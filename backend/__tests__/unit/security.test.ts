import { describe, expect, it } from 'vitest';
import { MAX_TEXT_LENGTH } from '#/constants.js';
import {
  DEFAULT_ALLOWED_ORIGINS,
  MAX_LOG_ARRAY_ITEMS,
  MAX_LOG_STRING_LENGTH,
  isOriginAllowed,
  parseAllowedOrigins,
  redactSecrets,
  safeErrorForLog,
  validateFactCheckRequestPayload,
} from '#/utils/security.js';

const VALID_REQUEST = {
  fingerprint: 'fp-123',
  researchThreshold: 0.5,
  apiKeys: {
    google: 'AIzaSyD-1234567890abcdefg',
    tavily: 'tvly-dev-abcdef1234567890',
  },
};

describe('redactSecrets', () => {
  it('redacts nested API keys while keeping safe fields', () => {
    const redacted = redactSecrets({
      fingerprint: 'fp-123',
      researchThreshold: 0.5,
      apiKeys: {
        google: 'AIzaSyD-1234567890abcdefg',
        tavily: 'tvly-dev-abcdef1234567890',
      },
      nested: {
        authorization: 'Bearer abcdefghijklmnop',
        password: 'hunter2',
        refreshToken: 'tok_1234567890',
      },
    });

    expect(redacted).toEqual({
      fingerprint: 'fp-123',
      researchThreshold: 0.5,
      // "apiKeys" itself matches the secret key pattern, so the whole
      // container is replaced rather than its individual fields.
      apiKeys: '[REDACTED]',
      nested: {
        authorization: '[REDACTED]',
        password: '[REDACTED]',
        refreshToken: '[REDACTED]',
      },
    });

    const serialized = JSON.stringify(redacted);
    expect(serialized).not.toContain('AIzaSyD');
    expect(serialized).not.toContain('tvly-dev');
    expect(serialized).not.toContain('hunter2');
    expect(serialized).not.toContain('Bearer');
  });

  it('matches secret key names case-insensitively and in common variants', () => {
    const redacted = redactSecrets({
      API_KEY: 'a',
      apiKey: 'b',
      'api-key': 'c',
      ApiKeys: 'd',
      TOKEN: 'e',
      clientSecret: 'f',
      Password: 'g',
      AUTHORIZATION: 'h',
    });

    expect(redacted).toEqual({
      API_KEY: '[REDACTED]',
      apiKey: '[REDACTED]',
      'api-key': '[REDACTED]',
      ApiKeys: '[REDACTED]',
      TOKEN: '[REDACTED]',
      clientSecret: '[REDACTED]',
      Password: '[REDACTED]',
      AUTHORIZATION: '[REDACTED]',
    });
  });

  it('keeps non-secret nested data untouched', () => {
    expect(
      redactSecrets({
        fingerprint: 'fp',
        count: 3,
        ok: true,
        missing: null,
        content: 'a regular claim',
      }),
    ).toEqual({
      fingerprint: 'fp',
      count: 3,
      ok: true,
      missing: null,
      content: 'a regular claim',
    });
  });

  it('caps long strings', () => {
    const long = 'a'.repeat(MAX_LOG_STRING_LENGTH * 3);
    const capped = redactSecrets(long);

    expect(capped.length).toBeLessThan(long.length);
    expect(capped.startsWith('a'.repeat(10))).toBe(true);
    expect(capped.endsWith('...[truncated]')).toBe(true);
  });

  it('scrubs credential-shaped values embedded in otherwise benign strings', () => {
    const redacted = redactSecrets(
      'call failed with AIzaSyD-1234567890abcdef and tvly-dev-abcdef123456',
    );

    expect(redacted).not.toContain('AIzaSyD');
    expect(redacted).not.toContain('tvly-dev');
    expect(redacted).toContain('[REDACTED]');
  });

  it('handles cycles, depth and long arrays without throwing', () => {
    const cyclic: Record<string, unknown> = { name: 'loop' };
    cyclic['self'] = cyclic;
    expect(JSON.stringify(redactSecrets(cyclic))).toBe(
      '{"name":"loop","self":"[Circular]"}',
    );

    const items = Array.from(
      { length: MAX_LOG_ARRAY_ITEMS + 5 },
      (_, index) => index,
    );
    expect(JSON.stringify(redactSecrets({ items }))).toContain(
      `...(${String(MAX_LOG_ARRAY_ITEMS + 5 - MAX_LOG_ARRAY_ITEMS)} more items)`,
    );

    let deep: Record<string, unknown> = { value: 'bottom' };
    for (let index = 0; index < 10; index++) {
      deep = { child: deep };
    }
    expect(JSON.stringify(redactSecrets(deep))).toContain('[MaxDepth]');
  });

  it('does not mutate the input and passes through primitives', () => {
    const input = { apiKeys: { google: 'keep-me' } };
    redactSecrets(input);

    expect(input.apiKeys.google).toBe('keep-me');
    expect(redactSecrets(42)).toBe(42);
    expect(redactSecrets(null)).toBeNull();
    expect(redactSecrets(undefined)).toBeUndefined();
  });

  it('redacts API keys held by Error objects', () => {
    const error = new Error('request failed for AIzaSyD-1234567890abcdef');
    expect(JSON.stringify(redactSecrets(error))).not.toContain('AIzaSyD');
  });
});

describe('safeErrorForLog', () => {
  it('returns only name and message', () => {
    const safe = safeErrorForLog(new Error('boom'));

    expect(safe).toEqual({ name: 'Error', message: 'boom' });
    expect(Object.keys(safe).sort()).toEqual(['message', 'name']);
    expect(JSON.stringify(safe)).not.toContain('stack');
  });

  it('redacts credentials that leak into error messages', () => {
    const safe = safeErrorForLog(
      new Error('401 from provider using key AIzaSyD-1234567890abcdef'),
    );

    expect(safe.name).toBe('Error');
    expect(safe.message).toContain('[REDACTED]');
    expect(safe.message).not.toContain('AIzaSyD');
  });

  it('summarizes non-Error values with the same redaction', () => {
    expect(safeErrorForLog('plain failure')).toEqual({
      name: 'UnknownError',
      message: 'plain failure',
    });

    const safe = safeErrorForLog({
      apiKeys: { google: 'AIzaSyD-1234567890abcdef' },
      token: 'tok_1234567890',
    });
    expect(safe.name).toBe('UnknownError');
    expect(safe.message).toContain('[REDACTED]');
    expect(safe.message).not.toContain('AIzaSyD');
    expect(safe.message).not.toContain('tok_1234567890');

    expect(safeErrorForLog(null)).toEqual({
      name: 'UnknownError',
      message: 'null',
    });
  });

  it('caps long error messages', () => {
    const safe = safeErrorForLog(
      new Error('e'.repeat(MAX_LOG_STRING_LENGTH * 2)),
    );
    expect(safe.message).toHaveLength(
      MAX_LOG_STRING_LENGTH + '...[truncated]'.length,
    );
  });
});

describe('parseAllowedOrigins', () => {
  it('defaults to the local development origins', () => {
    expect(parseAllowedOrigins()).toEqual([...DEFAULT_ALLOWED_ORIGINS]);
    expect(parseAllowedOrigins(undefined)).toEqual([
      ...DEFAULT_ALLOWED_ORIGINS,
    ]);
    expect(parseAllowedOrigins(null)).toEqual([...DEFAULT_ALLOWED_ORIGINS]);
    expect(parseAllowedOrigins('')).toEqual([...DEFAULT_ALLOWED_ORIGINS]);
    expect(parseAllowedOrigins('   ,  , ')).toEqual([
      ...DEFAULT_ALLOWED_ORIGINS,
    ]);
  });

  it('parses, trims, normalizes and de-duplicates a comma separated list', () => {
    expect(
      parseAllowedOrigins(
        ' https://veritas.example , http://localhost:3000/ , http://localhost:3000 ',
      ),
    ).toEqual(['https://veritas.example', 'http://localhost:3000']);

    expect(parseAllowedOrigins('HTTPS://Example.COM:443')).toEqual([
      'https://example.com',
    ]);
  });

  it('never accepts wildcards or non-HTTP entries', () => {
    expect(parseAllowedOrigins('*')).toEqual([...DEFAULT_ALLOWED_ORIGINS]);
    expect(parseAllowedOrigins('ftp://example.com, not-a-url')).toEqual([
      ...DEFAULT_ALLOWED_ORIGINS,
    ]);
    expect(
      parseAllowedOrigins('ftp://example.com, https://ok.example, *'),
    ).toEqual(['https://ok.example']);
  });
});

describe('isOriginAllowed', () => {
  const allowed = parseAllowedOrigins();

  it('allows requests without an Origin header', () => {
    expect(isOriginAllowed(undefined, allowed)).toBe(true);
    expect(isOriginAllowed(null, allowed)).toBe(true);
    expect(isOriginAllowed('', allowed)).toBe(true);
  });

  it('allows configured browser origins', () => {
    expect(isOriginAllowed('http://localhost:3001', allowed)).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:3001', allowed)).toBe(true);
    expect(isOriginAllowed('HTTP://LOCALHOST:3001', allowed)).toBe(true);
  });

  it('rejects unknown, malformed and "null" browser origins', () => {
    expect(isOriginAllowed('http://localhost:3000', allowed)).toBe(false);
    expect(isOriginAllowed('http://localhost:3001.evil.example', allowed)).toBe(
      false,
    );
    expect(isOriginAllowed('https://localhost:3001', allowed)).toBe(false);
    expect(isOriginAllowed('null', allowed)).toBe(false);
    expect(isOriginAllowed('not-an-origin', allowed)).toBe(false);
  });
});

describe('validateFactCheckRequestPayload', () => {
  it('accepts a valid request and returns the parsed payload', () => {
    expect(
      validateFactCheckRequestPayload('Some claim to verify', VALID_REQUEST),
    ).toEqual({
      ok: true,
      content: 'Some claim to verify',
      request: VALID_REQUEST,
    });
  });

  it('accepts content exactly at MAX_TEXT_LENGTH', () => {
    const content = 'x'.repeat(MAX_TEXT_LENGTH);
    expect(validateFactCheckRequestPayload(content, VALID_REQUEST).ok).toBe(
      true,
    );
  });

  it('rejects non-string content', () => {
    expect(validateFactCheckRequestPayload(42, VALID_REQUEST)).toEqual({
      ok: false,
      fingerprint: 'fp-123',
      message: 'Invalid request: text content must be a string',
    });
  });

  it('rejects oversized content without echoing it', () => {
    const result = validateFactCheckRequestPayload(
      'x'.repeat(MAX_TEXT_LENGTH + 1),
      VALID_REQUEST,
    );
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.message).toBe(
      `Text too long (max ${MAX_TEXT_LENGTH.toFixed(0)} characters)`,
    );
    expect(result.message).not.toContain('xxxx');
  });

  it('rejects payloads that fail the schema without echoing secrets', () => {
    const result = validateFactCheckRequestPayload('text', {
      fingerprint: 'fp-456',
      researchThreshold: 9,
      apiKeys: {
        google: 'AIzaSyD-1234567890abcdefg',
        tavily: 'tvly-dev-abcdef1234567890',
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.fingerprint).toBe('fp-456');
    expect(result.message).toContain('researchThreshold');
    expect(JSON.stringify(result)).not.toContain('AIzaSyD');
    expect(JSON.stringify(result)).not.toContain('tvly-dev');
  });

  it('reports missing required fields without echoing the payload', () => {
    const result = validateFactCheckRequestPayload('text', {
      researchThreshold: 0.5,
      apiKeys: { google: 123, tavily: 'tvly-dev-abcdef1234567890' },
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.fingerprint).toBe('unknown');
    expect(result.message).toContain('fingerprint');
    expect(JSON.stringify(result)).not.toContain('tvly-dev');
  });

  it('truncates an oversized fingerprint echoed back on rejection', () => {
    const result = validateFactCheckRequestPayload('text', {
      fingerprint: 'f'.repeat(200),
      researchThreshold: 2,
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.fingerprint).toHaveLength(128);
  });
});
