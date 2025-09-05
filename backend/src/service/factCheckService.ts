import { analyzeWithSources } from '#/analysis/analyseWithSources.js';
import { getCache, getCacheKey, hasCache, setCache } from '#/cache.js';
import { DEFAULT_FAST_MODEL } from '#/llm/config.js';
import { createLLM } from '#/llm/factory.js';
import { FACT_CHECK_RESULT_SCHEMA, FactCheckRequest, FactCheckResult } from '#/types.js';
import { ValidationError } from '#/utils/errors.js';
import * as Consts from '#/constants.js';

// Main fact-checking function
export const factCheckService = async (factCheckReq: FactCheckRequest): Promise<FactCheckResult> => {

  if (factCheckReq.content.trim().length === 0) {
    throw new ValidationError('Text is required');
  }

  if (factCheckReq.content.length > Consts.MAX_TEXT_LENGTH) {
    throw new ValidationError(`Text too long (max ${Consts.MAX_TEXT_LENGTH.toFixed(0)} characters)`);
  }

  const cacheKey = getCacheKey(factCheckReq.content);

  if (hasCache(cacheKey)) {
    return getCache(cacheKey)!;
  }

  const modelConfig = DEFAULT_FAST_MODEL;
  const model = createLLM(modelConfig);

  const analysis = await analyzeWithSources(factCheckReq.content, model);

  const result = FACT_CHECK_RESULT_SCHEMA.parse({
    originalText: factCheckReq.content,
    ...analysis,
  });

  setCache(cacheKey, result);
  return result;
};
