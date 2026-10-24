import assert from 'node:assert/strict';
import test from 'node:test';

import {
  captureFeedbackFromErrorCode,
  deriveLiveControlAvailability,
  deriveLiveStatusView,
  isLiveSessionActive,
  isResearchSaturated,
  isTranscriptDelayed,
} from '../liveUiState';

test('deriveLiveControlAvailability: idle allows start only', () => {
  const availability = deriveLiveControlAvailability({
    captureFeedback: 'idle',
    liveSessionState: null,
  });
  assert.equal(availability.canStart, true);
  assert.equal(availability.canPause, false);
  assert.equal(availability.canResume, false);
  assert.equal(availability.canStop, false);
});

test('deriveLiveControlAvailability: capturing enables pause and stop', () => {
  const availability = deriveLiveControlAvailability({
    captureFeedback: 'capturing',
    liveSessionState: 'LISTENING',
  });
  assert.equal(availability.canStart, false);
  assert.equal(availability.canPause, true);
  assert.equal(availability.canResume, false);
  assert.equal(availability.canStop, true);
});

test('deriveLiveControlAvailability: paused enables resume and stop', () => {
  const availability = deriveLiveControlAvailability({
    captureFeedback: 'paused',
    liveSessionState: 'PAUSED',
  });
  assert.equal(availability.canStart, false);
  assert.equal(availability.canPause, false);
  assert.equal(availability.canResume, true);
  assert.equal(availability.canStop, true);
});

test('deriveLiveControlAvailability: permission error allows retry start', () => {
  const availability = deriveLiveControlAvailability({
    captureFeedback: 'permission_error',
    liveSessionState: 'ERROR',
  });
  assert.equal(availability.canStart, true);
  assert.equal(availability.canStop, false);
});

test('deriveLiveStatusView: separates capture active, delay and saturation', () => {
  const view = deriveLiveStatusView({
    captureFeedback: 'capturing',
    liveSessionState: 'LISTENING',
    liveMetrics: {
      sessionId: 's1',
      stage: 'research',
      latencyMs: 1200,
      queueDepth: 12,
      deferred: 2,
    },
    lastTranscriptAt: new Date(Date.now() - 20_000).toISOString(),
    nowMs: Date.now(),
    hasGaps: true,
  });

  assert.equal(view.tone, 'running');
  assert.equal(view.messageKey, 'listening');
  assert.ok(view.feedbackKeys.includes('capture_active'));
  assert.ok(view.feedbackKeys.includes('transcript_delayed'));
  assert.ok(view.feedbackKeys.includes('research_saturated'));
  assert.ok(view.feedbackKeys.includes('gap'));
});

test('deriveLiveStatusView: no_audio is a distinct warning', () => {
  const view = deriveLiveStatusView({
    captureFeedback: 'no_audio',
    liveSessionState: null,
    liveMetrics: null,
    lastTranscriptAt: null,
    nowMs: Date.now(),
  });
  assert.equal(view.tone, 'warning');
  assert.equal(view.messageKey, 'no_audio');
});

test('isTranscriptDelayed: false before first segment', () => {
  assert.equal(
    isTranscriptDelayed({
      captureFeedback: 'capturing',
      liveSessionState: 'LISTENING',
      lastTranscriptAt: null,
      nowMs: Date.now(),
    }),
    false,
  );
});

test('isResearchSaturated: queue depth and deferred', () => {
  assert.equal(isResearchSaturated(null), false);
  assert.equal(
    isResearchSaturated({
      stage: 'research',
      latencyMs: 10,
      queueDepth: 2,
      deferred: 0,
    }),
    false,
  );
  assert.equal(
    isResearchSaturated({
      stage: 'research',
      latencyMs: 10,
      queueDepth: 8,
      deferred: 0,
    }),
    true,
  );
});

test('captureFeedbackFromErrorCode maps stable codes', () => {
  assert.equal(captureFeedbackFromErrorCode('PERMISSION_DENIED'), 'permission_error');
  assert.equal(captureFeedbackFromErrorCode('NO_AUDIO_TRACK'), 'no_audio');
  assert.equal(captureFeedbackFromErrorCode('UNSUPPORTED'), 'unsupported');
  assert.equal(captureFeedbackFromErrorCode('WORKLET_LOAD_FAILED'), 'connection_error');
});

test('isLiveSessionActive covers capture and server states', () => {
  assert.equal(isLiveSessionActive(null, 'idle'), false);
  assert.equal(isLiveSessionActive('LISTENING', 'idle'), true);
  assert.equal(isLiveSessionActive(null, 'capturing'), true);
  assert.equal(isLiveSessionActive('ENDED', 'ended'), false);
});
