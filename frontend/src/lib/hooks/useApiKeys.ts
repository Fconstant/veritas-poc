import { useState, useEffect } from 'react';

export interface ApiKeys {
  google: string;
  tavily: string;
}

const STORAGE_KEY = 'veritas_api_keys';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega as keys do localStorage na montagem
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setApiKeys(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar API keys:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salva as keys no localStorage
  const saveApiKeys = (keys: ApiKeys) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      setApiKeys(keys);
    } catch (error) {
      console.error('Erro ao salvar API keys:', error);
    }
  };

  // Remove as keys do localStorage
  const clearApiKeys = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setApiKeys(null);
    } catch (error) {
      console.error('Erro ao limpar API keys:', error);
    }
  };

  // Verifica se as keys estão configuradas
  const hasApiKeys = () => {
    return apiKeys !== null && 
           apiKeys.google.trim().length > 0 && 
           apiKeys.tavily.trim().length > 0;
  };

  return {
    apiKeys,
    isLoading,
    saveApiKeys,
    clearApiKeys,
    hasApiKeys: hasApiKeys()
  };
}
