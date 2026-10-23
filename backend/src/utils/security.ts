/**
 * Security helpers used at the HTTP/Socket.IO boundary:
 * - log redaction (`redactSecrets`, `safeErrorForLog`);
 * - allowed origin parsing/enforcement (`parseAllowedOrigins`, `isOriginAllowed`);
 * - runtime validation of client payloads (`validateFactCheckRequestPayload`).
 *
 * Nothing here boots a server or reads ambient env: callers pass values in,
 * which keeps these helpers pure and testable.
 */
import { MAX_TEXT_LENGTH } from '#/constants.js';
import {
  FACT_CHECK_REQUEST_SCHEMA,
  type FactCheckRequest,
} from '#/ws/types.js';

const REDACTED = '[REDACTED]';
const TRUNCATED = '...[truncated]';
const MAX_REDACTION_DEPTH = 6;
const CIRCULAR = '[Circular]';

/** Keys whose values are never safe to log. */
const SECRET_KEY_PATTERN = /api.?key|token|secret|authorization|password/i;

/** Values longer than this are capped before being logged. */
export const MAX_LOG_STRING_LENGTH = 200;

/** Maximum number of array entries kept when redacting a value for logs. */
export const MAX_LOG_ARRAY_ITEMS = 25;

/**
 * Credential shapes that may leak inside otherwise benign strings
 * (e.g. an error message mentioning the key it failed to use).
 */
const SECRET_VALUE_PATTERNS: readonly RegExp[] = [
  /AIza[0-9A-Za-z_-]{10,}/g, // Google API key
  /\bAQ\.[0-9A-Za-z_-]{20,}/g, // Google auth key
  /tvly-(?:dev-|prod-)?[0-9A-Za-z]{10,}/g, // Tavily key
  /\bsk-[0-9A-Za-z_-]{10,}/g, // OpenAI-style key
  /\bBearer\s+[0-9A-Za-z._~+/=-]{8,}/gi, // Authorization header value
];

const capString = (value: string): string =>
  value.length <= MAX_LOG_STRING_LENGTH
    ? value
    : `${value.slice(0, MAX_LOG_STRING_LENGTH)}${TRUNCATED}`;

const scrubSecretValues = (value: string): string =>
  SECRET_VALUE_PATTERNS.reduce(
    (acc, pattern) => acc.replace(pattern, REDACTED),
    value,
  );

const redactValue = (
  value: unknown,
  depth: number,
  seen: WeakSet<object>,
): unknown => {
  if (typeof value === 'string') {
    return capString(scrubSecretValues(value));
  }
  if (typeof value === 'function') {
    return '[Function]';
  }
  if (typeof value === 'symbol') {
    return value.toString();
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (depth >= MAX_REDACTION_DEPTH) {
    return '[MaxDepth]';
  }
  if (seen.has(value)) {
    return CIRCULAR;
  }
  seen.add(value);

  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Error) {
    return {
      name: capString(value.name),
      message: capString(scrubSecretValues(value.message)),
    };
  }

  if (Array.isArray(value)) {
    const items: unknown[] = value
      .slice(0, MAX_LOG_ARRAY_ITEMS)
      .map((item: unknown) => redactValue(item, depth + 1, seen));
    if (value.length > MAX_LOG_ARRAY_ITEMS) {
      items.push(
        `...(${(value.length - MAX_LOG_ARRAY_ITEMS).toString()} more items)`,
      );
    }
    return items;
  }

  const record = value as Record<string, unknown>;
  const redacted: Record<string, unknown> = {};
  for (const key of Object.keys(record)) {
    redacted[key] = SECRET_KEY_PATTERN.test(key)
      ? REDACTED
      : redactValue(record[key], depth + 1, seen);
  }
  return redacted;
};

/**
 * Recursively copies `value` for logging: values under keys matching
 * `/api.?key|token|secret|authorization|password/i` become `'[REDACTED]'`,
 * strings are capped and known credential shapes are scrubbed.
 */
export function redactSecrets(value: string): string;
export function redactSecrets(value: unknown): unknown;
export function redactSecrets(value: unknown): unknown {
  return redactValue(value, 0, new WeakSet());
}

export type SafeErrorForLog = {
  name: string;
  message: string;
};

const messageForLog = (error: unknown): string => {
  if (typeof error === 'string') {
    return capString(scrubSecretValues(error));
  }
  if (error === null || error === undefined) {
    return String(error);
  }
  if (typeof error === 'object') {
    try {
      return capString(scrubSecretValues(JSON.stringify(redactSecrets(error))));
    } catch {
      return 'Unknown error';
    }
  }
  if (typeof error === 'symbol') {
    return capString(scrubSecretValues(error.toString()));
  }
  if (
    typeof error === 'bigint' ||
    typeof error === 'number' ||
    typeof error === 'boolean'
  ) {
    return capString(error.toString());
  }
  return '[Function]';
};

/**
 * Extracts only the safe parts of an error (`name` + `message`), with the same
 * redaction applied by {@link redactSecrets}. Never returns `stack`, `cause`,
 * request objects or headers.
 */
export function safeErrorForLog(error: unknown): SafeErrorForLog {
  if (error instanceof Error) {
    return {
      name: capString(error.name || 'Error'),
      message: capString(scrubSecretValues(error.message)),
    };
  }
  return { name: 'UnknownError', message: messageForLog(error) };
}

/** Local development frontend origins (Next.js dev server). */
export const DEFAULT_ALLOWED_ORIGINS: readonly string[] = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

/**
 * Normalizes one origin to `scheme://host[:port]` (lowercase, no trailing
 * slash). Returns null for empty entries, wildcards and non-HTTP values so
 * they can never widen the allow-list.
 */
const normalizeOrigin = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '*') {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
};

/**
 * Parses `CORS_ORIGINS` (comma-separated) into a normalized origin list.
 * Empty, invalid and wildcard entries are dropped; when nothing valid is left
 * the local development defaults are returned.
 */
export function parseAllowedOrigins(envValue?: string | null): string[] {
  const origins: string[] = [];
  for (const entry of (envValue ?? '').split(',')) {
    const origin = normalizeOrigin(entry);
    if (origin !== null && !origins.includes(origin)) {
      origins.push(origin);
    }
  }
  return origins.length > 0 ? origins : [...DEFAULT_ALLOWED_ORIGINS];
}

/**
 * Browser origins must be present in the allow-list; requests without an
 * `Origin` header (curl, native and server-to-server clients) are allowed.
 * The literal `"null"` origin (sandboxed/file contexts) is rejected.
 */
export function isOriginAllowed(
  origin: string | undefined | null,
  allowedOrigins: readonly string[],
): boolean {
  if (!origin) {
    return true;
  }
  const normalized = normalizeOrigin(origin);
  if (normalized === null) {
    return false;
  }
  return allowedOrigins.some(
    (allowed) => normalizeOrigin(allowed) === normalized,
  );
}

const UNKNOWN_FINGERPRINT = 'unknown';
const MAX_FINGERPRINT_LENGTH = 128;
const MAX_REPORTED_ISSUES = 3;

type FactCheckPayloadRejection = {
  ok: false;
  /** Validated (or placeholder) fingerprint, safe to echo in `meta`. */
  fingerprint: string;
  /** Client-safe message; never contains the raw payload. */
  message: string;
};

export type FactCheckPayloadValidation =
  | { ok: true; content: string; request: FactCheckRequest }
  | FactCheckPayloadRejection;

const extractFingerprint = (data: unknown): string => {
  if (typeof data === 'object' && data !== null && 'fingerprint' in data) {
    const fingerprint = data.fingerprint;
    if (typeof fingerprint === 'string' && fingerprint.length > 0) {
      return fingerprint.slice(0, MAX_FINGERPRINT_LENGTH);
    }
  }
  return UNKNOWN_FINGERPRINT;
};

const invalid = (
  data: unknown,
  message: string,
): FactCheckPayloadRejection => ({
  ok: false,
  fingerprint: extractFingerprint(data),
  message,
});

/**
 * Validates the `REQUEST_FACT_CHECK` arguments before they reach the service:
 * the text must be a string within `MAX_TEXT_LENGTH` and the request object
 * must satisfy `FACT_CHECK_REQUEST_SCHEMA`. Failure messages describe the
 * problem only — raw payloads/secrets are never echoed back.
 */
export function validateFactCheckRequestPayload(
  content: unknown,
  data: unknown,
): FactCheckPayloadValidation {
  if (typeof content !== 'string') {
    return invalid(data, 'Invalid request: text content must be a string');
  }
  if (content.length > MAX_TEXT_LENGTH) {
    return invalid(
      data,
      `Text too long (max ${MAX_TEXT_LENGTH.toFixed(0)} characters)`,
    );
  }

  const parsed = FACT_CHECK_REQUEST_SCHEMA.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues
      .slice(0, MAX_REPORTED_ISSUES)
      .map((issue) =>
        issue.path.length > 0
          ? `${issue.path.join('.')}: ${issue.message}`
          : issue.message,
      )
      .join('; ');
    return invalid(
      data,
      details
        ? `Invalid request payload (${details})`
        : 'Invalid request payload',
    );
  }

  return { ok: true, content, request: parsed.data };
}
