// Configurações da API
// Suporte para Next.js e Ladle/Vite (process.env pode não estar disponível)
const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const env = {
  backendUrl: getEnv('NEXT_PUBLIC_BACKEND_URL'),
  defaultResearchThreshold: getEnv('NEXT_PUBLIC_DEFAULT_RESEARCH_THRESHOLD'),
  websocketTimeout: getEnv('NEXT_PUBLIC_WEBSOCKET_TIMEOUT'),
  maxRetryAttempts: getEnv('NEXT_PUBLIC_MAX_RETRY_ATTEMPTS'),
  retryDelay: getEnv('NEXT_PUBLIC_RETRY_DELAY'),
};

export const API_CONFIG = {
  // URL do backend – pode ser configurada via NEXT_PUBLIC_BACKEND_URL
  BACKEND_URL: env.backendUrl || 'http://localhost:3000',

  // Configurações padrão para verificação de fatos
  DEFAULT_RESEARCH_THRESHOLD:
    env.defaultResearchThreshold !== undefined
      ? Number(env.defaultResearchThreshold)
      : 0.5,

  // Timeout para conexão WebSocket (em ms)
  WEBSOCKET_TIMEOUT:
    env.websocketTimeout !== undefined ? Number(env.websocketTimeout) : 10000,

  // Configurações de retry
  MAX_RETRY_ATTEMPTS:
    env.maxRetryAttempts !== undefined ? Number(env.maxRetryAttempts) : 3,
  RETRY_DELAY: env.retryDelay !== undefined ? Number(env.retryDelay) : 1000,
} as const;

// Tipos para configuração
export type ApiConfig = typeof API_CONFIG;
