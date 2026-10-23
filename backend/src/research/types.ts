/**
 * Provider-agnostic research contracts. The evidence engine never talks to a
 * search vendor directly: it depends on `ResearchProvider`, so additional
 * providers (LIVE-018, P1) can be plugged in without touching the pipeline.
 */

export type SearchHit = {
  title: string;
  url: string;
  content?: string;
  score?: number;
  publishedAt?: string;
};

export type ExtractedDocument = {
  url: string;
  title?: string;
  content: string;
  publishedAt?: string;
};

export type SearchOptions = {
  maxResults?: number;
  signal?: AbortSignal;
};

export type ExtractOptions = {
  signal?: AbortSignal;
};

export interface ResearchProvider {
  search(query: string, opts?: SearchOptions): Promise<SearchHit[]>;
  extract(url: string, opts?: ExtractOptions): Promise<ExtractedDocument>;
}

/**
 * Failure taxonomy of the research layer. Callers map it to investigation
 * states: QUOTA -> DEFERRED, TIMEOUT/TRANSIENT -> retryable, INVALID/-
 * UNAVAILABLE -> limitation or FAILED, never to a factual verdict.
 */
export type ResearchErrorKind =
  | 'TRANSIENT'
  | 'QUOTA'
  | 'TIMEOUT'
  | 'UNAVAILABLE'
  | 'INVALID';

export type ResearchErrorOptions = {
  status?: number;
  cause?: unknown;
};

export class ResearchError extends Error {
  readonly kind: ResearchErrorKind;
  readonly status: number | undefined;

  constructor(
    kind: ResearchErrorKind,
    message: string,
    options: ResearchErrorOptions = {},
  ) {
    super(message, { cause: options.cause });
    this.name = 'ResearchError';
    this.kind = kind;
    this.status = options.status;
  }
}

const SECRET_PATTERNS: readonly RegExp[] = [
  /\btvly-[A-Za-z0-9_-]+/g,
  /\bsk-[A-Za-z0-9_-]{6,}/g,
  /\b(api[_-]?key|token|secret)\b\s*[:=]\s*["']?[A-Za-z0-9_\-.]{4,}["']?/gi,
];

/**
 * Removes credentials from anything that may surface to logs, failures or
 * persisted verification data. Known secrets are scrubbed first (any format),
 * then well-known token shapes as a safety net.
 */
export function redactSecrets(
  input: string,
  knownSecrets: readonly string[] = [],
): string {
  const withoutKnown = knownSecrets.reduce((acc, secret) => {
    if (secret.length < 4) {
      return acc;
    }
    return acc.split(secret).join('[redacted]');
  }, input);

  return SECRET_PATTERNS.reduce(
    (acc, pattern) => acc.replace(pattern, '[redacted]'),
    withoutKnown,
  );
}

/** Collapses whitespace and truncates without breaking surrogate pairs. */
export function summarizeText(input: string, maxChars: number): string {
  const singleLine = input.replace(/\s+/g, ' ').trim();
  return singleLine.length > maxChars
    ? `${singleLine.slice(0, maxChars)}…`
    : singleLine;
}
