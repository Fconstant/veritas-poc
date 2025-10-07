// Mock do factCheckService para o Ladle
export const factCheckService = {
  onStateChange: (callback: (state: any) => void) => {
    // Simula um estado inicial
    callback({
      status: 'idle',
      results: [],
      error: null,
    });
    // Retorna função de cleanup vazia
    return () => {};
  },
  disconnect: () => {
    console.log('[Mock] factCheckService.disconnect called');
  },
  reset: () => {
    console.log('[Mock] factCheckService.reset called');
  },
  testConnection: async () => {
    console.log('[Mock] factCheckService.testConnection called');
    return true;
  },
  requestFactCheck: async (text: string, options?: any) => {
    console.log('[Mock] factCheckService.requestFactCheck called with:', text.substring(0, 50) + '...');
    return "mock-fingerprint-" + Date.now();
  },
  getState: () => ({
    status: 'idle',
    results: [],
    error: null,
  }),
  isConnected: () => true,
};
