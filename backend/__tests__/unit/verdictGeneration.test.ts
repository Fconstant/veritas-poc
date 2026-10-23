import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Claim, Evidence, Source, Verification } from '@veritas/shared';
import { VERIFICATION_SCHEMA } from '@veritas/shared';
import { describe, expect, it, vi } from 'vitest';
import {
  BLOCKED_LIMITATION,
  DOWNGRADE_CONCLUSION,
  INCONCLUSIVE_DEFAULT_LIMITATION,
  NO_EVIDENCE_CONCLUSION,
  NO_EVIDENCE_LIMITATION,
  SYNTHESIS_REJECTED_CONCLUSION,
  SYNTHESIS_REJECTED_LIMITATION,
  generateVerification,
} from '#/analysis/verdictGeneration.js';
import type { GenerateVerificationArgs } from '#/analysis/verdictGeneration.js';

const CLAIM: Claim = {
  id: 'claim-1',
  sessionId: 'session-1',
  segmentIds: ['segment-1'],
  speakerId: 'speaker-1',
  originalQuote: 'O Pix foi criado em 2015.',
  normalizedClaim: 'O Pix foi criado em 2015.',
  timestampMs: { start: 1_000, end: 3_000 },
  status: 'RESEARCHING',
  notFactCheckable: false,
  atomicClaims: [{ id: 'atomic-1', proposition: 'O Pix foi criado em 2015.' }],
  revision: 1,
  createdAt: '2025-01-10T12:00:00.000Z',
  updatedAt: '2025-01-10T12:00:00.000Z',
};

const SOURCE: Source = {
  id: 'src-1',
  title: 'Lei nº 12.865/2013',
  publisher: 'planalto.gov.br',
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12865.htm',
  type: 'PRIMARY',
  accessedAt: '2025-01-10T12:00:00.000Z',
};

const REFUTES: Evidence = {
  id: 'ev-1',
  sourceId: 'src-1',
  relation: 'REFUTES',
  claimIds: ['claim-1'],
  excerpt:
    'A Lei nº 12.865, de 9 de outubro de 2013, autorizou o Banco Central a instituir o Pix.',
  explanation: 'A norma que autorizou o Pix é de 2013.',
  verifiedContent: true,
};

const SUPPORTS: Evidence = {
  ...REFUTES,
  id: 'ev-2',
  relation: 'SUPPORTS',
  excerpt: 'O Pix passou a operar em novembro de 2020.',
  explanation: 'O documento confirma a operação em 2020.',
};

const NOW = () => new Date('2025-01-10T12:00:05.000Z');

type LlmReply = string | Error;

function createLlm(...replies: LlmReply[]) {
  const inputs: unknown[] = [];
  const invoke = vi.fn((input: unknown): Promise<{ text: string }> => {
    inputs.push(input);
    const reply = replies.shift();
    if (reply === undefined) {
      return Promise.reject(new Error('sem resposta simulada'));
    }
    return reply instanceof Error
      ? Promise.reject(reply)
      : Promise.resolve({ text: reply });
  });
  return { llm: { invoke } as unknown as BaseChatModel, invoke, inputs };
}

function baseArgs(
  llm: BaseChatModel,
  overrides: Partial<GenerateVerificationArgs> = {},
): GenerateVerificationArgs {
  return {
    claim: CLAIM,
    sources: [SOURCE],
    evidence: [],
    gaps: [],
    transcriptConfirmed: true,
    llm,
    now: NOW,
    ...overrides,
  };
}

function expectValid(verification: Verification): void {
  const result = VERIFICATION_SCHEMA.safeParse(verification);
  expect(result.success ? [] : result.error.issues).toEqual([]);
}

const draft = (payload: unknown): string => JSON.stringify(payload);

describe('generateVerification', () => {
  it('accepts a FALSE verdict backed by decisive REFUTES evidence', async () => {
    const { llm, inputs, invoke } = createLlm(
      draft({
        verdict: 'FALSE',
        conclusion:
          'O Pix não foi criado em 2015: a lei que autorizou o arranjo é de 2013.',
        contradiction:
          'A Lei nº 12.865, que autorizou o Pix, é de 9 de outubro de 2013.',
        contradictionEvidenceIds: ['ev-1'],
        limitations: ['O documento não trata de 2015.'],
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, {
        evidence: [REFUTES],
        gaps: ['Nenhum documento de 2015 foi localizado.'],
      }),
    );

    expect(verification.status).toBe('COMPLETED');
    expect(verification.verdict).toBe('FALSE');
    expect(verification.contradiction).toContain('2013');
    expect(verification.contradictionEvidenceIds).toEqual(['ev-1']);
    expect(verification.evidence).toHaveLength(1);
    expect(verification.sources).toHaveLength(1);
    expect(verification.reviewedBy).toBe('AUTOMATED');
    expect(verification.createdAt).toBe('2025-01-10T12:00:05.000Z');
    expect(verification.updatedAt).toBe('2025-01-10T12:00:05.000Z');
    expect(verification.id).toBe('verification-claim-1-0');
    expect(verification.claimId).toBe('claim-1');
    expect(verification.segmentIds).toEqual(['segment-1']);
    expect(verification.originalQuote).toBe(CLAIM.originalQuote);
    expect(verification.normalizedClaim).toBe(CLAIM.normalizedClaim);
    expect(verification.atomicClaim.id).toBe('atomic-1');
    expect(verification.limitations).toEqual([
      'O documento não trata de 2015.',
      'Nenhum documento de 2015 foi localizado.',
    ]);
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(inputs[0])).toContain('evidência REFUTES');
    expectValid(verification);
  });

  it('downgrades FALSE without contradiction evidence to INCONCLUSIVE', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'FALSE',
        conclusion: 'O Pix não foi criado em 2015.',
        contradiction: 'A lei é de 2013.',
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [REFUTES] }),
    );

    expect(verification.status).toBe('COMPLETED');
    expect(verification.verdict).toBe('INCONCLUSIVE');
    expect(verification.conclusion).toBe(DOWNGRADE_CONCLUSION);
    expect(verification.contradiction).toBeUndefined();
    expect(verification.limitations.join(' ')).toContain('FALSA');
    expectValid(verification);
  });

  it('downgrades FALSE whose contradiction evidence does not refute', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'FALSE',
        conclusion: 'O Pix não foi criado em 2015.',
        contradiction: 'A lei é de 2013.',
        contradictionEvidenceIds: ['ev-2'],
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [SUPPORTS] }),
    );

    expect(verification.verdict).toBe('INCONCLUSIVE');
    expect(verification.contradictionEvidenceIds).toBeUndefined();
    expectValid(verification);
  });

  it('downgrades MISLEADING without supported aspects', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'MISLEADING',
        conclusion: 'O número é real, mas foi recortado.',
        mechanisms: [
          {
            code: 'SELECTIVE_PERIOD',
            explanation: 'O período anterior foi omitido.',
            evidenceIds: ['ev-2'],
          },
        ],
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [SUPPORTS] }),
    );

    expect(verification.verdict).toBe('INCONCLUSIVE');
    expect(verification.mechanisms).toEqual([]);
    expectValid(verification);
  });

  it('downgrades MISLEADING without a demonstrated mechanism', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'MISLEADING',
        conclusion: 'O número é real, mas foi recortado.',
        supportedAspects: ['O valor total existe.'],
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [SUPPORTS] }),
    );

    expect(verification.verdict).toBe('INCONCLUSIVE');
    expectValid(verification);
  });

  it('downgrades MISLEADING without a verified true component', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'MISLEADING',
        conclusion: 'O número é real, mas foi recortado.',
        supportedAspects: ['O valor total existe.'],
        mechanisms: [
          {
            code: 'SELECTIVE_PERIOD',
            explanation: 'O período anterior foi omitido.',
            evidenceIds: ['ev-1'],
          },
        ],
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [REFUTES] }),
    );

    expect(verification.verdict).toBe('INCONCLUSIVE');
    expectValid(verification);
  });

  it('accepts MISLEADING with a true component and a documented mechanism', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'MISLEADING',
        conclusion:
          'O valor existe, mas o recorte temporal omite alta anterior e induz a erro.',
        supportedAspects: ['O valor total de fato existe.'],
        mechanisms: [
          {
            code: 'SELECTIVE_PERIOD',
            explanation: 'O período anterior foi omitido.',
            evidenceIds: ['ev-2'],
          },
        ],
        limitations: ['Não há série completa publicada.'],
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [SUPPORTS] }),
    );

    expect(verification.status).toBe('COMPLETED');
    expect(verification.verdict).toBe('MISLEADING');
    expect(verification.supportedAspects).toEqual([
      'O valor total de fato existe.',
    ]);
    expect(verification.mechanisms).toHaveLength(1);
    expect(verification.mechanisms[0].code).toBe('SELECTIVE_PERIOD');
    expect(verification.mechanisms[0].evidenceIds).toEqual(['ev-2']);
    expectValid(verification);
  });

  it('accepts SUPPORTED with direct verified support', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'SUPPORTED',
        conclusion:
          'A afirmação é sustentada pela lei de 2013 no escopo citado.',
        contradiction: 'Trecho que não deveria constar.',
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [SUPPORTS] }),
    );

    expect(verification.status).toBe('COMPLETED');
    expect(verification.verdict).toBe('SUPPORTED');
    expect(verification.contradiction).toBeUndefined();
    expect(verification.supportedAspects).toEqual([]);
    expectValid(verification);
  });

  it('downgrades SUPPORTED without verified supporting evidence', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'SUPPORTED',
        conclusion: 'A afirmação é sustentada pela lei de 2013.',
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [REFUTES] }),
    );

    expect(verification.verdict).toBe('INCONCLUSIVE');
    expect(verification.conclusion).toBe(DOWNGRADE_CONCLUSION);
    expectValid(verification);
  });

  it('returns a deterministic INCONCLUSIVE without calling the LLM when there is no evidence', async () => {
    const { llm, invoke } = createLlm();

    const verification = await generateVerification(
      baseArgs(llm, {
        evidence: [],
        gaps: ['Nenhum documento primário foi localizado.'],
      }),
    );

    expect(invoke).not.toHaveBeenCalled();
    expect(verification.status).toBe('COMPLETED');
    expect(verification.verdict).toBe('INCONCLUSIVE');
    expect(verification.conclusion).toBe(NO_EVIDENCE_CONCLUSION);
    expect(verification.limitations).toEqual([
      'Nenhum documento primário foi localizado.',
    ]);
    expect(verification.mechanisms).toEqual([]);
    expectValid(verification);
  });

  it('adds a default limitation when no gap is reported', async () => {
    const { llm, invoke } = createLlm();

    const verification = await generateVerification(baseArgs(llm));

    expect(invoke).not.toHaveBeenCalled();
    expect(verification.limitations).toEqual([NO_EVIDENCE_LIMITATION]);
    expectValid(verification);
  });

  it('blocks the verification when the transcript is not confirmed', async () => {
    const { llm, invoke } = createLlm();

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [REFUTES], transcriptConfirmed: false }),
    );

    expect(invoke).not.toHaveBeenCalled();
    expect(verification.status).toBe('BLOCKED');
    expect(verification.verdict).toBeUndefined();
    expect(verification.conclusion).toBeUndefined();
    expect(verification.contradiction).toBeUndefined();
    expect(verification.limitations).toEqual([BLOCKED_LIMITATION]);
    expect(verification.transcriptConfirmed).toBe(false);
    expectValid(verification);
  });

  it('repairs once when the first synthesis is not usable', async () => {
    const { llm, inputs, invoke } = createLlm(
      'resposta fora do schema',
      draft({
        verdict: 'FALSE',
        conclusion: 'O Pix não foi criado em 2015.',
        contradiction: 'A lei é de 2013.',
        contradictionEvidenceIds: ['ev-1'],
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [REFUTES] }),
    );

    expect(invoke).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(inputs[1])).toContain('ERROS DE VALIDAÇÃO');
    expect(JSON.stringify(inputs[1])).toContain('JSON válido');
    expect(verification.verdict).toBe('FALSE');
    expectValid(verification);
  });

  it('falls back to a safe INCONCLUSIVE when both syntheses fail', async () => {
    const { llm, invoke } = createLlm('lixo', 'lixo também');

    const verification = await generateVerification(
      baseArgs(llm, {
        evidence: [REFUTES],
        gaps: ['O documento recuperado é parcial.'],
      }),
    );

    expect(invoke).toHaveBeenCalledTimes(2);
    expect(verification.status).toBe('COMPLETED');
    expect(verification.verdict).toBe('INCONCLUSIVE');
    expect(verification.conclusion).toBe(SYNTHESIS_REJECTED_CONCLUSION);
    expect(verification.limitations).toContain(
      'O documento recuperado é parcial.',
    );
    expect(verification.limitations.join(' ')).toContain(
      SYNTHESIS_REJECTED_LIMITATION,
    );
    expect(verification.contradiction).toBeUndefined();
    expectValid(verification);
  });

  it('drops evidence whose source was not inspected', async () => {
    const { llm, invoke } = createLlm();

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [{ ...REFUTES, sourceId: 'src-9' }] }),
    );

    expect(invoke).not.toHaveBeenCalled();
    expect(verification.evidence).toEqual([]);
    expect(verification.sources).toHaveLength(1);
    expect(verification.verdict).toBe('INCONCLUSIVE');
    expectValid(verification);
  });

  it('dedupes duplicated sources and evidence', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'SUPPORTED',
        conclusion: 'A afirmação é sustentada pelo documento.',
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, {
        sources: [SOURCE, { ...SOURCE }],
        evidence: [SUPPORTS, { ...SUPPORTS }],
      }),
    );

    expect(verification.sources).toHaveLength(1);
    expect(verification.evidence).toHaveLength(1);
    expectValid(verification);
  });

  it('honours verificationId, revision and an explicit atomic claim', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'SUPPORTED',
        conclusion: 'A afirmação é sustentada pelo documento.',
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, {
        evidence: [SUPPORTS],
        revision: 2,
        verificationId: 'verification-custom',
        atomicClaim: { id: 'atomic-9', proposition: 'Proposição explícita.' },
      }),
    );

    expect(verification.id).toBe('verification-custom');
    expect(verification.revision).toBe(2);
    expect(verification.atomicClaim.id).toBe('atomic-9');
    expectValid(verification);
  });

  it('keeps an INCONCLUSIVE draft but guarantees limitations', async () => {
    const { llm } = createLlm(
      draft({
        verdict: 'INCONCLUSIVE',
        conclusion: 'Os documentos divergem sobre a data de início.',
      }),
    );

    const verification = await generateVerification(
      baseArgs(llm, { evidence: [REFUTES, SUPPORTS] }),
    );

    expect(verification.verdict).toBe('INCONCLUSIVE');
    expect(verification.conclusion).toBe(
      'Os documentos divergem sobre a data de início.',
    );
    expect(verification.limitations).toEqual([INCONCLUSIVE_DEFAULT_LIMITATION]);
    expectValid(verification);
  });

  it('accepts a claim without optional fields and derives the atomic claim', async () => {
    const minimalClaim: Claim = {
      id: 'claim-2',
      segmentIds: ['segment-2'],
      originalQuote: 'Frase curta.',
      normalizedClaim: 'Frase curta.',
      status: 'DETECTED',
      notFactCheckable: false,
      atomicClaims: [],
      revision: 0,
      createdAt: '2025-01-10T12:00:00.000Z',
      updatedAt: '2025-01-10T12:00:00.000Z',
    };
    const { llm, invoke } = createLlm();

    const verification = await generateVerification({
      claim: minimalClaim,
      sources: [],
      evidence: [],
      gaps: [],
      transcriptConfirmed: true,
      llm,
      now: NOW,
    });

    expect(invoke).not.toHaveBeenCalled();
    expect(verification.id).toBe('verification-claim-2-0');
    expect(verification.sessionId).toBeUndefined();
    expect(verification.speakerId).toBeUndefined();
    expect(verification.timestampMs).toBeUndefined();
    expect(verification.atomicClaim).toEqual({
      id: 'claim-2-atomic-1',
      proposition: 'Frase curta.',
    });
    expectValid(verification);
  });
});
