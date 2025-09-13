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
      <div className="flex items-center justify-between p-6 border-b border-[#d6d8db]">
        <h2 className="text-lg font-semibold text-[#102148]">
          Text processed
        </h2>
        <Button
          onClick={onNewVerification}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>

      {/* Text Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <p className="text-[#102148] leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessedTextPanel;
