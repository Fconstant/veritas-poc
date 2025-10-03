"use client";

import React, { useState, useEffect } from 'react';
import { factCheckService } from '@/lib/services/factCheckService';
import { useFactCheckStore } from '@/lib/store/factCheckStore';
import { useApiKeys } from '@/lib/hooks/useApiKeys';

const ConnectionTest: React.FC = () => {
  const state = useFactCheckStore();
  const { apiKeys } = useApiKeys();
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog(`Estado atualizado: ${state.status}`);
  }, [state.status]);

  const testConnection = async () => {
    addLog('Testando conexão...');
    try {
      const connected = await factCheckService.testConnection();
      setIsConnected(connected);
      addLog(connected ? '✅ Conectado!' : '❌ Falha na conexão');
    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const startVerification = async () => {
    addLog('Iniciando verificação...');
    try {
      if (!apiKeys?.google || !apiKeys?.tavily) {
        addLog('⚠️ API keys ausentes. Configure-as no menu de configurações.');
        return;
      }
      const fingerprint = await factCheckService.requestFactCheck(
        "Este é um teste de verificação de fatos.",
        { 
          researchThreshold: 0.5,
          apiKeys: {
            google: apiKeys.google,
            tavily: apiKeys.tavily
          }
        }
      );
      addLog(`Fingerprint: ${fingerprint}`);
    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste de Integração</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Controles</h2>
          
          <div className="space-y-2">
            <button 
              onClick={testConnection}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Testar Conexão
            </button>
            
            <button 
              onClick={startVerification}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={!isConnected}
            >
              Iniciar Verificação
            </button>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Estado Atual:</h3>
            <p><strong>Status:</strong> {state.status}</p>
            <p><strong>Conectado:</strong> {isConnected ? 'Sim' : 'Não'}</p>
            <p><strong>Resultados:</strong> {state.results.length}</p>
            {state.error && <p><strong>Erro:</strong> {state.error}</p>}
            {state.message && <p><strong>Mensagem:</strong> {state.message}</p>}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
