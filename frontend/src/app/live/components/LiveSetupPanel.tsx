"use client";

import React from 'react';
import { Info, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/shared/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';

interface LiveSetupPanelProps {
  onStart: () => void;
  starting?: boolean;
  className?: string;
}

/**
 * Pre-capture setup for Live mode (LIVE-025).
 * Only tab audio is offered — mic/mobile capture stay out of the pilot UI.
 */
const LiveSetupPanel: React.FC<LiveSetupPanelProps> = ({
  onStart,
  starting = false,
  className,
}) => {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'flex flex-col gap-4 w-full rounded-[16px] border border-[bg-violet-900/20] bg-[#f2f2f2] p-4 shadow-[0px_20px_80px_0px_rgba(137,44,219,0.2)] backdrop-blur-[1.5px]',
        className,
      )}
      data-slot="live-setup-panel"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#755a97] mb-2">
          {t.live.setup.eyebrow}
        </p>
        <h2 className="text-lg font-bold text-[#292236] mb-1">
          {t.live.setup.title}
        </h2>
        <p className="text-sm text-[#81788b] leading-relaxed">
          {t.live.setup.description}
        </p>
      </div>

      <div className="rounded-xl border border-[#e4ddec] bg-white px-3 py-3">
        <label className="block text-xs font-semibold text-[#60526c] mb-1.5">
          {t.live.setup.sourceLabel}
        </label>
        <div className="rounded-lg border border-[#d7d4de] bg-[#faf9fc] px-3 py-2.5 text-sm font-medium text-[#292236]">
          {t.live.setup.sourceTab}
        </div>
        <p className="mt-2 flex items-start gap-2 text-xs text-[#81788b] leading-relaxed">
          <Info className="size-4 shrink-0 mt-0.5 text-[#8a5cda]" />
          <span>{t.live.setup.sourceHint}</span>
        </p>
      </div>

      <Button
        variant="filled"
        size="default"
        onClick={onStart}
        disabled={starting}
        className="w-full"
      >
        <Play className="size-5" />
        {starting ? t.live.status.requesting_permission : t.live.controls.start}
      </Button>

      <p className="text-xs text-[#81788b] leading-relaxed">
        {t.live.setup.privacyNote}
      </p>
    </div>
  );
};

export default LiveSetupPanel;
