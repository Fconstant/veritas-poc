import { z } from 'zod';

export const PROTOCOL_VERSION = 1;

const ISO_DATETIME_SCHEMA = z.iso.datetime({ offset: true });

// ===== Sessão =====
export const LIVE_SESSION_STATE_SCHEMA = z.enum([
  'IDLE',
  'CONNECTING',
  'LISTENING',
  'PAUSED',
  'ENDING',
  'ENDED',
  'RECONNECTING',
  'ERROR',
]);
export type LiveSessionState = z.infer<typeof LIVE_SESSION_STATE_SCHEMA>;

// ===== Áudio e transcrição =====
export const AUDIO_CHUNK_META_SCHEMA = z.object({
  chunkSeq: z.number().int().gte(0),
  encoding: z.literal('pcm16le'),
  sampleRate: z.literal(16000),
  channels: z.literal(1),
  samples: z.number().int().gt(0),
  startSample: z.number().int().gte(0),
  capturedAt: ISO_DATETIME_SCHEMA,
});
export type AudioChunkMeta = z.infer<typeof AUDIO_CHUNK_META_SCHEMA>;

export const TRANSCRIPT_SEGMENT_STATUS_SCHEMA = z.enum([
  'PROVISIONAL',
  'FINAL',
  'BLOCKED',
]);
export type TranscriptSegmentStatus = z.infer<
  typeof TRANSCRIPT_SEGMENT_STATUS_SCHEMA
>;

export const UNCERTAINTY_REASON_SCHEMA = z.enum([
  'NUMBER',
  'NEGATION',
  'SUBJECT',
  'OVERLAP',
  'LOW_CONFIDENCE',
  'TRANSCRIPTION_ERROR',
]);
export type UncertaintyReason = z.infer<typeof UNCERTAINTY_REASON_SCHEMA>;

export const TRANSCRIPT_SEGMENT_SCHEMA = z.object({
  id: z.string(),
  sessionId: z.string(),
  revision: z.number().int().gte(0),
  status: TRANSCRIPT_SEGMENT_STATUS_SCHEMA,
  text: z.string().min(1),
  speakerId: z.string().optional(),
  startMs: z.number().int().gte(0),
  endMs: z.number().int().gte(0),
  confidence: z.number().gte(0).lte(1).optional(),
  uncertaintyReasons: z.array(UNCERTAINTY_REASON_SCHEMA).optional(),
  createdAt: ISO_DATETIME_SCHEMA,
});
export type TranscriptSegment = z.infer<typeof TRANSCRIPT_SEGMENT_SCHEMA>;

export const SPEAKER_MAPPING_SCHEMA = z.object({
  speakerId: z.string(),
  participantName: z.string().min(1),
  confirmed: z.boolean(),
  revision: z.number().int().gte(0),
});
export type SpeakerMapping = z.infer<typeof SPEAKER_MAPPING_SCHEMA>;

// ===== Claims =====
export const ATOMIC_CLAIM_SCHEMA = z.object({
  id: z.string(),
  proposition: z.string().min(1),
  subject: z.string().optional(),
  predicate: z.string().optional(),
  period: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  populationOrScope: z.string().optional(),
  quantity: z
    .object({
      value: z.number(),
      unit: z.string().min(1),
    })
    .optional(),
});
export type AtomicClaim = z.infer<typeof ATOMIC_CLAIM_SCHEMA>;

export const CLAIM_STATUS_SCHEMA = z.enum([
  'DETECTED',
  'QUEUED',
  'RESEARCHING',
  'EVALUATING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'DEFERRED',
  'BLOCKED',
]);
export type ClaimStatus = z.infer<typeof CLAIM_STATUS_SCHEMA>;

export const CLAIM_SCHEMA = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  segmentIds: z.array(z.string()).min(1),
  speakerId: z.string().optional(),
  originalQuote: z.string().min(1),
  normalizedClaim: z.string().min(1),
  timestampMs: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .optional(),
  status: CLAIM_STATUS_SCHEMA,
  notFactCheckable: z.boolean(),
  atomicClaims: z.array(ATOMIC_CLAIM_SCHEMA),
  revision: z.number().int().gte(0),
  createdAt: ISO_DATETIME_SCHEMA,
  updatedAt: ISO_DATETIME_SCHEMA,
});
export type Claim = z.infer<typeof CLAIM_SCHEMA>;

// ===== Fontes e evidências =====
export const VERDICT_SCHEMA = z.enum([
  'SUPPORTED',
  'FALSE',
  'MISLEADING',
  'INCONCLUSIVE',
]);
export type Verdict = z.infer<typeof VERDICT_SCHEMA>;

export const EVIDENCE_RELATION_SCHEMA = z.enum([
  'SUPPORTS',
  'REFUTES',
  'CONTEXTUALIZES',
]);
export type EvidenceRelation = z.infer<typeof EVIDENCE_RELATION_SCHEMA>;

export const SOURCE_TYPE_SCHEMA = z.enum([
  'PRIMARY',
  'SECONDARY',
  'PARTISAN',
  'OTHER',
]);
export type SourceType = z.infer<typeof SOURCE_TYPE_SCHEMA>;

export const MECHANISM_CODE_SCHEMA = z.enum([
  'FALSE_ORIGIN_ATTRIBUTION',
  'MISATTRIBUTED_AGGREGATE',
  'OMITTED_TIME_LIMIT',
  'PROGRAM_CONFLATION',
  'INCOMPATIBLE_COMPARISON',
  'UNSUPPORTED_CAUSALITY',
  'SELECTIVE_PERIOD',
  'OVERGENERALIZATION',
  'SELECTIVE_EVIDENCE',
]);
export type MechanismCode = z.infer<typeof MECHANISM_CODE_SCHEMA>;

export const SOURCE_SCHEMA = z.object({
  id: z.string(),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.url(),
  type: SOURCE_TYPE_SCHEMA,
  publishedAt: ISO_DATETIME_SCHEMA.optional(),
  accessedAt: ISO_DATETIME_SCHEMA,
  dataPeriod: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  contentHash: z.string().optional(),
});
export type Source = z.infer<typeof SOURCE_SCHEMA>;

export const EVIDENCE_SCHEMA = z.object({
  id: z.string(),
  sourceId: z.string(),
  relation: EVIDENCE_RELATION_SCHEMA,
  claimIds: z.array(z.string()).min(1),
  excerpt: z.string().min(1),
  location: z.string().optional(),
  explanation: z.string().min(1),
  verifiedContent: z.boolean(),
});
export type Evidence = z.infer<typeof EVIDENCE_SCHEMA>;

export const MECHANISM_SCHEMA = z.object({
  code: MECHANISM_CODE_SCHEMA,
  explanation: z.string().min(1),
  evidenceIds: z.array(z.string()).min(1),
});
export type Mechanism = z.infer<typeof MECHANISM_SCHEMA>;

// ===== Verificação =====
const REVIEWER_SCHEMA = z.enum(['AUTOMATED', 'HUMAN']);

const VERIFICATION_SHAPE_SCHEMA = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  claimId: z.string(),
  segmentIds: z.array(z.string()).min(1),
  speakerId: z.string().optional(),
  originalQuote: z.string().min(1),
  normalizedClaim: z.string().min(1),
  timestampMs: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .optional(),
  transcriptConfirmed: z.boolean(),
  atomicClaim: ATOMIC_CLAIM_SCHEMA,
  status: CLAIM_STATUS_SCHEMA,
  verdict: VERDICT_SCHEMA.optional(),
  conclusion: z.string().optional(),
  contradiction: z.string().optional(),
  contradictionEvidenceIds: z.array(z.string()).optional(),
  mechanisms: z.array(MECHANISM_SCHEMA).default([]),
  supportedAspects: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  evidence: z.array(EVIDENCE_SCHEMA).default([]),
  sources: z.array(SOURCE_SCHEMA).default([]),
  revision: z.number().int().gte(0),
  reviewedBy: REVIEWER_SCHEMA.optional(),
  createdAt: ISO_DATETIME_SCHEMA,
  updatedAt: ISO_DATETIME_SCHEMA,
});

export const VERIFICATION_SCHEMA = VERIFICATION_SHAPE_SCHEMA.superRefine(
  (verification, ctx) => {
    const evidenceById = new Map(
      verification.evidence.map((item) => [item.id, item]),
    );
    const evidenceIds = new Set<string>();
    const sourceIds = new Set<string>();
    const sourceUrls = new Set<string>();
    const contradictionEvidenceIds =
      verification.contradictionEvidenceIds ?? [];
    const conclusion = verification.conclusion?.trim() ?? '';
    const contradiction = verification.contradiction?.trim() ?? '';
    const isCompleted = verification.status === 'COMPLETED';

    if (!isCompleted) {
      if (verification.verdict !== undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'Only COMPLETED verifications may carry a verdict.',
          path: ['verdict'],
        });
      }
      if (verification.conclusion !== undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'Only COMPLETED verifications may carry a conclusion.',
          path: ['conclusion'],
        });
      }
      if (verification.contradiction !== undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'Only COMPLETED verifications may carry a contradiction.',
          path: ['contradiction'],
        });
      }
      if (contradictionEvidenceIds.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Only COMPLETED verifications may carry contradiction evidence.',
          path: ['contradictionEvidenceIds'],
        });
      }
    } else {
      if (verification.verdict === undefined) {
        ctx.addIssue({
          code: 'custom',
          message: 'COMPLETED verification requires a verdict.',
          path: ['verdict'],
        });
      }
      if (conclusion.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'COMPLETED verification requires a non-empty conclusion.',
          path: ['conclusion'],
        });
      }
    }

    switch (verification.verdict) {
      case 'FALSE': {
        if (contradiction.length === 0) {
          ctx.addIssue({
            code: 'custom',
            message: 'FALSE verification requires a contradiction.',
            path: ['contradiction'],
          });
        }
        if (contradictionEvidenceIds.length === 0) {
          ctx.addIssue({
            code: 'custom',
            message:
              'FALSE verification requires at least one contradiction evidence id.',
            path: ['contradictionEvidenceIds'],
          });
        }
        contradictionEvidenceIds.forEach((evidenceId, index) => {
          const evidence = evidenceById.get(evidenceId);
          if (evidence === undefined) {
            ctx.addIssue({
              code: 'custom',
              message: `Contradiction evidence "${evidenceId}" does not exist.`,
              path: ['contradictionEvidenceIds', index],
            });
            return;
          }
          if (evidence.relation !== 'REFUTES' || !evidence.verifiedContent) {
            ctx.addIssue({
              code: 'custom',
              message: `Contradiction evidence "${evidenceId}" must REFUTE the claim and be verified.`,
              path: ['contradictionEvidenceIds', index],
            });
          }
        });
        break;
      }
      case 'SUPPORTED': {
        const hasVerifiedSupport = verification.evidence.some(
          (item) => item.relation === 'SUPPORTS' && item.verifiedContent,
        );
        if (!hasVerifiedSupport) {
          ctx.addIssue({
            code: 'custom',
            message:
              'SUPPORTED verification requires verified supporting evidence.',
            path: ['evidence'],
          });
        }
        break;
      }
      case 'MISLEADING': {
        if (verification.supportedAspects.length === 0) {
          ctx.addIssue({
            code: 'custom',
            message:
              'MISLEADING verification requires at least one supported aspect.',
            path: ['supportedAspects'],
          });
        }
        if (verification.mechanisms.length === 0) {
          ctx.addIssue({
            code: 'custom',
            message: 'MISLEADING verification requires at least one mechanism.',
            path: ['mechanisms'],
          });
        }
        verification.mechanisms.forEach((mechanism, mechanismIndex) => {
          mechanism.evidenceIds.forEach((evidenceId, evidenceIndex) => {
            const evidence = evidenceById.get(evidenceId);
            if (evidence !== undefined && !evidence.verifiedContent) {
              ctx.addIssue({
                code: 'custom',
                message: `Mechanism evidence "${evidenceId}" must be verified.`,
                path: [
                  'mechanisms',
                  mechanismIndex,
                  'evidenceIds',
                  evidenceIndex,
                ],
              });
            }
          });
        });
        break;
      }
      default:
        break;
    }

    verification.sources.forEach((source, index) => {
      if (sourceIds.has(source.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicated source id "${source.id}".`,
          path: ['sources', index, 'id'],
        });
      }
      sourceIds.add(source.id);

      if (sourceUrls.has(source.url)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicated source url "${source.url}".`,
          path: ['sources', index, 'url'],
        });
      }
      sourceUrls.add(source.url);
    });

    verification.evidence.forEach((item, index) => {
      if (evidenceIds.has(item.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicated evidence id "${item.id}".`,
          path: ['evidence', index, 'id'],
        });
      }
      evidenceIds.add(item.id);

      if (!sourceIds.has(item.sourceId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Evidence source "${item.sourceId}" does not exist.`,
          path: ['evidence', index, 'sourceId'],
        });
      }

      if (item.claimIds.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Evidence must reference at least one claim.',
          path: ['evidence', index, 'claimIds'],
        });
      }
    });

    verification.mechanisms.forEach((mechanism, mechanismIndex) => {
      mechanism.evidenceIds.forEach((evidenceId, evidenceIndex) => {
        if (!evidenceIds.has(evidenceId)) {
          ctx.addIssue({
            code: 'custom',
            message: `Mechanism evidence "${evidenceId}" does not exist.`,
            path: ['mechanisms', mechanismIndex, 'evidenceIds', evidenceIndex],
          });
        }
      });
    });
  },
);
export type Verification = z.infer<typeof VERIFICATION_SCHEMA>;

// ===== Envelope =====
export const EVENT_ENVELOPE_SCHEMA = z.object({
  protocolVersion: z.number(),
  eventId: z.string().min(1),
  sessionId: z.string().optional(),
  eventSeq: z.number().int().gte(0),
  emittedAt: ISO_DATETIME_SCHEMA,
});
export type EventEnvelope = z.infer<typeof EVENT_ENVELOPE_SCHEMA>;

// Server -> client events travel as { envelope, data }; client -> server
// payloads are sent as-is (the server stamps the envelope on emission).
const envelopeEvent = <T extends z.ZodType>(data: T) =>
  z.object({ envelope: EVENT_ENVELOPE_SCHEMA, data });

// ===== Cliente -> servidor =====
export const START_LIVE_SESSION_SCHEMA = z.object({
  sessionId: z.string(),
  source: z.enum(['TAB', 'MIC']),
  language: z.literal('pt-BR'),
  consent: z.literal(true),
  apiKeys: z
    .object({
      google: z.string().optional(),
      tavily: z.string().optional(),
    })
    .optional(),
});
export type StartLiveSession = z.infer<typeof START_LIVE_SESSION_SCHEMA>;

export const AUDIO_CHUNK_SCHEMA = AUDIO_CHUNK_META_SCHEMA.extend({
  sessionId: z.string(),
});
export type AudioChunk = z.infer<typeof AUDIO_CHUNK_SCHEMA>;

export const LIVE_SESSION_CONTROL_SCHEMA = z.object({
  sessionId: z.string(),
});
export type LiveSessionControl = z.infer<typeof LIVE_SESSION_CONTROL_SCHEMA>;

export const RESUME_SESSION_SCHEMA = z.object({
  sessionId: z.string(),
  cursor: z.number().int().gte(0),
});
export type ResumeSession = z.infer<typeof RESUME_SESSION_SCHEMA>;

export const UPDATE_SPEAKER_MAPPING_SCHEMA = z.object({
  sessionId: z.string(),
  mappings: z.array(SPEAKER_MAPPING_SCHEMA),
  expectedRevision: z.number().int().gte(0),
});
export type UpdateSpeakerMapping = z.infer<
  typeof UPDATE_SPEAKER_MAPPING_SCHEMA
>;

export const CORRECT_TRANSCRIPT_SCHEMA = z.object({
  sessionId: z.string(),
  segmentId: z.string(),
  expectedRevision: z.number().int().gte(0),
  text: z.string().min(1),
});
export type CorrectTranscript = z.infer<typeof CORRECT_TRANSCRIPT_SCHEMA>;

export const RETRY_VERIFICATION_SCHEMA = z.object({
  verificationId: z.string(),
});
export type RetryVerification = z.infer<typeof RETRY_VERIFICATION_SCHEMA>;

export const EXPORT_SESSION_SCHEMA = z.object({
  sessionId: z.string(),
});
export type ExportSession = z.infer<typeof EXPORT_SESSION_SCHEMA>;

export const DELETE_SESSION_SCHEMA = z.object({
  sessionId: z.string(),
});
export type DeleteSession = z.infer<typeof DELETE_SESSION_SCHEMA>;

export const CLIENT_EVENT_SCHEMAS = {
  START_LIVE_SESSION: START_LIVE_SESSION_SCHEMA,
  AUDIO_CHUNK: AUDIO_CHUNK_SCHEMA,
  PAUSE_LIVE_SESSION: LIVE_SESSION_CONTROL_SCHEMA,
  RESUME_LIVE_SESSION: LIVE_SESSION_CONTROL_SCHEMA,
  END_LIVE_SESSION: LIVE_SESSION_CONTROL_SCHEMA,
  CANCEL_LIVE_SESSION: LIVE_SESSION_CONTROL_SCHEMA,
  RESUME_SESSION: RESUME_SESSION_SCHEMA,
  UPDATE_SPEAKER_MAPPING: UPDATE_SPEAKER_MAPPING_SCHEMA,
  CORRECT_TRANSCRIPT: CORRECT_TRANSCRIPT_SCHEMA,
  RETRY_VERIFICATION: RETRY_VERIFICATION_SCHEMA,
  EXPORT_SESSION: EXPORT_SESSION_SCHEMA,
  DELETE_SESSION: DELETE_SESSION_SCHEMA,
} as const;

// ===== Servidor -> cliente =====
export const LIVE_SESSION_STARTED_DATA_SCHEMA = z.object({
  sessionId: z.string(),
  state: LIVE_SESSION_STATE_SCHEMA,
});
export const LIVE_SESSION_STARTED_EVENT_SCHEMA = envelopeEvent(
  LIVE_SESSION_STARTED_DATA_SCHEMA,
);
export type LiveSessionStartedData = z.infer<
  typeof LIVE_SESSION_STARTED_DATA_SCHEMA
>;
export type LiveSessionStartedEvent = z.infer<
  typeof LIVE_SESSION_STARTED_EVENT_SCHEMA
>;

export const LIVE_SESSION_STATE_DATA_SCHEMA = z.object({
  sessionId: z.string(),
  state: LIVE_SESSION_STATE_SCHEMA,
  reason: z.string().optional(),
});
export const LIVE_SESSION_STATE_EVENT_SCHEMA = envelopeEvent(
  LIVE_SESSION_STATE_DATA_SCHEMA,
);
export type LiveSessionStateData = z.infer<
  typeof LIVE_SESSION_STATE_DATA_SCHEMA
>;
export type LiveSessionStateEvent = z.infer<
  typeof LIVE_SESSION_STATE_EVENT_SCHEMA
>;

export const TRANSCRIPT_EVENT_DATA_SCHEMA = z.object({
  segment: TRANSCRIPT_SEGMENT_SCHEMA,
});
export const TRANSCRIPT_PARTIAL_EVENT_SCHEMA = envelopeEvent(
  TRANSCRIPT_EVENT_DATA_SCHEMA,
);
export const TRANSCRIPT_FINAL_EVENT_SCHEMA = envelopeEvent(
  TRANSCRIPT_EVENT_DATA_SCHEMA,
);
export const TRANSCRIPT_REVISED_EVENT_SCHEMA = envelopeEvent(
  TRANSCRIPT_EVENT_DATA_SCHEMA,
);
export type TranscriptEventData = z.infer<typeof TRANSCRIPT_EVENT_DATA_SCHEMA>;
export type TranscriptPartialEvent = z.infer<
  typeof TRANSCRIPT_PARTIAL_EVENT_SCHEMA
>;
export type TranscriptFinalEvent = z.infer<
  typeof TRANSCRIPT_FINAL_EVENT_SCHEMA
>;
export type TranscriptRevisedEvent = z.infer<
  typeof TRANSCRIPT_REVISED_EVENT_SCHEMA
>;

export const SPEAKER_MAPPING_UPDATED_DATA_SCHEMA = z.object({
  sessionId: z.string(),
  mappings: z.array(SPEAKER_MAPPING_SCHEMA),
  revision: z.number().int().gte(0),
});
export const SPEAKER_MAPPING_UPDATED_EVENT_SCHEMA = envelopeEvent(
  SPEAKER_MAPPING_UPDATED_DATA_SCHEMA,
);
export type SpeakerMappingUpdatedData = z.infer<
  typeof SPEAKER_MAPPING_UPDATED_DATA_SCHEMA
>;
export type SpeakerMappingUpdatedEvent = z.infer<
  typeof SPEAKER_MAPPING_UPDATED_EVENT_SCHEMA
>;

export const CLAIM_DETECTED_DATA_SCHEMA = z.object({
  claim: CLAIM_SCHEMA,
});
export const CLAIM_DETECTED_EVENT_SCHEMA = envelopeEvent(
  CLAIM_DETECTED_DATA_SCHEMA,
);
export type ClaimDetectedData = z.infer<typeof CLAIM_DETECTED_DATA_SCHEMA>;
export type ClaimDetectedEvent = z.infer<typeof CLAIM_DETECTED_EVENT_SCHEMA>;

export const CLAIM_STATUS_UPDATED_DATA_SCHEMA = z.object({
  claimId: z.string(),
  status: CLAIM_STATUS_SCHEMA,
  revision: z.number().int().gte(0),
});
export const CLAIM_STATUS_UPDATED_EVENT_SCHEMA = envelopeEvent(
  CLAIM_STATUS_UPDATED_DATA_SCHEMA,
);
export type ClaimStatusUpdatedData = z.infer<
  typeof CLAIM_STATUS_UPDATED_DATA_SCHEMA
>;
export type ClaimStatusUpdatedEvent = z.infer<
  typeof CLAIM_STATUS_UPDATED_EVENT_SCHEMA
>;

export const VERIFICATION_RESULT_DATA_SCHEMA = z.object({
  verification: VERIFICATION_SCHEMA,
});
export const VERIFICATION_RESULT_EVENT_SCHEMA = envelopeEvent(
  VERIFICATION_RESULT_DATA_SCHEMA,
);
export type VerificationResultData = z.infer<
  typeof VERIFICATION_RESULT_DATA_SCHEMA
>;
export type VerificationResultEvent = z.infer<
  typeof VERIFICATION_RESULT_EVENT_SCHEMA
>;

export const VERIFICATION_INVALIDATED_DATA_SCHEMA = z.object({
  verificationId: z.string(),
  reason: z.string(),
  revision: z.number().int().gte(0),
});
export const VERIFICATION_INVALIDATED_EVENT_SCHEMA = envelopeEvent(
  VERIFICATION_INVALIDATED_DATA_SCHEMA,
);
export type VerificationInvalidatedData = z.infer<
  typeof VERIFICATION_INVALIDATED_DATA_SCHEMA
>;
export type VerificationInvalidatedEvent = z.infer<
  typeof VERIFICATION_INVALIDATED_EVENT_SCHEMA
>;

export const SESSION_SNAPSHOT_DATA_SCHEMA = z.object({
  sessionId: z.string(),
  state: LIVE_SESSION_STATE_SCHEMA,
  segments: z.array(TRANSCRIPT_SEGMENT_SCHEMA),
  claims: z.array(CLAIM_SCHEMA),
  verifications: z.array(VERIFICATION_SCHEMA),
  cursor: z.number().int().gte(0),
});
export const SESSION_SNAPSHOT_EVENT_SCHEMA = envelopeEvent(
  SESSION_SNAPSHOT_DATA_SCHEMA,
);
export type SessionSnapshotData = z.infer<typeof SESSION_SNAPSHOT_DATA_SCHEMA>;
export type SessionSnapshotEvent = z.infer<
  typeof SESSION_SNAPSHOT_EVENT_SCHEMA
>;

export const LIVE_METRICS_DATA_SCHEMA = z.object({
  sessionId: z.string().optional(),
  stage: z.string(),
  latencyMs: z.number(),
  queueDepth: z.number(),
  deferred: z.number(),
  creditsUsed: z.number().optional(),
});
export const LIVE_METRICS_EVENT_SCHEMA = envelopeEvent(
  LIVE_METRICS_DATA_SCHEMA,
);
export type LiveMetricsData = z.infer<typeof LIVE_METRICS_DATA_SCHEMA>;
export type LiveMetricsEvent = z.infer<typeof LIVE_METRICS_EVENT_SCHEMA>;

export const LIVE_GAP_DATA_SCHEMA = z.object({
  sessionId: z.string(),
  fromSample: z.number().int(),
  toSample: z.number().int(),
  reason: z.string(),
});
export const LIVE_GAP_EVENT_SCHEMA = envelopeEvent(LIVE_GAP_DATA_SCHEMA);
export type LiveGapData = z.infer<typeof LIVE_GAP_DATA_SCHEMA>;
export type LiveGapEvent = z.infer<typeof LIVE_GAP_EVENT_SCHEMA>;

export const LIVE_SESSION_ENDED_DATA_SCHEMA = z.object({
  sessionId: z.string(),
  reason: z.string(),
});
export const LIVE_SESSION_ENDED_EVENT_SCHEMA = envelopeEvent(
  LIVE_SESSION_ENDED_DATA_SCHEMA,
);
export type LiveSessionEndedData = z.infer<
  typeof LIVE_SESSION_ENDED_DATA_SCHEMA
>;
export type LiveSessionEndedEvent = z.infer<
  typeof LIVE_SESSION_ENDED_EVENT_SCHEMA
>;

export const AUDIO_CHUNK_ACK_DATA_SCHEMA = z.object({
  sessionId: z.string(),
  chunkSeq: z.number().int(),
  accepted: z.boolean(),
});
export const AUDIO_CHUNK_ACK_EVENT_SCHEMA = envelopeEvent(
  AUDIO_CHUNK_ACK_DATA_SCHEMA,
);
export type AudioChunkAckData = z.infer<typeof AUDIO_CHUNK_ACK_DATA_SCHEMA>;
export type AudioChunkAckEvent = z.infer<typeof AUDIO_CHUNK_ACK_EVENT_SCHEMA>;

export const SERVER_EVENT_SCHEMAS = {
  LIVE_SESSION_STARTED: LIVE_SESSION_STARTED_EVENT_SCHEMA,
  LIVE_SESSION_STATE: LIVE_SESSION_STATE_EVENT_SCHEMA,
  TRANSCRIPT_PARTIAL: TRANSCRIPT_PARTIAL_EVENT_SCHEMA,
  TRANSCRIPT_FINAL: TRANSCRIPT_FINAL_EVENT_SCHEMA,
  TRANSCRIPT_REVISED: TRANSCRIPT_REVISED_EVENT_SCHEMA,
  SPEAKER_MAPPING_UPDATED: SPEAKER_MAPPING_UPDATED_EVENT_SCHEMA,
  CLAIM_DETECTED: CLAIM_DETECTED_EVENT_SCHEMA,
  CLAIM_STATUS_UPDATED: CLAIM_STATUS_UPDATED_EVENT_SCHEMA,
  VERIFICATION_RESULT: VERIFICATION_RESULT_EVENT_SCHEMA,
  VERIFICATION_INVALIDATED: VERIFICATION_INVALIDATED_EVENT_SCHEMA,
  SESSION_SNAPSHOT: SESSION_SNAPSHOT_EVENT_SCHEMA,
  LIVE_METRICS: LIVE_METRICS_EVENT_SCHEMA,
  LIVE_GAP: LIVE_GAP_EVENT_SCHEMA,
  LIVE_SESSION_ENDED: LIVE_SESSION_ENDED_EVENT_SCHEMA,
  AUDIO_CHUNK_ACK: AUDIO_CHUNK_ACK_EVENT_SCHEMA,
} as const;
