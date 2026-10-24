'use client';

import * as React from 'react';
import { ChevronDown, ExternalLink, ShieldCheck, TriangleAlert } from 'lucide-react';

import type { Source, Verification } from '@veritas/shared';

import { cn } from '@/lib/utils';
import { interpolate, useI18n } from '@/lib/i18n/I18nContext';
import {
  countUniqueSources,
  formatIsoDate,
  getContextEvidence,
  getEvidenceRelationLabel,
  getLimitations,
  getPrimarySources,
  getRefutingEvidence,
  getStatusLabel,
  getSupportingEvidence,
  getUnverifiedEvidence,
  getVerifiedEvidence,
  type ResolvedEvidence,
} from '@/lib/verification/presentation';

export interface EvidenceDisclosureProps {
  verification: Verification;
  defaultOpen?: boolean;
  className?: string;
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-button)] focus-visible:ring-offset-2';
const GROUP_LABEL =
  'text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--text-helper)]';

interface EvidenceItemProps {
  item: ResolvedEvidence;
  /** Unverified rows keep every audit detail but drop the relation framing. */
  verified: boolean;
}

const EvidenceItem: React.FC<EvidenceItemProps> = ({ item, verified }) => {
  const { t } = useI18n();
  const { evidence, source } = item;
  const publishedAt = formatIsoDate(source.publishedAt);
  const accessedAt = formatIsoDate(source.accessedAt);

  return (
    <li
      className={cn(
        'min-w-0 rounded-[10px] border bg-white p-3',
        verified
          ? 'border-[var(--divider)]'
          : 'border-[color-mix(in_srgb,var(--warning-amber)_35%,white)]',
      )}
      data-evidence-id={evidence.id}
      data-verified={verified}
    >
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex min-w-0 max-w-full items-center gap-1 text-[12px] font-bold text-[var(--purple-link)] hover:underline',
          FOCUS_RING,
        )}
      >
        <span className="break-words text-left">{source.title}</span>
        <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
        <span className="sr-only">({t.liveCard.evidence.linkHint})</span>
      </a>

      <p className="mt-1 break-words text-[11px] leading-snug text-[var(--text-muted)]">
        {source.publisher}
        {publishedAt !== null && (
          <>
            {' · '}
            {t.liveCard.evidence.publishedAt} {publishedAt}
          </>
        )}
        {accessedAt !== null && (
          <>
            {' · '}
            {t.liveCard.evidence.accessedAt} {accessedAt}
          </>
        )}
      </p>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {verified && (
          <span className="rounded-full bg-[var(--bg-purple-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--purple-medium)]">
            {getEvidenceRelationLabel(evidence.relation)}
          </span>
        )}
        {evidence.location !== undefined && evidence.location.trim().length > 0 && (
          <span className="break-words text-[10px] text-[var(--text-muted)]">
            {t.liveCard.evidence.location}: {evidence.location}
          </span>
        )}
      </div>

      <blockquote className="mt-2 break-words border-l-2 border-[var(--divider)] pl-2 text-[11px] leading-relaxed text-[var(--text-secondary)]">
        <span className="sr-only">{t.liveCard.evidence.excerpt}: </span>
        {evidence.excerpt}
      </blockquote>

      <p className="mt-1.5 break-words text-[11px] leading-relaxed text-[var(--text-muted)]">
        {evidence.explanation}
      </p>
    </li>
  );
};

/**
 * Layer 3 — evidence and audit. Collapsed by default, keyboard operable and
 * limited to verified evidence as proof; unverified excerpts are shown apart
 * with an explicit warning.
 */
const EvidenceDisclosure: React.FC<EvidenceDisclosureProps> = ({
  verification,
  defaultOpen = false,
  className,
}) => {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(defaultOpen);

  // useId may contain characters that are unsafe for CSS selectors.
  const reactId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const buttonId = `evidence-toggle-${reactId}`;
  const panelId = `evidence-panel-${reactId}`;

  // Refuting evidence leads: in a FALSE result it carries the contradiction.
  const groups = [
    { relation: 'REFUTES' as const, items: getRefutingEvidence(verification) },
    { relation: 'SUPPORTS' as const, items: getSupportingEvidence(verification) },
    { relation: 'CONTEXTUALIZES' as const, items: getContextEvidence(verification) },
  ];
  const populatedGroups = groups.filter((group) => group.items.length > 0);

  const unverified = getUnverifiedEvidence(verification);
  const limitations = getLimitations(verification);
  const primarySources: Source[] = getPrimarySources(verification);
  const referenceCount = countUniqueSources(getVerifiedEvidence(verification));

  const statusLabel =
    t.liveCard.status[verification.status] ?? getStatusLabel(verification.status);
  const updatedAt = formatIsoDate(verification.updatedAt);

  const toggleLabel = open ? t.liveCard.evidence.hide : t.liveCard.evidence.show;

  return (
    <div className={cn('min-w-0', className)}>
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex w-full items-center justify-between gap-2 border-t border-[var(--divider)] bg-[#faf9fc] px-4 py-3 text-left text-[12px] font-bold text-[var(--purple-link)] transition-colors hover:bg-[#f3eefb]',
          FOCUS_RING,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
          <span className="break-words">
            {toggleLabel}
            {referenceCount > 0 && (
              <>
                {' · '}
                {interpolate(
                  referenceCount === 1
                    ? t.liveCard.evidence.countOne
                    : t.liveCard.evidence.count,
                  { count: referenceCount },
                )}
              </>
            )}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="border-t border-[var(--divider)] bg-[#fcfbfe] px-4 pb-4 pt-3"
      >
        {populatedGroups.map((group) => {
          const groupLabel = t.liveCard.evidence.groups[group.relation];

          return (
            <div key={group.relation} className="mb-3 last:mb-0">
              <p className={cn(GROUP_LABEL, 'mb-1.5')}>
                {groupLabel}
              </p>
              <ul aria-label={groupLabel} className="grid gap-2">
                {group.items.map((item) => (
                  <EvidenceItem key={item.evidence.id} item={item} verified />
                ))}
              </ul>
            </div>
          );
        })}

        {populatedGroups.length === 0 && (
          <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
            <span className="block font-semibold text-[var(--text-secondary)]">
              {t.liveCard.evidence.empty}
            </span>
            {t.liveCard.evidence.emptyHint}
          </p>
        )}

        {unverified.length > 0 && (
          <div className="mt-3 rounded-[10px] border border-[color-mix(in_srgb,var(--warning-amber)_40%,white)] bg-[color-mix(in_srgb,var(--warning-amber)_10%,white)] p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-[color-mix(in_srgb,var(--warning-amber)_80%,#111827)]">
              <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0" />
              {t.liveCard.evidence.unverifiedTitle}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
              {t.liveCard.evidence.unverifiedBody}
            </p>
            <ul className="mt-2 grid gap-2">
              {unverified.map((item) => (
                <EvidenceItem key={item.evidence.id} item={item} verified={false} />
              ))}
            </ul>
          </div>
        )}

        {primarySources.length > 0 && (
          <div className="mt-3">
            <p className={GROUP_LABEL}>
              {t.liveCard.evidence.primarySources}
            </p>
            <ul className="mt-1 grid gap-1">
              {primarySources.map((source) => (
                <li key={source.id} className="min-w-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'break-words text-[11px] font-semibold text-[var(--purple-link)] hover:underline',
                      FOCUS_RING,
                    )}
                  >
                    {source.title}
                  </a>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {' · '}
                    {source.publisher}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {limitations.length > 0 && (
          <div className="mt-3 rounded-[10px] bg-[var(--bg-overlay)] p-3">
            <p className="text-[11px] font-bold text-[var(--purple-medium)]">
              {t.liveCard.limitations.title}
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-[var(--text-secondary)]">
              {limitations.map((limitation, index) => (
                <li key={`${index}-${limitation}`} className="break-words">
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 border-t border-[var(--divider)] pt-2 text-[10px] leading-relaxed text-[var(--text-muted)]">
          <p>
            {interpolate(t.liveCard.revision.label, {
              revision: verification.revision,
            })}
            {' · '}
            {interpolate(t.liveCard.revision.statusLabel, { status: statusLabel })}
            {updatedAt !== null && (
              <>
                {' · '}
                {interpolate(t.liveCard.revision.updatedAt, { date: updatedAt })}
              </>
            )}
          </p>
          <p className="mt-1">{t.liveCard.revision.note}</p>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDisclosure;
