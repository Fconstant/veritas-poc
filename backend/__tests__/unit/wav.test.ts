import { describe, expect, it } from 'vitest';
import {
  InvalidPcmError,
  PCM16_AUDIO_FORMAT,
  WAV_HEADER_BYTES,
  WavParseError,
  msToSamples,
  parseWavHeader,
  pcm16ToWav,
  samplesToMs,
} from '#/live/wav.js';

const pcm = (samples: number): Buffer => {
  const buffer = Buffer.alloc(samples * 2);
  for (let index = 0; index < samples; index++) {
    buffer.writeInt16LE(((index % 100) - 50) * 100, index * 2);
  }
  return buffer;
};

describe('pcm16ToWav', () => {
  it('writes a canonical 44-byte RIFF/WAVE header for mono 16 kHz', () => {
    const payload = pcm(1600);
    const wav = pcm16ToWav(payload);

    expect(wav.length).toBe(WAV_HEADER_BYTES + payload.length);
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
    expect(wav.toString('ascii', 8, 12)).toBe('WAVE');
    expect(wav.toString('ascii', 12, 16)).toBe('fmt ');
    expect(wav.toString('ascii', 36, 40)).toBe('data');

    const header = parseWavHeader(wav);
    expect(header).toEqual({
      audioFormat: PCM16_AUDIO_FORMAT,
      channels: 1,
      sampleRate: 16000,
      byteRate: 16000 * 2,
      blockAlign: 2,
      bitsPerSample: 16,
      dataBytes: payload.length,
      riffSize: 36 + payload.length,
      totalBytes: WAV_HEADER_BYTES + payload.length,
    });
  });

  it('copies the PCM payload instead of aliasing it', () => {
    const payload = pcm(8);
    const original = Buffer.from(payload);
    const wav = pcm16ToWav(payload);
    payload.fill(0);

    expect(wav.subarray(WAV_HEADER_BYTES).equals(original)).toBe(true);
    expect(wav.readInt16LE(WAV_HEADER_BYTES)).toBe(-5000);
  });

  it('supports stereo with a consistent block align and byte rate', () => {
    const frames = 100;
    const stereo = Buffer.alloc(frames * 4);
    const wav = pcm16ToWav(stereo, 48000, 2);
    const header = parseWavHeader(wav);

    expect(header.channels).toBe(2);
    expect(header.blockAlign).toBe(4);
    expect(header.byteRate).toBe(48000 * 4);
    expect(header.dataBytes).toBe(frames * 4);
    expect(wav.length).toBe(WAV_HEADER_BYTES + frames * 4);
  });

  it('handles an empty payload as a valid header-only WAV', () => {
    const wav = pcm16ToWav(Buffer.alloc(0));
    expect(wav.length).toBe(WAV_HEADER_BYTES);
    expect(parseWavHeader(wav).dataBytes).toBe(0);
  });

  it('rejects an odd number of bytes for mono PCM16', () => {
    expect(() => pcm16ToWav(Buffer.alloc(3))).toThrow(InvalidPcmError);
    expect(() => pcm16ToWav(Buffer.alloc(3))).toThrow(/block size/);
  });

  it('rejects a payload that is not a whole number of stereo frames', () => {
    expect(() => pcm16ToWav(Buffer.alloc(6), 16000, 2)).toThrow(
      InvalidPcmError,
    );
  });

  it('guards mono/stereo channel counts', () => {
    expect(() => pcm16ToWav(Buffer.alloc(2), 16000, 0)).toThrow(
      InvalidPcmError,
    );
    expect(() => pcm16ToWav(Buffer.alloc(4), 16000, 3)).toThrow(/channels/);
    expect(() => pcm16ToWav(Buffer.alloc(2), 16000, 1.5)).toThrow(
      InvalidPcmError,
    );
  });

  it('guards the sample rate', () => {
    expect(() => pcm16ToWav(Buffer.alloc(2), 0)).toThrow(InvalidPcmError);
    expect(() => pcm16ToWav(Buffer.alloc(2), 16000.5)).toThrow(InvalidPcmError);
  });
});

describe('parseWavHeader', () => {
  it('rejects short, foreign and truncated containers', () => {
    expect(() => parseWavHeader(Buffer.alloc(10))).toThrow(WavParseError);

    const foreign = pcm16ToWav(pcm(4));
    foreign.write('RIFX', 0, 'ascii');
    expect(() => parseWavHeader(foreign)).toThrow(/RIFF/);

    const truncated = pcm16ToWav(pcm(4)).subarray(0, WAV_HEADER_BYTES + 2);
    expect(() => parseWavHeader(truncated)).toThrow(/extends beyond/);
  });

  it('rejects inconsistent fields', () => {
    const wrongFormat = pcm16ToWav(pcm(4));
    wrongFormat.writeUInt16LE(3, 20); // IEEE float
    expect(() => parseWavHeader(wrongFormat)).toThrow(/audio format/);

    const wrongDepth = pcm16ToWav(pcm(4));
    wrongDepth.writeUInt16LE(8, 34);
    expect(() => parseWavHeader(wrongDepth)).toThrow(/bit depth/);

    const wrongBlockAlign = pcm16ToWav(pcm(4));
    wrongBlockAlign.writeUInt16LE(4, 32);
    expect(() => parseWavHeader(wrongBlockAlign)).toThrow(/block align/);

    const wrongRiffSize = pcm16ToWav(pcm(4));
    wrongRiffSize.writeUInt32LE(1, 4);
    expect(() => parseWavHeader(wrongRiffSize)).toThrow(/RIFF chunk size/);
  });
});

describe('sample/time helpers', () => {
  it('converts between samples and milliseconds at 16 kHz', () => {
    expect(msToSamples(1000)).toBe(16000);
    expect(msToSamples(8000)).toBe(128000);
    expect(msToSamples(0)).toBe(0);
    expect(samplesToMs(16000)).toBe(1000);
    expect(samplesToMs(128000)).toBe(8000);
    expect(samplesToMs(0)).toBe(0);
  });

  it('rejects negative or non-finite input', () => {
    expect(() => msToSamples(-1)).toThrow(RangeError);
    expect(() => samplesToMs(Number.NaN)).toThrow(RangeError);
  });
});
