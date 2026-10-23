import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  RESEARCH_DEFAULT_TIMEOUT_MS,
  TAVILY_DEFAULT_BASE_URL,
  TavilyResearchProvider,
} from '#/research/tavily.js';
import { ResearchError } from '#/research/types.js';

type FetchRequest = { url: string; init?: RequestInit };

type FetchHandler = (request: FetchRequest) => Response | Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(text),
  } as unknown as Response;
}

function stubFetch(handler: FetchHandler) {
  const mock = vi.fn((url: string, init?: RequestInit) =>
    Promise.resolve(handler({ url, init })),
  );
  vi.stubGlobal('fetch', mock);
  return mock;
}

function parseBody(init: RequestInit | undefined): Record<string, unknown> {
  const body = init?.body;
  return JSON.parse(typeof body === 'string' ? body : '{}') as Record<
    string,
    unknown
  >;
}

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  return promise.catch((error: unknown) => error);
}

describe('TavilyResearchProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends an advanced search request and maps valid hits', async () => {
    const fetchMock = stubFetch(() =>
      jsonResponse({
        results: [
          {
            title: 'Resolução BCB 1/2020',
            url: 'https://www.bcb.gov.br/estabilidadefinanceira/pix',
            content: 'Institui o arranjo de pagamentos Pix.',
            score: 0.93,
            published_date: '2020-11-05T00:00:00Z',
          },
          { title: 'Sem URL' },
          { url: 'https://sem-titulo.example/x' },
          { title: 'URL inválida', url: 'file:///etc/passwd' },
        ],
      }),
    );

    const provider = new TavilyResearchProvider({
      apiKey: 'tvly-test-key',
      baseUrl: 'https://api.tavily.test',
    });

    const hits = await provider.search('Pix', { maxResults: 3 });

    expect(hits).toEqual([
      {
        title: 'Resolução BCB 1/2020',
        url: 'https://www.bcb.gov.br/estabilidadefinanceira/pix',
        content: 'Institui o arranjo de pagamentos Pix.',
        score: 0.93,
        publishedAt: '2020-11-05T00:00:00Z',
      },
    ]);

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.tavily.test/search',
    );
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
    expect(parseBody(fetchMock.mock.calls[0][1])).toMatchObject({
      api_key: 'tvly-test-key',
      query: 'Pix',
      max_results: 3,
      search_depth: 'advanced',
      include_answer: false,
      include_raw_content: false,
    });
  });

  it('uses the default base url and timeout when not configured', async () => {
    const fetchMock = stubFetch(() => jsonResponse({ results: [] }));
    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });

    await provider.search('Pix');

    expect(TAVILY_DEFAULT_BASE_URL).toBe('https://api.tavily.com');
    expect(RESEARCH_DEFAULT_TIMEOUT_MS).toBe(20_000);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.tavily.com/search');
  });

  it('keeps duplicated urls because dedupe belongs to the caller', async () => {
    const duplicated = {
      title: 'Duplicada',
      url: 'https://example.org/a',
      content: 'Trecho',
    };
    stubFetch(() => jsonResponse({ results: [duplicated, duplicated] }));

    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });
    const hits = await provider.search('Pix');

    expect(hits).toHaveLength(2);
  });

  it.each([429, 432, 433])('maps HTTP %i to QUOTA', async (status) => {
    stubFetch(() => jsonResponse({ detail: 'rate limit exceeded' }, status));
    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });

    const error = await captureError(provider.search('Pix'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('QUOTA');
    expect((error as ResearchError).status).toBe(status);
  });

  it('maps HTTP 5xx to TRANSIENT', async () => {
    stubFetch(() => jsonResponse({ detail: 'internal error' }, 503));
    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });

    const error = await captureError(provider.search('Pix'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('TRANSIENT');
  });

  it('maps an aborted request to TIMEOUT', async () => {
    stubFetch(
      ({ init }) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const controller = new AbortController();
    const provider = new TavilyResearchProvider({
      apiKey: 'tvly-test-key',
      timeoutMs: 5_000,
    });

    const pending = provider.search('Pix', { signal: controller.signal });
    controller.abort();

    const error = await captureError(pending);
    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('TIMEOUT');
  });

  it('times out when the provider never answers', async () => {
    stubFetch(() => new Promise<Response>(() => undefined));

    const provider = new TavilyResearchProvider({
      apiKey: 'tvly-test-key',
      timeoutMs: 5,
    });

    const error = await captureError(provider.search('Pix'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('TIMEOUT');
  });

  it('maps malformed JSON to INVALID', async () => {
    stubFetch(() => jsonResponse('not-json', 200));
    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });

    const error = await captureError(provider.search('Pix'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('INVALID');
  });

  it('rejects a search payload without results', async () => {
    stubFetch(() => jsonResponse({ answer: 'nada' }));
    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });

    const error = await captureError(provider.search('Pix'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('INVALID');
  });

  it('never exposes the api key in error messages', async () => {
    const apiKey = 'tvly-secret-key-123456';
    stubFetch(() => jsonResponse({ detail: `Invalid API key: ${apiKey}` }, 401));
    const provider = new TavilyResearchProvider({ apiKey });

    const error = await captureError(provider.search('Pix'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('UNAVAILABLE');
    expect((error as ResearchError).message).not.toContain(apiKey);
    expect((error as ResearchError).message).toContain('[redacted]');
  });

  it('never exposes a non-standard key echoed by the network layer', async () => {
    const apiKey = 'test-api-key';
    const fetchMock = vi.fn(() =>
      Promise.reject(new Error(`connection failed for key ${apiKey}`)),
    );
    vi.stubGlobal('fetch', fetchMock);

    const provider = new TavilyResearchProvider({ apiKey });
    const error = await captureError(provider.search('Pix'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('TRANSIENT');
    expect((error as ResearchError).message).not.toContain(apiKey);
  });

  it('rejects empty api keys and empty queries before calling fetch', async () => {
    expect(() => new TavilyResearchProvider({ apiKey: '   ' })).toThrowError(
      ResearchError,
    );

    const fetchMock = stubFetch(() => jsonResponse({ results: [] }));
    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });

    const error = await captureError(provider.search('   '));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('INVALID');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('extracts document content', async () => {
    const fetchMock = stubFetch(() =>
      jsonResponse({
        results: [
          {
            url: 'https://www.bcb.gov.br/pix',
            raw_content: 'A Lei nº 12.865, de 2013, autorizou o Pix.',
            title: 'Pix',
            published_date: '2013-10-09T00:00:00Z',
          },
        ],
        failed_results: [],
      }),
    );

    const provider = new TavilyResearchProvider({
      apiKey: 'tvly-test-key',
      baseUrl: 'https://api.tavily.test',
    });
    const document = await provider.extract('https://www.bcb.gov.br/pix');

    expect(document).toEqual({
      url: 'https://www.bcb.gov.br/pix',
      title: 'Pix',
      content: 'A Lei nº 12.865, de 2013, autorizou o Pix.',
      publishedAt: '2013-10-09T00:00:00Z',
    });

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.tavily.test/extract');
    expect(parseBody(fetchMock.mock.calls[0][1])).toMatchObject({
      api_key: 'tvly-test-key',
      urls: ['https://www.bcb.gov.br/pix'],
      extract_depth: 'basic',
    });
  });

  it('maps an empty extraction to UNAVAILABLE', async () => {
    stubFetch(() =>
      jsonResponse({
        results: [],
        failed_results: [{ url: 'https://example.org/a', error: 'not found' }],
      }),
    );

    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });
    const error = await captureError(provider.extract('https://example.org/a'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('UNAVAILABLE');
  });

  it('rejects invalid urls before calling fetch', async () => {
    const fetchMock = stubFetch(() => jsonResponse({ results: [] }));
    const provider = new TavilyResearchProvider({ apiKey: 'tvly-test-key' });

    const error = await captureError(provider.extract('javascript:alert(1)'));

    expect(error).toBeInstanceOf(ResearchError);
    expect((error as ResearchError).kind).toBe('INVALID');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
