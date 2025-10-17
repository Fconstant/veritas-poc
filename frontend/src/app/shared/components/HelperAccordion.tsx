"use client";

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nContext';

interface HelperAccordionProps {
  className?: string;
}

/**
 * HelperAccordion - Componente de ajuda expansível
 * Design v0.2: Node 619:33878 (4 variantes)
 *
 * Estados:
 * 1. Collapsed (default) - Border: #d6d8db
 * 2. Collapsed + Hover - Border: #b09ac5, Background: #f2f2f2
 * 3. Expanded - Border: #d6d8db, linha divisória
 * 4. Expanded + Hover - Border: #b09ac5, Background: #f2f2f2
 *
 * Especificações:
 * - Dimensões: 436px × 88px (collapsed), 436px × 336px (expanded)
 * - Border: 1px solid #d6d8db (default), #b09ac5 (hover)
 * - Border radius: 16px (apenas top)
 * - Background hover: #f2f2f2
 * - Animação: 300ms ease-in-out
 * - Ícone: HelpCircle 20px
 * - Texto: Inter Medium 14px, cor #716793
 * - Conteúdo: Inter Regular 14px, cor #585858, line-height 24px
 */
export const HelperAccordion: React.FC<HelperAccordionProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        "px-4 rounded-tl-2xl rounded-tr-2xl border-l border-r border-t border-[var(--helper-border)] overflow-hidden transition-all duration-300 ease-in-out cursor-pointer",
        "hover:border-[var(--border-hover-purple)] hover:shadow-[var(--shadow-hover-accordion)]",
        isExpanded ? "h-auto" : "h-16",
        className
      )}
      onClick={toggleExpanded}
    >
      <div className="flex flex-col py-0 ">
        {/* Header */}
        <div className="flex flex-col gap-4 items-start py-4 w-full">
          <div className="flex items-start w-full">
            <div className="flex flex-1 items-center gap-4 min-h-0 min-w-0">
              {/* Título */}
              <div className="flex flex-1 flex-wrap gap-4 items-center h-full min-h-0 min-w-0">
                <div className="flex flex-1 gap-2 items-center h-8 min-h-0 min-w-0">
                  <HelpCircle className="w-5 h-5" style={{ color: 'var(--purple-accent)' }} />
                  <span
                    className="font-[var(--font-inter)] font-medium text-[14px] leading-[24px] whitespace-nowrap"
                    style={{ color: 'var(--text-helper)' }}
                  >
                    {t.helperAccordion.title}
                  </span>
                </div>
                {/* Ícone de expansão */}
                {isExpanded ? (
                  <ChevronUp className="w-6 h-6" style={{ color: 'var(--text-helper)' }} />
                ) : (
                  <ChevronDown className="w-6 h-6" style={{ color: 'var(--text-helper)' }} />
                )}
              </div>
            </div>
          </div>
          <div className="self-stretch h-0 outline outline-1 outline-zinc-300"></div>
        </div>

        {/* Conteúdo Expandido */}
        {isExpanded && (
          <div
            className="flex flex-col gap-4 px-2 pt-2 pb-6 animate-in fade-in duration-300"
          >
            <ul className="list-disc list-inside space-y-2">
              <li
                className="font-[var(--font-inter)] font-normal text-[14px] leading-[20px]"
                style={{ color: 'var(--text-helper-expanded)' }}
              >
                {t.helperAccordion.items.ai}
              </li>
              <li
                className="font-[var(--font-inter)] font-normal text-[14px] leading-[20px]"
                style={{ color: 'var(--text-helper-expanded)' }}
              >
                {t.helperAccordion.items.free}
              </li>
              <li
                className="font-[var(--font-inter)] font-normal text-[14px] leading-[20px]"
                style={{ color: 'var(--text-helper-expanded)' }}
              >
                {t.helperAccordion.items.purpose}
              </li>
              <li
                className="font-[var(--font-inter)] font-normal text-[14px] leading-[20px]"
                style={{ color: 'var(--text-helper-expanded)' }}
              >
                {t.helperAccordion.items.privacy}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelperAccordion;
