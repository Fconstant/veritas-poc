"use client";

import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/shared/components/ui/button';

// Constante extraída conforme memória do PR
const TEXT_TO_BE_REVIEWED_LENGTH = 5000;

interface VerificationTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onUseExample: () => void;
  onVerify: () => void;
  className?: string;
}

/**
 * VerificationTextArea - Componente de entrada de texto para verificação
 * Design v0.2: Node 650:16293 (Verification Empty State)
 * 
 * Especificações:
 * - Width: 570px
 * - Background card: #f2f2f2
 * - Border: 1px solid #b8b8b8
 * - Border radius: 24px
 * - Character limit: 5000
 * - Character counter cores:
 *   - Normal (0-4500): #716793
 *   - Warning (4501-5000): #f59e0b
 *   - Error (>5000): #ef4444
 */
export const VerificationTextArea: React.FC<VerificationTextAreaProps> = ({
  value,
  onChange,
  onUseExample,
  onVerify,
  className
}) => {
  const charCount = value.length;
  const isDisabled = charCount === 0;
  const isOverLimit = charCount > TEXT_TO_BE_REVIEWED_LENGTH;

  // Determina a cor do counter
  const getCounterColor = () => {
    if (isOverLimit) return 'var(--error-red)';
    if (charCount > 4500) return 'var(--warning-amber)';
    return 'var(--text-helper)';
  };

  // Mensagem do tooltip para botão desabilitado
  const getDisabledTooltip = () => {
    if (isOverLimit) {
      return `O texto excede o limite de ${TEXT_TO_BE_REVIEWED_LENGTH} caracteres. Remova ${charCount - TEXT_TO_BE_REVIEWED_LENGTH} caracteres para continuar.`;
    }
    if (isDisabled) {
      return "Digite ou cole um texto para verificar";
    }
    return null;
  };

  return (
    <div 
      className={cn(
        "flex flex-col gap-6 items-center w-full max-w-[570px] rounded-[24px] border backdrop-blur-[1.5px] pb-8 px-6 pt-0",
        "bg-[var(--card-bg)] border-[var(--card-border)] shadow-[0px_20px_80px_0px_rgba(137,44,219,0.20)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 items-start w-full">
        <div className="flex flex-col gap-5 items-start justify-center pt-5 w-full">
          <div className="flex gap-2 items-center justify-between w-full">
            {/* Título */}
            <div className="flex gap-2 items-center">
              <FileText className="w-6 h-6 opacity-50" />
              <span className="font-[var(--font-inter)] font-medium text-[16px] leading-[24px] text-slate-900">
                Verificar Fatos de...
              </span>
            </div>
            {/* Character Counter */}
            <span 
              className="font-[var(--font-inter)] font-medium text-[14px] leading-[24px]"
              style={{ color: getCounterColor() }}
            >
              {charCount}/{TEXT_TO_BE_REVIEWED_LENGTH} characters limit
            </span>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex flex-col gap-3 items-start w-full">
          <div className="flex flex-col gap-2 items-start bg-[var(--input-bg-secondary)] border border-[var(--purple-primary)] rounded-lg p-3 w-full">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Entre o texto que deseja conferir as afirmações aqui..."
              className="w-full min-h-[200px] bg-transparent font-[var(--font-merriweather)] text-[14px] leading-[28px] tracking-[0.14px] resize-none outline-none"
              style={{ 
                color: value ? 'var(--text-active)' : 'var(--text-placeholder)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex items-start justify-between w-full">
        {/* Botão Usar exemplo */}
        <Button
          variant="outlined"
          size="default"
          onClick={onUseExample}
        >
          Usar exemplo
        </Button>

        {/* Botão Verificar fatos */}
        <Button
          variant="filled"
          size="default"
          onClick={onVerify}
          disabled={isDisabled || isOverLimit}
          disabledTooltip={getDisabledTooltip()}
        >
          <Sparkles className="w-6 h-6" />
          Verificar fatos
        </Button>
      </div>
    </div>
  );
};

export default VerificationTextArea;
