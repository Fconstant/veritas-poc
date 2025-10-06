"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ResultData } from '@/lib/types/results';

interface ClaimHighlight {
  id: string;
  text: string;
  startIndex: number;
  endIndex: number;
  claimNumber: number;
  status: ResultData['status'];
}

interface InteractiveTextProps {
  text: string;
  results: ResultData[];
  onClaimClick?: (claimId: string) => void;
  selectedClaimId?: string;
  className?: string;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  results,
  onClaimClick,
  selectedClaimId,
  className
}) => {
  const [hoveredClaimId, setHoveredClaimId] = useState<string | null>(null);

  // Função para encontrar CLAIMS no texto usando correspondência de texto
  const findClaimsInText = useCallback((text: string, results: ResultData[]): ClaimHighlight[] => {
    const highlights: ClaimHighlight[] = [];
    
    results.forEach((result, index) => {
      const claimText = result.text.trim();
      
      // Remove aspas do início e fim se existirem
      const cleanClaimText = claimText.replace(/^["']|["']$/g, '');
      
      // Busca o texto do CLAIM no texto original
      const startIndex = text.indexOf(cleanClaimText);
      
      if (startIndex !== -1) {
        highlights.push({
          id: result.id,
          text: cleanClaimText,
          startIndex,
          endIndex: startIndex + cleanClaimText.length,
          claimNumber: index + 1,
          status: result.status
        });
      }
    });
    
    // Ordena por posição no texto
    return highlights.sort((a, b) => a.startIndex - b.startIndex);
  }, []);

  // Encontra os CLAIMS no texto
  const claimHighlights = useMemo(() => {
    return findClaimsInText(text, results);
  }, [text, results, findClaimsInText]);

  // Função para renderizar o texto com highlights
  const renderTextWithHighlights = useCallback(() => {
    if (claimHighlights.length === 0) {
      return (
        <span className="text-zinc-500">
          {text}
        </span>
      );
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    claimHighlights.forEach((highlight) => {
      // Adiciona texto antes do highlight
      if (highlight.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`} className="text-zinc-500">
            {text.slice(lastIndex, highlight.startIndex)}
          </span>
        );
      }

      // Adiciona o highlight com número na frente
      const isSelected = selectedClaimId === highlight.id;
      const isHovered = hoveredClaimId === highlight.id;
      
      elements.push(
        <span
          key={`claim-${highlight.id}`}
          id={`claim-${highlight.id}`}
          className={cn(
            "inline-flex items-center gap-1 cursor-pointer transition-all duration-200",
            // Selected state
            isSelected && "ring-2 ring-purple-500 ring-opacity-50 rounded px-1 py-0.5"
          )}
          onClick={() => onClaimClick?.(highlight.id)}
          onMouseEnter={() => setHoveredClaimId(highlight.id)}
          onMouseLeave={() => setHoveredClaimId(null)}
          title={`CLAIM ${highlight.claimNumber}: ${highlight.text}`}
        >
          {/* Número da referência */}
          <span className={cn(
            "text-[#5d13dd] font-semibold text-sm",
            isHovered && "text-purple-700"
          )}>
            {highlight.claimNumber}.
          </span>
          
          {/* Texto do CLAIM */}
          <span className={cn(
            // Base styles
            "font-medium px-1 py-0.5 rounded",
            // Purple color for all claims (as per Figma)
            "text-[#5d13dd] bg-purple-50",
            // Hover state
            isHovered && "bg-opacity-80 shadow-sm"
          )}>
            {highlight.text}
          </span>
        </span>
      );

      lastIndex = highlight.endIndex;
    });

    // Adiciona texto restante
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-${lastIndex}`} className="text-zinc-500">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  }, [text, claimHighlights, selectedClaimId, hoveredClaimId, onClaimClick]);

  return (
    <div className={cn("relative", className)}>
      {/* Texto com highlights */}
      <div className="whitespace-pre-wrap leading-7">
        {renderTextWithHighlights()}
      </div>
    </div>
  );
};

export default InteractiveText;
