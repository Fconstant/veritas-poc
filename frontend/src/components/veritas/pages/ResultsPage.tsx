"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import ProcessedTextPanel from '../results/ProcessedTextPanel';
import ResultsPanel from '../results/ResultsPanel';
import { ResultData } from '../results/ResultCard';
import { factCheckService } from '@/lib/services/factCheckService';
import { VerificationState, FactCheckResult } from '@/lib/types/api';
import Header from '../Header/Header';

interface ResultsPageProps {
  text?: string;
  onNewVerification?: () => void;
  className?: string;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  text,
  onNewVerification,
  className
}) => {
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'idle',
    results: []
  });
  const [processedText, setProcessedText] = useState<string>('');
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Converte FactCheckResult do backend para ResultData do componente
  const convertToResultData = useCallback((result: FactCheckResult): ResultData => {
    // Determina o status baseado nas flags
    let status: ResultData['status'] = 'verified';
    if (result.data.flags?.includes('MISLEADING')) {
      status = 'unverified';
    } else if (result.data.flags?.includes('UNVERIFIABLE') || result.data.flags?.includes('INCONCLUSIVE')) {
      status = 'pending';
    }

    return {
      id: `${result.meta.fingerprint}-${result.meta.chunk}-${result.meta.seq}`,
      text: result.data.extractedClaim,
      confidence: result.data.reasoningConfidence,
      status,
      sources: result.data.sources,
      explanation: result.data.reasoning
    };
  }, []);

  // Converte o estado de verificação para o estado do painel de resultados
  const getResultsPanelStatus = useCallback((): 'loading' | 'partial' | 'complete' | 'error' => {
    // Se não há resultados, sempre mostra loading
    if (verificationState.results.length === 0) {
      return 'loading';
    }

    switch (verificationState.status) {
      case 'connecting':
      case 'processing':
        return 'loading';
      case 'finished':
        return 'complete';
      case 'error':
      case 'interrupted':
        return 'error';
      case 'idle':
      default:
        return 'partial';
    }
  }, [verificationState.status, verificationState.results.length]);

  // Converte os resultados do backend para o formato do componente
  const convertedResults = verificationState.results.map(convertToResultData);

  // Inicializa a conexão com o backend
  useEffect(() => {
    if (isInitialized) return;

    const initializeConnection = async () => {
      try {
        console.log('🔌 Inicializando conexão com o backend...');
        
        // Testa a conexão
        const isConnected = await factCheckService.testConnection();
        if (!isConnected) {
          console.error('❌ Falha ao conectar com o backend');
          setVerificationState(prev => ({
            ...prev,
            status: 'error',
            error: 'Não foi possível conectar com o servidor. Verifique se o backend está rodando.'
          }));
          return;
        }

        console.log('✅ Conexão com o backend estabelecida');
        
        // Sincroniza com o estado atual do serviço
        const currentState = factCheckService.getState();
        setVerificationState(currentState);
        
        // Obtém o texto processado do serviço ou usa o texto passado como prop
        const serviceText = factCheckService.getProcessedText() || text || "Texto não disponível";
        setProcessedText(serviceText);
        
        setIsInitialized(true);

        // Mostra o painel de resultados após 1-2 segundos
        setTimeout(() => {
          setShowResultsPanel(true);
        }, 1500);

      } catch (error) {
        console.error('❌ Erro ao inicializar conexão:', error);
        setVerificationState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    initializeConnection();
  }, [isInitialized]);

  // Escuta mudanças no estado da verificação
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = factCheckService.onStateChange((state) => {
      setVerificationState(state);
    });

    return unsubscribe;
  }, [isInitialized]);

  // Inicia a verificação automaticamente quando a página carrega
  useEffect(() => {
    if (!isInitialized || !showResultsPanel) return;

    const startVerification = async () => {
      try {
        // Se já há resultados, não inicia nova verificação
        const currentState = factCheckService.getState();
        if (currentState.results.length > 0) {
          console.log('📊 Usando resultados existentes:', currentState.results.length);
          return;
        }

        console.log('🚀 Iniciando verificação de fatos...');
        console.log('📝 Texto:', text);
        
        const fingerprint = await factCheckService.requestFactCheck(text, {
          researchThreshold: 0.5
        });
        
        console.log('🔑 Fingerprint gerado:', fingerprint);
      } catch (error) {
        console.error('❌ Erro ao iniciar verificação:', error);
        setVerificationState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro ao iniciar verificação'
        }));
      }
    };

    // Aguarda um pouco antes de iniciar a verificação
    const timer = setTimeout(startVerification, 2000);
    return () => clearTimeout(timer);
  }, [isInitialized, showResultsPanel, text]);

  const handleNewVerification = () => {
    if (onNewVerification) {
      onNewVerification();
    } else {
      // Fallback: redirecionar para home
      window.location.href = '/';
    }
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          {/* Coluna Esquerda - Texto Processado */}
          <div className="bg-white rounded-lg border border-[#d6d8db] shadow-sm">
            <ProcessedTextPanel
              text={processedText}
              onNewVerification={handleNewVerification}
            />
          </div>

          {/* Coluna Direita - Resultados */}
          {showResultsPanel && (
            <div className="bg-white rounded-lg border border-[#d6d8db] shadow-sm">
              <ResultsPanel
                status={getResultsPanelStatus()}
                results={convertedResults}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
