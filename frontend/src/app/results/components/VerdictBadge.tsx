'use client';

import * as React from 'react';
import {
  CircleCheck,
  CircleQuestionMark,
  CircleX,
  TriangleAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { Verification, Verdict } from '@veritas/shared';

import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nContext';
import {
  getDisplayVerdict,
  getStatusLabel,
  getVerdictLabel,
} from '@/lib/verification/presentation';

export interface VerdictBadgeProps {
  verification: Verification;
  className?: string;
}

interface VerdictTone {
  icon: LucideIcon;
  /**
   * Surface, border and text are mixed from the design tokens; text is darkened
   * with color-mix so the small uppercase label keeps AA contrast.
   */
  tag: string;
}

const VERDICT_TONES: Record<Verdict, VerdictTone> = {
  FALSE: {
    icon: CircleX,
    tag: 'border-[color-mix(in_srgb,var(--error-red)_45%,white)] bg-[color-mix(in_srgb,var(--error-red)_12%,white)] text-[color-mix(in_srgb,var(--error-red)_72%,#111827)]',
  },
  MISLEADING: {
    icon: TriangleAlert,
    tag: 'border-[color-mix(in_srgb,var(--warning-amber)_45%,white)] bg-[color-mix(in_srgb,var(--warning-amber)_14%,white)] text-[color-mix(in_srgb,var(--warning-amber)_80%,#111827)]',
  },
  SUPPORTED: {
    icon: CircleCheck,
    tag: 'border-[color-mix(in_srgb,var(--success-green)_45%,white)] bg-[color-mix(in_srgb,var(--success-green)_14%,white)] text-[color-mix(in_srgb,var(--success-green)_60%,#111827)]',
  },
  INCONCLUSIVE: {
    icon: CircleQuestionMark,
    tag: 'border-[color-mix(in_srgb,var(--text-muted)_35%,white)] bg-[color-mix(in_srgb,var(--text-muted)_10%,white)] text-[color-mix(in_srgb,var(--text-muted)_85%,#111827)]',
  },
};

/**
 * Status pill before completion, verdict tag afterwards — never both.
 * The verdict comes from `getDisplayVerdict`, so an in-flight verification can
 * never leak a label even if a stale verdict arrives on the wire.
 */
const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verification, className }) => {
  const { t } = useI18n();
  const verdict = getDisplayVerdict(verification);

  if (verdict === null) {
    const statusLabel =
      t.liveCard.status[verification.status] ??
      getStatusLabel(verification.status);

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-[var(--helper-border)] bg-[var(--bg-overlay)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]',
          className,
        )}
        data-status={verification.status}
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        {statusLabel}
      </span>
    );
  }

  const tone = VERDICT_TONES[verdict];
  const Icon = tone.icon;
  const verdictLabel = t.liveCard.verdict[verdict] ?? getVerdictLabel(verdict);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[7px] border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.045em]',
        tone.tag,
        className,
      )}
      data-verdict={verdict}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="sr-only">{t.liveCard.verdictAriaPrefix}: </span>
      {verdictLabel}
    </span>
  );
};

export default VerdictBadge;
