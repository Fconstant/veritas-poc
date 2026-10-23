import { describe, expect, it } from 'vitest';
import type { TranscriptSegment } from '@veritas/shared';
import {
  ContextManager,
  DEFAULT_CONTEXT_MAX_SEGMENTS,
  UNKNOWN_SPEAKER_LABEL,
  formatMediaTimestamp,
} from '#/live/contextManager.js';

const segment = (
  overrides: Partial<TranscriptSegment> & Pick<TranscriptSegment, 'id'>,
): TranscriptSegment => ({
  sessionId: 'session-1',
  revision: 0,
  status: 'FINAL',
  text: 'texto padrão',
  startMs: 0,
  endMs: 1000,
  createdAt: '2025-01-10T12:00:00.000Z',
  ...overrides,
});

describe('formatMediaTimestamp', () => {
  it('formats media time as mm:ss', () => {
    expect(formatMediaTimestamp(0)).toBe('00:00');
    expect(formatMediaTimestamp(4_000)).toBe('00:04');
    expect(formatMediaTimestamp(65_000)).toBe('01:05');
    expect(formatMediaTimestamp(6_000_000)).toBe('100:00');
    expect(formatMediaTimestamp(-500)).toBe('00:00');
  });
});

describe('ContextManager', () => {
  it('keeps pronoun context available to the following utterance', () => {
    const manager = new ContextManager();
    manager.addSegment(
      segment({
        id: 'seg-1',
        speakerId: 'spk-a',
        text: 'O auxílio de R$ 600 foi criado em 2023.',
        startMs: 0,
        endMs: 3_000,
      }),
    );
    manager.addSegment(
      segment({
        id: 'seg-2',
        speakerId: 'spk-b',
        text: 'Ele foi pago por doze meses.',
        startMs: 3_000,
        endMs: 6_000,
      }),
    );

    const context = manager.getContext();

    expect(context.text).toContain('O auxílio de R$ 600 foi criado em 2023.');
    expect(context.text).toContain('Ele foi pago por doze meses.');
    expect(context.segments.map((item) => item.id)).toEqual(['seg-1', 'seg-2']);
  });

  it('labels each speaker separately and never merges opponents', () => {
    const manager = new ContextManager();
    manager.addSegment(
      segment({
        id: 'seg-a',
        speakerId: 'candidato-a',
        text: 'Eu vou criar o auxílio de R$ 600.',
        startMs: 0,
        endMs: 4_000,
      }),
    );
    manager.addSegment(
      segment({
        id: 'seg-b',
        speakerId: 'candidato-b',
        text: 'Ele não criou nada disso.',
        startMs: 4_000,
        endMs: 7_000,
      }),
    );

    const lines = manager.getContext().text.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('[00:00] candidato-a: Eu vou criar o auxílio de R$ 600.');
    expect(lines[1]).toBe('[00:04] candidato-b: Ele não criou nada disso.');
  });

  it('uses the unknown speaker label when the speaker is not identified', () => {
    const manager = new ContextManager();
    manager.addSegment(
      segment({ id: 'seg-1', text: 'Fala sem locutor identificado.' }),
    );

    expect(manager.getContext().text).toBe(
      `[00:00] ${UNKNOWN_SPEAKER_LABEL}: Fala sem locutor identificado.`,
    );
  });

  it('replaces a stale revision and records the revision actually used', () => {
    const manager = new ContextManager();
    manager.addSegment(
      segment({
        id: 'seg-1',
        revision: 0,
        text: 'O Pix foi criado em 2015.',
      }),
    );
    manager.addSegment(
      segment({
        id: 'seg-1',
        revision: 1,
        text: 'O Pix foi criado em 2020.',
      }),
    );

    const context = manager.getContext();

    expect(context.text).toContain('O Pix foi criado em 2020.');
    expect(context.text).not.toContain('2015');
    expect(context.dependencies).toEqual([{ id: 'seg-1', revision: 1 }]);

    manager.addSegment(
      segment({
        id: 'seg-1',
        revision: 0,
        text: 'O Pix foi criado em 1999.',
      }),
    );
    expect(manager.getContext().text).not.toContain('1999');
  });

  it('bounds the window by maxSegments', () => {
    const manager = new ContextManager({ maxSegments: 2 });
    manager.addSegment(segment({ id: 'seg-1', text: 'Primeira fala.', startMs: 0 }));
    manager.addSegment(segment({ id: 'seg-2', text: 'Segunda fala.', startMs: 1_000 }));
    manager.addSegment(segment({ id: 'seg-3', text: 'Terceira fala.', startMs: 2_000 }));

    const context = manager.getContext();

    expect(context.segments.map((item) => item.id)).toEqual(['seg-2', 'seg-3']);
    expect(context.text).not.toContain('Primeira fala.');
  });

  it('bounds the window by maxAgeMs relative to the newest segment', () => {
    const manager = new ContextManager({ maxAgeMs: 70_000 });
    manager.addSegment(segment({ id: 'seg-1', text: 'Fala antiga.', startMs: 0, endMs: 1_000 }));
    manager.addSegment(
      segment({ id: 'seg-2', text: 'Fala intermediária.', startMs: 60_000, endMs: 61_000 }),
    );
    manager.addSegment(
      segment({ id: 'seg-3', text: 'Fala recente.', startMs: 120_000, endMs: 121_000 }),
    );

    const context = manager.getContext();

    expect(context.segments.map((item) => item.id)).toEqual(['seg-2', 'seg-3']);
  });

  it('bounds the window by maxChars and keeps the newest speech', () => {
    const manager = new ContextManager({ maxChars: 60 });
    manager.addSegment(
      segment({ id: 'seg-1', speakerId: 'spk-a', text: 'Fala muito antiga.', startMs: 0 }),
    );
    manager.addSegment(
      segment({ id: 'seg-2', speakerId: 'spk-b', text: 'Fala recente.', startMs: 1_000 }),
    );
    manager.addSegment(
      segment({ id: 'seg-3', speakerId: 'spk-c', text: 'Última fala.', startMs: 2_000 }),
    );

    const context = manager.getContext();

    expect(context.text.length).toBeLessThanOrEqual(60);
    expect(context.text).toContain('Última fala.');
    expect(context.text).not.toContain('Fala muito antiga.');
  });

  it('truncates a segment that alone exceeds the char budget', () => {
    const manager = new ContextManager({ maxChars: 80 });
    manager.addSegment(
      segment({
        id: 'seg-1',
        speakerId: 'spk-a',
        text: 'Uma fala muito longa que não cabe inteira dentro do orçamento de caracteres do contexto.',
      }),
    );

    const context = manager.getContext();

    expect(context.text.length).toBeLessThanOrEqual(80);
    expect(context.text.endsWith('…')).toBe(true);
    expect(context.dependencies).toEqual([{ id: 'seg-1', revision: 0 }]);
  });

  it('exposes the formatted text through getContextText', () => {
    const manager = new ContextManager();
    manager.addSegment(
      segment({ id: 'seg-1', speakerId: 'spk-a', text: 'Fala curta.' }),
    );

    expect(manager.getContextText()).toBe('[00:00] spk-a: Fala curta.');
  });

  it('reports ids and revisions of every segment used by the last window', () => {
    const manager = new ContextManager({ maxSegments: 2 });
    expect(manager.getDependencies()).toEqual([]);

    manager.addSegment(segment({ id: 'seg-1', revision: 0, text: 'A.', startMs: 0 }));
    manager.addSegment(segment({ id: 'seg-2', revision: 3, text: 'B.', startMs: 1_000 }));
    manager.addSegment(segment({ id: 'seg-3', revision: 1, text: 'C.', startMs: 2_000 }));

    manager.getContext();

    expect(manager.getDependencies()).toEqual([
      { id: 'seg-2', revision: 3 },
      { id: 'seg-3', revision: 1 },
    ]);
  });

  it('excludes the segment under analysis from the context and dependencies', () => {
    const manager = new ContextManager();
    manager.addSegment(segment({ id: 'seg-1', text: 'Fala anterior.', startMs: 0 }));
    manager.addSegment(segment({ id: 'seg-2', text: 'Fala atual.', startMs: 1_000 }));

    const context = manager.getContext({ excludeSegmentId: 'seg-2' });

    expect(context.segments.map((item) => item.id)).toEqual(['seg-1']);
    expect(context.dependencies).toEqual([{ id: 'seg-1', revision: 0 }]);
  });

  it('orders segments by media start regardless of insertion order', () => {
    const manager = new ContextManager();
    manager.addSegment(segment({ id: 'seg-3', text: 'Terceira.', startMs: 20_000 }));
    manager.addSegment(segment({ id: 'seg-1', text: 'Primeira.', startMs: 0 }));
    manager.addSegment(segment({ id: 'seg-2', text: 'Segunda.', startMs: 10_000 }));

    expect(manager.getSegments().map((item) => item.id)).toEqual([
      'seg-1',
      'seg-2',
      'seg-3',
    ]);
  });

  it('returns empty windows and clears retained segments', () => {
    const manager = new ContextManager();
    expect(manager.getContext()).toEqual({
      text: '',
      segments: [],
      dependencies: [],
    });

    manager.addSegment(segment({ id: 'seg-1', text: 'Fala.' }));
    manager.getContext();
    manager.clear();

    expect(manager.getSegments()).toEqual([]);
    expect(manager.getDependencies()).toEqual([]);
    expect(manager.getContext().text).toBe('');
  });

  it('does not leak internal state through returned segments', () => {
    const manager = new ContextManager();
    manager.addSegment(segment({ id: 'seg-1', text: 'Original.' }));

    const [first] = manager.getSegments();
    first.text = 'Alterado externamente';

    expect(manager.getSegments()[0].text).toBe('Original.');
  });

  it('uses twenty segments as the default window bound', () => {
    const manager = new ContextManager();
    for (let index = 0; index < DEFAULT_CONTEXT_MAX_SEGMENTS + 5; index++) {
      manager.addSegment(
        segment({
          id: `seg-${index.toString()}`,
          text: `Fala ${index.toString()}.`,
          startMs: index * 1_000,
        }),
      );
    }

    expect(manager.getSegments()).toHaveLength(DEFAULT_CONTEXT_MAX_SEGMENTS + 5);
    expect(manager.getContext().segments).toHaveLength(
      DEFAULT_CONTEXT_MAX_SEGMENTS,
    );
  });
});
