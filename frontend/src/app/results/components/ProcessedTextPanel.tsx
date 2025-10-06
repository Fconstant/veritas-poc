"use client";

import React from 'react';
import { Button } from '@/app/shared/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Type } from 'lucide-react';
import InteractiveText from './InteractiveText';
import type { ResultData } from '@/lib/types/results';

interface ProcessedTextPanelProps {
  text: string;
  results?: ResultData[];
  onNewVerification: () => void;
  onClaimClick?: (claimId: string) => void;
  selectedClaimId?: string;
  className?: string;
}

const ProcessedTextPanel: React.FC<ProcessedTextPanelProps> = ({
  text,
  results = [],
  onNewVerification,
  onClaimClick,
  selectedClaimId,
  className
}) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="py-4 border-b border-[#d6d8db] flex-shrink-0">
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          <div className="content-stretch flex gap-[8px] h-full items-center relative shrink-0">
            <div className="box-border content-stretch flex gap-[8px] items-center justify-center opacity-50 p-[8px] relative rounded-[100px] shrink-0 size-[24px]">
              <div className="overflow-clip relative shrink-0 size-[24px]">
                <Type className="size-[24px] text-slate-900" />
              </div>
            </div>
            <div className="flex flex-col font-[var(--font-inter)] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-slate-900 whitespace-nowrap">
              <p className="leading-[20px]">Texto Processado</p>
            </div>
          </div>
          <Button
            onClick={onNewVerification}
            variant="filled"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Novo
          </Button>
        </div>
      </div>

      {/* Text Content */}
      <div className="px-2 flex-1 pb-4 overflow-y-auto flex flex-col justify-start max-h-[calc(100vh-200px)]">
        <InteractiveText
          text={text}
          results={results}
          onClaimClick={onClaimClick}
          selectedClaimId={selectedClaimId}
          className={cn(
            "[font-family:var(--font-merriweather)]",
            "text-zinc-500 pt-4 pb-4 text-sm font-normal leading-7 tracking-tight"
          )}
        />
      </div>
    </div>
  );
};

export default ProcessedTextPanel;

