"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { ResultsHeader, VerificationStatus } from './ResultsHeader';
// import ResultCard from './ResultCard';
import type { ResultData } from './ResultCard';
// ResultCard desativado: estados por resultado não são suportados no momento.
// O painel agora exibe apenas o status global via ResultsHeader.

interface ResultsPanelProps {
  status: 'loading' | 'partial' | 'complete' | 'error';
  results: ResultData[];
  className?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  onCopyPlainText?: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  status,
  results,
  className,
  onCancel,
  onRetry,
  onCopyPlainText
}) => {
  // Mapear status do ResultsPanel para VerificationStatus do ResultsHeader
  const getVerificationStatus = (): VerificationStatus => {
    switch (status) {
      case 'loading':
      case 'partial':
        return 'verifying';
      case 'complete':
        return 'done';
      case 'error':
        return 'error';
      default:
        return 'verifying';
    }
  };

  const renderResults = () => {
    if (status === 'loading') {
      return (
        <div className="space-y-4">
          {/* Skeleton Card baseado no design do Figma */}
          <div className="box-border flex flex-col gap-2 items-start justify-start pl-3 pr-4 py-4 relative rounded-[8px] w-full border border-[#351397]/30 bg-[#f9f9f9]">
            <div className="flex gap-2 items-start justify-start relative shrink-0 w-full">
              {/* Status dot skeleton */}
              <div className="relative shrink-0 size-4">
                <div className="absolute bg-[#e7ebeb] left-1/2 rounded-full size-4 top-1/2 translate-x-[-50%] translate-y-[-50%]" />
                <div className="absolute bg-[#cbd0d5] left-1/2 rounded-full size-2 top-1/2 translate-x-[-50%] translate-y-[-50%]" />
              </div>
              
              {/* Text skeleton */}
              <div className="flex flex-col gap-3 grow items-start justify-start min-h-px min-w-px relative shrink-0">
                {/* Primeira linha do skeleton */}
                <div className="h-4 rounded-full shrink-0 w-full bg-gradient-to-r from-[#e7ebeb] via-[#cbd0d5] to-[#e7ebeb] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
                {/* Segunda linha do skeleton */}
                <div className="h-4 rounded-full shrink-0 w-72 bg-gradient-to-r from-[#e7ebeb] via-[#cbd0d5] to-[#e7ebeb] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (results.length === 0) {
      if (status === 'complete') {
        // Estado "Nenhum resultado encontrado" baseado no design do Figma
        return (
          <div className="flex flex-col gap-4 items-center justify-center">
            {/* Card com fundo roxo claro */}
            <div className="bg-[rgba(132,74,233,0.1)] box-border flex gap-2 items-center justify-start p-6 relative rounded-[15px]">
              <div className="overflow-clip relative shrink-0 size-12">
                <CheckCircle2 className="size-12 text-[#844ae9]" />
              </div>
            </div>
            
            {/* Texto */}
            <div className="flex flex-col font-normal justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#383838] text-[14px] text-nowrap">
              <p className="leading-[24px] overflow-ellipsis overflow-hidden whitespace-pre">Nenhum resultado encontrado!</p>
            </div>
          </div>
        );
      }
      
      // Estado de processamento (mantém o design original)
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <CheckCircle2 className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Processando resultados...
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {results.map((result: any) => (
          <div key={result.id} className="rounded-md border border-[#d6d8db] bg-white p-4">
            {/* Claim Text */}
            <div className="mb-3">
              <p className="text-sm text-[#102148] leading-relaxed font-medium">
                {result.text}
              </p>
            </div>

            {/* Status and Confidence
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                {result.status === 'verified' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Verificado</span>
                  </div>
                )}
                {result.status === 'unverified' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-red-600 font-medium">Não Verificado</span>
                  </div>
                )}
                {result.status === 'pending' && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-yellow-600 font-medium">Pendente</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(result.confidence * 100)}% confiança
              </div>
            </div> */}

            {/* Explanation */}
            {result.explanation && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-1">Análise:</h4>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded">
                  {result.explanation}
                </p>
              </div>
            )}

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Fontes:</h4>
                <div className="space-y-1">
                  {result.sources.map((source: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <a 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline truncate"
                      >
                        {source}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-stone-50 rounded-2xl',
        'shadow-[0px_20px_80px_0px_rgba(137,44,219,0.20),0px_4px_8px_0px_rgba(0,0,0,0.15)]',
        // Altura máxima garantida para nunca ultrapassar a viewport
        'max-h-[calc(100vh-4rem)]',
        // Borda condicional baseada no status
        status === 'error' ? 'border border-[#cb1f1f]' : 'border border-violet-900',
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#d6d8db] flex-shrink-0">
        <div className="flex items-center justify-between">
          <ResultsHeader
            status={getVerificationStatus()}
            onCancel={onCancel}
            onRetry={onRetry}
            onCopy={onCopyPlainText}
          />
        </div>
      </div>

      {/* Results Content */}
      <div className={cn(
        'px-6 py-6',
        // Flex behavior: sempre flex-1 com overflow-y-auto para rolagem quando necessário
        'flex-1 overflow-y-auto'
      )}>
        {renderResults()}
      </div>
    </div>
  );
};

export default ResultsPanel;
