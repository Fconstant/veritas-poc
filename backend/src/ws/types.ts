import type { FactCheckRequest, FactCheckResult } from '#/types.js';

// WebSocket Message Types
// Frontend to Backend Messages

export type RequestFactCheckMessage = {
  type: 'REQUEST_FACT_CHECK';
  data: FactCheckRequest;
};
// Backend to Frontend Messages

export type FactCheckResultMessage = {
  type: 'FACT_CHECK_RESULT';
  data: FactCheckResult;
};

export type UpdateStatusMessage = {
  type: 'UPDATE_STATUS';
  data: {
    status: 'processing' | 'completed' | 'error';
    message?: string;
  };
};
// Union types for type safety

export type ClientToServerMessage = RequestFactCheckMessage;
export type ServerToClientMessage = FactCheckResultMessage | UpdateStatusMessage;
