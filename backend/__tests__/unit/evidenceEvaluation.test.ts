import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Source } from '@veritas/shared';
import { describe, expect, it, vi } from 'vitest';
import {
  MAX_DOCUMENT_PROMPT_CHARS,
  NO_DOCUMENT_GAP,
  evaluateEvidence,
} from '#/analysis/evidenceEvaluation.js';
import { ParsingError } from '#/utils/errors.js';

const DOCUMENT =
  'A Lei nº 12.865, de 9 de outubro de 2013, autorizou o Banco Central do Brasil a instituir o arranjo de pagamentos conhecido como Pix e a disciplinar a sua gestão. O Pix passou a operar em novembro de 2020, após a publicação do regulamento do Banco Central. A norma não prevê prazo de validade para o arranjo, que segue em funcionamento.';

const SOURCE: Source = {
  id: 'src-1',
  title: 'Lei nº 12.865/2013',
  publisher: 'planalto.gov.br',
  url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12865.htm',
  type: 'PRIMARY',
  publishedAt: '2013-10-09T00:00:00.000Z',
  accessedAt: '2025-01-10T12:00:00.000Z',
};

const CLAIM = {
  id: 'claim-1',
  normalizedClaim: 'O Pix foi criado em 2015.',
  originalQuote: 'O Pix foi criado em 2015.',
  atomicClaims: [{ id: 'atomic-1', proposition: 'O Pix foi criado em 2015' }],
};

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

const reply = (payload: unknown): string => JSON.stringify(payload);

const evaluate = (
  documents: Record<string, string>,
  llm: BaseChatModel,
  sources: Source[] = [SOURCE],
) => evaluateEvidence({ claim: CLAIM, sources, documents, llm });

describe('evaluateEvidence', () => {
  it('accepts an excerpt that exists in the inspected document', async () => {
    const { llm, inputs } = createLlm(
      reply({
        evidence: [
          {
            sourceId: 'src-1',
            relation: 'SUPPORTS',
            excerpt:
              'A Lei nº 12.865, de 9 de outubro de 2013, autorizou o Banco Central do Brasil',
            explanation:
              'O documento atribui a autorização do Pix ao Banco Central em 2013.',
          },
        ],
        gaps: [],
      }),
    );

    const result = await evaluate({ 'src-1': DOCUMENT }, llm);

    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0]).toMatchObject({
      id: 'ev-1',
      sourceId: 'src-1',
      relation: 'SUPPORTS',
      claimIds: ['claim-1'],
      verifiedContent: true,
    });
    expect(result.rejected).toEqual([]);

    const prompt = JSON.stringify(inputs[0]);
    expect(prompt).toContain('Responda em português');
    expect(prompt).toContain('quem, o quê, quando, quanto, como');
    expect(prompt).toContain('src-1');
    expect(prompt).toContain('Publicação: 2013-10-09T00:00:00.000Z');
    expect(prompt).toContain('Acesso: 2025-01-10T12:00:00.000Z');
  });

  it('matches excerpts case-insensitively with normalized whitespace', async () => {
    const { llm } = createLlm(
      reply({
        evidence: [
          {
            sourceId: 'src-1',
            relation: 'CONTEXTUALIZES',
            excerpt:
              'A LEI Nº 12.865,\n   de 9 de outubro de 2013,   autorizou o Banco Central',
            explanation: 'Datas e autoria coincidem com o documento.',
          },
        ],
      }),
    );

    const result = await evaluate({ 'src-1': DOCUMENT }, llm);

    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].relation).toBe('CONTEXTUALIZES');
  });

  it('rejects an invented excerpt and keeps it out of the evidence list', async () => {
    const { llm } = createLlm(
      reply({
        evidence: [
          {
            sourceId: 'src-1',
            relation: 'REFUTES',
            excerpt: 'O Pix foi criado em 2015 por decreto presidencial.',
            explanation: 'Trecho inventado.',
          },
        ],
      }),
    );

    const result = await evaluate({ 'src-1': DOCUMENT }, llm);

    expect(result.evidence).toEqual([]);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]).toContain('não encontrado');
    expect(result.rejected[0]).toContain('decreto presidencial');
    expect(result.rejected[0].length).toBeLessThan(200);
  });

  it('accepts multiple relations and numbers them sequentially', async () => {
    const { llm } = createLlm(
      reply({
        evidence: [
          {
            sourceId: 'src-1',
            relation: 'SUPPORTS',
            excerpt: 'A Lei nº 12.865, de 9 de outubro de 2013',
            explanation: 'A norma é de 2013.',
          },
          {
            sourceId: 'src-1',
            relation: 'CONTEXTUALIZES',
            excerpt: 'O Pix passou a operar em novembro de 2020',
            explanation: 'O início da operação é posterior à lei.',
          },
          {
            sourceId: 'src-1',
            relation: 'REFUTES',
            excerpt: 'A norma não prevê prazo de validade para o arranjo',
            explanation: 'O documento não trata de criação em 2015.',
          },
        ],
      }),
    );

    const result = await evaluate({ 'src-1': DOCUMENT }, llm);

    expect(result.evidence.map((item) => item.id)).toEqual([
      'ev-1',
      'ev-2',
      'ev-3',
    ]);
    expect(result.evidence.map((item) => item.relation)).toEqual([
      'SUPPORTS',
      'CONTEXTUALIZES',
      'REFUTES',
    ]);
    expect(result.evidence.every((item) => item.verifiedContent)).toBe(true);
  });

  it('rejects evidence pointing to an unknown source', async () => {
    const { llm } = createLlm(
      reply({
        evidence: [
          {
            sourceId: 'src-9',
            relation: 'SUPPORTS',
            excerpt: 'A Lei nº 12.865, de 9 de outubro de 2013',
            explanation: 'Fonte inexistente.',
          },
          {
            sourceId: 'src-1',
            relation: 'SUPPORTS',
            excerpt: 'A Lei nº 12.865, de 9 de outubro de 2013',
            explanation: 'Fonte existente.',
          },
        ],
      }),
    );

    const result = await evaluate({ 'src-1': DOCUMENT }, llm);

    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].sourceId).toBe('src-1');
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]).toContain('src-9');
  });

  it('truncates long documents in the prompt without throwing', async () => {
    const longDocument = `${'A'.repeat(20_000)} trecho final`;
    const { llm, inputs } = createLlm(
      reply({
        evidence: [
          {
            sourceId: 'src-1',
            relation: 'SUPPORTS',
            excerpt: 'A'.repeat(80),
            explanation: 'Trecho presente no início do documento.',
          },
        ],
      }),
    );

    const result = await evaluate({ 'src-1': longDocument }, llm);

    const prompt = JSON.stringify(inputs[0]);
    expect(prompt.length).toBeLessThan(20_000);
    expect(prompt).toContain('[conteúdo truncado para inspeção]');
    expect(prompt).not.toContain('trecho final');
    expect(MAX_DOCUMENT_PROMPT_CHARS).toBe(6000);
    expect(result.evidence).toHaveLength(1);
  });

  it('preserves the gaps reported by the model', async () => {
    const { llm } = createLlm(
      reply({
        evidence: [],
        gaps: [
          'O documento não informa a data de criação.',
          'Nenhum documento trata do ano de 2015.',
        ],
      }),
    );

    const result = await evaluate({ 'src-1': DOCUMENT }, llm);

    expect(result.evidence).toEqual([]);
    expect(result.gaps).toEqual([
      'O documento não informa a data de criação.',
      'Nenhum documento trata do ano de 2015.',
    ]);
  });

  it('rejects an excerpt without an explanation', async () => {
    const { llm } = createLlm(
      reply({
        evidence: [
          {
            sourceId: 'src-1',
            relation: 'SUPPORTS',
            excerpt: 'A Lei nº 12.865, de 9 de outubro de 2013',
            explanation: '   ',
          },
        ],
      }),
    );

    const result = await evaluate({ 'src-1': DOCUMENT }, llm);

    expect(result.evidence).toEqual([]);
    expect(result.rejected[0]).toContain('justificativa');
  });

  it('does not call the model when no document was inspected', async () => {
    const { llm, invoke } = createLlm(reply({ evidence: [] }));

    const result = await evaluate({}, llm);

    expect(result).toEqual({
      evidence: [],
      gaps: [NO_DOCUMENT_GAP],
      rejected: [],
    });
    expect(invoke).not.toHaveBeenCalled();
  });

  it('throws ParsingError when the model output is not valid JSON', async () => {
    const { llm } = createLlm('não é json');

    await expect(evaluate({ 'src-1': DOCUMENT }, llm)).rejects.toBeInstanceOf(
      ParsingError,
    );
  });

  it('throws ParsingError when the model ignores the schema', async () => {
    const { llm } = createLlm(reply({ evidence: 'nada' }));

    await expect(evaluate({ 'src-1': DOCUMENT }, llm)).rejects.toBeInstanceOf(
      ParsingError,
    );
  });
});
