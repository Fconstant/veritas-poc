import type { TranscriptSegment } from '@veritas/shared';

/**
 * Bounded, versioned window of transcript segments used as evidence context.
 *
 * The window is media-time based (not wall-clock based) and keeps every speaker
 * attached to their own words: segments are never merged or re-attributed.
 */

export const UNKNOWN_SPEAKER_LABEL = 'Locutor desconhecido';
export const DEFAULT_CONTEXT_MAX_CHARS = 2000;
export const DEFAULT_CONTEXT_MAX_SEGMENTS = 20;

/** Below this budget a truncated line carries no useful content, so it is dropped. */
const MIN_TRUNCATED_TEXT_CHARS = 8;

export type ContextDependency = {
  id: string;
  revision: number;
};

export type ContextWindowOptions = {
  maxChars?: number;
  /** Maximum media-time distance (ms) from the newest segment. Unbounded when omitted. */
  maxAgeMs?: number;
  excludeSegmentId?: string;
};

export type ContextWindow = {
  /** Formatted lines: `[mm:ss] <speaker>: text`, oldest first. */
  text: string;
  /** Segments actually used by the window, oldest first. */
  segments: TranscriptSegment[];
  /** Ids and revisions of the segments above, for invalidation bookkeeping. */
  dependencies: ContextDependency[];
};

export type ContextManagerOptions = {
  maxChars?: number;
  maxAgeMs?: number;
  maxSegments?: number;
};

export function formatMediaTimestamp(timestampMs: number): string {
  const totalSeconds = Math.floor(Math.max(0, timestampMs) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function speakerLabel(segment: TranscriptSegment): string {
  const speakerId = segment.speakerId?.trim();
  return speakerId !== undefined && speakerId.length > 0
    ? speakerId
    : UNKNOWN_SPEAKER_LABEL;
}

function segmentEnd(segment: TranscriptSegment): number {
  return Math.max(segment.startMs, segment.endMs);
}

export class ContextManager {
  private readonly segments = new Map<string, TranscriptSegment>();
  private readonly maxChars: number;
  private readonly maxAgeMs: number | undefined;
  private readonly maxSegments: number;
  private lastDependencies: ContextDependency[] = [];

  constructor(options: ContextManagerOptions = {}) {
    this.maxChars = Math.max(1, options.maxChars ?? DEFAULT_CONTEXT_MAX_CHARS);
    this.maxAgeMs = options.maxAgeMs;
    this.maxSegments = Math.max(
      1,
      Math.floor(options.maxSegments ?? DEFAULT_CONTEXT_MAX_SEGMENTS),
    );
  }

  /**
   * Stores a segment. A higher revision replaces the text of the same id; an
   * equal or older revision is ignored (corrections are monotonic).
   */
  addSegment(segment: TranscriptSegment): void {
    const stored = this.segments.get(segment.id);
    if (stored !== undefined && stored.revision >= segment.revision) {
      return;
    }
    this.segments.set(segment.id, { ...segment });
  }

  /** All retained segments ordered by media start. */
  getSegments(): TranscriptSegment[] {
    return this.ordered().map((segment) => ({ ...segment }));
  }

  getContext(options: ContextWindowOptions = {}): ContextWindow {
    const maxChars = Math.max(0, options.maxChars ?? this.maxChars);
    const maxAgeMs = options.maxAgeMs ?? this.maxAgeMs;
    const ordered = this.ordered().filter(
      (segment) => segment.id !== options.excludeSegmentId,
    );

    const newest = ordered.at(-1);
    if (newest === undefined) {
      return this.publish([], []);
    }

    const newestEnd = segmentEnd(newest);
    const fresh =
      maxAgeMs === undefined
        ? ordered
        : ordered.filter(
            (segment) => newestEnd - segmentEnd(segment) <= maxAgeMs,
          );
    const limited = fresh.slice(-this.maxSegments);

    // Walk newest -> oldest so the most recent speech survives the char budget.
    const included: TranscriptSegment[] = [];
    const lines: string[] = [];
    let used = 0;

    for (let index = limited.length - 1; index >= 0; index--) {
      const segment = limited[index];
      const prefix = `[${formatMediaTimestamp(segment.startMs)}] ${speakerLabel(segment)}: `;
      const separator = included.length > 0 ? 1 : 0;
      const available = maxChars - used - separator - prefix.length;
      const truncated = segment.text.length > available;

      if (available <= 0 || (truncated && available < MIN_TRUNCATED_TEXT_CHARS)) {
        break;
      }

      const text = truncated
        ? `${segment.text.slice(0, available - 1).trimEnd()}…`
        : segment.text;

      included.unshift({ ...segment });
      lines.unshift(`${prefix}${text}`);
      used += separator + prefix.length + text.length;
    }

    return this.publish(included, lines);
  }

  /**
   * Dependencies of the most recently built window. Empty before the first
   * `getContext` call or after `clear`.
   */
  getDependencies(): ContextDependency[] {
    return this.lastDependencies.map((dependency) => ({ ...dependency }));
  }

  clear(): void {
    this.segments.clear();
    this.lastDependencies = [];
  }

  private publish(
    segments: TranscriptSegment[],
    lines: string[],
  ): ContextWindow {
    const dependencies = segments.map((segment) => ({
      id: segment.id,
      revision: segment.revision,
    }));
    this.lastDependencies = dependencies;
    return {
      text: lines.join('\n'),
      segments: segments.map((segment) => ({ ...segment })),
      dependencies: dependencies.map((dependency) => ({ ...dependency })),
    };
  }

  private ordered(): TranscriptSegment[] {
    return [...this.segments.values()].sort(
      (a, b) =>
        a.startMs - b.startMs || a.endMs - b.endMs || a.id.localeCompare(b.id),
    );
  }
}
