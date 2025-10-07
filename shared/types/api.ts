import { z } from 'zod';

// ===== Schemas Zod =====
const METADATA_SCHEMA = z.object({
  fingerprint: z.string().min(1),
});

const RESULT_META_SCHEMA = METADATA_SCHEMA.extend({
  chunk: z.number().gte(0),
  seq: z.number().gte(0),
});

const buildResponseSchema = <Z extends z.ZodType, ZZ extends z.ZodType>(
  data: Z,
  meta: ZZ,
) => {
  return z.object({ data, meta });
};

export const FACT_CHECK_REQUEST_SCHEMA = METADATA_SCHEMA.pick({
  fingerprint: true,
}).extend({
  researchThreshold: z.number().gte(0).lte(1).optional(),
  apiKeys: z.object({
    google: z.string().optional(),
    tavily: z.string().optional(),
  }).optional(),
});

export const FACT_CHECK_RESULT_DATA_SCHEMA = z.object({
  extractedClaim: z.string(),
  reasoningConfidence: z.number().gte(0).lte(1),
  reasoning: z.string().min(1, 'Reasoning cannot be empty'),
  flags: z
    .array(z.enum(['UNVERIFIABLE', 'MISLEADING', 'INCONCLUSIVE', 'AMBIGUOUS']))
    .optional(),
  sources: z.array(z.string().url()).optional(),
});

export const FACT_CHECK_RESULT_SCHEMA = buildResponseSchema(
  FACT_CHECK_RESULT_DATA_SCHEMA,
  RESULT_META_SCHEMA,
);

export const UPDATE_STATUS_SCHEMA = buildResponseSchema(
  z.object({
    status: z.enum(['PROCESSING', 'FINISHED', 'EXCEPTION', 'INTERRUPTED']),
    message: z.string().optional(),
  }),
  METADATA_SCHEMA,
);

export const CHUNK_COUNT_SCHEMA = buildResponseSchema(
  z.object({
    chunkCount: z.number().gte(0),
  }),
  METADATA_SCHEMA,
);

// ===== TypeScript Types =====
export type FactCheckRequest = z.infer<typeof FACT_CHECK_REQUEST_SCHEMA>;
export type FactCheckResultData = z.infer<typeof FACT_CHECK_RESULT_DATA_SCHEMA>;
export type FactCheckResult = z.infer<typeof FACT_CHECK_RESULT_SCHEMA>;
export type UpdateStatus = z.infer<typeof UPDATE_STATUS_SCHEMA>;
export type UpdateStatusData = UpdateStatus['data'];
export type ChunkCount = z.infer<typeof CHUNK_COUNT_SCHEMA>;
export type ChunkCountData = ChunkCount['data'];

// ===== Socket.IO Events =====
export type ClientToServerEvents = {
  REQUEST_FACT_CHECK: (content: string, request: FactCheckRequest) => void;
};

export type ServerToClientEvents = {
  FACT_CHECK_RESULT: (data: FactCheckResult) => void;
  UPDATE_STATUS: (data: UpdateStatus) => void;
  CHUNK_COUNT: (data: ChunkCount) => void;
};

// ===== Estados da Verificação (Frontend) =====
export type VerificationStatus = 
  | 'idle'
  | 'connecting'
  | 'processing'
  | 'finished'
  | 'error'
  | 'interrupted';

export interface VerificationState {
  status: VerificationStatus;
  message?: string;
  results: FactCheckResult[];
  chunkCount?: number;
  error?: string;
  processedText: string;
  fingerprint: string | null;
}
