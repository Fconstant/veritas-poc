import assert from 'node:assert/strict';
import test from 'node:test';

import type { TranscriptSegment } from '@veritas/shared';

import {
  claimsForSegment,
  formatSpeechTimestamp,
  mergeSnapshotSegments,
  resolveSpeakerLabel,
  sortSegmentsBySpeechTime,
  upsertTranscriptSegment,
} from '../transcriptSync';

const ACCESSED_AT = '2026-10-19T10:00:00-03:00';

const makeSegment = (
  overrides: Partial<TranscriptSegment> = {},
): TranscriptSegment => ({
  id: 'seg-1',
  sessionId: 'session-a',
  revision: 1,
  status: 'PROVISIONAL',
  text: 'Olá mundo',
  startMs: 1000,
  endMs: 2000,
  createdAt: ACCESSED_AT,
  ...overrides,
});

test('upsertTranscriptSegment inserts and upgrades by revision', () => {
  const first = upsertTranscriptSegment([], makeSegment({ revision: 1 }));
  assert.equal(first.applied, true);
  assert.equal(first.conflict, false);

  const upgraded = upsertTranscriptSegment(
    first.items,
    makeSegment({ revision: 2, status: 'FINAL', text: 'Olá, mundo.' }),
  );
  assert.equal(upgraded.applied, true);
  assert.equal(upgraded.items[0].text, 'Olá, mundo.');
  assert.equal(upgraded.items[0].status, 'FINAL');
});

test('upsertTranscriptSegment signals conflict on stale concurrent revision', () => {
  const base = upsertTranscriptSegment(
    [],
    makeSegment({ revision: 3, text: 'Correção local' }),
  ).items;

  const stale = upsertTranscriptSegment(
    base,
    makeSegment({ revision: 2, text: 'Versão antiga do servidor' }),
    'session-a',
    { treatStaleAsConflict: true },
  );

  assert.equal(stale.applied, false);
  assert.equal(stale.conflict, true);
  assert.equal(stale.items[0].text, 'Correção local');
});

test('upsertTranscriptSegment ignores other sessions', () => {
  const result = upsertTranscriptSegment(
    [makeSegment()],
    makeSegment({ id: 'other', sessionId: 'session-b', revision: 9 }),
    'session-a',
  );
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'wrong-session');
  assert.equal(result.items.length, 1);
});

test('resolveSpeakerLabel never invents a candidate name', () => {
  assert.deepEqual(resolveSpeakerLabel(undefined, []), {
    label: null,
    known: false,
    confirmed: false,
  });

  assert.deepEqual(resolveSpeakerLabel('spk-1', []), {
    label: 'spk-1',
    known: false,
    confirmed: false,
  });

  assert.deepEqual(
    resolveSpeakerLabel('spk-1', [
      {
        speakerId: 'spk-1',
        participantName: 'Mediador',
        confirmed: false,
        revision: 1,
      },
    ]),
    { label: 'Mediador', known: true, confirmed: false },
  );
});

test('sortSegmentsBySpeechTime orders by startMs', () => {
  const ordered = sortSegmentsBySpeechTime([
    makeSegment({ id: 'b', startMs: 5000, endMs: 6000 }),
    makeSegment({ id: 'a', startMs: 1000, endMs: 2000 }),
  ]);
  assert.deepEqual(
    ordered.map((s) => s.id),
    ['a', 'b'],
  );
});

test('mergeSnapshotSegments upserts snapshot rows', () => {
  const merged = mergeSnapshotSegments(
    [makeSegment({ revision: 1 })],
    {
      sessionId: 'session-a',
      state: 'LISTENING',
      segments: [
        makeSegment({ revision: 2, text: 'Atualizado', status: 'FINAL' }),
        makeSegment({
          id: 'seg-2',
          revision: 1,
          text: 'Novo',
          startMs: 3000,
          endMs: 4000,
        }),
      ],
      claims: [],
      verifications: [],
      cursor: 4,
    },
  );

  assert.equal(merged.length, 2);
  assert.equal(merged.find((s) => s.id === 'seg-1')?.text, 'Atualizado');
});

test('claimsForSegment and formatSpeechTimestamp helpers', () => {
  assert.equal(formatSpeechTimestamp(65_000), '01:05');
  assert.equal(
    claimsForSegment('seg-1', [
      {
        id: 'c1',
        segmentIds: ['seg-1', 'seg-2'],
        originalQuote: 'q',
        normalizedClaim: 'n',
        status: 'DETECTED',
        notFactCheckable: false,
        atomicClaims: [],
        revision: 1,
        createdAt: ACCESSED_AT,
        updatedAt: ACCESSED_AT,
      },
      {
        id: 'c2',
        segmentIds: ['seg-9'],
        originalQuote: 'q',
        normalizedClaim: 'n',
        status: 'DETECTED',
        notFactCheckable: false,
        atomicClaims: [],
        revision: 1,
        createdAt: ACCESSED_AT,
        updatedAt: ACCESSED_AT,
      },
    ]).map((c) => c.id).join(','),
    'c1',
  );
});
