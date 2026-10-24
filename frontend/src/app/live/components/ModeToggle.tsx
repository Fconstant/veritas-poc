"use client";

import React from 'react';
import { AudioLines, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nContext';
import type { LiveInputMode } from '@/lib/live/liveUiState';

interface ModeToggleProps {
  mode: LiveInputMode;
  onModeChange: (mode: LiveInputMode) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Text / Live audio mode switch (LIVE-007 / LIVE-025).
 * Microphone is intentionally not offered — out of pilot scope.
 */
const ModeToggle: React.FC<ModeToggleProps> = ({
  mode,
  onModeChange,
  disabled = false,
  className,
}) => {
  const { t } = useI18n();

  return (
    <div
      role="tablist"
      aria-label={t.live.modeToggleAria}
      className={cn(
        'grid grid-cols-2 gap-1 rounded-xl bg-[#eeebf2] p-1.5 w-full',
        className,
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'live'}
        disabled={disabled}
        onClick={() => onModeChange('live')}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad7df6] focus-visible:ring-offset-2',
          mode === 'live'
            ? 'bg-white text-[#351397] shadow-sm'
            : 'text-[#6e678a] hover:text-[#351397]',
          disabled && 'opacity-55 cursor-not-allowed',
        )}
      >
        <AudioLines className="size-4" />
        {t.live.modeLive}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'text'}
        disabled={disabled}
        onClick={() => onModeChange('text')}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ad7df6] focus-visible:ring-offset-2',
          mode === 'text'
            ? 'bg-white text-[#351397] shadow-sm'
            : 'text-[#6e678a] hover:text-[#351397]',
          disabled && 'opacity-55 cursor-not-allowed',
        )}
      >
        <FileText className="size-4" />
        {t.live.modeText}
      </button>
    </div>
  );
};

export default ModeToggle;
