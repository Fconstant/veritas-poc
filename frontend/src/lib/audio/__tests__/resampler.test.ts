import assert from 'node:assert/strict';
import test from 'node:test';

import {
  TARGET_SAMPLE_RATE,
  bufferToPcm16,
  downsampleTo16k,
  floatToPcm16,
  floatToPcm16Sample,
  pcm16ToBuffer,
} from '../resampler';

const SINE_HZ = 440;

function makeSine(
  sampleRate: number,
  durationMs: number,
  frequency = SINE_HZ,
  amplitude = 0.8,
): Float32Array {
  const length = Math.round((sampleRate * durationMs) / 1000);
  const samples = new Float32Array(length);

  for (let index = 0; index < length; index += 1) {
    samples[index] = amplitude * Math.sin((2 * Math.PI * frequency * index) / sampleRate);
  }

  return samples;
}

function maxAbsDiff(left: Float32Array, right: Float32Array): number {
  assert.equal(left.length, right.length, 'comprimentos diferentes');

  let worst = 0;

  for (let index = 0; index < left.length; index += 1) {
    const diff = Math.abs(left[index] - right[index]);
    if (diff > worst) {
      worst = diff;
    }
  }

  return worst;
}

test('downsampleTo16k: 48 kHz -> 16 kHz produz 1/3 das amostras', () => {
  const input = makeSine(48000, 100);
  const output = downsampleTo16k(input, 48000);

  assert.equal(input.length, 4800);
  assert.equal(output.length, 1600);
  assert.equal(output.length, Math.round(input.length / 3));
});

test('downsampleTo16k: 48 kHz preserva a forma do sinal', () => {
  const input = makeSine(48000, 100);
  const output = downsampleTo16k(input, 48000);
  // 48000 / 16000 == 3 exatamente: a interpolação cai em índices inteiros.
  const expected = makeSine(TARGET_SAMPLE_RATE, 100);

  assert.ok(maxAbsDiff(output, expected) < 1e-6);
});

test('downsampleTo16k: 44,1 kHz -> 16 kHz mantém a duração e a forma aproximada', () => {
  const input = makeSine(44100, 100);
  const output = downsampleTo16k(input, 44100);

  assert.equal(output.length, 1600);
  assert.ok(
    maxAbsDiff(output, makeSine(TARGET_SAMPLE_RATE, 100)) < 0.02,
    'interpolação linear deve acompanhar a senoide de 440 Hz',
  );
});

test('downsampleTo16k: 8 kHz -> 16 kHz faz upsampling sem distorcer a senoide', () => {
  const input = makeSine(8000, 100);
  const output = downsampleTo16k(input, 8000);
  const expected = makeSine(TARGET_SAMPLE_RATE, 100);

  assert.equal(output.length, 1600);
  // A última amostra é a borda do buffer (interpolação não tem look-ahead);
  // o trecho útil precisa acompanhar a senoide.
  assert.ok(
    maxAbsDiff(output.subarray(0, output.length - 1), expected.subarray(0, expected.length - 1)) <
      0.02,
  );
});

test('downsampleTo16k: 16 kHz é passthrough (mesma referência)', () => {
  const input = makeSine(16000, 100);
  const output = downsampleTo16k(input, TARGET_SAMPLE_RATE);

  assert.equal(output, input);
  assert.equal(output.length, 1600);
});

test('downsampleTo16k: preserva DC e entradas vazias', () => {
  const dc = new Float32Array(4800).fill(0.25);
  const output = downsampleTo16k(dc, 48000);

  assert.equal(output.length, 1600);
  assert.ok(output.every((sample) => Math.abs(sample - 0.25) < 1e-6));

  assert.equal(downsampleTo16k(new Float32Array(0), 48000).length, 0);
  assert.equal(downsampleTo16k(new Float32Array(1), 48000).length, 1);
});

test('downsampleTo16k: rejeita taxas inválidas', () => {
  const input = new Float32Array(10);

  for (const rate of [0, -8000, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => downsampleTo16k(input, rate), RangeError);
  }
});

test('floatToPcm16: aplica clipping em [-1, 1]', () => {
  const output = floatToPcm16(
    new Float32Array([0, 1, -1, 1.5, -1.5, 2, -2, 0.25, -0.25]),
  );

  assert.deepEqual(
    Array.from(output),
    [0, 32767, -32767, 32767, -32767, 32767, -32767, 8192, -8192],
  );
});

test('floatToPcm16: arredonda simetricamente e neutraliza NaN', () => {
  assert.equal(floatToPcm16Sample(0.5), 16384);
  assert.equal(floatToPcm16Sample(-0.5), -16384);
  assert.equal(floatToPcm16Sample(0.1), 3277);
  assert.equal(floatToPcm16Sample(Number.NaN), 0);
  assert.equal(floatToPcm16Sample(Number.POSITIVE_INFINITY), 0);
  assert.equal(floatToPcm16Sample(-1), -32767);
});

test('pcm16ToBuffer: grava little-endian', () => {
  const buffer = pcm16ToBuffer(new Int16Array([1, -1, 256, -256]));
  const bytes = Array.from(new Uint8Array(buffer));

  assert.equal(buffer.byteLength, 8);
  assert.deepEqual(bytes, [0x01, 0x00, 0xff, 0xff, 0x00, 0x01, 0x00, 0xff]);
  assert.deepEqual(Array.from(bufferToPcm16(buffer)), [1, -1, 256, -256]);
});

test('pcm16ToBuffer: buffer vazio e valores extremos', () => {
  assert.equal(pcm16ToBuffer(new Int16Array(0)).byteLength, 0);

  const extremes = pcm16ToBuffer(new Int16Array([32767, -32768]));
  const view = new DataView(extremes);

  assert.equal(view.getInt16(0, true), 32767);
  assert.equal(view.getInt16(2, true), -32768);
});
