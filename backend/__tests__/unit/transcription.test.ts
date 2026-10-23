import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_UNAVAILABLE_TRANSCRIPTION_MESSAGE,
  GeminiAudioAdapter,
  TranscriptionAbortedError,
  TranscriptionError,
  TranscriptionParseError,
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionTimeoutError,
  TranscriptionUnavailableError,
  UnavailableTranscriptionProvider,
  WhisperCppAdapter,
  buildGeminiTranscriptionPrompt,
  createTranscriptionProvider,
  parseGeminiTranscriptionResponse,
  parseWhisperJson,
  parseWhisperTimestamp,
  type CommandResult,
  type CommandSpec,
  type FetchLike,
  type TranscriptionOptions,
} from '#/live/transcription.js';
import { WAV_HEADER_BYTES, parseWavHeader } from '#/live/wav.js';

class FakeProvider implements TranscriptionProvider {
  readonly name: string;
  calls = 0;
  private readonly available: boolean;
  private readonly result: TranscriptionResult;

  constructor(
    name: string,
    available = true,
    result: TranscriptionResult = { text: 'texto' },
  ) {
    this.name = name;
    this.available = available;
    this.result = result;
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(this.available);
  }

  transcribe(): Promise<TranscriptionResult> {
    this.calls += 1;
    return Promise.resolve(this.result);
  }
}

const options = (
  overrides: Partial<TranscriptionOptions> = {},
): TranscriptionOptions => ({
  sampleRate: 16000,
  language: 'pt-BR',
  startSample: 0,
  durationMs: 1000,
  ...overrides,
});

const pcm = (samples = 1600): Buffer => {
  const buffer = Buffer.alloc(samples * 2);
  for (let index = 0; index < samples; index++) {
    buffer.writeInt16LE(((index % 50) - 25) * 700, index * 2);
  }
  return buffer;
};

const okRunner =
  (json: string, captured: CommandSpec[] = []) =>
  (spec: CommandSpec): Promise<CommandResult> => {
    captured.push(spec);
    const outputIndex = spec.args.indexOf('-of');
    const base = spec.args.at(outputIndex + 1);
    if (outputIndex < 0 || base === undefined) {
      return Promise.reject(new Error('missing -of argument'));
    }
    return fs.writeFile(`${base}.json`, json, 'utf8').then(
      (): CommandResult => ({
        code: 0,
        stdout: '',
        stderr: '',
        timedOut: false,
        aborted: false,
      }),
    );
  };

const WHISPER_JSON = JSON.stringify({
  transcription: [
    {
      timestamps: { from: '00:00:00,000', to: '00:00:01,500' },
      offsets: { from: 0, to: 1500 },
      text: ' O Pix foi criado em 2015.',
    },
    {
      timestamps: { from: '00:00:01,500', to: '00:00:03,000' },
      offsets: { from: 1500, to: 3000 },
      text: ' Isso é um fato.',
    },
  ],
});

describe('parseWhisperTimestamp', () => {
  it('parses whisper.cpp HH:MM:SS,mmm timestamps', () => {
    expect(parseWhisperTimestamp('00:00:00,000')).toBe(0);
    expect(parseWhisperTimestamp('00:00:01,500')).toBe(1500);
    expect(parseWhisperTimestamp('01:02:03.004')).toBe(3_723_004);
    expect(parseWhisperTimestamp('00:00:00,12')).toBe(120);
    expect(parseWhisperTimestamp('not-a-timestamp')).toBeUndefined();
    expect(parseWhisperTimestamp(42)).toBeUndefined();
  });
});

describe('parseWhisperJson', () => {
  it('parses the current transcription/offsets format', () => {
    const result = parseWhisperJson(WHISPER_JSON);

    expect(result.text).toBe('O Pix foi criado em 2015. Isso é um fato.');
    expect(result.segments).toEqual([
      { text: 'O Pix foi criado em 2015.', startMs: 0, endMs: 1500 },
      { text: 'Isso é um fato.', startMs: 1500, endMs: 3000 },
    ]);
  });

  it('tolerates the older segments/timestamps format', () => {
    const result = parseWhisperJson(
      JSON.stringify({
        segments: [
          {
            timestamps: { from: '00:00:02,000', to: '00:00:04,250' },
            text: ' Segunda hipótese.',
          },
        ],
      }),
    );

    expect(result.segments).toEqual([
      { text: 'Segunda hipótese.', startMs: 2000, endMs: 4250 },
    ]);
  });

  it('derives a confidence signal from probability or avg_logprob', () => {
    const withProbability = parseWhisperJson(
      JSON.stringify({
        transcription: [
          { offsets: { from: 0, to: 10 }, probability: 0.9, text: 'a' },
        ],
      }),
    );
    expect(withProbability.confidence).toBeCloseTo(0.9);
    expect(withProbability.segments?.[0]?.confidence).toBeCloseTo(0.9);

    const withLogprob = parseWhisperJson(
      JSON.stringify({
        transcription: [
          { offsets: { from: 0, to: 10 }, avg_logprob: -0.5, text: 'b' },
        ],
      }),
    );
    expect(withLogprob.confidence).toBeCloseTo(Math.exp(-0.5));
  });

  it('keeps monotonic times when offsets are missing', () => {
    const result = parseWhisperJson(
      JSON.stringify({
        transcription: [
          { text: 'primeiro' },
          { text: 'segundo' },
          { text: 'terceiro' },
        ],
      }),
    );

    expect(result.text).toBe('primeiro segundo terceiro');
    expect(result.segments?.map((segment) => segment.startMs)).toEqual([
      0, 0, 0,
    ]);
  });

  it('accepts a top-level text fallback and empty documents', () => {
    expect(parseWhisperJson(JSON.stringify({ text: ' só texto ' }))).toEqual({
      text: 'só texto',
      segments: [],
    });
    expect(parseWhisperJson('{}')).toEqual({ text: '', segments: [] });
  });

  it('rejects invalid JSON and non-object documents', () => {
    expect(() => parseWhisperJson('not json')).toThrow(TranscriptionParseError);
    expect(() => parseWhisperJson('[]')).toThrow(TranscriptionParseError);
  });
});

describe('WhisperCppAdapter', () => {
  const cleanups: string[] = [];

  const tempDir = async (): Promise<string> => {
    const dir = await fs.mkdtemp(join(tmpdir(), 'veritas-whisper-test-'));
    cleanups.push(dir);
    return dir;
  };

  afterEach(async () => {
    await Promise.all(
      cleanups
        .splice(0)
        .map((dir) => fs.rm(dir, { recursive: true, force: true })),
    );
  });

  it('is unavailable when the binary cannot be spawned, and caches the probe', async () => {
    const modelPath = join(await tempDir(), 'model.bin');
    await fs.writeFile(modelPath, 'model');
    let probes = 0;
    const adapter = new WhisperCppAdapter({
      modelPath,
      runner: () => {
        probes += 1;
        return Promise.resolve({
          code: null,
          stdout: '',
          stderr: '',
          timedOut: false,
          aborted: false,
          spawnErrorCode: 'ENOENT',
        });
      },
    });

    expect(await adapter.isAvailable()).toBe(false);
    expect(await adapter.isAvailable()).toBe(false);
    expect(probes).toBe(1);
  });

  it('is unavailable when the model file is missing', async () => {
    let probes = 0;
    const adapter = new WhisperCppAdapter({
      modelPath: join(await tempDir(), 'absent.bin'),
      runner: () => {
        probes += 1;
        return Promise.resolve({
          code: 0,
          stdout: '',
          stderr: '',
          timedOut: false,
          aborted: false,
        });
      },
    });

    expect(await adapter.isAvailable()).toBe(false);
    expect(probes).toBe(0);
  });

  it('is available when the binary answers --help and the model exists', async () => {
    const modelPath = join(await tempDir(), 'model.bin');
    await fs.writeFile(modelPath, 'model');
    const captured: CommandSpec[] = [];
    const adapter = new WhisperCppAdapter({
      modelPath,
      runner: (spec) => {
        captured.push(spec);
        return Promise.resolve({
          code: 0,
          stdout: 'usage: whisper-cli ...',
          stderr: '',
          timedOut: false,
          aborted: false,
        });
      },
    });

    expect(await adapter.isAvailable()).toBe(true);
    expect(captured[0]).toMatchObject({
      command: 'whisper-cli',
      args: ['--help'],
    });
  });

  it('writes a WAV window, runs whisper.cpp and parses JSON output', async () => {
    const modelPath = join(await tempDir(), 'model.bin');
    await fs.writeFile(modelPath, 'model');
    const captured: CommandSpec[] = [];
    const adapter = new WhisperCppAdapter({
      modelPath,
      binPath: '/opt/whisper/whisper-cli',
      runner: okRunner(WHISPER_JSON, captured),
    });

    const result = await adapter.transcribe(pcm(), options());

    expect(result.text).toBe('O Pix foi criado em 2015. Isso é um fato.');
    expect(captured).toHaveLength(1);
    const args = captured[0]?.args ?? [];
    expect(args.slice(0, 2)).toEqual(['-m', modelPath]);
    expect(args).toContain('-l');
    expect(args[args.indexOf('-l') + 1]).toBe('pt');
    expect(args).toContain('-oj');
    expect(args).toContain('-nt');
    expect(captured[0]?.command).toBe('/opt/whisper/whisper-cli');

    const wavPath = args.at(args.indexOf('-f') + 1);
    expect(wavPath).toBeDefined();
    if (wavPath === undefined) {
      return;
    }
    // The temp directory is removed after transcription finishes.
    await expect(fs.access(wavPath)).rejects.toThrow();
    expect(wavPath.startsWith(tmpdir())).toBe(true);
  });

  it('retries once with minimal flags when the build rejects optional flags', async () => {
    const modelPath = join(await tempDir(), 'model.bin');
    await fs.writeFile(modelPath, 'model');
    const calls: CommandSpec[] = [];
    const adapter = new WhisperCppAdapter({
      modelPath,
      runner: (spec) => {
        calls.push(spec);
        if (calls.length === 1) {
          return Promise.resolve({
            code: 1,
            stdout: '',
            stderr: 'error: unknown argument: -nt',
            timedOut: false,
            aborted: false,
          });
        }
        return okRunner(WHISPER_JSON)(spec);
      },
    });

    const result = await adapter.transcribe(pcm(), options());

    expect(result.text).toContain('O Pix');
    expect(calls).toHaveLength(2);
    expect(calls[1]?.args).not.toContain('-nt');
    expect(calls[1]?.args).not.toContain('-np');
  });

  it('maps timeouts, spawn failures and exits to typed errors', async () => {
    const modelPath = join(await tempDir(), 'model.bin');
    await fs.writeFile(modelPath, 'model');

    const timeoutAdapter = new WhisperCppAdapter({
      modelPath,
      timeoutMs: 1234,
      runner: () =>
        Promise.resolve({
          code: null,
          stdout: '',
          stderr: '',
          timedOut: true,
          aborted: false,
        }),
    });
    await expect(timeoutAdapter.transcribe(pcm(), options())).rejects.toThrow(
      TranscriptionTimeoutError,
    );

    const missingAdapter = new WhisperCppAdapter({
      modelPath,
      runner: () =>
        Promise.resolve({
          code: null,
          stdout: '',
          stderr: '',
          timedOut: false,
          aborted: false,
          spawnErrorCode: 'ENOENT',
        }),
    });
    await expect(missingAdapter.transcribe(pcm(), options())).rejects.toThrow(
      TranscriptionUnavailableError,
    );

    const failingAdapter = new WhisperCppAdapter({
      modelPath,
      runner: () =>
        Promise.resolve({
          code: 2,
          stdout: '',
          stderr: 'failed to load model',
          timedOut: false,
          aborted: false,
        }),
    });
    await expect(failingAdapter.transcribe(pcm(), options())).rejects.toThrow(
      /código 2/,
    );
  });

  it('rejects a pre-aborted signal without spawning', async () => {
    const modelPath = join(await tempDir(), 'model.bin');
    await fs.writeFile(modelPath, 'model');
    let calls = 0;
    const adapter = new WhisperCppAdapter({
      modelPath,
      runner: () => {
        calls += 1;
        return okRunner(WHISPER_JSON)({ command: 'x', args: [], timeoutMs: 1 });
      },
    });
    const controller = new AbortController();
    controller.abort();

    await expect(
      adapter.transcribe(pcm(), options({ signal: controller.signal })),
    ).rejects.toBeInstanceOf(TranscriptionAbortedError);
    expect(calls).toBe(0);
  });

  it('rejects when no model is configured', async () => {
    const adapter = new WhisperCppAdapter({ modelPath: '', env: {} });
    await expect(adapter.transcribe(pcm(), options())).rejects.toBeInstanceOf(
      TranscriptionUnavailableError,
    );
  });
});

describe('GeminiAudioAdapter', () => {
  const successfulResponse = (payload: unknown): Response =>
    new Response(
      JSON.stringify({
        candidates: [
          { content: { parts: [{ text: JSON.stringify(payload) }] } },
        ],
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );

  it('posts inline WAV audio with the key in a header, never in the URL', async () => {
    const requests: {
      url: string;
      init: RequestInit;
      bodyText: string;
    }[] = [];
    const fetchImpl: FetchLike = (url, init) => {
      requests.push({
        url,
        init,
        bodyText: typeof init.body === 'string' ? init.body : '',
      });
      return Promise.resolve(
        successfulResponse({
          text: 'O Pix foi criado em 2015.',
          confidence: 0.8,
          segments: [
            {
              text: 'O Pix foi criado em 2015.',
              startMs: 0,
              endMs: 1000,
              confidence: 0.8,
            },
          ],
        }),
      );
    };
    const adapter = new GeminiAudioAdapter({
      apiKey: 'AIza-secret-key-1234567890',
      model: 'gemini-test-model',
      baseUrl: 'https://gemini.example/',
      env: {},
      fetchImpl,
    });

    const result = await adapter.transcribe(pcm(), options());
    const request = requests.at(0);

    expect(request?.url).toBe(
      'https://gemini.example/v1beta/models/gemini-test-model:generateContent',
    );
    expect(request?.url).not.toContain('AIza');
    expect(request?.init.method).toBe('POST');
    expect(request?.init.headers).toMatchObject({
      'x-goog-api-key': 'AIza-secret-key-1234567890',
    });

    const body = JSON.parse(request?.bodyText ?? '{}') as {
      contents: {
        parts: {
          text?: string;
          inlineData?: { mimeType: string; data: string };
        }[];
      }[];
      generationConfig: { temperature: number };
    };
    expect(body.generationConfig.temperature).toBe(0);
    const inline = body.contents[0]?.parts[1]?.inlineData;
    expect(inline?.mimeType).toBe('audio/wav');
    const wav = Buffer.from(inline?.data ?? '', 'base64');
    expect(wav.length).toBe(WAV_HEADER_BYTES + pcm().length);
    expect(parseWavHeader(wav).dataBytes).toBe(pcm().length);
    expect(body.contents[0]?.parts[0]?.text).toContain('JSON');
    expect(request?.bodyText).not.toContain('AIza-secret');

    expect(result.text).toBe('O Pix foi criado em 2015.');
    expect(result.confidence).toBeCloseTo(0.8);
    expect(result.segments?.[0]).toMatchObject({ startMs: 0, endMs: 1000 });
  });

  it('accepts a fenced JSON response and normalizes segments', async () => {
    const fetchImpl: FetchLike = () =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: '```json\n{"text":"","segments":[{"text":"  oi  ","startMs":10.4,"endMs":5,"confidence":0.7}]}\n```',
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      );
    const adapter = new GeminiAudioAdapter({
      apiKey: 'k',
      env: {},
      fetchImpl,
    });

    const result = await adapter.transcribe(pcm(), options());
    expect(result.segments).toEqual([
      { text: 'oi', startMs: 10, endMs: 10, confidence: 0.7 },
    ]);
    expect(result.text).toBe('oi');
  });

  it('surfaces HTTP failures without leaking the key', async () => {
    const fetchImpl: FetchLike = () =>
      Promise.resolve(
        new Response('forbidden for AIza-secret-key-1234567890', {
          status: 403,
        }),
      );
    const adapter = new GeminiAudioAdapter({
      apiKey: 'AIza-secret-key-1234567890',
      env: {},
      fetchImpl,
    });

    const error = await adapter
      .transcribe(pcm(), options())
      .catch((thrown: unknown) => thrown);
    expect(error).toBeInstanceOf(TranscriptionError);
    expect((error as TranscriptionError).code).toBe('TRANSCRIPTION_HTTP_ERROR');
    expect((error as Error).message).toContain('403');
    expect((error as Error).message).not.toContain('AIza');
  });

  it('aborts the request when the caller aborts', async () => {
    let observedSignal: AbortSignal | undefined;
    const fetchImpl: FetchLike = (_url, init) => {
      observedSignal = init.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    };
    const adapter = new GeminiAudioAdapter({
      apiKey: 'k',
      env: {},
      fetchImpl,
    });
    const controller = new AbortController();
    const pending = adapter.transcribe(
      pcm(),
      options({ signal: controller.signal }),
    );

    controller.abort();

    await expect(pending).rejects.toBeInstanceOf(TranscriptionAbortedError);
    expect(observedSignal?.aborted).toBe(true);
  });

  it('times out with a typed error', async () => {
    vi.useFakeTimers();
    try {
      const fetchImpl: FetchLike = (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        });
      const adapter = new GeminiAudioAdapter({
        apiKey: 'k',
        timeoutMs: 50,
        env: {},
        fetchImpl,
      });
      const pending = adapter
        .transcribe(pcm(), options())
        .catch((thrown: unknown) => thrown);
      await vi.advanceTimersByTimeAsync(60);
      await expect(pending).resolves.toBeInstanceOf(TranscriptionTimeoutError);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects an empty key at construction', () => {
    expect(() => new GeminiAudioAdapter({ apiKey: '   ' })).toThrow(
      TranscriptionUnavailableError,
    );
  });
});

describe('parseGeminiTranscriptionResponse', () => {
  it('rejects malformed or non-contract payloads', () => {
    expect(() => parseGeminiTranscriptionResponse({})).toThrow(
      TranscriptionParseError,
    );
    expect(() =>
      parseGeminiTranscriptionResponse({
        candidates: [{ content: { parts: [{ text: 'not json' }] } }],
      }),
    ).toThrow(TranscriptionParseError);
    expect(() =>
      parseGeminiTranscriptionResponse({
        candidates: [{ content: { parts: [{ text: '{"text":42}' }] } }],
      }),
    ).toThrow(TranscriptionParseError);
  });
});

describe('buildGeminiTranscriptionPrompt', () => {
  it('forbids invention and pins the JSON contract', () => {
    const prompt = buildGeminiTranscriptionPrompt(
      options({ durationMs: 8000, startSample: 16000 }),
    );

    expect(prompt).toContain('português do Brasil');
    expect(prompt).toMatch(/verbatim|literal/i);
    expect(prompt).toMatch(/não invente/i);
    expect(prompt).toContain('"segments"');
    expect(prompt).toContain('8000 ms');
  });
});

describe('UnavailableTranscriptionProvider', () => {
  it('is never available and fails with an actionable message', async () => {
    const provider = new UnavailableTranscriptionProvider();

    expect(provider.name).toBe('unavailable');
    expect(await provider.isAvailable()).toBe(false);

    const error = await provider
      .transcribe()
      .catch((thrown: unknown) => thrown);
    expect(error).toBeInstanceOf(TranscriptionUnavailableError);
    expect((error as Error).message).toContain('WHISPER_CPP_BIN');
    expect((error as Error).message).toContain('ALLOW_CLOUD_TRANSCRIPTION');
    expect((error as Error).message).toBe(
      DEFAULT_UNAVAILABLE_TRANSCRIPTION_MESSAGE,
    );
  });
});

describe('createTranscriptionProvider', () => {
  const googleKey = 'AIza-test-key';

  it('prefers whisper.cpp when it is available', async () => {
    const whisper = new FakeProvider('whisper', true);
    let geminiCreated = 0;
    const provider = await createTranscriptionProvider({
      googleApiKey: googleKey,
      env: { ALLOW_CLOUD_TRANSCRIPTION: 'true' },
      createWhisperProvider: () => whisper,
      createGeminiProvider: () => {
        geminiCreated += 1;
        return new FakeProvider('gemini');
      },
    });

    expect(provider).toBe(whisper);
    expect(geminiCreated).toBe(0);
  });

  it('falls back to Gemini only with the explicit flag and a key', async () => {
    const gemini = new FakeProvider('gemini');
    const provider = await createTranscriptionProvider({
      googleApiKey: googleKey,
      env: { ALLOW_CLOUD_TRANSCRIPTION: 'true' },
      createWhisperProvider: () => new FakeProvider('whisper', false),
      createGeminiProvider: (apiKey) => {
        expect(apiKey).toBe(googleKey);
        return gemini;
      },
    });

    expect(provider).toBe(gemini);
  });

  it('never sends audio to the cloud without ALLOW_CLOUD_TRANSCRIPTION', async () => {
    let geminiCreated = 0;
    const provider = await createTranscriptionProvider({
      googleApiKey: googleKey,
      env: {},
      createWhisperProvider: () => new FakeProvider('whisper', false),
      createGeminiProvider: () => {
        geminiCreated += 1;
        return new FakeProvider('gemini');
      },
    });

    expect(provider).toBeInstanceOf(UnavailableTranscriptionProvider);
    expect(geminiCreated).toBe(0);
    expect(await provider.isAvailable()).toBe(false);
  });

  it('never sends audio to the cloud without a Google key', async () => {
    let geminiCreated = 0;
    const provider = await createTranscriptionProvider({
      env: { ALLOW_CLOUD_TRANSCRIPTION: 'true' },
      createWhisperProvider: () => new FakeProvider('whisper', false),
      createGeminiProvider: () => {
        geminiCreated += 1;
        return new FakeProvider('gemini');
      },
    });

    expect(provider).toBeInstanceOf(UnavailableTranscriptionProvider);
    expect(geminiCreated).toBe(0);
  });

  it('does not silently use the cloud when Gemini is preferred but not allowed', async () => {
    let geminiCreated = 0;
    const provider = await createTranscriptionProvider({
      preferred: 'gemini',
      googleApiKey: googleKey,
      env: {},
      createWhisperProvider: () => new FakeProvider('whisper', true),
      createGeminiProvider: () => {
        geminiCreated += 1;
        return new FakeProvider('gemini');
      },
    });

    expect(provider).toBeInstanceOf(UnavailableTranscriptionProvider);
    expect(geminiCreated).toBe(0);
    const error = await provider
      .transcribe(Buffer.alloc(2), options())
      .catch((thrown: unknown) => thrown);
    expect((error as Error).message).toContain('ALLOW_CLOUD_TRANSCRIPTION');
  });

  it('honours TRANSCRIPTION_PROVIDER=gemini from the environment', async () => {
    const gemini = new FakeProvider('gemini');
    const provider = await createTranscriptionProvider({
      googleApiKey: googleKey,
      env: {
        TRANSCRIPTION_PROVIDER: 'gemini',
        ALLOW_CLOUD_TRANSCRIPTION: 'true',
      },
      createWhisperProvider: () => new FakeProvider('whisper', true),
      createGeminiProvider: () => gemini,
    });

    expect(provider).toBe(gemini);
  });

  it('still refuses the cloud when TRANSCRIPTION_PROVIDER=gemini but not allowed', async () => {
    let geminiCreated = 0;
    const provider = await createTranscriptionProvider({
      googleApiKey: googleKey,
      env: { TRANSCRIPTION_PROVIDER: 'gemini' },
      createWhisperProvider: () => new FakeProvider('whisper', true),
      createGeminiProvider: () => {
        geminiCreated += 1;
        return new FakeProvider('gemini');
      },
    });

    expect(provider).toBeInstanceOf(UnavailableTranscriptionProvider);
    expect(geminiCreated).toBe(0);
  });

  it('returns unavailable when whisper is preferred but missing', async () => {
    const provider = await createTranscriptionProvider({
      preferred: 'whisper',
      googleApiKey: googleKey,
      env: { ALLOW_CLOUD_TRANSCRIPTION: 'true' },
      createWhisperProvider: () => new FakeProvider('whisper', false),
      createGeminiProvider: () => new FakeProvider('gemini'),
    });

    expect(provider).toBeInstanceOf(UnavailableTranscriptionProvider);
  });

  it('builds a real whisper adapter by default (unavailable in this environment)', async () => {
    const provider = await createTranscriptionProvider({
      env: {
        WHISPER_CPP_BIN: join(tmpdir(), 'veritas-bin-that-does-not-exist'),
        WHISPER_CPP_MODEL: join(tmpdir(), 'veritas-model-that-does-not-exist'),
      },
    });

    expect(provider).toBeInstanceOf(UnavailableTranscriptionProvider);
  });
});
