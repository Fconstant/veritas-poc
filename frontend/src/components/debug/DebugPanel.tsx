import React, { useState, useEffect } from 'react';
import { factCheckService } from '@/lib/services/factCheckService';
import { API_CONFIG } from '@/lib/config/api';

interface DebugPanelProps {
  className?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Desconhecido');
  const [lastError, setLastError] = useState<string>('');

  useEffect(() => {
    // Escuta mudanças no estado da verificação
    const unsubscribe = factCheckService.onStateChange((state) => {
      setConnectionStatus(state.status);
      if (state.error) {
        setLastError(state.error);
      }
    });

    return unsubscribe;
  }, []);

  const testConnection = async () => {
    try {
      setLastError('');
      const isConnected = await factCheckService.testConnection();
      setConnectionStatus(isConnected ? 'Conectado' : 'Desconectado');
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'Erro desconhecido');
      setConnectionStatus('Erro');
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded text-xs opacity-50 hover:opacity-100"
      >
        Debug
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Backend URL:</strong> {API_CONFIG.BACKEND_URL}
        </div>
        
        <div>
          <strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            connectionStatus === 'Conectado' ? 'bg-green-600' :
            connectionStatus === 'Erro' ? 'bg-red-600' :
            'bg-yellow-600'
          }`}>
            {connectionStatus}
          </span>
        </div>
        
        <div>
          <strong>WebSocket:</strong> {factCheckService.isConnected() ? 'Conectado' : 'Desconectado'}
        </div>
        
        {lastError && (
          <div>
            <strong>Último Erro:</strong>
            <div className="text-red-400 text-xs mt-1 break-words">
              {lastError}
            </div>
          </div>
        )}
        
        <button
          onClick={testConnection}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
        >
          Testar Conexão
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;

