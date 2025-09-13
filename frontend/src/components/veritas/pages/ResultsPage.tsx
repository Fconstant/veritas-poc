"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ProcessedTextPanel from '../results/ProcessedTextPanel';
import ResultsPanel from '../results/ResultsPanel';
import { ResultData } from '../results/ResultCard';

interface ResultsPageProps {
  text?: string;
  onNewVerification?: () => void;
  className?: string;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  text = "Este é um texto de exemplo para demonstração da página de resultados. O texto será processado e verificado pelo sistema de fact-checking.",
  onNewVerification,
  className
}) => {
  const [resultsStatus, setResultsStatus] = useState<'loading' | 'partial' | 'complete' | 'error'>('loading');
  const [results, setResults] = useState<ResultData[]>([]);
  const [showResultsPanel, setShowResultsPanel] = useState(false);

  // Simular carregamento inicial
  useEffect(() => {
    // Mostrar painel de resultados após 1-2 segundos
    const timer = setTimeout(() => {
      setShowResultsPanel(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simular recebimento de resultados
  useEffect(() => {
    if (!showResultsPanel) return;

    // Simular primeiro resultado após 3 segundos
    const firstResultTimer = setTimeout(() => {
      setResultsStatus('partial');
      setResults([
        {
          id: '1',
          text: 'Este é um texto de exemplo para demonstração',
          confidence: 0.95,
          status: 'verified',
          sources: ['https://example.com/source1'],
          explanation: 'Esta afirmação foi verificada através de múltiplas fontes confiáveis.'
        }
      ]);
    }, 3000);

    // Simular segundo resultado após 5 segundos
    const secondResultTimer = setTimeout(() => {
      setResults(prev => [
        ...prev,
        {
          id: '2',
          text: 'da página de resultados',
          confidence: 0.87,
          status: 'verified',
          sources: ['https://example.com/source2'],
          explanation: 'Confirmado por fontes oficiais.'
        }
      ]);
    }, 5000);

    // Simular resultado final após 7 segundos
    const finalResultTimer = setTimeout(() => {
      setResultsStatus('complete');
      setResults(prev => [
        ...prev,
        {
          id: '3',
          text: 'O texto será processado e verificado',
          confidence: 0.92,
          status: 'verified',
          sources: ['https://example.com/source3'],
          explanation: 'Processo de verificação concluído com sucesso.'
        }
      ]);
    }, 7000);

    return () => {
      clearTimeout(firstResultTimer);
      clearTimeout(secondResultTimer);
      clearTimeout(finalResultTimer);
    };
  }, [showResultsPanel]);

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
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
          {/* Coluna Esquerda - Texto Processado */}
          <div className="bg-white rounded-lg border border-[#d6d8db] shadow-sm">
            <ProcessedTextPanel
              text={text}
              onNewVerification={handleNewVerification}
            />
          </div>

          {/* Coluna Direita - Resultados */}
          {showResultsPanel && (
            <div className="bg-white rounded-lg border border-[#d6d8db] shadow-sm">
              <ResultsPanel
                status={resultsStatus}
                results={results}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
