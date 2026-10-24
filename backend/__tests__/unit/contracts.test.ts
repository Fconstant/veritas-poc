import { describe, expect, it } from 'vitest';
import {
  AUDIO_CHUNK_META_SCHEMA,
  EVENT_ENVELOPE_SCHEMA,
  VERIFICATION_SCHEMA,
} from '@veritas/shared';

const SOURCE = {
  id: 'source-1',
  title: 'Resolução BCB 1/2020',
  publisher: 'Banco Central do Brasil',
  url: 'https://example.org/bcb/resolucao-1-2020',
  type: 'PRIMARY',
  accessedAt: '2025-01-10T12:00:00.000Z',
};

const REFUTES_EVIDENCE = {
  id: 'evidence-1',
  sourceId: 'source-1',
  relation: 'REFUTES',
  claimIds: ['claim-1'],
  excerpt: 'A resolução que instituiu o Pix é de 2020.',
  explanation: 'O documento é posterior a 2015.',
  verifiedContent: true,
};

const SUPPORTS_EVIDENCE = {
  ...REFUTES_EVIDENCE,
  id: 'evidence-2',
  relation: 'SUPPORTS',
};

const BASE_VERIFICATION = {
  id: 'verification-1',
  claimId: 'claim-1',
  segmentIds: ['segment-1'],
  originalQuote: 'O Pix foi criado em 2015.',
  normalizedClaim: 'O Pix foi criado em 2015.',
  transcriptConfirmed: true,
  atomicClaim: {
    id: 'atomic-claim-1',
    proposition: 'O Pix foi criado em 2015.',
  },
  status: 'COMPLETED',
  revision: 0,
  createdAt: '2025-01-10T12:00:00.000Z',
  updatedAt: '2025-01-10T12:00:05.000Z',
};

const verification = (overrides: Record<string, unknown> = {}) => ({
  ...BASE_VERIFICATION,
  ...overrides,
});

const issuePaths = (value: unknown): string[] => {
  const result = VERIFICATION_SCHEMA.safeParse(value);
  if (result.success) {
    return [];
  }
  return result.error.issues.map((issue) => issue.path.map(String).join('.'));
};

describe('VERIFICATION_SCHEMA', () => {
  it('accepts a valid FALSE verification', () => {
    const result = verification({
      verdict: 'FALSE',
      conclusion: 'O Pix não foi criado em 2015.',
      contradiction: 'A norma que instituiu o Pix é de 2020.',
      contradictionEvidenceIds: ['evidence-1'],
      evidence: [REFUTES_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toEqual([]);
  });

  it('rejects FALSE without a contradiction text', () => {
    const result = verification({
      verdict: 'FALSE',
      conclusion: 'O Pix não foi criado em 2015.',
      contradictionEvidenceIds: ['evidence-1'],
      evidence: [REFUTES_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('contradiction');
  });

  it('rejects FALSE without contradiction evidence ids', () => {
    const result = verification({
      verdict: 'FALSE',
      conclusion: 'O Pix não foi criado em 2015.',
      contradiction: 'A norma que instituiu o Pix é de 2020.',
      evidence: [REFUTES_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('contradictionEvidenceIds');
  });

  it('rejects FALSE whose contradiction evidence is unverified', () => {
    const result = verification({
      verdict: 'FALSE',
      conclusion: 'O Pix não foi criado em 2015.',
      contradiction: 'A norma que instituiu o Pix é de 2020.',
      contradictionEvidenceIds: ['evidence-1'],
      evidence: [{ ...REFUTES_EVIDENCE, verifiedContent: false }],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('contradictionEvidenceIds.0');
  });

  it('rejects FALSE whose contradiction evidence does not refute', () => {
    const result = verification({
      verdict: 'FALSE',
      conclusion: 'O Pix não foi criado em 2015.',
      contradiction: 'A norma que instituiu o Pix é de 2020.',
      contradictionEvidenceIds: ['evidence-2'],
      evidence: [SUPPORTS_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('contradictionEvidenceIds.0');
  });

  it('rejects MISLEADING without supportedAspects', () => {
    const result = verification({
      verdict: 'MISLEADING',
      conclusion: 'O número é real, mas foi recortado.',
      evidence: [SUPPORTS_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('supportedAspects');
  });

  it('rejects MISLEADING without a mechanism', () => {
    const result = verification({
      verdict: 'MISLEADING',
      conclusion: 'O número é real, mas foi recortado.',
      supportedAspects: ['O valor total existe.'],
      evidence: [SUPPORTS_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('mechanisms');
  });

  it('accepts MISLEADING with a documented mechanism', () => {
    const result = verification({
      verdict: 'MISLEADING',
      conclusion: 'O número é real, mas foi recortado.',
      supportedAspects: ['O valor total existe.'],
      mechanisms: [
        {
          code: 'SELECTIVE_PERIOD',
          explanation: 'O período anterior foi omitido.',
          evidenceIds: ['evidence-2'],
        },
      ],
      evidence: [SUPPORTS_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toEqual([]);
  });

  it('rejects MISLEADING whose mechanism evidence is unverified', () => {
    const result = verification({
      verdict: 'MISLEADING',
      conclusion: 'O número é real, mas foi recortado.',
      supportedAspects: ['O valor total existe.'],
      mechanisms: [
        {
          code: 'SELECTIVE_PERIOD',
          explanation: 'O período anterior foi omitido.',
          evidenceIds: ['evidence-2'],
        },
      ],
      evidence: [{ ...SUPPORTS_EVIDENCE, verifiedContent: false }],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('mechanisms.0.evidenceIds.0');
  });

  it('rejects SUPPORTED without evidence', () => {
    const result = verification({
      verdict: 'SUPPORTED',
      conclusion: 'O Pix foi criado em 2015.',
    });

    expect(issuePaths(result)).toContain('evidence');
  });

  it('rejects SUPPORTED without verified supporting evidence', () => {
    const result = verification({
      verdict: 'SUPPORTED',
      conclusion: 'O Pix foi criado em 2015.',
      evidence: [{ ...SUPPORTS_EVIDENCE, verifiedContent: false }],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('evidence');
  });

  it('accepts SUPPORTED with verified supporting evidence', () => {
    const result = verification({
      verdict: 'SUPPORTED',
      conclusion: 'O Pix foi criado em 2015.',
      evidence: [SUPPORTS_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toEqual([]);
  });

  it('accepts INCONCLUSIVE completed without evidence', () => {
    const result = verification({
      verdict: 'INCONCLUSIVE',
      conclusion: 'Não foi possível confirmar a data de criação.',
      limitations: ['Nenhum documento primário foi localizado.'],
    });

    expect(issuePaths(result)).toEqual([]);
  });

  it('rejects a non-COMPLETED verification carrying a verdict', () => {
    const result = verification({
      status: 'RESEARCHING',
      verdict: 'SUPPORTED',
      conclusion: 'O Pix foi criado em 2015.',
      evidence: [SUPPORTS_EVIDENCE],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toContain('verdict');
    expect(issuePaths(result)).toContain('conclusion');
  });

  it('accepts a non-COMPLETED verification with partial evidence', () => {
    const result = verification({
      status: 'RESEARCHING',
      evidence: [{ ...SUPPORTS_EVIDENCE, relation: 'CONTEXTUALIZES' }],
      sources: [SOURCE],
    });

    expect(issuePaths(result)).toEqual([]);
  });

  it('rejects duplicated source urls', () => {
    const result = verification({
      verdict: 'INCONCLUSIVE',
      conclusion: 'Não foi possível confirmar a data de criação.',
      sources: [SOURCE, { ...SOURCE, id: 'source-2' }],
    });

    expect(issuePaths(result)).toContain('sources.1.url');
  });

  it('rejects evidence pointing to an unknown source', () => {
    const result = verification({
      verdict: 'SUPPORTED',
      conclusion: 'O Pix foi criado em 2015.',
      evidence: [SUPPORTS_EVIDENCE],
    });

    expect(issuePaths(result)).toContain('evidence.0.sourceId');
  });
});

describe('EVENT_ENVELOPE_SCHEMA', () => {
  const envelope = {
    protocolVersion: 1,
    eventId: 'event-1',
    sessionId: 'session-1',
    eventSeq: 0,
    emittedAt: '2025-01-10T12:00:00.000Z',
  };

  it('accepts a valid envelope', () => {
    expect(EVENT_ENVELOPE_SCHEMA.safeParse(envelope).success).toBe(true);
    expect(
      EVENT_ENVELOPE_SCHEMA.safeParse({ ...envelope, sessionId: undefined })
        .success,
    ).toBe(true);
  });

  it('rejects invalid envelopes', () => {
    expect(
      EVENT_ENVELOPE_SCHEMA.safeParse({ ...envelope, eventId: '' }).success,
    ).toBe(false);
    expect(
      EVENT_ENVELOPE_SCHEMA.safeParse({ ...envelope, eventSeq: -1 }).success,
    ).toBe(false);
    expect(
      EVENT_ENVELOPE_SCHEMA.safeParse({ ...envelope, protocolVersion: undefined })
        .success,
    ).toBe(false);
    expect(
      EVENT_ENVELOPE_SCHEMA.safeParse({ ...envelope, emittedAt: '10/01/2025' })
        .success,
    ).toBe(false);
  });
});

describe('AUDIO_CHUNK_META_SCHEMA', () => {
  const chunk = {
    chunkSeq: 0,
    encoding: 'pcm16le',
    sampleRate: 16000,
    channels: 1,
    samples: 1600,
    startSample: 0,
    capturedAt: '2025-01-10T12:00:00.000Z',
  };

  it('accepts a valid chunk', () => {
    expect(AUDIO_CHUNK_META_SCHEMA.safeParse(chunk).success).toBe(true);
  });

  it('rejects invalid chunks', () => {
    expect(
      AUDIO_CHUNK_META_SCHEMA.safeParse({ ...chunk, chunkSeq: -1 }).success,
    ).toBe(false);
    expect(
      AUDIO_CHUNK_META_SCHEMA.safeParse({ ...chunk, encoding: 'pcm16' }).success,
    ).toBe(false);
    expect(
      AUDIO_CHUNK_META_SCHEMA.safeParse({ ...chunk, sampleRate: 48000 }).success,
    ).toBe(false);
    expect(
      AUDIO_CHUNK_META_SCHEMA.safeParse({ ...chunk, channels: 2 }).success,
    ).toBe(false);
    expect(
      AUDIO_CHUNK_META_SCHEMA.safeParse({ ...chunk, samples: 0 }).success,
    ).toBe(false);
    expect(
      AUDIO_CHUNK_META_SCHEMA.safeParse({ ...chunk, capturedAt: 'now' }).success,
    ).toBe(false);
  });
});
