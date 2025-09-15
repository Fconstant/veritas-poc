"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ProcessedTextPanelProps {
  text: string;
  onNewVerification: () => void;
  className?: string;
}

const ProcessedTextPanel: React.FC<ProcessedTextPanelProps> = ({
  text,
  onNewVerification,
  className
}) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-4 border-b border-[#d6d8db]">
        <h2 className="text-lg font-semibold text-[#102148]">
          Text processed
        </h2>
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

      {/* Text Content */}
      <div className="flex-1 pb-4 overflow-y-auto flex flex-col justify-start">
        <p
          className={cn(
            "[font-family:var(--font-merriweather)]",
            "text-zinc-500 pt-4 pb-4 text-sm font-normal leading-7 tracking-tight whitespace-pre-wrap"
          )}
          style={{ fontFamily: "Merriweather, serif" }}
        >
            {text}
          </p>
        </div>
      </div>
  );
};

export default ProcessedTextPanel;


