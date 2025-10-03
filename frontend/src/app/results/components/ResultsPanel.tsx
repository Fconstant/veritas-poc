"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
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
  onResultClick?: (resultId: string) => void;
  selectedResultId?: string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  status,
  results,
  className,
  onCancel,
  onRetry,
  onCopyPlainText,
  onResultClick,
  selectedResultId
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

    if (status === 'error') {
      // Estado de erro baseado no design do Figma
      return (
        <div className="flex flex-col gap-4 items-center justify-center">
          {/* Card com fundo vermelho claro */}
          <div className="bg-[rgba(212,74,74,0.15)] box-border flex gap-2 items-center justify-start p-6 relative rounded-[15px]">
            <div className="overflow-clip relative shrink-0 size-12">
              <AlertCircle className="size-12 text-[#d44a4a]" />
            </div>
          </div>
          
          {/* Texto */}
          <div className="flex flex-col font-normal justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#383838] text-[14px] text-nowrap">
            <p className="leading-[24px] overflow-ellipsis overflow-hidden whitespace-pre">Erro na Verificação. Tente novamente.</p>
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
        {results.map((result: any, index: number) => (
          <div 
            key={result.id}
            id={`result-${result.id}`}
            className={cn(
              "rounded-lg border border-[#d6d8db] bg-white p-4 transition-all duration-200 cursor-pointer",
              selectedResultId === result.id && "ring-2 ring-purple-500 ring-opacity-50 bg-purple-50",
              "hover:shadow-md hover:border-purple-300"
            )}
            onClick={() => onResultClick?.(result.id)}
          >
            {/* Claim Number */}
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200",
                selectedResultId === result.id 
                  ? "bg-purple-500 text-white" 
                  : "bg-gray-200 text-gray-600"
              )}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                {/* Claim Text */}
                <div className="mb-3">
                  <p className="text-neutral-700 text-base font-normal font-['Inter'] leading-normal">
                    {result.text}
                  </p>
                </div>

                {/* Explanation */}
                {result.explanation && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 leading-normal bg-gray-50 p-2 rounded-lg">
                      {result.explanation}
                    </p>
                  </div>
                )}

                {/* Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Fontes:</h4>
                    <div className="space-y-1">
                      {result.sources.map((source: string, sourceIndex: number) => (
                        <div key={sourceIndex} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <a 
                            href={source} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#8A5CDA] hover:text-[#5d13dd] underline truncate"
                          >
                            <span className="truncate">{source}</span>
                            <ExternalLink className="size-3 flex-shrink-0" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Skeleton card no final da lista durante verificação */}
        {(status === 'loading' as string | 'partial' as string) && (
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
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-stone-50 rounded-2xl',
        // Sombra condicional baseada no status
        status === 'loading' || status === 'partial' 
          ? 'shadow-[0px_20px_80px_0px_rgba(137,44,219,0.20),0px_4px_8px_0px_rgba(0,0,0,0.15)]'
          : 'shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)]',
        // Altura máxima garantida para nunca ultrapassar a viewport
        'max-h-[calc(100vh-7rem)]',
        // Borda condicional baseada no status
        status === 'error' 
          ? 'border border-[#cb1f1f]' 
          : status === 'loading' || status === 'partial'
            ? 'border border-violet-900'
            : 'border border-violet-900/30',
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
