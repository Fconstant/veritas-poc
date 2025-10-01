"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import ProcessedTextPanel from '../results/ProcessedTextPanel';
import ResultsPanel from '../results/ResultsPanel';
import { ResultData } from '../results/ResultCard';
import { factCheckService } from '@/lib/services/factCheckService';
import { FactCheckResult } from '@/lib/types/api';
import Header from '../Header/Header';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { useFactCheckStore } from '@/lib/store/factCheckStore';
import { useApiKeys } from '@/lib/hooks/useApiKeys';

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
  const verificationState = useFactCheckStore();
  const { apiKeys } = useApiKeys();
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showNewTextModal, setShowNewTextModal] = useState(false);
  const [showCancelVerificationModal, setShowCancelVerificationModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>();

  // Converte FactCheckResult do backend para ResultData do componente
  const convertToResultData = useCallback((result: FactCheckResult): ResultData => {
    // Determina o status baseado nas flags
    let status: ResultData['status'] = 'verified';
    if (result.data.flags?.includes('MISLEADING')) {
      status = 'unverified';
    } else if (result.data.flags?.includes('UNVERIFIABLE') || result.data.flags?.includes('INCONCLUSIVE')) {
      status = 'pending';
    }

    const converted = {
      id: `${result.meta.fingerprint}-${result.meta.chunk}-${result.meta.seq}`,
      text: result.data.extractedClaim,
      confidence: result.data.reasoningConfidence,
      status,
      sources: result.data.sources || [], // Garantir que sempre seja um array
      explanation: result.data.reasoning
    };

    console.log('🔄 Convertendo resultado:', {
      original: result,
      converted: converted,
      sources: result.data.sources,
      hasSources: !!result.data.sources,
      sourcesLength: result.data.sources?.length || 0
    });

    return converted;
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
  
  console.log('📊 Resultados convertidos:', {
    count: convertedResults.length,
    results: convertedResults
  });

  // Função para gerar o texto completo formatado com todos os resultados
  const generateFormattedText = useCallback(() => {
    const originalText = verificationState.processedText || text || '';
    const results = convertedResults;
    
    if (!originalText) return '';
    
    let formattedText = '';
    
    // Adiciona o texto original
    formattedText += 'TEXTO VERIFICADO:\n';
    formattedText += '==================\n\n';
    formattedText += originalText;
    formattedText += '\n\n';
    
    // Se não há resultados, adiciona informação
    if (results.length === 0) {
      formattedText += 'RESULTADOS DA VERIFICAÇÃO:\n';
      formattedText += '=========================\n\n';
      formattedText += 'Nenhum resultado encontrado na verificação.\n';
      return formattedText;
    }
    
    // Adiciona os resultados da verificação
    formattedText += 'RESULTADOS DA VERIFICAÇÃO:\n';
    formattedText += '=========================\n\n';
    
    results.forEach((result, index) => {
      formattedText += `${index + 1}. AFIRMAÇÃO VERIFICADA:\n`;
      formattedText += `${result.text}\n\n`;
      
      // Status da verificação
      let statusText = '';
      switch (result.status) {
        case 'verified':
          statusText = '✅ VERIFICADO';
          break;
        case 'unverified':
          statusText = '❌ NÃO VERIFICADO';
          break;
        case 'pending':
          statusText = '⏳ PENDENTE';
          break;
        default:
          statusText = '❓ INDETERMINADO';
      }
      
      formattedText += `Status: ${statusText}\n`;
      formattedText += `Confiança: ${Math.round(result.confidence * 100)}%\n\n`;
      
      // Análise/explicação
      if (result.explanation) {
        formattedText += `ANÁLISE:\n`;
        formattedText += `${result.explanation}\n\n`;
      }
      
      // Fontes
      if (result.sources && result.sources.length > 0) {
        formattedText += `FONTES:\n`;
        result.sources.forEach((source, sourceIndex) => {
          formattedText += `${sourceIndex + 1}. ${source}\n`;
        });
        formattedText += '\n';
      }
      
      // Separador entre resultados
      if (index < results.length - 1) {
        formattedText += '---\n\n';
      }
    });
    
    // Adiciona informações finais
    formattedText += '\n';
    formattedText += 'GERADO POR VERITAS - VERIFICADOR DE FATOS\n';
    formattedText += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    formattedText += `Total de afirmações verificadas: ${results.length}\n`;
    
    return formattedText;
  }, [verificationState.processedText, text, convertedResults]);

  const handleCopyPlainText = useCallback(async () => {
    try {
      const textToCopy = generateFormattedText();
      if (!textToCopy) return;
      
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback para navegadores antigos
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (e) {
      console.error('Falha ao copiar texto:', e);
    }
  }, [generateFormattedText]);

  // Inicializa a conexão com o backend
  useEffect(() => {
    if (isInitialized) return;

    const timeouts: number[] = [];
    const initializeConnection = async () => {
      try {
        console.log('🔌 Inicializando conexão com o backend...');
        
        // Testa a conexão
        const isConnected = await factCheckService.testConnection();
        if (!isConnected) {
          console.error('❌ Falha ao conectar com o backend');
          return;
        }

        console.log('✅ Conexão com o backend estabelecida');
        setIsInitialized(true);

        // Mostra o painel esquerdo primeiro (imagem 4)
        const t1 = window.setTimeout(() => {
          setShowLeftPanel(true);
        }, 500);
        timeouts.push(t1);

        // Mostra o painel de resultados após 1-2 segundos (imagem 5)
        const t2 = window.setTimeout(() => {
          setShowResultsPanel(true);
        }, 1500);
        timeouts.push(t2);

      } catch (error) {
        console.error('❌ Erro ao inicializar conexão:', error);
      } finally {
        // nada aqui; cleanup feito no retorno do effect
      }
    };

    void initializeConnection();
    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
    }
  }, [isInitialized, text]);

  // O estado já é sincronizado automaticamente via Zustand

  // Inicia a verificação automaticamente quando a página carrega
  useEffect(() => {
    if (!isInitialized || !showResultsPanel) return;

    const startVerification = async () => {
      try {
        // Se já há resultados ou verificação em andamento, não inicia nova verificação
        const currentState = factCheckService.getState();
        if (currentState.results.length > 0 || currentState.status === 'processing' || currentState.status === 'connecting') {
          console.log('📊 Usando estado existente:', currentState.status, 'com', currentState.results.length, 'resultados');
          return;
        }

        // Verifica se há texto processado disponível
        const serviceText = factCheckService.getProcessedText();
        if (!serviceText || serviceText.trim() === '') {
          console.log('⚠️ Nenhum texto processado disponível, aguardando...');
          return;
        }

        console.log('🚀 Iniciando verificação de fatos...');
        console.log('📝 Texto:', serviceText);

        // Garante envio das API keys ao backend
        if (!apiKeys?.google || !apiKeys?.tavily) {
          console.warn('⚠️ API keys ausentes; abortando verificação automática na ResultsPage');
          return;
        }
        
        const fingerprint = await factCheckService.requestFactCheck(serviceText, {
          researchThreshold: 0.5,
          apiKeys: {
            google: apiKeys.google,
            tavily: apiKeys.tavily,
          },
        });
        
        console.log('🔑 Fingerprint gerado:', fingerprint);
      } catch (error) {
        console.error('❌ Erro ao iniciar verificação:', error);
      }
    };

    // Inicia a verificação imediatamente
    startVerification();
  }, [isInitialized, showResultsPanel, text, apiKeys]);

  const handleNewVerification = () => {
    // Sempre mostrar modal de confirmação
    setShowNewTextModal(true);
  };

  const handleConfirmNewText = () => {
    console.log('✅ Modal confirmado - executando ação');
    setShowNewTextModal(false);
    if (onNewVerification) {
      onNewVerification();
    } else {
      // Fallback: redirecionar para home
      window.location.href = '/';
    }
  };

  const handleCancelNewText = () => {
    // Apenas fecha o modal, não faz nada mais
    console.log('🚫 Modal cancelado - fechando modal');
    setShowNewTextModal(false);
  };

  // Handlers para sincronização bidirecional
  const handleClaimClick = useCallback((claimId: string) => {
    console.log('🎯 CLAIM clicado:', claimId);
    setSelectedClaimId(claimId);
    
    // Scroll para o resultado correspondente
    const resultElement = document.getElementById(`result-${claimId}`);
    if (resultElement) {
      resultElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, []);

  const handleResultClick = useCallback((resultId: string) => {
    console.log('📊 Resultado clicado:', resultId);
    setSelectedClaimId(resultId);
    
    // Scroll para o CLAIM correspondente no texto
    const claimElement = document.getElementById(`claim-${resultId}`);
    if (claimElement) {
      claimElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, []);

  return (
    <div className={cn('min-h-screen', className)} style={{ backgroundColor: 'var(--veritas-results-background)' }}>
      {/* Header */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
      </div>
      
      <div className="max-w-[1280px] mx-auto px-4 sm:px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-7rem)]">
          {/* Coluna Esquerda - Texto Processado */}
          {showLeftPanel && (
            <div className="rounded-lg pl-16 pr-16 transition-opacity duration-500">
              <ProcessedTextPanel
                text={verificationState.processedText || text || ''}
                results={convertedResults}
                onNewVerification={handleNewVerification}
                onClaimClick={handleClaimClick}
                selectedClaimId={selectedClaimId}
              />
            </div>
          )}

          {/* Coluna Direita - Resultados */}
          {showResultsPanel && (
            <div>
          <ResultsPanel
            status={getResultsPanelStatus()}
            results={convertedResults}
            onCopyPlainText={handleCopyPlainText}
            onCancel={() => setShowCancelVerificationModal(true)}
            onResultClick={handleResultClick}
            selectedResultId={selectedClaimId}
          />
        </div>
      )}
        </div>
      </div>

      {/* Modal de Confirmação para Novo Texto */}
      <ConfirmationDialog
        isOpen={showNewTextModal}
        onClose={() => setShowNewTextModal(false)}
        onCancel={handleCancelNewText}
        variant="new-text"
        onConfirm={handleConfirmNewText}
      />

      {/* Modal de Confirmação para Cancelar Verificação */}
      <ConfirmationDialog
        isOpen={showCancelVerificationModal}
        onClose={() => setShowCancelVerificationModal(false)}
        onCancel={() => setShowCancelVerificationModal(false)}
        variant="cancel-verification"
        onConfirm={() => {
          // Limpa estado local e serviço, e volta para a home
          factCheckService.reset();
          setShowCancelVerificationModal(false);
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }}
      />
    </div>
  );
};

export default ResultsPage;
