import { describe, expect, it } from 'vitest';
import { TRANSCRIPT_SEGMENT_SCHEMA } from '@veritas/shared';
import {
  SegmentCorrectionError,
  SegmentNotFoundError,
  SegmentRevisionConflictError,
  SpeechSegmenter,
  detectUncertainty,
  isSilence,
  reconcileOverlap,
  rmsLevel,
  splitAtSentenceBoundary,
  type SpeechSegmenterOptions,
} from '#/live/speechSegments.js';

const FIXED_NOW = '2025-01-10T12:00:00.000Z';

const createSegmenter = (
  overrides: Partial<SpeechSegmenterOptions> = {},
): SpeechSegmenter =>
  new SpeechSegmenter({
    sessionId: 'session-1',
    clock: () => new Date(FIXED_NOW),
    ...overrides,
  });

const loudPcm = (samples = 160): Buffer => {
  const buffer = Buffer.alloc(samples * 2);
  for (let index = 0; index < samples; index++) {
    buffer.writeInt16LE((index % 2 === 0 ? 1 : -1) * 12_000, index * 2);
  }
  return buffer;
};

describe('reconcileOverlap', () => {
  it('trims a repeated tail/prefix without duplicating words', () => {
    expect(
      reconcileOverlap('o pix foi criado em', 'foi criado em 2015 pelo banco'),
    ).toEqual({
      text: 'o pix foi criado em 2015 pelo banco',
      trimmedWords: 3,
    });
  });

  it('still trims when the previous text ends with a sentence terminator', () => {
    expect(
      reconcileOverlap(
        'o pix foi criado em 2015.',
        'criado em 2015. Pelo banco central',
      ),
    ).toEqual({
      text: 'o pix foi criado em 2015. Pelo banco central',
      trimmedWords: 3,
    });
  });

  it('keeps every word when there is no overlap', () => {
    expect(reconcileOverlap('bom dia', 'boa tarde')).toEqual({
      text: 'bom dia boa tarde',
      trimmedWords: 0,
    });
  });

  it('never drops a repeated sentence after a terminator', () => {
    const result = reconcileOverlap(
      'isso é falso. Não é verdade',
      'Não é verdade',
    );
    expect(result.text).toBe('isso é falso. Não é verdade');
    expect(result.trimmedWords).toBe(3);
  });

  it('keeps adjacent negations that are not a genuine overlap', () => {
    expect(reconcileOverlap('isso é falso e não', 'não é verdade')).toEqual({
      text: 'isso é falso e não não é verdade',
      trimmedWords: 0,
    });
  });

  it('does not collapse a single shared negation', () => {
    expect(reconcileOverlap('o candidato falou', 'falou muito')).toEqual({
      text: 'o candidato falou muito',
      trimmedWords: 1,
    });
    expect(reconcileOverlap('isso é falso e não', 'não aumentou')).toEqual({
      text: 'isso é falso e não não aumentou',
      trimmedWords: 0,
    });
  });

  it('handles full containment and empty sides', () => {
    expect(reconcileOverlap('texto completo', 'texto completo')).toEqual({
      text: 'texto completo',
      trimmedWords: 2,
    });
    expect(reconcileOverlap('', 'novo')).toEqual({
      text: 'novo',
      trimmedWords: 0,
    });
    expect(reconcileOverlap('antigo', '')).toEqual({
      text: 'antigo',
      trimmedWords: 0,
    });
  });
});

describe('splitAtSentenceBoundary', () => {
  it('splits on the last terminator inside the limit', () => {
    const split = splitAtSentenceBoundary(
      'Primeira frase. Segunda frase. Terceira frase.',
      34,
    );
    expect(split).toEqual({
      prefix: 'Primeira frase. Segunda frase.',
      remainder: 'Terceira frase.',
    });
  });

  it('never cuts a number with a thousands separator', () => {
    expect(
      splitAtSentenceBoundary('O valor foi de R$ 1.500,00 em 2022.', 30),
    ).toBeUndefined();
  });

  it('returns undefined without a safe boundary', () => {
    expect(
      splitAtSentenceBoundary('sem pontuação nenhuma', 10),
    ).toBeUndefined();
  });
});

describe('detectUncertainty', () => {
  it('flags numbers, negations and low confidence independently', () => {
    expect(detectUncertainty('o valor é 600 reais', 0.9)).toEqual(['NUMBER']);
    expect(detectUncertainty('não houve aumento', 0.9)).toEqual(['NEGATION']);
    expect(detectUncertainty('o valor é 600 e não subiu', 0.4)).toEqual([
      'NUMBER',
      'NEGATION',
      'LOW_CONFIDENCE',
    ]);
    expect(detectUncertainty('texto neutro', 0.9)).toEqual([]);
  });
});

describe('isSilence', () => {
  it('detects digital silence and loud speech', () => {
    expect(isSilence(Buffer.alloc(320))).toBe(true);
    expect(isSilence(Buffer.alloc(0))).toBe(true);
    expect(isSilence(loudPcm())).toBe(false);
    expect(rmsLevel(Buffer.alloc(320))).toBe(0);
    expect(rmsLevel(loudPcm())).toBeGreaterThan(0.3);
  });

  it('honours a custom threshold and rejects invalid ones', () => {
    const quiet = Buffer.alloc(320);
    for (let index = 0; index < 160; index++) {
      quiet.writeInt16LE(200, index * 2);
    }
    expect(isSilence(quiet, 0.001)).toBe(false);
    expect(isSilence(quiet, 0.5)).toBe(true);
    expect(() => isSilence(quiet, -1)).toThrow(RangeError);
  });
});

describe('SpeechSegmenter windows', () => {
  it('merges overlapping windows without repeating words and keeps one stable id', () => {
    const segmenter = createSegmenter();
    const first = segmenter.pushWindow({
      text: 'o pix foi criado em',
      startMs: 0,
      endMs: 3000,
      confidence: 0.9,
    });
    const second = segmenter.pushWindow({
      text: 'foi criado em 2015 pelo banco central',
      startMs: 2000,
      endMs: 6000,
      confidence: 0.9,
    });

    expect(first.current?.status).toBe('PROVISIONAL');
    expect(second.overlapWordsTrimmed).toBe(3);
    expect(second.current?.text).toBe(
      'o pix foi criado em 2015 pelo banco central',
    );
    expect(second.current?.id).toBe(first.current?.id);
    expect(second.current?.revision).toBe(1);
    expect(second.current?.text.match(/foi criado em/gu) ?? []).toHaveLength(1);
    expect(second.current?.startMs).toBe(0);
    expect(second.current?.endMs).toBe(6000);
  });

  it('keeps repeated words when the media clock does not overlap', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow({
      text: 'isso é falso e não',
      startMs: 0,
      endMs: 3000,
      confidence: 0.9,
    });
    const second = segmenter.pushWindow({
      text: 'não é verdade',
      startMs: 3000,
      endMs: 5000,
      confidence: 0.9,
    });

    expect(second.overlapWordsTrimmed).toBe(0);
    expect(second.current?.text).toBe('isso é falso e não não é verdade');
  });

  it('starts a new segment after a silence gap and finalizes the previous one', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow({
      text: 'essa é uma fala longa o suficiente para fechar',
      startMs: 0,
      endMs: 3000,
      confidence: 0.9,
    });
    const result = segmenter.pushWindow({
      text: 'outra fala',
      startMs: 5000,
      endMs: 8000,
      confidence: 0.9,
    });

    expect(result.finalized).toHaveLength(1);
    expect(result.finalized[0]?.status).toBe('FINAL');
    expect(result.finalized[0]?.text).toBe(
      'essa é uma fala longa o suficiente para fechar',
    );
    expect(result.current?.text).toBe('outra fala');
    expect(result.current?.id).not.toBe(result.finalized[0]?.id);
  });

  it('respects a speaker change reported by diarization', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow(
      { text: 'primeira fala do locutor um', startMs: 0, endMs: 2000 },
      { speakerId: 'speaker-1' },
    );
    const result = segmenter.pushWindow(
      { text: 'segunda fala do locutor dois', startMs: 2000, endMs: 4000 },
      { speakerId: 'speaker-2' },
    );

    expect(result.finalized[0]?.speakerId).toBe('speaker-1');
    expect(result.current?.speakerId).toBe('speaker-2');
  });

  it('splits a long accumulation on sentence punctuation', () => {
    const segmenter = createSegmenter({ maxSegmentChars: 60 });
    const result = segmenter.pushWindow({
      text: 'A primeira frase é longa o suficiente. A segunda frase também é longa.',
      startMs: 0,
      endMs: 8000,
      confidence: 0.9,
    });

    expect(result.finalized).toHaveLength(1);
    expect(result.finalized[0]?.text).toBe(
      'A primeira frase é longa o suficiente.',
    );
    expect(result.finalized[0]?.status).toBe('FINAL');
    expect(result.current?.text).toBe('A segunda frase também é longa.');
    expect(result.current?.status).toBe('PROVISIONAL');
    expect(result.current?.startMs).toBeGreaterThanOrEqual(
      result.finalized[0]?.endMs ?? 0,
    );
  });

  it('never silently drops empty text on an open segment', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow({
      text: 'texto já transcrito',
      startMs: 0,
      endMs: 2000,
      confidence: 0.9,
    });
    const result = segmenter.pushWindow({
      text: '   ',
      startMs: 2000,
      endMs: 4000,
      confidence: 0.9,
    });

    expect(result.current?.text).toBe('texto já transcrito');
    expect(result.current?.uncertaintyReasons).toContain('TRANSCRIPTION_ERROR');
    expect(segmenter.finalize().at(0)?.status).toBe('BLOCKED');
  });

  it('produces schema-valid segments', () => {
    const segmenter = createSegmenter({ maxSegmentChars: 60 });
    const result = segmenter.pushWindow({
      text: 'A primeira frase é longa o suficiente. A segunda frase também é longa.',
      startMs: 0,
      endMs: 8000,
      confidence: 0.9,
    });

    for (const segment of [...result.finalized, result.current]) {
      expect(TRANSCRIPT_SEGMENT_SCHEMA.safeParse(segment).success).toBe(true);
    }
  });
});

describe('SpeechSegmenter uncertainty', () => {
  it('blocks a low-confidence number with NUMBER and LOW_CONFIDENCE', () => {
    const segmenter = createSegmenter();
    const provisional = segmenter.pushWindow({
      text: 'o auxílio é de 600 reais',
      startMs: 0,
      endMs: 3000,
      confidence: 0.4,
    });
    expect(provisional.current?.uncertaintyReasons).toEqual([
      'NUMBER',
      'LOW_CONFIDENCE',
    ]);

    const finalized = segmenter.finalize();

    expect(finalized[0]?.status).toBe('BLOCKED');
    expect(finalized[0]?.uncertaintyReasons).toEqual([
      'NUMBER',
      'LOW_CONFIDENCE',
    ]);
  });

  it('blocks negations whose confidence is unknown', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow({
      text: 'não houve aumento do benefício',
      startMs: 0,
      endMs: 3000,
    });
    const finalized = segmenter.finalize();

    expect(finalized[0]?.status).toBe('BLOCKED');
    expect(finalized[0]?.uncertaintyReasons).toEqual(['NEGATION']);
  });

  it('keeps confirmed numbers final but records the NUMBER signal', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow({
      text: 'o auxílio é de 600 reais',
      startMs: 0,
      endMs: 3000,
      confidence: 0.93,
    });
    const finalized = segmenter.finalize();

    expect(finalized[0]?.status).toBe('FINAL');
    expect(finalized[0]?.uncertaintyReasons).toEqual(['NUMBER']);
  });

  it('blocks overlapping audio reported by the session', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow(
      {
        text: 'duas pessoas falando ao mesmo tempo',
        startMs: 0,
        endMs: 3000,
        confidence: 0.95,
      },
      { reasons: ['OVERLAP'] },
    );
    const finalized = segmenter.finalize();

    expect(finalized[0]?.status).toBe('BLOCKED');
    expect(finalized[0]?.uncertaintyReasons).toContain('OVERLAP');
  });
});

describe('SpeechSegmenter corrections', () => {
  it('applies a correction with revision+1 and keeps the history', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow({
      text: 'o auxílio é de 600 reais',
      startMs: 0,
      endMs: 3000,
      confidence: 0.4,
    });
    const blocked = segmenter.finalize().at(0);
    expect(blocked).toBeDefined();
    if (blocked === undefined) {
      return;
    }
    expect(blocked.status).toBe('BLOCKED');

    const corrected = segmenter.correct(
      blocked.id,
      'o auxílio é de 600 reais por mês',
      blocked.revision,
    );

    expect(corrected.status).toBe('FINAL');
    expect(corrected.revision).toBe(blocked.revision + 1);
    expect(corrected.text).toBe('o auxílio é de 600 reais por mês');
    expect(corrected.uncertaintyReasons).toBeUndefined();

    const history = segmenter.getHistory(blocked.id);
    expect(history.map((entry) => entry.revision)).toEqual([
      blocked.revision,
      corrected.revision,
    ]);
    expect(history[0]?.text).toBe('o auxílio é de 600 reais');
    expect(history[1]?.text).toBe('o auxílio é de 600 reais por mês');

    const dependencies = segmenter.getDependencies(blocked.id);
    expect(dependencies).toContainEqual({
      kind: 'revision',
      segmentId: blocked.id,
      revision: blocked.revision,
    });
    expect(
      dependencies.some((dependency) => dependency.kind === 'window'),
    ).toBe(true);
  });

  it('rejects a stale expected revision', () => {
    const segmenter = createSegmenter();
    segmenter.pushWindow({
      text: 'primeira versão',
      startMs: 0,
      endMs: 2000,
      confidence: 0.9,
    });
    const segment = segmenter.finalize().at(0);
    expect(segment).toBeDefined();
    if (segment === undefined) {
      return;
    }
    segmenter.correct(segment.id, 'segunda versão', segment.revision);

    expect(() =>
      segmenter.correct(segment.id, 'terceira versão', segment.revision),
    ).toThrow(SegmentRevisionConflictError);
    try {
      segmenter.correct(segment.id, 'terceira versão', segment.revision);
    } catch (error) {
      expect(error).toBeInstanceOf(SegmentRevisionConflictError);
      const conflict = error as SegmentRevisionConflictError;
      expect(conflict.expectedRevision).toBe(segment.revision);
      expect(conflict.actualRevision).toBe(segment.revision + 1);
    }
  });

  it('rejects unknown segments and empty corrections', () => {
    const segmenter = createSegmenter();
    expect(() => segmenter.correct('missing', 'x', 0)).toThrow(
      SegmentNotFoundError,
    );

    segmenter.pushWindow({
      text: 'texto original',
      startMs: 0,
      endMs: 2000,
      confidence: 0.9,
    });
    const segment = segmenter.finalize().at(0);
    expect(segment).toBeDefined();
    if (segment === undefined) {
      return;
    }
    expect(() => segmenter.correct(segment.id, '  ', segment.revision)).toThrow(
      SegmentCorrectionError,
    );
  });

  it('requires certainty again when new words arrive after a correction', () => {
    const segmenter = createSegmenter();
    const pushed = segmenter.pushWindow({
      text: 'texto provisório',
      startMs: 0,
      endMs: 2000,
      confidence: 0.9,
    });
    const segment = pushed.current;
    expect(segment).toBeDefined();
    if (segment === undefined) {
      return;
    }
    segmenter.correct(
      segment.id,
      'texto provisório corrigido',
      segment.revision,
    );
    segmenter.pushWindow({
      text: 'agora com 600 reais',
      startMs: 2000,
      endMs: 4000,
      confidence: 0.3,
    });

    const finalized = segmenter.finalize().at(0);

    expect(finalized?.status).toBe('BLOCKED');
    expect(finalized?.uncertaintyReasons).toContain('LOW_CONFIDENCE');
    expect(finalized?.uncertaintyReasons).toContain('NUMBER');
  });

  it('keeps a corrected provisional segment provisional', () => {
    const segmenter = createSegmenter();
    const pushed = segmenter.pushWindow({
      text: 'texto provisório',
      startMs: 0,
      endMs: 2000,
      confidence: 0.9,
    });
    const segment = pushed.current;
    expect(segment).toBeDefined();
    if (segment === undefined) {
      return;
    }

    const corrected = segmenter.correct(
      segment.id,
      'texto provisório corrigido',
      segment.revision,
    );

    expect(corrected.status).toBe('PROVISIONAL');
    expect(corrected.revision).toBe(segment.revision + 1);
  });
});

describe('SpeechSegmenter cursors and snapshots', () => {
  it('reports segments changed after a cursor', () => {
    const segmenter = createSegmenter();
    expect(segmenter.getCursor()).toBe(0);
    expect(segmenter.getSegments(0)).toEqual([]);

    segmenter.pushWindow({
      text: 'primeira fala longa o suficiente para fechar aqui',
      startMs: 0,
      endMs: 2000,
      confidence: 0.9,
    });
    const firstCursor = segmenter.getCursor();
    expect(firstCursor).toBeGreaterThan(0);
    expect(segmenter.getSegments(0)).toHaveLength(1);

    segmenter.pushWindow({
      text: 'segunda fala',
      startMs: 6000,
      endMs: 8000,
      confidence: 0.9,
    });

    expect(segmenter.getSegments(firstCursor).length).toBeGreaterThan(0);
    expect(segmenter.getSegments(segmenter.getCursor())).toEqual([]);
    expect(segmenter.getAllSegments()).toHaveLength(2);
    expect(segmenter.getSegment('missing')).toBeUndefined();
  });

  it('keeps ids stable and revisions monotonic across windows', () => {
    const segmenter = createSegmenter();
    const first = segmenter.pushWindow({
      text: 'texto',
      startMs: 0,
      endMs: 2000,
      confidence: 0.9,
    });
    const second = segmenter.pushWindow({
      text: 'texto maior agora',
      startMs: 1000,
      endMs: 4000,
      confidence: 0.9,
    });

    expect(second.current?.id).toBe(first.current?.id);
    expect(second.current?.revision).toBeGreaterThan(
      first.current?.revision ?? 0,
    );
  });
});
