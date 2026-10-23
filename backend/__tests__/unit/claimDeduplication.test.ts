import { describe, expect, it } from 'vitest';
import type { AtomicClaim, Claim } from '@veritas/shared';
import {
  DEFAULT_PARAPHRASE_THRESHOLD,
  buildClaimKey,
  findDuplicate,
} from '#/live/claimDeduplication.js';

type ClaimInput = {
  id: string;
  text: string;
  quote?: string;
  subject?: string;
  scope?: string;
  quantity?: { value: number; unit: string };
  notFactCheckable?: boolean;
  atomicClaims?: AtomicClaim[];
};

function makeClaim(input: ClaimInput): Claim {
  const atomicClaims: AtomicClaim[] =
    input.atomicClaims ??
    (input.notFactCheckable === true
      ? []
      : [
          {
            id: `${input.id}-atomic`,
            proposition: input.text,
            ...(input.subject === undefined ? {} : { subject: input.subject }),
            ...(input.scope === undefined
              ? {}
              : { populationOrScope: input.scope }),
            ...(input.quantity === undefined
              ? {}
              : { quantity: { ...input.quantity } }),
          },
        ]);

  return {
    id: input.id,
    segmentIds: ['segment-1'],
    originalQuote: input.quote ?? input.text,
    normalizedClaim: input.text,
    status: 'DETECTED',
    notFactCheckable: input.notFactCheckable ?? false,
    atomicClaims,
    revision: 0,
    createdAt: '2025-01-10T12:00:00.000Z',
    updatedAt: '2025-01-10T12:00:00.000Z',
  };
}

const AUXILIO_2023 =
  'O auxílio emergencial de R$ 600 foi pago às famílias em 2023.';

describe('buildClaimKey', () => {
  it('is stable across accents, case and punctuation', () => {
    const first = makeClaim({
      id: 'claim-1',
      text: 'O Auxílio de R$ 600 foi pago, em 2023.',
    });
    const second = makeClaim({
      id: 'claim-2',
      text: 'o auxilio de r$ 600 foi pago em 2023',
    });

    expect(buildClaimKey(first)).toBe(buildClaimKey(second));
  });

  it('separates negated from affirmative propositions', () => {
    const affirmative = makeClaim({
      id: 'claim-1',
      text: 'O Pix foi criado em 2015 pelo Banco Central.',
    });
    const negated = makeClaim({
      id: 'claim-2',
      text: 'O Pix não foi criado em 2015 pelo Banco Central.',
    });

    expect(buildClaimKey(negated)).not.toBe(buildClaimKey(affirmative));
  });

  it('separates propositions with different quantities', () => {
    const sixHundred = makeClaim({
      id: 'claim-1',
      text: 'O auxílio de R$ 600 foi pago.',
    });
    const sevenHundred = makeClaim({
      id: 'claim-2',
      text: 'O auxílio de R$ 700 foi pago.',
    });

    expect(buildClaimKey(sixHundred)).not.toBe(buildClaimKey(sevenHundred));
  });
});

describe('findDuplicate', () => {
  it('dedupes a literal repetition as EXACT', () => {
    const candidate = makeClaim({ id: 'claim-2', text: AUXILIO_2023 });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'o auxilio emergencial de r$ 600 foi pago as familias em 2023',
    });

    const match = findDuplicate(candidate, [existing]);

    expect(match).toEqual({
      claim: existing,
      kind: 'EXACT',
      similarity: 1,
    });
  });

  it('dedupes an equivalent paraphrase that keeps every critical token', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O auxílio emergencial de 600 reais foi pago às famílias em 2023.',
    });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'Em 2023, o auxílio emergencial de R$ 600 foi pago às famílias.',
    });

    const match = findDuplicate(candidate, [existing]);

    expect(match?.claim).toBe(existing);
    expect(match?.kind).toBe('PARAPHRASE');
    expect(match?.similarity).toBeGreaterThanOrEqual(
      DEFAULT_PARAPHRASE_THRESHOLD,
    );
  });

  it('does not reuse when the period changes (R$ 600 in 2023 vs 2024)', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O auxílio emergencial de R$ 600 foi pago às famílias em 2024.',
    });
    const existing = makeClaim({ id: 'claim-1', text: AUXILIO_2023 });

    expect(findDuplicate(candidate, [existing])).toBeNull();
    expect(findDuplicate(candidate, [existing], { threshold: 0.5 })).toBeNull();
  });

  it('does not reuse when the temporary/permanent status changes', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O auxílio emergencial de R$ 600 é permanente para as famílias.',
    });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'O auxílio emergencial de R$ 600 é temporário para as famílias.',
    });

    expect(findDuplicate(candidate, [existing], { threshold: 0.5 })).toBeNull();
  });

  it('does not reuse when the amount changes even with high similarity', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'Segundo o portal da transparência, o auxílio emergencial de R$ 700 foi pago às famílias brasileiras durante o ano de 2023.',
    });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'Segundo o portal da transparência, o auxílio emergencial de R$ 600 foi pago às famílias brasileiras durante o ano de 2023.',
    });

    expect(findDuplicate(candidate, [existing], { threshold: 0.5 })).toBeNull();
  });

  it('does not reuse when the unit changes', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O reajuste do benefício foi de 600 reais para as famílias.',
    });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'O reajuste do benefício foi de 600 por cento para as famílias.',
    });

    expect(findDuplicate(candidate, [existing], { threshold: 0.5 })).toBeNull();
  });

  it('does not reuse a claim attributed to a different named subject', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O ex-presidente Lula gastou R$ 7 bilhões em viagens oficiais.',
    });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'O ex-presidente Lula e Janja gastaram R$ 7 bilhões em viagens oficiais.',
    });

    expect(findDuplicate(candidate, [existing], { threshold: 0.5 })).toBeNull();
  });

  it('does not reuse when the structured subject differs', () => {
    const text = 'Gastou R$ 7 bilhões em viagens oficiais em 2023.';
    const candidate = makeClaim({
      id: 'claim-2',
      text,
      subject: 'Lula e Janja',
    });
    const existing = makeClaim({ id: 'claim-1', text, subject: 'Lula' });

    expect(findDuplicate(candidate, [existing])).toBeNull();
  });

  it('does not reuse when the population or scope differs', () => {
    const text = 'O benefício de R$ 600 foi pago em 2023.';
    const candidate = makeClaim({
      id: 'claim-2',
      text,
      scope: 'famílias de baixa renda',
    });
    const existing = makeClaim({
      id: 'claim-1',
      text,
      scope: 'servidores públicos federais',
    });

    expect(findDuplicate(candidate, [existing])).toBeNull();
  });

  it('does not reuse when the structured quantity differs', () => {
    const text = 'O benefício foi aprovado pelo Congresso Nacional em 2023.';
    const candidate = makeClaim({
      id: 'claim-2',
      text,
      quantity: { value: 700, unit: 'R$' },
    });
    const existing = makeClaim({
      id: 'claim-1',
      text,
      quantity: { value: 600, unit: 'R$' },
    });

    expect(findDuplicate(candidate, [existing])).toBeNull();
  });

  it('does not reuse when the negation changes', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O Pix não foi criado em 2015 pelo Banco Central.',
    });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'O Pix foi criado em 2015 pelo Banco Central.',
    });

    expect(findDuplicate(candidate, [existing])).toBeNull();
  });

  it('does not dedupe unrelated propositions', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O Congresso aprovou a reforma tributária em dezembro.',
    });
    const existing = makeClaim({ id: 'claim-1', text: AUXILIO_2023 });

    expect(findDuplicate(candidate, [existing])).toBeNull();
  });

  it('does not reuse across the NOT_FACT_CHECKABLE triage', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O governo deveria investir mais em educação.',
      notFactCheckable: true,
    });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'O governo deveria investir mais em educação.',
    });

    expect(findDuplicate(candidate, [existing])).toBeNull();
  });

  it('does not reuse a claim that bundles several propositions', () => {
    const text = 'O Pix foi criado em 2015 e o auxílio foi pago em 2023.';
    const candidate = makeClaim({
      id: 'claim-2',
      text,
      atomicClaims: [
        { id: 'atomic-1', proposition: 'O Pix foi criado em 2015.' },
        { id: 'atomic-2', proposition: 'O auxílio foi pago em 2023.' },
      ],
    });
    const existing = makeClaim({ id: 'claim-1', text });

    expect(findDuplicate(candidate, [existing])).toBeNull();
  });

  it('never matches the candidate against itself', () => {
    const claim = makeClaim({ id: 'claim-1', text: AUXILIO_2023 });

    expect(findDuplicate(claim, [claim])).toBeNull();
  });

  it('returns the closest paraphrase when several occurrences exist', () => {
    const candidate = makeClaim({
      id: 'claim-4',
      text: 'O auxílio emergencial de 600 reais foi pago às famílias em 2023.',
    });
    const weaker = makeClaim({
      id: 'claim-2',
      text: 'O auxílio emergencial de R$ 600 foi pago às famílias em 2023 por doze meses.',
    });
    const closest = makeClaim({
      id: 'claim-3',
      text: 'Em 2023, o auxílio emergencial de R$ 600 foi pago às famílias.',
    });

    const match = findDuplicate(candidate, [weaker, closest], {
      threshold: 0.6,
    });

    expect(match?.claim).toBe(closest);
    expect(match?.similarity).toBe(1);
  });

  it('normalizes thousand separators and percent units', () => {
    const thousands = findDuplicate(
      makeClaim({ id: 'claim-2', text: 'O programa pagou R$ 7.000 por família.' }),
      [makeClaim({ id: 'claim-1', text: 'O programa pagou 7000 reais por família.' })],
    );
    expect(thousands?.kind).toBe('PARAPHRASE');

    const percent = findDuplicate(
      makeClaim({ id: 'claim-4', text: 'O reajuste foi de 50% para os servidores.' }),
      [makeClaim({ id: 'claim-3', text: 'O reajuste foi de 50 por cento para os servidores.' })],
    );
    expect(percent?.kind).toBe('EXACT');

    const differentPercent = findDuplicate(
      makeClaim({ id: 'claim-6', text: 'O reajuste foi de 50% para os servidores.' }),
      [makeClaim({ id: 'claim-5', text: 'O reajuste foi de 60% para os servidores.' })],
      { threshold: 0.5 },
    );
    expect(differentPercent).toBeNull();
  });

  it('returns null when there are no existing occurrences', () => {
    expect(findDuplicate(makeClaim({ id: 'claim-1', text: AUXILIO_2023 }), [])).toBeNull();
  });

  it('respects a stricter similarity threshold', () => {
    const candidate = makeClaim({
      id: 'claim-2',
      text: 'O auxílio emergencial de R$ 600 foi pago às famílias brasileiras durante o ano de 2023.',
    });
    const existing = makeClaim({
      id: 'claim-1',
      text: 'O auxílio emergencial de R$ 600 foi pago às famílias brasileiras durante o ano inteiro de 2023.',
    });

    expect(findDuplicate(candidate, [existing], { threshold: 1 })).toBeNull();
    expect(findDuplicate(candidate, [existing])?.claim).toBe(existing);
  });
});
