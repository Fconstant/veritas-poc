"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResultsHeader, VerificationStatus } from './ResultsHeader';
import { Button } from '@/app/shared/components/ui/button';
// import ResultCard from './ResultCard';
import type { ResultData } from '@/lib/types/results';
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
    if (canGoPrev) onResultClick?.(results[selectedIndex - 1].id);
  };

  const handleNext = () => {
    if (canGoNext) onResultClick?.(results[selectedIndex + 1].id);
  };

  const renderResults = () => {
    if (status === 'loading') {
      return (
        <div className="space-y-4 w-full">
          {/* Skeleton Card baseado no design do Figma */}
          <div className="border border-[#351397] border-solid box-border content-stretch flex flex-col gap-[8px] items-start pl-[12px] pr-[16px] py-[16px] relative rounded-[16px] shrink-0 w-full">
            <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
              {/* Status dot skeleton */}
              <div className="relative shrink-0 size-[16px]">
                <div className="absolute bg-[#e7ebeb] left-1/2 rounded-[9999px] size-[16px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
                <div className="absolute bg-[#cbd0d5] left-1/2 rounded-[9999px] size-[8px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
              </div>
              
              {/* Text skeleton */}
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-h-px min-w-px relative shrink-0">
                {/* Primeira linha do skeleton */}
                <div className="h-[16px] relative rounded-[9999px] shrink-0 w-full bg-gradient-to-r from-[#e7ebeb] via-[#cbd0d5] to-[#e7ebeb] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
                {/* Segunda linha do skeleton */}
                <div className="h-[16px] relative rounded-[9999px] shrink-0 w-[288px] bg-gradient-to-r from-[#e7ebeb] via-[#cbd0d5] to-[#e7ebeb] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (status === 'error') {
      // Estado de erro baseado no design do Figma
      return (
        <div className="flex flex-col gap-[16px] items-center justify-center">
          {/* Card com fundo vermelho claro */}
          <div className="bg-[rgba(212,74,74,0.15)] box-border content-stretch flex gap-[8px] items-center p-[24px] relative rounded-[15px] shrink-0">
            <div className="overflow-clip relative shrink-0 size-[48px]">
              <AlertCircle className="size-[48px] text-[#d44a4a]" />
            </div>
          </div>
          
          {/* Texto */}
          <div className="flex flex-col font-['Inter'] font-normal justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#383838] text-[14px] whitespace-nowrap">
            <p className="leading-[24px] overflow-ellipsis overflow-hidden">Erro na Verificação. Tente novamente.</p>
          </div>
        </div>
      );
    }

    if (results.length === 0) {
      if (status === 'complete') {
        // Estado "Nenhum resultado encontrado" baseado no design do Figma
        return (
          <div className="flex flex-col gap-[16px] items-center justify-center">
            {/* Card com fundo roxo claro */}
            <div className="bg-[rgba(132,74,233,0.1)] box-border content-stretch flex gap-[8px] items-center p-[24px] relative rounded-[15px] shrink-0">
              <div className="overflow-clip relative shrink-0 size-[48px]">
                <CheckCircle2 className="size-[48px] text-[#844ae9]" />
              </div>
            </div>
            
            {/* Texto */}
            <div className="flex flex-col font-['Inter'] font-normal justify-center leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#383838] text-[14px] whitespace-nowrap">
              <p className="leading-[24px] overflow-ellipsis overflow-hidden">Nenhum resultado encontrado!</p>
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
          <div 
            key={result.id}
            id={`result-${result.id}`}
            className={cn(
              "bg-white border border-[#d9d9d9] border-solid relative rounded-[16px] shrink-0 w-full transition-all duration-200 cursor-pointer",
              selectedResultId === result.id && "ring-2 ring-purple-500 ring-opacity-50 bg-purple-50",
              "hover:shadow-md hover:border-purple-300"
            )}
            onClick={() => onResultClick?.(result.id)}
          >
            <div className="box-border content-stretch flex flex-col gap-[16px] items-start overflow-clip pb-[16px] pt-[24px] px-[16px] relative rounded-[inherit] w-full">
              {/* Claim Text com numeração */}
              <div className="box-border content-stretch flex gap-[8px] items-start justify-center pl-0 pr-[16px] py-0 relative rounded-[8px] shrink-0 w-full">
                <div className="-webkit-box flex-[1_0_0] flex-col font-[var(--font-merriweather)] justify-center leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-[rgba(29,30,31,0.9)]">
                  <ol className="list-decimal" start={index + 1}>
                    <li className="ms-[21px] whitespace-pre-wrap">
                      <span className="leading-[28px]">{result.text}</span>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Análise e Fontes */}
              <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full">
                {/* Explanation/Análise */}
                {result.explanation && (
                  <div className="bg-[rgba(245,245,245,0.5)] border border-[#d8d8d8] border-solid box-border content-stretch flex flex-col gap-[8px] items-start p-[16px] relative rounded-[12px] shrink-0 w-full">
                    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                      <div className="flex flex-col font-['Inter'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#716793] text-[14px] whitespace-nowrap">
                        <p className="leading-[24px]">Análise</p>
                      </div>
                    </div>
                    <div className="flex flex-col font-['Inter'] font-normal justify-center leading-[28px] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(29,30,31,0.9)] w-[min-content] whitespace-pre-wrap">
                      <p>{result.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Sources/Fontes */}
                {result.sources && result.sources.length > 0 && (
                  <div className="box-border content-stretch flex flex-col gap-[8px] items-start px-[8px] py-0 relative shrink-0 w-full">
                    <div className="box-border content-stretch flex gap-[8px] items-center px-[8px] py-0 relative shrink-0 w-full">
                      <div className="flex flex-col font-['Inter'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#716793] text-[14px] whitespace-nowrap">
                        <p className="leading-[24px]">Fontes</p>
                      </div>
                    </div>
                    <div className="content-start flex flex-wrap gap-[4px_8px] items-start relative shrink-0 w-full">
                      {result.sources.map((source: string, sourceIndex: number) => {
                        let displayText = source;
                        try {
                          displayText = new URL(source).hostname.replace('www.', '');
                        } catch {
                          // Se não for uma URL válida, usa o texto original
                          displayText = source.length > 30 ? source.substring(0, 30) + '...' : source;
                        }
                        
                        return (
                          <div key={sourceIndex} className="box-border content-stretch flex gap-[8px] items-center justify-center px-[6px] py-[2px] relative rounded-[8px] shrink-0">
                            <a 
                              href={source} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-['Inter'] font-normal leading-[24px] not-italic relative shrink-0 text-[#8a5cda] text-[13px] hover:text-[#5d13dd]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {displayText}
                            </a>
                            <div className="overflow-clip relative shrink-0 size-[16px]">
                              <ExternalLink className="size-[16px] text-[#8a5cda]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Skeleton card no final da lista durante verificação */}
        {status === 'partial' && (
          <div className="border border-[#351397] border-solid box-border content-stretch flex flex-col gap-[8px] items-start pl-[12px] pr-[16px] py-[16px] relative rounded-[16px] shrink-0 w-full">
            <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
              {/* Status dot skeleton */}
              <div className="relative shrink-0 size-[16px]">
                <div className="absolute bg-[#e7ebeb] left-1/2 rounded-[9999px] size-[16px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
                <div className="absolute bg-[#cbd0d5] left-1/2 rounded-[9999px] size-[8px] top-1/2 translate-x-[-50%] translate-y-[-50%]" />
              </div>
              
              {/* Text skeleton */}
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-h-px min-w-px relative shrink-0">
                {/* Primeira linha do skeleton */}
                <div className="h-[16px] relative rounded-[9999px] shrink-0 w-full bg-gradient-to-r from-[#e7ebeb] via-[#cbd0d5] to-[#e7ebeb] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
                {/* Segunda linha do skeleton */}
                <div className="h-[16px] relative rounded-[9999px] shrink-0 w-[288px] bg-gradient-to-r from-[#e7ebeb] via-[#cbd0d5] to-[#e7ebeb] bg-[length:200px_100%] animate-[shimmer_10s_ease-in-out_infinite]" />
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
      <div className="box-border content-stretch flex flex-col gap-[16px] items-start pt-[16px] relative shrink-0 w-full">
        <div className="content-stretch flex items-start relative shrink-0 w-full">
          <ResultsHeader
            status={getVerificationStatus()}
            onCancel={onCancel}
            onRetry={onRetry}
            onCopy={onCopyPlainText}
          />
        </div>
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t border-[#d6d8db]" />
        </div>
      </div>

      {/* Results Content */}
      <div className={cn(
        'box-border content-justify flex flex-col gap-[16px] items-center px-[8px] py-[16px] relative shrink-0 w-full',
        // Flex behavior: sempre flex-1 com overflow-y-auto para rolagem quando necessário
        'flex-1 overflow-y-auto',
        // Justificação condicional
        (status === 'error' || (status === 'complete' && results.length === 0)) && 'justify-center'
      )}>
        {renderResults()}
      </div>

      {/* Footer - apenas quando há resultados */}
      {status === 'complete' && results.length > 0 && (
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start pb-[24px] pt-0 px-0 relative shrink-0 w-full">
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t border-[#d6d8db]" />
          </div>
          <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
            <div className="content-stretch flex gap-[8px] items-center relative self-stretch shrink-0">
              <div className="flex flex-col font-['Inter'] font-medium justify-center leading-[0] not-italic opacity-50 relative shrink-0 text-[14px] text-slate-900 whitespace-nowrap">
                <p className="leading-[20px]">{results.length} {results.length === 1 ? 'Afirmação encontrada' : 'Afirmações encontradas'}</p>
              </div>
            </div>
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
              <Button variant="link" size="sm" disabled={!canGoPrev} disabledTooltip={prevDisabledTooltip} onClick={handlePrev} className="px-[4px] py-[2px]">
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button variant="link" size="sm" disabled={!canGoNext} disabledTooltip={nextDisabledTooltip} onClick={handleNext} className="px-[4px] py-[2px]">
                Próximo
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer para estado partial (em andamento) */}
      {status === 'partial' && results.length > 0 && (
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start pb-[24px] pt-0 px-0 relative shrink-0 w-full">
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t border-[#d6d8db]" />
          </div>
          <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
            <div className="content-stretch flex gap-[8px] items-center relative self-stretch shrink-0">
              <div className="flex flex-col font-['Inter'] font-medium justify-center leading-[0] not-italic opacity-50 relative shrink-0 text-[14px] text-slate-900 whitespace-nowrap">
                <p className="leading-[20px]">{results.length} {results.length === 1 ? 'Afirmação encontrada' : 'Afirmações encontradas'}</p>
              </div>
            </div>
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
              <Button variant="link" size="sm" disabled={!canGoPrev} disabledTooltip={prevDisabledTooltip} onClick={handlePrev}>
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button variant="link" size="sm" disabled={!canGoNext} disabledTooltip={nextDisabledTooltip} onClick={handleNext}>
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
