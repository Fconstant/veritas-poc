"use client";

import React, { useMemo, useState } from 'react';
import { AlertTriangle, AudioLines, Pencil } from 'lucide-react';
import type { Claim, TranscriptSegment } from '@veritas/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/app/shared/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useFactCheckStore } from '@/lib/store/factCheckStore';
import { factCheckService } from '@/lib/services/factCheckService';
import {
  claimsForSegment,
  formatSpeechTimestamp,
  resolveSpeakerLabel,
  sortSegmentsBySpeechTime,
} from '@/lib/store/transcriptSync';

interface LiveTranscriptProps {
  className?: string;
  onNavigateToClaim?: (claimId: string, verificationId?: string) => void;
}

function statusBadgeClass(status: TranscriptSegment['status']): string {
  switch (status) {
    case 'PROVISIONAL':
      return 'bg-[#fff6e7] text-[#906215] border-[#f8e3bd]';
    case 'FINAL':
      return 'bg-[#eafaf0] text-[#277549] border-[#c3edcf]';
    case 'BLOCKED':
      return 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]';
    default: {
      const _exhaustive: never = status;
      void _exhaustive;
      return 'bg-[#f4f2f7] text-[#7c7189] border-[#e4ddec]';
    }
  }
}

/**
 * Progressive transcript panel (LIVE-026).
 * Speech timestamps are shown separately from processing time.
 * Unknown authorship stays explicit; claims link to verification cards.
 */
const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  className,
  onNavigateToClaim,
}) => {
  const { t } = useI18n();
  const segments = useFactCheckStore((s) => s.segments);
  const claims = useFactCheckStore((s) => s.claims);
  const mappings = useFactCheckStore((s) => s.speakerMappings);
  const conflicts = useFactCheckStore((s) => s.segmentConflicts);
  const sessionId = useFactCheckStore((s) => s.sessionId);
  const liveGaps = useFactCheckStore((s) => s.liveGaps);
  const verifications = useFactCheckStore((s) => s.verifications);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const ordered = useMemo(
    () => sortSegmentsBySpeechTime(segments),
    [segments],
  );

  const handleStartEdit = (segment: TranscriptSegment) => {
    setEditingId(segment.id);
    setDraft(segment.text);
  };

  const handleSubmitCorrection = (segment: TranscriptSegment) => {
    if (!sessionId || draft.trim().length === 0) return;
    factCheckService.correctTranscript({
      sessionId,
      segmentId: segment.id,
      expectedRevision: segment.revision,
      text: draft.trim(),
    });
    setEditingId(null);
  };

  const verificationIdForClaim = (claimId: string): string | undefined => {
    const pending = `claim-pending-${claimId}`;
    const match =
      verifications.find((item) => item.claimId === claimId) ??
      verifications.find((item) => item.id === pending);
    return match?.id;
  };

  return (
    <section
      className={cn(
        'flex flex-col bg-white border border-[#dfdbe5] rounded-[19px] overflow-hidden shadow-[0_8px_36px_rgba(31,14,57,0.04)] min-h-[320px]',
        className,
      )}
      data-slot="live-transcript"
    >
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#ece8f2]">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-[#292236]">
          <AudioLines className="size-4 text-[#731fb8]" />
          {t.live.transcript.title}
        </h2>
        <span className="text-xs text-[#81788b]">{t.live.transcript.subtitle}</span>
      </header>

      <div
        className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[min(60vh,560px)]"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {liveGaps.length > 0 && (
          <div
            className="flex items-start gap-2 rounded-xl border border-[#f8e3bd] bg-[#fff6e7] px-3 py-2 text-xs text-[#906215]"
            role="status"
          >
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>
              {t.live.transcript.gapsNotice.replace(
                '{{count}}',
                String(liveGaps.length),
              )}
            </span>
          </div>
        )}

        {ordered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 min-h-[240px] text-[#81788b] text-sm text-center px-4">
            <AudioLines className="size-8 opacity-50" />
            <p>{t.live.transcript.empty}</p>
          </div>
        ) : (
          ordered.map((segment) => {
            const speaker = resolveSpeakerLabel(segment.speakerId, mappings);
            const linkedClaims = claimsForSegment(segment.id, claims);
            const hasConflict = conflicts.includes(segment.id);
            const isEditing = editingId === segment.id;

            return (
              <article
                key={segment.id}
                id={`transcript-segment-${segment.id}`}
                className={cn(
                  'rounded-xl border border-[#ece8f2] bg-[#faf9fc] px-3 py-3',
                  segment.status === 'PROVISIONAL' && 'opacity-90',
                  segment.status === 'BLOCKED' && 'border-[#fecaca] bg-[#fef7f7]',
                  hasConflict && 'ring-2 ring-[#f59e0b]/50',
                )}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <time
                    className="font-mono text-[11px] tabular-nums text-[#7c7189]"
                    dateTime={`P${Math.floor(segment.startMs / 1000)}S`}
                    title={t.live.transcript.speechTimeHint}
                  >
                    {formatSpeechTimestamp(segment.startMs)}
                    {' – '}
                    {formatSpeechTimestamp(segment.endMs)}
                  </time>
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      statusBadgeClass(segment.status),
                    )}
                  >
                    {t.live.transcript.status[segment.status]}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      speaker.confirmed
                        ? 'text-[#351397]'
                        : 'text-[#906215]',
                    )}
                  >
                    {speaker.known && speaker.confirmed
                      ? speaker.label
                      : t.live.transcript.unknownSpeaker}
                    {speaker.known && !speaker.confirmed
                      ? ` (${t.live.transcript.unconfirmedSpeaker})`
                      : null}
                  </span>
                  {hasConflict && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#b45309]">
                      <AlertTriangle className="size-3" />
                      {t.live.transcript.revisionConflict}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      className="w-full min-h-[72px] rounded-lg border border-[#d7d4de] bg-white p-2 text-sm [font-family:var(--font-merriweather)]"
                      aria-label={t.live.transcript.correctLabel}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="filled"
                        onClick={() => handleSubmitCorrection(segment)}
                      >
                        {t.live.transcript.saveCorrection}
                      </Button>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => setEditingId(null)}
                      >
                        {t.common.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={cn(
                      'text-sm leading-relaxed text-[#292236] [font-family:var(--font-merriweather)]',
                      segment.status === 'PROVISIONAL' && 'italic text-[#4e4558]',
                    )}
                  >
                    {segment.text}
                  </p>
                )}

                {segment.uncertaintyReasons &&
                  segment.uncertaintyReasons.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {segment.uncertaintyReasons.map((reason) => (
                        <li
                          key={reason}
                          className="rounded-full bg-[#fef2f2] border border-[#fecaca] px-2 py-0.5 text-[10px] font-semibold text-[#b91c1c]"
                        >
                          {t.live.transcript.uncertainty[reason] ?? reason}
                        </li>
                      ))}
                    </ul>
                  )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {!isEditing && sessionId && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(segment)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#8a5cda] hover:text-[#5d13dd]"
                    >
                      <Pencil className="size-3" />
                      {t.live.transcript.correct}
                    </button>
                  )}
                  <span className="text-[10px] text-[#9ca3af]">
                    {t.live.transcript.revision.replace(
                      '{{revision}}',
                      String(segment.revision),
                    )}
                  </span>
                </div>

                {linkedClaims.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {linkedClaims.map((claim: Claim) => {
                      const verificationId = verificationIdForClaim(claim.id);
                      return (
                        <button
                          key={claim.id}
                          type="button"
                          onClick={() =>
                            onNavigateToClaim?.(claim.id, verificationId)
                          }
                          className="rounded-full border border-[#d4c4f5] bg-[#f5f0ff] px-2.5 py-1 text-[11px] font-semibold text-[#351397] hover:bg-[#ebe4ff] max-w-full truncate"
                          title={claim.normalizedClaim}
                        >
                          {t.live.transcript.claimChip}:{' '}
                          {claim.normalizedClaim.slice(0, 48)}
                          {claim.normalizedClaim.length > 48 ? '…' : ''}
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default LiveTranscript;
