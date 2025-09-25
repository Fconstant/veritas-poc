// Tipos baseados no backend para comunicação WebSocket

export interface FactCheckRequest {
  fingerprint: string;
  researchThreshold?: number;
  apiKeys?: {
    gemini?: string;
    tavily?: string;
  };
}

export interface FactCheckResultData {
  extractedClaim: string;
  reasoningConfidence: number;
  reasoning: string;
  flags?: ('UNVERIFIABLE' | 'MISLEADING' | 'INCONCLUSIVE' | 'AMBIGUOUS')[];
  sources?: string[];
}

export interface FactCheckResult {
  data: FactCheckResultData;
  meta: {
    fingerprint: string;
    chunk: number;
    seq: number;
  };
}

export interface UpdateStatusData {
  status: 'PROCESSING' | 'FINISHED' | 'EXCEPTION' | 'INTERRUPTED';
  message?: string;
}

export interface UpdateStatus {
  data: UpdateStatusData;
  meta: {
    fingerprint: string;
  };
}

export interface ChunkCountData {
  chunkCount: number;
}

export interface ChunkCount {
  data: ChunkCountData;
  meta: {
    fingerprint: string;
  };
}

// Eventos do WebSocket
export interface ClientToServerEvents {
  REQUEST_FACT_CHECK: (content: string, request: FactCheckRequest) => void;
}

export interface ServerToClientEvents {
  FACT_CHECK_RESULT: (data: FactCheckResult) => void;
  UPDATE_STATUS: (data: UpdateStatus) => void;
  CHUNK_COUNT: (data: ChunkCount) => void;
}

// Estados da verificação
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
}
