"use client";

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ResultData } from '@/lib/types/results';
import { TextHighlight, type Claim } from '@/app/shared/components/TextHighlight';

interface InteractiveTextProps {
  text: string;
  results: ResultData[];
  onClaimClick?: (claimId: string) => void;
  selectedClaimId?: string;
  className?: string;
}

/**
 * InteractiveText - Wrapper para TextHighlight que converte ResultData em Claims
 * Usa o componente TextHighlight que segue o design do Figma (Node 574:14996)
 */
const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  results,
  onClaimClick,
  selectedClaimId,
  className
}) => {
  // Função para encontrar CLAIMS no texto usando correspondência de texto
  const findClaimsInText = useCallback((text: string, results: ResultData[]): Claim[] => {
    const claims: Claim[] = [];
    
    results.forEach((result, index) => {
      const claimText = result.text.trim();
      
      // Remove aspas do início e fim se existirem
      const cleanClaimText = claimText.replace(/^["']|["']$/g, '');
      
      // Busca o texto do CLAIM no texto original
      const startIndex = text.indexOf(cleanClaimText);
      
      if (startIndex !== -1) {
        claims.push({
          id: result.id,
          number: index + 1,
          text: cleanClaimText,
          startIndex,
          endIndex: startIndex + cleanClaimText.length
        });
      }
    });
    
    // Ordena por posição no texto
    return claims.sort((a, b) => a.startIndex - b.startIndex);
  }, []);

  // Converte ResultData[] em Claim[]
  const claims = useMemo(() => {
    return findClaimsInText(text, results);
  }, [text, results, findClaimsInText]);

  return (
    <TextHighlight
      text={text}
      claims={claims}
      selectedClaimId={selectedClaimId}
      onClaimClick={onClaimClick}
      className={className}
    />
  );
};

export default InteractiveText;
