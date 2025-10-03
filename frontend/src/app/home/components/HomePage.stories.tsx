import type { Story, StoryDefault } from "@ladle/react";
import React from "react";
import HomePage from "./HomePage";
import { factCheckService } from '@/lib/services/factCheckService';

// Mock do router para o Ladle
const mockRouter = {
  push: (url: string) => {
    console.log(`Mock router push: ${url}`);
  },
};

// Mock completo do factCheckService para evitar problemas de WebSocket no Ladle
const createMockFactCheckService = () => ({
  onStateChange: (callback: (state: any) => void) => {
    // Simula um estado inicial
    callback({
      status: 'idle',
      results: []
    });
    // Retorna função de cleanup vazia
    return () => {};
  },
  disconnect: () => {
    console.log('Mock factCheckService disconnect called');
  },
  reset: () => {
    console.log('Mock factCheckService reset called');
  },
  testConnection: async () => {
    console.log('Mock factCheckService testConnection called');
    return true;
  },
  requestFactCheck: async (text: string, options?: any) => {
    console.log('Mock factCheckService requestFactCheck called with:', text);
    return "mock-fingerprint-" + Date.now();
  },
  getState: () => ({
    status: 'idle',
    results: []
  }),
  isConnected: () => true
});

// Wrapper que substitui o factCheckService antes de renderizar
const HomePageWithMock: React.FC<{ router: any }> = ({ router }) => {
  React.useEffect(() => {
    // Cria backup dos métodos originais
    const originalMethods = {
      onStateChange: factCheckService.onStateChange,
      disconnect: factCheckService.disconnect,
      reset: factCheckService.reset,
      testConnection: factCheckService.testConnection,
      requestFactCheck: factCheckService.requestFactCheck,
      getState: factCheckService.getState,
      isConnected: factCheckService.isConnected,
    };
    
    // Substitui com o mock
    const mockService = createMockFactCheckService();
    Object.assign(factCheckService, mockService);
    
    // Cleanup ao desmontar - restaura os métodos originais
    return () => {
      Object.assign(factCheckService, originalMethods);
    };
  }, []);

  return <HomePage router={router} />;
};

export default {
  title: "Pages/Home",
} satisfies StoryDefault;

// Story completa da Home Page
export const Default: Story = () => (
  <div className="w-full h-screen overflow-hidden">
    <HomePageWithMock router={mockRouter} />
  </div>
);

// Story mobile
export const Mobile: Story = () => (
  <div className="w-[375px] h-screen overflow-hidden mx-auto border border-gray-300">
    <HomePageWithMock router={mockRouter} />
  </div>
);

