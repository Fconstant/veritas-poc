/**
 * PCM helpers for the Veritas Live audio pipeline (LIVE-002/003).
 *
 * Everything in this module is pure: no DOM, no Web Audio, no module-level
 * side effects. It is imported both by browser code and by Node tests, so it
 * must stay runnable outside the browser.
 *
 * Wire format produced here (`pcm16le`): signed 16-bit little-endian, mono,
 * 16 kHz — see `AudioChunkMeta` in `shared/types/live.ts`.
 */

/** Sample rate required by the transcription contract (`AudioChunkMeta`). */
export const TARGET_SAMPLE_RATE = 16000;

/** Scale factor for signed 16-bit PCM (positive full scale). */
const PCM16_MAX = 32767;

/**
 * Converts a mono float signal to 16 kHz using linear interpolation.
 *
 * - `sourceRate === 16000` is a passthrough (the very same array is returned).
 * - Invalid source rates (0, negative, NaN, Infinity) throw `RangeError`;
 *   silently returning the wrong audio would corrupt the transcription clock.
 * - The output length is `round(input.length * 16000 / sourceRate)`, so the
 *   sample clock keeps the same media duration.
 */
export function downsampleTo16k(
  input: Float32Array,
  sourceRate: number,
): Float32Array {
  if (!Number.isFinite(sourceRate) || sourceRate <= 0) {
    throw new RangeError(
      `downsampleTo16k: fonte de áudio com taxa inválida (${String(sourceRate)})`,
    );
  }

  if (sourceRate === TARGET_SAMPLE_RATE) {
    return input;
  }

  if (input.length === 0) {
    return new Float32Array(0);
  }

  const ratio = sourceRate / TARGET_SAMPLE_RATE;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);
  const lastIndex = input.length - 1;

  for (let i = 0; i < outputLength; i += 1) {
    const position = i * ratio;
    const lowerIndex = Math.floor(position);
    // Reading past the buffer would yield `undefined` → NaN samples.
    const clampedLower = lowerIndex > lastIndex ? lastIndex : lowerIndex;
    const upperIndex = clampedLower + 1 > lastIndex ? lastIndex : clampedLower + 1;
    const fraction = position - clampedLower;
    const lowerValue = input[clampedLower];
    const upperValue = input[upperIndex];
    output[i] = lowerValue + (upperValue - lowerValue) * fraction;
  }

  return output;
}

/**
 * Clips to [-1, 1] and converts a single float sample to signed 16-bit PCM.
 *
 * Rounding is half-away-from-zero so that the positive and negative halves stay
 * symmetric (`0.5 → 16384`, `-0.5 → -16384`). Non-finite values become `0`:
 * a NaN must never reach the wire format.
 */
export function floatToPcm16Sample(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const clamped = value > 1 ? 1 : value < -1 ? -1 : value;
  const scaled = clamped * PCM16_MAX;
  return scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
}

/** Clips to [-1, 1] and converts a mono float signal to signed 16-bit PCM. */
export function floatToPcm16(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    output[i] = floatToPcm16Sample(input[i]);
  }
  return output;
}

/**
 * Serializes signed 16-bit PCM as little-endian bytes.
 *
 * The returned buffer is exactly `input.length * 2` bytes and owns no shared
 * memory with `input`, so it can be transferred to a worker/socket safely.
 */
export function pcm16ToBuffer(input: Int16Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i += 1) {
    view.setInt16(i * 2, input[i], true);
  }
  return buffer;
}

/**
 * Reads little-endian 16-bit PCM bytes back into samples.
 *
 * Used by tests and by diagnostics that need to inspect a chunk payload.
 * A trailing odd byte is ignored instead of throwing.
 */
export function bufferToPcm16(buffer: ArrayBuffer): Int16Array {
  const sampleCount = Math.floor(buffer.byteLength / 2);
  const output = new Int16Array(sampleCount);
  const view = new DataView(buffer);
  for (let i = 0; i < sampleCount; i += 1) {
    output[i] = view.getInt16(i * 2, true);
  }
  return output;
}
