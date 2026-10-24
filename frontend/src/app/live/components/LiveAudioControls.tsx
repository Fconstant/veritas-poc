"use client";

import React, { useEffect, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/shared/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useFactCheckStore } from '@/lib/store/factCheckStore';
import {
  deriveLiveControlAvailability,
  deriveLiveStatusView,
  type LiveStatusTone,
} from '@/lib/live/liveUiState';

interface LiveAudioControlsProps {
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  starting?: boolean;
  className?: string;
  /** Compact dock variant for mobile. */
  variant?: 'default' | 'dock';
}

const toneClasses: Record<LiveStatusTone, string> = {
  idle: 'bg-[#f4f2f7] border-[#e4ddec] text-[#7c7189]',
  running: 'bg-[#eafaf0] border-[#c3edcf] text-[#277549]',
  paused: 'bg-[#fff6e7] border-[#f8e3bd] text-[#906215]',
  warning: 'bg-[#fff6e7] border-[#f8e3bd] text-[#906215]',
  error: 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]',
  ended: 'bg-[#f4f2f7] border-[#e4ddec] text-[#7c7189]',
};

const toneDot: Record<LiveStatusTone, string> = {
  idle: 'bg-[#9ca3af]',
  running: 'bg-[#22c55e] animate-pulse',
  paused: 'bg-[#e4a84b]',
  warning: 'bg-[#e4a84b]',
  error: 'bg-[#ef4444]',
  ended: 'bg-[#9ca3af]',
};

/**
 * Definitive Live capture controls + status (LIVE-007 / LIVE-025).
 * Reflects real captureFeedback / liveSessionState from the store.
 */
const LiveAudioControls: React.FC<LiveAudioControlsProps> = ({
  onStart,
  onPause,
  onResume,
  onStop,
  starting = false,
  className,
  variant = 'default',
}) => {
  const { t } = useI18n();
  const captureFeedback = useFactCheckStore((s) => s.captureFeedback);
  const liveSessionState = useFactCheckStore((s) => s.liveSessionState);
  const liveMetrics = useFactCheckStore((s) => s.liveMetrics);
  const lastTranscriptAt = useFactCheckStore((s) => s.lastTranscriptAt);
  const liveGaps = useFactCheckStore((s) => s.liveGaps);
  const error = useFactCheckStore((s) => s.error);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 2000);
    return () => window.clearInterval(id);
  }, []);

  const availability = deriveLiveControlAvailability({
    captureFeedback,
    liveSessionState,
  });
  const status = deriveLiveStatusView({
    captureFeedback,
    liveSessionState,
    liveMetrics,
    lastTranscriptAt,
    nowMs,
    hasGaps: liveGaps.length > 0,
  });

  const statusLabel =
    t.live.status[status.messageKey as keyof typeof t.live.status] ??
    status.messageKey;

  const showStart = Boolean(onStart) && availability.canStart;
  const showPauseResume = Boolean(onPause || onResume);
  const isPaused =
    captureFeedback === 'paused' || liveSessionState === 'PAUSED';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        variant === 'dock' && 'justify-between w-full',
        className,
      )}
      data-slot="live-audio-controls"
    >
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold',
            toneClasses[status.tone],
          )}
          role="status"
          aria-live="polite"
        >
          <span className={cn('size-2 rounded-full', toneDot[status.tone])} />
          {starting ? t.live.status.requesting_permission : statusLabel}
        </span>

        {status.feedbackKeys
          .filter((key) => key !== status.messageKey)
          .map((key) => (
            <span
              key={key}
              className="inline-flex items-center rounded-full border border-[#e4ddec] bg-white px-3 py-2 text-xs text-[#7c7189] font-medium"
            >
              {t.live.feedback[key as keyof typeof t.live.feedback] ?? key}
            </span>
          ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {showStart && (
          <Button
            variant="filled"
            size="sm"
            onClick={onStart}
            disabled={starting}
            className="min-h-[42px]"
          >
            <Play className="size-4" />
            {t.live.controls.start}
          </Button>
        )}

        {showPauseResume && (
          <Button
            variant="outlined"
            size="sm"
            onClick={isPaused ? onResume : onPause}
            disabled={
              starting ||
              (isPaused ? !availability.canResume : !availability.canPause)
            }
            disabledTooltip={
              isPaused
                ? t.live.controls.resumeDisabled
                : t.live.controls.pauseDisabled
            }
            className="min-h-[42px]"
          >
            {isPaused ? (
              <>
                <Play className="size-4" />
                {t.live.controls.resume}
              </>
            ) : (
              <>
                <Pause className="size-4" />
                {t.live.controls.pause}
              </>
            )}
          </Button>
        )}

        {onStop && (
          <Button
            variant="outlined"
            size="sm"
            onClick={onStop}
            disabled={starting || !availability.canStop}
            disabledTooltip={t.live.controls.stopDisabled}
            className="min-h-[42px] border-[#ef4444] text-[#b91c1c] hover:bg-red-50 hover:text-[#991b1b]"
          >
            <Square className="size-4" />
            {variant === 'dock' ? null : t.live.controls.stop}
          </Button>
        )}
      </div>

      {error && (status.tone === 'error' || status.tone === 'warning') && (
        <p
          className="basis-full text-sm text-[#b91c1c] mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default LiveAudioControls;
