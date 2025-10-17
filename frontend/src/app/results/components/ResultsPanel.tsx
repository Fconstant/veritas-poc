"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResultsHeader, VerificationStatus } from './ResultsHeader';
import { Button } from '@/app/shared/components/ui/button';
import ResultCard from './ResultCard';
import type { ResultData } from '@/lib/types/results';

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
        // Se completo mas sem resultados, usa estado especial
        if (results.length === 0) {
          return 'complete-no-results';
        }
        return 'done';
      case 'error':
        return 'error';
      default:
        return 'verifying';
    }
  };

  // Navegação entre resultados selecionados
  const selectedIndex = results.findIndex((r) => r.id === selectedResultId);
  const canGoPrev = results.length > 0 && selectedIndex > 0;
  const canGoNext = results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length - 1;

  const prevDisabledTooltip =
    selectedIndex === -1
      ? "Nenhuma afirmação selecionada"
      : selectedIndex === 0
      ? "Já está na primeira afirmação"
      : undefined;

  const nextDisabledTooltip =
    selectedIndex === -1
      ? "Nenhum afirmação selecionado"
      : selectedIndex === results.length - 1
      ? "Já está na última afirmação"
      : undefined;

  const handlePrev = () => {
    if (canGoPrev) {
      const prevResult = results[selectedIndex - 1];
      onResultClick?.(prevResult.id);
      
      // Scroll para o resultado anterior
      setTimeout(() => {
        const resultElement = document.getElementById(`result-${prevResult.id}`);
        if (resultElement) {
          resultElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 50);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      const nextResult = results[selectedIndex + 1];
      onResultClick?.(nextResult.id);
      
      // Scroll para o próximo resultado
      setTimeout(() => {
        const resultElement = document.getElementById(`result-${nextResult.id}`);
        if (resultElement) {
          resultElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 50);
    }
  };

  const renderResults = () => {
    if (status === 'loading') {
      return (
        <div className="space-y-4 w-full">
          {/* Skeleton Card baseado no design do Figma */}
          <div className="border border-[var(--purple-primary)] border-solid box-border content-stretch flex flex-col gap-2 items-start pl-3 pr-4 py-4 relative rounded-2xl shrink-0 w-full">
            <div className="content-stretch flex gap-2 items-start relative shrink-0 w-full">
              {/* Status dot skeleton */}
              <div className="relative shrink-0 size-4">
                <div className="absolute bg-[var(--skeleton-bg-light)] left-1/2 rounded-full size-4 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bg-[var(--skeleton-bg-medium)] left-1/2 rounded-full size-2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              {/* Text skeleton */}
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-3 items-start min-h-px min-w-px relative shrink-0">
                {/* Primeira linha do skeleton */}
                <div className="h-4 relative rounded-full shrink-0 w-full bg-gradient-to-r from-[var(--skeleton-bg-light)] via-[var(--skeleton-bg-medium)] to-[var(--skeleton-bg-light)] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
                {/* Segunda linha do skeleton */}
                <div className="h-4 relative rounded-full shrink-0 w-72 bg-gradient-to-r from-[var(--skeleton-bg-light)] via-[var(--skeleton-bg-medium)] to-[var(--skeleton-bg-light)] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
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
          <div className="bg-[var(--text-error-bg)] box-border content-stretch flex gap-2 items-center p-6 relative rounded-2xl shrink-0">
            <div className="overflow-clip relative shrink-0 size-12">
              <AlertCircle className="size-12 text-[var(--text-error)]" />
            </div>
          </div>
          
          {/* Texto */}
          <div className="flex flex-col font-['Inter'] font-normal justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[var(--text-active)] text-sm whitespace-nowrap">
            <p className="leading-6 overflow-ellipsis overflow-hidden">Erro na Verificação. Tente novamente.</p>
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
            <div className="bg-[var(--bg-purple-light)] box-border content-stretch flex gap-2 items-center p-6 relative rounded-2xl shrink-0">
              <div className="overflow-clip relative shrink-0 size-12">
                <CheckCircle2 className="size-12 text-[var(--purple-button)]" />
              </div>
            </div>
            
            {/* Texto */}
            <div className="flex flex-col font-['Inter'] font-normal justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[var(--text-active)] text-sm whitespace-nowrap">
              <p className="leading-6 overflow-ellipsis overflow-hidden">Nenhum resultado encontrado!</p>
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
        {results.map((result: ResultData, index: number) => (
          <ResultCard
            key={result.id}
            id={`result-${result.id}`}
            text={result.text}
            explanation={result.explanation}
            sources={result.sources}
            index={index + 1}
            isSelected={selectedResultId === result.id}
            onClick={() => onResultClick?.(result.id)}
          />
        ))}

        {/* Skeleton card no final da lista durante verificação */}
        {status === 'partial' && (
          <div className="border border-[var(--purple-primary)] border-solid box-border content-stretch flex flex-col gap-2 items-start pl-3 pr-4 py-4 relative rounded-2xl shrink-0 w-full">
            <div className="content-stretch flex gap-2 items-start relative shrink-0 w-full">
              {/* Status dot skeleton */}
              <div className="relative shrink-0 size-4">
                <div className="absolute bg-[var(--skeleton-bg-light)] left-1/2 rounded-full size-4 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bg-[var(--skeleton-bg-medium)] left-1/2 rounded-full size-2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              {/* Text skeleton */}
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-3 items-start min-h-px min-w-px relative shrink-0">
                {/* Primeira linha do skeleton */}
                <div className="h-4 relative rounded-full shrink-0 w-full bg-gradient-to-r from-[var(--skeleton-bg-light)] via-[var(--skeleton-bg-medium)] to-[var(--skeleton-bg-light)] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
                {/* Segunda linha do skeleton */}
                <div className="h-4 relative rounded-full shrink-0 w-72 bg-gradient-to-r from-[var(--skeleton-bg-light)] via-[var(--skeleton-bg-medium)] to-[var(--skeleton-bg-light)] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    // Card com todos os Resultados na página de Verificação
    <div
      className={cn(
        'flex flex-col inline-flex flex-col justify-start items-start w-full',
        // Altura máxima garantida para nunca ultrapassar a viewport
        'max-h-[calc(100vh-7rem)]',
        className
      )}
    >
      {/* Header */}
      <div className="box-border content-stretch flex flex-col gap-3 sm:gap-4 items-start pt-3 sm:pt-4 relative shrink-0 w-full">
        <div className="content-stretch flex items-start relative shrink-0 w-full">
          <ResultsHeader
            status={getVerificationStatus()}
            onCancel={onCancel}
            onRetry={onRetry}
            onCopy={onCopyPlainText}
          />
        </div>
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t border-[var(--helper-border)]" />
        </div>
      </div>

      {/* Results Content */}
      <div className={cn(
        'box-border content-justify flex flex-col gap-3 sm:gap-4 items-center px-1 sm:px-2 py-3 sm:py-4 relative shrink-0 w-full',
        // Flex behavior: sempre flex-1 com overflow-y-auto para rolagem quando necessário
        'flex-1 overflow-y-auto',
        // Justificação condicional
        (status === 'error' || (status === 'complete' && results.length === 0)) && 'justify-center'
      )}>
        {renderResults()}
      </div>

      {/* Footer - apenas quando há resultados */}
      {status === 'complete' && results.length > 0 && (
        <div className="box-border content-stretch flex flex-col gap-3 sm:gap-4 items-start pb-4 sm:pb-6 pt-0 px-0 relative shrink-0 w-full">
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t border-[var(--helper-border)]" />
          </div>
          <div className="content-stretch flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 relative shrink-0 w-full">
            <div className="content-stretch flex gap-2 items-center relative self-stretch shrink-0">
              <div className="flex flex-col font-['Inter'] font-medium justify-center leading-[0] not-italic opacity-50 relative shrink-0 text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                <p className="leading-5">{results.length} {results.length === 1 ? 'Afirmação encontrada' : 'Afirmações encontradas'}</p>
              </div>
            </div>
            <div className="content-stretch flex gap-1 sm:gap-2 items-center relative shrink-0">
              <Button variant="link" size="sm" disabled={!canGoPrev} disabledTooltip={prevDisabledTooltip} onClick={handlePrev} className="px-0.5 sm:px-1 py-0.5 text-xs sm:text-sm">
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button variant="link" size="sm" disabled={!canGoNext} disabledTooltip={nextDisabledTooltip} onClick={handleNext} className="px-0.5 sm:px-1 py-0.5 text-xs sm:text-sm">
                Próximo
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer para estado partial (em andamento) */
      {status === 'partial' && results.length > 0 && (
        <div className="box-border content-stretch flex flex-col gap-3 sm:gap-4 items-start pb-4 sm:pb-6 pt-0 px-0 relative shrink-0 w-full">
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t border-[var(--helper-border)]" />
          </div>
          <div className="content-stretch flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 relative shrink-0 w-full">
            <div className="content-stretch flex gap-2 items-center relative self-stretch shrink-0">
              <div className="flex flex-col font-['Inter'] font-medium justify-center leading-[0] not-italic opacity-50 relative shrink-0 text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                <p className="leading-5">{results.length} {results.length === 1 ? 'Afirmação encontrada' : 'Afirmações encontradas'}</p>
              </div>
            </div>
            <div className="content-stretch flex gap-1 sm:gap-2 items-center relative shrink-0">
              <Button variant="link" size="sm" disabled={!canGoPrev} disabledTooltip={prevDisabledTooltip} onClick={handlePrev} className="text-xs sm:text-sm">
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button variant="link" size="sm" disabled={!canGoNext} disabledTooltip={nextDisabledTooltip} onClick={handleNext} className="text-xs sm:text-sm">
                Próximo
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
