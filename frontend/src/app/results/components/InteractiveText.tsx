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
    const usedRanges: Array<{ start: number; end: number }> = [];
    
    results.forEach((result, index) => {
      const claimText = result.text.trim();
      
      // Remove aspas do início e fim se existirem
      const cleanClaimText = claimText.replace(/^["']|["']$/g, '');
      
      // Busca TODAS as ocorrências do texto no texto original
      let searchStartIndex = 0;
      let foundMatch = false;
      
      while (searchStartIndex < text.length) {
        const startIndex = text.indexOf(cleanClaimText, searchStartIndex);
        
        if (startIndex === -1) {
          break; // Não há mais ocorrências
        }
        
        const endIndex = startIndex + cleanClaimText.length;
        
        // Verifica se essa posição já foi usada por outra claim
        const isOverlapping = usedRanges.some(range => 
          (startIndex >= range.start && startIndex < range.end) ||
          (endIndex > range.start && endIndex <= range.end) ||
          (startIndex <= range.start && endIndex >= range.end)
        );
        
        if (!isOverlapping) {
          // Adiciona a claim
          claims.push({
            id: result.id,
            number: index + 1,
            text: cleanClaimText,
            startIndex,
            endIndex
          });
          
          // Marca essa região como usada
          usedRanges.push({ start: startIndex, end: endIndex });
          foundMatch = true;
          break; // Usa apenas a primeira ocorrência não sobreposta
        }
        
        // Continua buscando a partir do próximo caractere
        searchStartIndex = startIndex + 1;
      }
      
      // Se não encontrou nenhuma ocorrência, tenta busca mais flexível
      if (!foundMatch) {
        // Estratégia 1: Normaliza pontuação e espaços
        const normalizedClaim = cleanClaimText
          .replace(/[.,!?;:"']/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
        
        const normalizedText = text
          .replace(/[.,!?;:"']/g, '')
          .replace(/\s+/g, ' ')
          .toLowerCase();
        
        let normalizedStart = normalizedText.indexOf(normalizedClaim);
        
        if (normalizedStart !== -1) {
          // Mapeia de volta para o texto original
          let charCount = 0;
          let originalStart = 0;
          
          for (let i = 0; i < text.length && charCount < normalizedStart; i++) {
            const char = text[i];
            if (!/[.,!?;:"'\s]/.test(char) || char === ' ') {
              charCount++;
            }
            originalStart = i + 1;
          }
          
          const endIndex = Math.min(originalStart + cleanClaimText.length, text.length);
          
          const isOverlapping = usedRanges.some(range => 
            (originalStart >= range.start && originalStart < range.end) ||
            (endIndex > range.start && endIndex <= range.end)
          );
          
          if (!isOverlapping && originalStart < text.length) {
            claims.push({
              id: result.id,
              number: index + 1,
              text: cleanClaimText,
              startIndex: originalStart,
              endIndex
            });
            
            usedRanges.push({ start: originalStart, end: endIndex });
            foundMatch = true;
          }
        }
        
        // Estratégia 2: Se ainda não encontrou, tenta buscar por substring significativa
        if (!foundMatch && cleanClaimText.length > 30) {
          // Pega os primeiros 30 caracteres como substring de busca
          const substring = cleanClaimText.substring(0, 30).trim();
          const substringIndex = text.indexOf(substring);
          
          if (substringIndex !== -1) {
            const endIndex = Math.min(substringIndex + cleanClaimText.length, text.length);
            
            const isOverlapping = usedRanges.some(range => 
              (substringIndex >= range.start && substringIndex < range.end) ||
              (endIndex > range.start && endIndex <= range.end)
            );
            
            if (!isOverlapping) {
              claims.push({
                id: result.id,
                number: index + 1,
                text: cleanClaimText,
                startIndex: substringIndex,
                endIndex
              });
              
              usedRanges.push({ start: substringIndex, end: endIndex });
              foundMatch = true;
            }
          }
        }
      }
    });
    
    // Ordena por posição no texto
    return claims.sort((a, b) => a.startIndex - b.startIndex);
  }, []);

  // Converte ResultData[] em Claim[]
  const claims = useMemo(() => {
    const foundClaims = findClaimsInText(text, results);
    
    // Debug: Log claims encontradas vs total
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TextHighlight] Encontradas ${foundClaims.length} de ${results.length} claims no texto`);
      
      // Log claims não encontradas
      const foundIds = new Set(foundClaims.map(c => c.id));
      const notFound = results.filter(r => !foundIds.has(r.id));
      if (notFound.length > 0) {
        console.log('[TextHighlight] Claims não encontradas:', notFound.map((r, i) => ({
          index: results.indexOf(r) + 1,
          text: r.text.substring(0, 100) + '...'
        })));
      }
    }
    
    return foundClaims;
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
