/**
 * WAV (RIFF/WAVE) container helpers for the live audio pipeline.
 *
 * The live session exchanges raw PCM16LE mono @ 16 kHz chunks (`AUDIO_CHUNK_
 * META_SCHEMA`). Transcription/diarization adapters expect a self-describing
 * container, so every window is wrapped in a canonical 44-byte PCM WAV header
 * before leaving the process boundary.
 *
 * Everything here is pure and synchronous: no filesystem, no env, no clock.
 */

/** Single source of truth for the live pipeline audio format. */
export const PCM16_SAMPLE_RATE = 16000;
export const PCM16_BITS_PER_SAMPLE = 16;
export const PCM16_BYTES_PER_SAMPLE = PCM16_BITS_PER_SAMPLE / 8;
/** WAVE_FORMAT_PCM */
export const PCM16_AUDIO_FORMAT = 1;

/** Canonical PCM header size: RIFF(12) + fmt (24) + data header (8). */
export const WAV_HEADER_BYTES = 44;
export const WAV_FMT_CHUNK_BYTES = 16;
/** RIFF chunk size minus the 8 bytes of the chunk id/size itself. */
export const RIFF_OVERHEAD_BYTES = 36;
export const MIN_WAV_CHANNELS = 1;
export const MAX_WAV_CHANNELS = 2;
/** RIFF sizes are unsigned 32-bit. */
const MAX_UINT32 = 0xffffffff;
export const MAX_WAV_DATA_BYTES = MAX_UINT32 - RIFF_OVERHEAD_BYTES;

/** Base class so callers can distinguish audio-format problems. */
export class WavError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WavError';
  }
}

export class InvalidPcmError extends WavError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPcmError';
  }
}

export class WavParseError extends WavError {
  constructor(message: string) {
    super(message);
    this.name = 'WavParseError';
  }
}

export type WavHeader = {
  /** `WAVE_FORMAT_PCM` (1) for the live pipeline. */
  audioFormat: number;
  channels: number;
  sampleRate: number;
  /** sampleRate * channels * bytesPerSample, as declared in `fmt `. */
  byteRate: number;
  /** channels * bytesPerSample, as declared in `fmt `. */
  blockAlign: number;
  bitsPerSample: number;
  /** Size declared in the `data` chunk header. */
  dataBytes: number;
  /** Size declared in the RIFF chunk header (file size - 8). */
  riffSize: number;
  /** Total bytes in the container (header + declared payload). */
  totalBytes: number;
};

const assertSampleRate = (sampleRate: number): void => {
  if (!Number.isInteger(sampleRate) || sampleRate < 1) {
    throw new InvalidPcmError('sampleRate must be a positive integer');
  }
  if (sampleRate > MAX_UINT32) {
    throw new InvalidPcmError('sampleRate exceeds the RIFF 32-bit limit');
  }
};

const assertChannels = (channels: number): void => {
  if (!Number.isInteger(channels)) {
    throw new InvalidPcmError('channels must be an integer');
  }
  // The live protocol is mono; stereo is tolerated by the builder so the same
  // helper can wrap qualification fixtures, anything else is rejected.
  if (channels < MIN_WAV_CHANNELS || channels > MAX_WAV_CHANNELS) {
    throw new InvalidPcmError(
      `channels must be between ${String(MIN_WAV_CHANNELS)} and ${String(MAX_WAV_CHANNELS)} (got ${String(channels)})`,
    );
  }
};

/**
 * Wraps raw interleaved PCM16LE samples in a canonical 44-byte RIFF/WAVE
 * header. The payload is copied, never referenced.
 *
 * Throws {@link InvalidPcmError} for an odd byte count (a PCM16 sample is two
 * bytes) and for channel counts other than mono/stereo.
 */
export function pcm16ToWav(pcm: Buffer, sampleRate = 16000, channels = 1): Buffer {
  assertSampleRate(sampleRate);
  assertChannels(channels);

  const blockAlign = channels * PCM16_BYTES_PER_SAMPLE;
  if (pcm.length % blockAlign !== 0) {
    throw new InvalidPcmError(
      `PCM byte length (${String(pcm.length)}) is not a multiple of the ${String(blockAlign)}-byte block size for ${String(channels)} channel(s)`,
    );
  }
  if (pcm.length > MAX_WAV_DATA_BYTES) {
    throw new InvalidPcmError('PCM payload exceeds the RIFF 32-bit limit');
  }

  const dataBytes = pcm.length;
  const buffer = Buffer.alloc(WAV_HEADER_BYTES + dataBytes);

  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(RIFF_OVERHEAD_BYTES + dataBytes, 4);
  buffer.write('WAVE', 8, 'ascii');

  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(WAV_FMT_CHUNK_BYTES, 16);
  buffer.writeUInt16LE(PCM16_AUDIO_FORMAT, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * blockAlign, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(PCM16_BITS_PER_SAMPLE, 34);

  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataBytes, 40);

  pcm.copy(buffer, WAV_HEADER_BYTES);
  return buffer;
}

/**
 * Parses and validates the canonical PCM header produced by
 * {@link pcm16ToWav}. Used by tests and by adapters that must reject foreign
 * or truncated containers before forwarding audio anywhere.
 */
export function parseWavHeader(wav: Buffer): WavHeader {
  if (wav.length < WAV_HEADER_BYTES) {
    throw new WavParseError(
      `WAV payload is shorter than the ${String(WAV_HEADER_BYTES)}-byte header`,
    );
  }
  if (wav.toString('ascii', 0, 4) !== 'RIFF') {
    throw new WavParseError('Missing RIFF signature');
  }
  if (wav.toString('ascii', 8, 12) !== 'WAVE') {
    throw new WavParseError('Missing WAVE signature');
  }
  if (wav.toString('ascii', 12, 16) !== 'fmt ') {
    throw new WavParseError('Missing fmt chunk');
  }
  if (wav.toString('ascii', 36, 40) !== 'data') {
    throw new WavParseError('Missing data chunk');
  }

  const riffSize = wav.readUInt32LE(4);
  const fmtChunkBytes = wav.readUInt32LE(16);
  const audioFormat = wav.readUInt16LE(20);
  const channels = wav.readUInt16LE(22);
  const sampleRate = wav.readUInt32LE(24);
  const byteRate = wav.readUInt32LE(28);
  const blockAlign = wav.readUInt16LE(32);
  const bitsPerSample = wav.readUInt16LE(34);
  const dataBytes = wav.readUInt32LE(40);

  if (fmtChunkBytes !== WAV_FMT_CHUNK_BYTES) {
    throw new WavParseError(
      `Unsupported fmt chunk size ${String(fmtChunkBytes)}`,
    );
  }
  if (audioFormat !== PCM16_AUDIO_FORMAT) {
    throw new WavParseError(
      `Unsupported audio format ${String(audioFormat)} (expected PCM)`,
    );
  }
  if (channels < MIN_WAV_CHANNELS || channels > MAX_WAV_CHANNELS) {
    throw new WavParseError(`Unsupported channel count ${String(channels)}`);
  }
  if (sampleRate < 1) {
    throw new WavParseError('Invalid sample rate');
  }
  if (bitsPerSample !== PCM16_BITS_PER_SAMPLE) {
    throw new WavParseError(
      `Unsupported bit depth ${String(bitsPerSample)} (expected 16)`,
    );
  }
  const expectedBlockAlign = channels * PCM16_BYTES_PER_SAMPLE;
  if (blockAlign !== expectedBlockAlign) {
    throw new WavParseError(
      `Inconsistent block align ${String(blockAlign)} (expected ${String(expectedBlockAlign)})`,
    );
  }
  if (byteRate !== sampleRate * blockAlign) {
    throw new WavParseError('Inconsistent byte rate');
  }
  if (dataBytes % blockAlign !== 0) {
    throw new WavParseError('Data chunk is not a whole number of samples');
  }
  if (WAV_HEADER_BYTES + dataBytes > wav.length) {
    throw new WavParseError('Data chunk extends beyond the payload');
  }
  if (riffSize !== RIFF_OVERHEAD_BYTES + dataBytes) {
    throw new WavParseError('Inconsistent RIFF chunk size');
  }

  return {
    audioFormat,
    channels,
    sampleRate,
    byteRate,
    blockAlign,
    bitsPerSample,
    dataBytes,
    riffSize,
    totalBytes: WAV_HEADER_BYTES + dataBytes,
  };
}

const assertNonNegativeFinite = (value: number, name: string): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number`);
  }
};

/** Converts milliseconds to a whole number of samples (16 kHz by default). */
export function msToSamples(ms: number, sampleRate = PCM16_SAMPLE_RATE): number {
  assertNonNegativeFinite(ms, 'ms');
  return Math.round((ms * sampleRate) / 1000);
}

/** Converts a sample count to whole milliseconds (16 kHz by default). */
export function samplesToMs(
  samples: number,
  sampleRate = PCM16_SAMPLE_RATE,
): number {
  assertNonNegativeFinite(samples, 'samples');
  return Math.round((samples * 1000) / sampleRate);
}
