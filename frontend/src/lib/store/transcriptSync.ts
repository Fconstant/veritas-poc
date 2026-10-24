import type {
  Claim,
  SessionSnapshotData,
  SpeakerMapping,
  TranscriptSegment,
} from '@veritas/shared';

import { upsertByRevision, type UpsertResult } from './verificationSync';

/**
 * Pure transcript / speaker sync helpers (LIVE-026).
 *
 * Segments and claims upsert by id+revision. A concurrent correction that
 * arrives with a lower-or-equal revision after a local edit is recorded as a
 * conflict instead of silently overwriting the local text.
 */

export type SegmentUpsertOutcome = UpsertResult<TranscriptSegment> & {
  conflict: boolean;
};

export function upsertTranscriptSegment(
  segments: readonly TranscriptSegment[],
  incoming: TranscriptSegment,
  sessionId: string | null = null,
  options: { treatStaleAsConflict?: boolean } = {},
): SegmentUpsertOutcome {
  const result = upsertByRevision(segments, incoming, sessionId);
  const conflict =
    Boolean(options.treatStaleAsConflict) &&
    (result.reason === 'stale' || result.reason === 'duplicate');

  return { ...result, conflict };
}

export function mergeSnapshotSegments(
  segments: readonly TranscriptSegment[],
  snapshot: SessionSnapshotData,
): TranscriptSegment[] {
  let next = segments.filter(
    (item) => item.sessionId === snapshot.sessionId,
  );

  for (const segment of snapshot.segments) {
    next = upsertByRevision(next, segment, snapshot.sessionId).items;
  }

  return next;
}

export function mergeSnapshotClaims(
  claims: readonly Claim[],
  snapshot: SessionSnapshotData,
): Claim[] {
  let next = claims.filter(
    (item) =>
      item.sessionId === undefined || item.sessionId === snapshot.sessionId,
  );

  for (const claim of snapshot.claims) {
    next = upsertByRevision(next, claim, snapshot.sessionId).items;
  }

  return next;
}

export function applySpeakerMappings(
  current: readonly SpeakerMapping[],
  currentRevision: number,
  incoming: readonly SpeakerMapping[],
  incomingRevision: number,
): { mappings: SpeakerMapping[]; revision: number; applied: boolean } {
  if (incomingRevision < currentRevision) {
    return {
      mappings: [...current],
      revision: currentRevision,
      applied: false,
    };
  }
  if (incomingRevision === currentRevision) {
    return {
      mappings: [...current],
      revision: currentRevision,
      applied: false,
    };
  }

  return {
    mappings: [...incoming],
    revision: incomingRevision,
    applied: true,
  };
}

/**
 * Resolves a display label for a speaker. Unconfirmed / missing mappings stay
 * explicitly unknown — never invent a candidate name (LIVE-007 / LIVE-026).
 */
export function resolveSpeakerLabel(
  speakerId: string | undefined,
  mappings: readonly SpeakerMapping[],
): { label: string | null; known: boolean; confirmed: boolean } {
  if (!speakerId || speakerId.trim().length === 0) {
    return { label: null, known: false, confirmed: false };
  }

  const mapping = mappings.find((item) => item.speakerId === speakerId);
  if (!mapping) {
    return { label: speakerId, known: false, confirmed: false };
  }

  return {
    label: mapping.participantName,
    known: true,
    confirmed: mapping.confirmed,
  };
}

/** Chronological order for the transcript panel (speech time, not processing). */
export function sortSegmentsBySpeechTime(
  segments: readonly TranscriptSegment[],
): TranscriptSegment[] {
  return [...segments].sort((a, b) => {
    if (a.startMs !== b.startMs) return a.startMs - b.startMs;
    if (a.endMs !== b.endMs) return a.endMs - b.endMs;
    return a.id.localeCompare(b.id);
  });
}

export function claimsForSegment(
  segmentId: string,
  claims: readonly Claim[],
): Claim[] {
  return claims.filter((claim) => claim.segmentIds.includes(segmentId));
}

export function formatSpeechTimestamp(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
