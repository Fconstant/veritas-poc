import type { Claim } from '@veritas/shared';

/**
 * Conservative claim equivalence.
 *
 * Two claims are only considered interchangeable when their critical facts
 * agree: numbers, units, negation, period/quantity, subject and population.
 * A high text similarity alone never approves reuse.
 */

export type DuplicateKind = 'EXACT' | 'PARAPHRASE';

export type DuplicateMatch = {
  claim: Claim;
  kind: DuplicateKind;
  similarity: number;
};

export type FindDuplicateOptions = {
  /** Minimum token Jaccard similarity for a paraphrase. Defaults to 0.9. */
  threshold?: number;
};

export const DEFAULT_PARAPHRASE_THRESHOLD = 0.9;

const DIACRITICS = /[\u0300-\u036f]/g;

const UNIT_ALIASES: ReadonlyMap<string, string> = new Map(
  Object.entries({
    reais: 'brl',
    real: 'brl',
    brl: 'brl',
    dolares: 'usd',
    dolar: 'usd',
    usd: 'usd',
    '%': '%',
    porcento: '%',
    percentual: '%',
    trilhao: 'trilhao',
    trilhoes: 'trilhao',
    bilhao: 'bilhao',
    bilhoes: 'bilhao',
    bi: 'bilhao',
    bilion: 'bilhao',
    bilions: 'bilhao',
    milhao: 'milhao',
    milhoes: 'milhao',
    mi: 'milhao',
    milhon: 'milhao',
    mil: 'mil',
    milhar: 'mil',
    milhares: 'mil',
    thousand: 'mil',
    ponto: 'ponto',
    pontos: 'ponto',
  }),
);

const NEGATION_TOKENS: ReadonlySet<string> = new Set([
  'nao',
  'nunca',
  'jamais',
  'nem',
  'sem',
  'nenhum',
  'nenhuma',
  'nenhuns',
  'nenhumas',
  'ninguem',
  'tampouco',
  'sequer',
]);

const PERIOD_ALIASES: ReadonlyMap<string, string> = new Map(
  Object.entries({
    temporario: 'temporario',
    temporaria: 'temporario',
    temporariamente: 'temporario',
    provisorio: 'temporario',
    provisoria: 'temporario',
    provisoriamente: 'temporario',
    transitorio: 'temporario',
    transitoria: 'temporario',
    permanente: 'permanente',
    permanentemente: 'permanente',
    definitivo: 'permanente',
    definitiva: 'permanente',
    definitivamente: 'permanente',
    atual: 'atual',
    atualmente: 'atual',
    hoje: 'atual',
    agora: 'atual',
    ontem: 'passado',
    passado: 'passado',
    anterior: 'passado',
    anteriormente: 'passado',
    ultimo: 'passado',
    ultima: 'passado',
    amanha: 'futuro',
    futuro: 'futuro',
    proximo: 'futuro',
    proxima: 'futuro',
    futuramente: 'futuro',
    mensal: 'mensal',
    mensalmente: 'mensal',
    anual: 'anual',
    anualmente: 'anual',
    semanal: 'semanal',
    diario: 'diario',
    diariamente: 'diario',
    trimestral: 'trimestral',
    semestral: 'semestral',
  }),
);

const STOPWORDS: ReadonlySet<string> = new Set([
  'a',
  'o',
  'as',
  'os',
  'um',
  'uma',
  'uns',
  'umas',
  'de',
  'do',
  'da',
  'dos',
  'das',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'num',
  'numa',
  'por',
  'pelo',
  'pela',
  'pelos',
  'pelas',
  'para',
  'pra',
  'com',
  'e',
  'ou',
  'que',
  'se',
  'foi',
  'foram',
  'ser',
  'sao',
  'era',
  'eram',
  'esta',
  'estao',
  'estava',
  'estavam',
  'tem',
  'tinha',
  'havia',
  'ha',
  'ao',
  'aos',
  'as',
  'ate',
  'apos',
  'entre',
  'sobre',
  'como',
  'mais',
  'menos',
  'muito',
  'muita',
  'muitos',
  'muitas',
  'ja',
  'ainda',
  'tambem',
  'sim',
  'ele',
  'ela',
  'eles',
  'elas',
  'isso',
  'isto',
  'esse',
  'essa',
  'este',
  'esta',
  'aquele',
  'aquela',
  'seu',
  'sua',
  'seus',
  'suas',
  'lhe',
  'lhes',
  'me',
  'te',
  'vos',
  'the',
  'of',
  'and',
  'to',
  'in',
  'was',
  'were',
  'is',
  'are',
  'that',
  'this',
  'for',
  'with',
  'by',
  'at',
  'on',
  'from',
  'it',
  'be',
  'been',
  'has',
  'have',
  'had',
  'will',
  'would',
  'can',
  'could',
  'may',
  'might',
  'should',
]);

/** Capitalized words that are generic in political speech and not a named subject. */
const GENERIC_CAPITALIZED: ReadonlySet<string> = new Set([
  'o',
  'a',
  'os',
  'as',
  'um',
  'uma',
  'ele',
  'ela',
  'eles',
  'elas',
  'isso',
  'isto',
  'esse',
  'essa',
  'este',
  'esta',
  'aquele',
  'aquela',
  'segundo',
  'conforme',
  'quando',
  'mas',
  'porem',
  'entao',
  'governo',
  'federal',
  'brasil',
  'pais',
  'presidente',
  'vice',
  'ministro',
  'ministra',
  'deputado',
  'deputada',
  'senador',
  'senadora',
  'estado',
  'municipio',
  'prefeito',
  'prefeita',
  'programa',
  'auxilio',
  'beneficio',
  'ministerio',
  'secretaria',
  'portal',
  'transparencia',
  'congresso',
  'senado',
  'camara',
]);

type LexResult = {
  /** Content tokens used for similarity (numbers as `#n`, units as `u:x`). */
  tokens: string[];
  numbers: string[];
  units: string[];
  periods: string[];
  negated: boolean;
};

type CriticalSignature = {
  numbers: string[];
  units: string[];
  periods: string[];
  negated: boolean;
  entities: string[];
  subject: string | null;
  quantity: string | null;
};

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS, '');
}

function assembleNumber(integer: string, fraction: string): string {
  const normalizedInteger = integer.replace(/^0+(?=\d)/, '');
  const trimmedFraction = fraction.replace(/0+$/, '');
  return trimmedFraction.length > 0
    ? `${normalizedInteger}.${trimmedFraction}`
    : normalizedInteger;
}

/** Canonical decimal string for a numeric token, `undefined` when it is not a number. */
function canonicalNumber(raw: string): string | undefined {
  const cleaned = raw.replace(/^[.,]+/, '').replace(/[.,]+$/, '');
  if (!/^\d[\d.,]*$/.test(cleaned)) {
    return undefined;
  }

  const mixed = /^(\d{1,3}(?:\.\d{3})+),(\d+)$/.exec(cleaned);
  if (mixed) {
    return assembleNumber(mixed[1].replaceAll('.', ''), mixed[2]);
  }

  if (/^\d{1,3}(?:\.\d{3})+$/.test(cleaned)) {
    return assembleNumber(cleaned.replaceAll('.', ''), '');
  }

  const comma = /^(\d+),(\d+)$/.exec(cleaned);
  if (comma) {
    return assembleNumber(comma[1], comma[2]);
  }

  const dot = /^(\d+)\.(\d+)$/.exec(cleaned);
  if (dot) {
    // Portuguese input: three digits after a dot are a thousands separator.
    return dot[2].length === 3
      ? assembleNumber(`${dot[1]}${dot[2]}`, '')
      : assembleNumber(dot[1], dot[2]);
  }

  return /^\d+$/.test(cleaned)
    ? assembleNumber(cleaned, '')
    : undefined;
}

function sorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort();
}

function lexClaim(text: string): LexResult {
  const prepared = stripDiacritics(text.toLowerCase())
    .replaceAll('r$', ' reais ')
    .replaceAll('us$', ' dolares ');

  const tokens = new Set<string>();
  const numbers = new Set<string>();
  const units = new Set<string>();
  const periods = new Set<string>();
  let negated = false;

  for (const raw of prepared.split(/[^a-z0-9.,%]+/)) {
    let token = raw.replace(/^[.,]+/, '').replace(/[.,]+$/, '');
    let percent = false;

    if (token.endsWith('%')) {
      percent = true;
      token = token.slice(0, -1).replace(/[.,]+$/, '');
    }

    const number = token.length > 0 ? canonicalNumber(token) : undefined;
    if (number !== undefined) {
      numbers.add(number);
      tokens.add(`#${number}`);
      if (percent) {
        units.add('%');
        tokens.add('u:%');
      }
      continue;
    }

    if (token.length === 0) {
      if (percent) {
        units.add('%');
        tokens.add('u:%');
      }
      continue;
    }

    const unit = UNIT_ALIASES.get(token);
    if (unit !== undefined) {
      units.add(unit);
      tokens.add(`u:${unit}`);
      continue;
    }

    if (NEGATION_TOKENS.has(token)) {
      negated = true;
      continue;
    }

    const period = PERIOD_ALIASES.get(token);
    if (period !== undefined) {
      periods.add(period);
      tokens.add(token);
      continue;
    }

    if (!STOPWORDS.has(token)) {
      tokens.add(token);
    }
  }

  return {
    tokens: [...tokens],
    numbers: sorted(numbers),
    units: sorted(units),
    periods: sorted(periods),
    negated,
  };
}

function extractEntities(text: string): string[] {
  const entities = new Set<string>();

  for (const word of text.split(/[^\p{L}\p{M}'-]+/u)) {
    if (!/^\p{Lu}[\p{L}\p{M}'-]*$/u.test(word)) {
      continue;
    }
    const normalized = stripDiacritics(word.toLowerCase());
    if (normalized.length < 2 || GENERIC_CAPITALIZED.has(normalized)) {
      continue;
    }
    entities.add(normalized);
  }

  return sorted(entities);
}

function claimText(claim: Claim): string {
  return claim.normalizedClaim.trim();
}

function subjectKey(claim: Claim): string | null {
  const subject = claim.atomicClaims.at(0)?.subject;
  if (subject === undefined) {
    return null;
  }
  const text = subject.trim();
  if (text.length === 0) {
    return null;
  }
  return lexClaim(text).tokens.join(' ');
}

function quantityKey(claim: Claim): string | null {
  const quantity = claim.atomicClaims.at(0)?.quantity;
  if (quantity === undefined) {
    return null;
  }
  const value = canonicalNumber(String(quantity.value));
  if (value === undefined) {
    return null;
  }
  const unit = lexClaim(quantity.unit);
  return `${value}|${unit.units.at(0) ?? unit.tokens.join(' ')}`;
}

function criticalSignature(claim: Claim, text: string): CriticalSignature {
  const lexed = lexClaim(text);
  return {
    numbers: lexed.numbers,
    units: lexed.units,
    periods: lexed.periods,
    negated: lexed.negated,
    entities: extractEntities(text),
    subject: subjectKey(claim),
    quantity: quantityKey(claim),
  };
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function signaturesMatch(
  left: CriticalSignature,
  right: CriticalSignature,
): boolean {
  if (left.negated !== right.negated) {
    return false;
  }
  if (!arraysEqual(left.numbers, right.numbers)) {
    return false;
  }
  if (!arraysEqual(left.units, right.units)) {
    return false;
  }
  if (!arraysEqual(left.periods, right.periods)) {
    return false;
  }
  if (left.subject !== null && right.subject !== null && left.subject !== right.subject) {
    return false;
  }
  if (
    left.quantity !== null &&
    right.quantity !== null &&
    left.quantity !== right.quantity
  ) {
    return false;
  }
  return true;
}

function jaccard(left: readonly string[], right: readonly string[]): number {
  if (left.length === 0 && right.length === 0) {
    return 1;
  }
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  let intersection = 0;
  for (const token of leftSet) {
    if (rightSet.has(token)) {
      intersection += 1;
    }
  }
  const union = leftSet.size + rightSet.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

/**
 * Deterministic key for the literal (normalized) wording of a claim. Claims
 * with the same key are exact repetitions of each other.
 */
export function buildClaimKey(claim: Claim): string {
  return lexClaim(claimText(claim)).tokens.join(' ');
}

/**
 * Finds an existing occurrence that can reuse the investigation of `candidate`.
 * Returns `null` when no equivalent occurrence exists.
 */
export function findDuplicate(
  candidate: Claim,
  existing: readonly Claim[],
  options: FindDuplicateOptions = {},
): DuplicateMatch | null {
  const threshold = Math.min(
    1,
    Math.max(0, options.threshold ?? DEFAULT_PARAPHRASE_THRESHOLD),
  );
  const text = claimText(candidate);
  const candidateTokens = lexClaim(text).tokens;
  const candidateKey = candidateTokens.join(' ');
  const candidateSignature = criticalSignature(candidate, text);
  let best: DuplicateMatch | null = null;

  for (const claim of existing) {
    if (claim.id === candidate.id) {
      continue;
    }
    if (claim.notFactCheckable !== candidate.notFactCheckable) {
      continue;
    }
    // A claim bundling several propositions is never reused automatically.
    if (claim.atomicClaims.length > 1 || candidate.atomicClaims.length > 1) {
      continue;
    }

    const otherText = claimText(claim);
    const otherTokens = lexClaim(otherText).tokens;
    const similarity = jaccard(candidateTokens, otherTokens);

    if (otherTokens.join(' ') === candidateKey) {
      return { claim, kind: 'EXACT', similarity: 1 };
    }

    if (similarity < threshold) {
      continue;
    }

    const otherSignature = criticalSignature(claim, otherText);
    if (!signaturesMatch(candidateSignature, otherSignature)) {
      continue;
    }

    // Capitalization alone is not a subject change: identical word sets keep
    // the same meaning even when one occurrence starts with a lowercase name.
    if (
      similarity < 1 &&
      !arraysEqual(candidateSignature.entities, otherSignature.entities)
    ) {
      continue;
    }

    if (best === null || similarity > best.similarity) {
      best = { claim, kind: 'PARAPHRASE', similarity };
    }
  }

  return best;
}
