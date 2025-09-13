"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import AnimatedText from '@/components/ui/AnimatedText';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ResultCard, { ResultData } from './ResultCard';

interface ResultsPanelProps {
  status: 'loading' | 'partial' | 'complete' | 'error';
  results: ResultData[];
  className?: string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  status,
  results,
  className
}) => {
  const getHeaderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-green-500 animate-pulse" />
            <AnimatedText 
              text="Verificando" 
              className="text-lg font-semibold text-[#102148]"
            />
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-green-500" />
            <h2 className="text-lg font-semibold text-[#102148]">
              Verificando...
            </h2>
          </div>
        );
      case 'complete':
        return (
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-green-500" />
            <h2 className="text-lg font-semibold text-[#102148]">
              Verificação Completa
            </h2>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-3">
            <CheckCircle className="size-6 text-red-500" />
            <h2 className="text-lg font-semibold text-[#102148]">
              Erro na Verificação
            </h2>
          </div>
        );
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (status === 'loading') {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ResultCard
              key={i}
              result={{
                id: `loading-${i}`,
                text: '',
                confidence: 0,
                status: 'loading'
              }}
            />
          ))}
        </div>
      );
    }

    if (results.length === 0 && status !== 'loading') {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <CheckCircle className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum resultado encontrado
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {results.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-6 border-b border-[#d6d8db]">
        {getHeaderContent()}
      </div>

      {/* Results Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderResults()}
      </div>
    </div>
  );
};

export default ResultsPanel;
