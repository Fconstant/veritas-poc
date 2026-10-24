import assert from 'node:assert/strict';
import test from 'node:test';

import type { TranscriptSegment } from '@veritas/shared';

import { useFactCheckStore } from '../factCheckStore';

const ACCESSED_AT = '2026-10-19T10:00:00-03:00';

const resetStore = () => {
  useFactCheckStore.getState().reset();
};

const makeSegment = (
  overrides: Partial<TranscriptSegment> = {},
): TranscriptSegment => ({
  id: 'seg-1',
  sessionId: 'session-a',
  revision: 1,
  status: 'PROVISIONAL',
  text: 'Fala inicial',
  startMs: 0,
  endMs: 1200,
  createdAt: ACCESSED_AT,
  ...overrides,
});

test('store upsertSegment updates text on higher revision', () => {
  resetStore();
  const store = useFactCheckStore.getState();
  store.update({ sessionId: 'session-a' });
  store.upsertSegment(makeSegment({ revision: 1 }));
  store.upsertSegment(
    makeSegment({ revision: 2, status: 'FINAL', text: 'Fala definitiva' }),
  );

  const { segments, lastTranscriptAt } = useFactCheckStore.getState();
  assert.equal(segments.length, 1);
  assert.equal(segments[0].text, 'Fala definitiva');
  assert.ok(lastTranscriptAt);
});

test('store upsertSegment records revision conflict without overwrite', () => {
  resetStore();
  const store = useFactCheckStore.getState();
  store.update({ sessionId: 'session-a' });
  store.upsertSegment(makeSegment({ revision: 3, text: 'Local' }));
  store.upsertSegment(makeSegment({ revision: 1, text: 'Remoto antigo' }), {
    treatStaleAsConflict: true,
  });

  const state = useFactCheckStore.getState();
  assert.equal(state.segments[0].text, 'Local');
  assert.deepEqual(state.segmentConflicts, ['seg-1']);
});

test('applySessionSnapshot merges segments and claims', () => {
  resetStore();
  useFactCheckStore.getState().update({ sessionId: 'session-a' });
  useFactCheckStore.getState().upsertSegment(makeSegment({ revision: 1 }));

  useFactCheckStore.getState().applySessionSnapshot({
    sessionId: 'session-a',
    state: 'LISTENING',
    segments: [
      makeSegment({ revision: 2, text: 'Do snapshot', status: 'FINAL' }),
    ],
    claims: [
      {
        id: 'claim-1',
        sessionId: 'session-a',
        segmentIds: ['seg-1'],
        originalQuote: 'Do snapshot',
        normalizedClaim: 'Do snapshot',
        status: 'DETECTED',
        notFactCheckable: false,
        atomicClaims: [],
        revision: 1,
        createdAt: ACCESSED_AT,
        updatedAt: ACCESSED_AT,
      },
    ],
    verifications: [],
    cursor: 12,
  });

  const state = useFactCheckStore.getState();
  assert.equal(state.liveSessionState, 'LISTENING');
  assert.equal(state.segments[0].text, 'Do snapshot');
  assert.equal(state.claims.length, 1);
  assert.equal(state.eventCursor, 12);
});

test('setCaptureFeedback and setLiveSessionState stay distinct', () => {
  resetStore();
  const store = useFactCheckStore.getState();
  store.setCaptureFeedback('capturing');
  store.setLiveSessionState('LISTENING');
  store.setLiveMetrics({
    sessionId: 'session-a',
    stage: 'research',
    latencyMs: 400,
    queueDepth: 9,
    deferred: 1,
  });

  const state = useFactCheckStore.getState();
  assert.equal(state.captureFeedback, 'capturing');
  assert.equal(state.liveSessionState, 'LISTENING');
  assert.equal(state.liveMetrics?.deferred, 1);
});
