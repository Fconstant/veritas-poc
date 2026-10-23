/* global AudioWorkletProcessor, registerProcessor, sampleRate */
/**
 * Veritas Live — PCM capture worklet (LIVE-003).
 *
 * Runs on the audio thread. Receives the mono (down-mixed) tab audio, resamples
 * it to the transcription target rate with linear interpolation and posts
 * `pcm16le` chunks of ~100 ms to the main thread.
 *
 * Protocol (main thread -> worklet):
 *   { type: 'pause' }  stop emitting; the media clock keeps advancing
 *   { type: 'resume' } resume emitting
 *   { type: 'flush' }  emit the last partial chunk, then { type: 'flushed' }
 *   { type: 'stop' }   the processor stops
 *
 * Protocol (worklet -> main thread):
 *   { type: 'ready', sourceRate, targetRate, chunkSamples } — diagnostics
 *   { type: 'chunk', buffer, samples, startSample, sampleRate } — transferred
 *   { type: 'flushed', startSample }
 *   { type: 'error', message }
 *
 * `startSample` is the media clock in the 16 kHz timeline. It keeps advancing
 * while the capture is paused, so the main thread can report an explicit gap
 * instead of silently compacting the session timeline.
 *
 * Plain standalone JS: no imports, no bundler, servable straight from /public.
 */

const DEFAULT_TARGET_RATE = 16000;
const DEFAULT_CHUNK_MS = 100;
const MAX_BUFFER_SAMPLES = 1 << 20;

function positiveNumber(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

/** Clips to [-1, 1] and rounds half-away-from-zero (mirrors resampler.ts). */
function toPcm16(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const clamped = value > 1 ? 1 : value < -1 ? -1 : value;
  const scaled = clamped * 32767;

  return scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
}

class PcmWorkletProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const processorOptions = (options && options.processorOptions) || {};
    const nativeRate =
      typeof sampleRate === 'number' && sampleRate > 0
        ? sampleRate
        : DEFAULT_TARGET_RATE;

    this.targetRate = positiveNumber(processorOptions.targetRate, DEFAULT_TARGET_RATE);
    this.chunkMs = positiveNumber(processorOptions.chunkMs, DEFAULT_CHUNK_MS);
    this.sourceRate = positiveNumber(processorOptions.sourceRate, nativeRate);
    this.chunkSamples = Math.max(1, Math.round((this.targetRate * this.chunkMs) / 1000));
    // Source samples per target sample (3 at 48 kHz -> 16 kHz).
    this.step = this.sourceRate / this.targetRate;

    // Preallocated mono source buffer: one chunk worth of samples plus the
    // interpolation look-ahead and one render quantum of slack.
    const initialCapacity =
      Math.ceil(this.chunkSamples * this.step * 2) + 512 + this.chunkSamples;
    this.buffer = new Float32Array(Math.max(4096, initialCapacity));
    this.length = 0;
    /** Fractional read position (in source samples) inside `buffer`. */
    this.readPos = 0;
    /** Target-domain samples emitted so far, including paused/skipped audio. */
    this.emittedSamples = 0;
    /**
     * Source frames discarded while paused and not yet converted to the target
     * domain. Integer accumulation keeps the paused clock exact (a 48 kHz source
     * paused for 1 s advances exactly 16000 samples, no drift).
     */
    this.pauseSourceFrames = 0;
    this.paused = false;
    this.stopped = false;

    this.port.onmessage = (event) => this.handleMessage(event.data);
    this.port.postMessage({
      type: 'ready',
      sourceRate: this.sourceRate,
      targetRate: this.targetRate,
      chunkSamples: this.chunkSamples,
    });
  }

  /**
   * AudioWorklet entry point. Returns `true` to stay alive.
   * No allocation per sample: only the per-chunk Int16Array is created.
   */
  process(inputs) {
    if (this.stopped) {
      return false;
    }

    const input = inputs[0];

    if (!input || input.length === 0 || !input[0]) {
      return true;
    }

    const frames = input[0].length;

    if (frames <= 0) {
      return true;
    }

    if (this.paused) {
      // Audio is not transmitted while paused, but the media clock must not
      // compact: the skipped interval is reported as a gap by the main thread.
      this.advancePausedClock(frames);
      return true;
    }

    this.appendMono(input, frames);

    while (this.emitChunk(false)) {
      // Drain every full chunk produced by this quantum.
    }

    return true;
  }

  /** Mixes all input channels to mono and appends them to the source buffer. */
  appendMono(input, frames) {
    const channels = input.length;
    this.ensureCapacity(this.length + frames);

    const buffer = this.buffer;
    const offset = this.length;

    if (channels === 1) {
      buffer.set(input[0], offset);
    } else {
      for (let frame = 0; frame < frames; frame += 1) {
        let sum = 0;
        for (let channel = 0; channel < channels; channel += 1) {
          sum += input[channel][frame];
        }
        buffer[offset + frame] = sum / channels;
      }
    }

    this.length += frames;
  }

  advancePausedClock(frames) {
    this.pauseSourceFrames += frames;

    const targetSamples = Math.floor(
      (this.pauseSourceFrames * this.targetRate) / this.sourceRate,
    );

    if (targetSamples <= 0) {
      return;
    }

    this.emittedSamples += targetSamples;
    // Keep the sub-sample remainder in the source domain so nothing is lost and
    // nothing is counted twice across successive pause blocks.
    this.pauseSourceFrames -= Math.ceil(
      (targetSamples * this.sourceRate) / this.targetRate,
    );
  }

  /** Number of target samples that can be produced from the buffered audio. */
  availableOutputSamples() {
    if (this.length === 0) {
      return 0;
    }

    const span = (this.length - 1 - this.readPos) / this.step;

    return span < 0 ? 0 : Math.floor(span) + 1;
  }

  /**
   * Emits one chunk. `final` emits whatever is left (last partial chunk of the
   * session) instead of waiting for a full one.
   */
  emitChunk(final) {
    const available = this.availableOutputSamples();
    const count = final ? available : this.chunkSamples;

    if (count <= 0 || available < count) {
      return false;
    }

    const pcm = new Int16Array(count);

    for (let index = 0; index < count; index += 1) {
      const position = this.readPos + index * this.step;
      const lower = Math.floor(position);
      const fraction = position - lower;
      const lowerValue = this.buffer[lower];
      const upperValue = lower + 1 < this.length ? this.buffer[lower + 1] : lowerValue;
      pcm[index] = toPcm16(lowerValue + (upperValue - lowerValue) * fraction);
    }

    const startSample = this.emittedSamples;
    this.emittedSamples += count;
    this.readPos += count * this.step;
    this.compact();

    const payload = pcm.buffer;
    this.port.postMessage(
      {
        type: 'chunk',
        buffer: payload,
        samples: count,
        startSample,
        sampleRate: this.targetRate,
      },
      [payload],
    );

    return true;
  }

  /** Drops the source samples already converted, keeping the interpolation tail. */
  compact() {
    const consumed = Math.floor(this.readPos);

    if (consumed <= 0) {
      return;
    }

    if (consumed >= this.length) {
      this.length = 0;
      this.readPos = 0;
      return;
    }

    this.buffer.copyWithin(0, consumed, this.length);
    this.length -= consumed;
    this.readPos -= consumed;
  }

  ensureCapacity(required) {
    if (required <= this.buffer.length) {
      return;
    }

    if (required > MAX_BUFFER_SAMPLES) {
      // Defensive: the buffer is drained every quantum, so this means the
      // consumer is gone. Reset instead of growing without bound.
      this.port.postMessage({ type: 'error', message: 'buffer overflow' });
      this.length = 0;
      this.readPos = 0;
      return;
    }

    let capacity = this.buffer.length;

    while (capacity < required) {
      capacity *= 2;
    }

    const next = new Float32Array(capacity);
    next.set(this.buffer.subarray(0, this.length));
    this.buffer = next;
  }

  /** Emits everything left as one final (partial) chunk. */
  flush() {
    while (this.emitChunk(false)) {
      // Drain full chunks first so only the remainder is sent as partial.
    }

    this.emitChunk(true);
    this.port.postMessage({ type: 'flushed', startSample: this.emittedSamples });
  }

  handleMessage(message) {
    if (!message || typeof message !== 'object') {
      return;
    }

    switch (message.type) {
      case 'pause':
        this.paused = true;
        break;
      case 'resume':
        this.paused = false;
        break;
      case 'flush':
        this.flush();
        break;
      case 'stop':
        this.stopped = true;
        break;
      default:
        break;
    }
  }
}

registerProcessor('pcm-worklet', PcmWorkletProcessor);
