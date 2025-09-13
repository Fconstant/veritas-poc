// Configurações da API
export const API_CONFIG = {
  // URL do backend - configuração hardcoded para desenvolvimento
  BACKEND_URL: 'http://localhost:3000',
  
  // Configurações padrão para verificação de fatos
  DEFAULT_RESEARCH_THRESHOLD: 0.5,
  
  // Timeout para conexão WebSocket (em ms)
  WEBSOCKET_TIMEOUT: 10000,
  
  // Configurações de retry
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Tipos para configuração
export type ApiConfig = typeof API_CONFIG;
