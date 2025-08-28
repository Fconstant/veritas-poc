import { analyzeWithSources } from '../analysis/analyseWithSources.js';
import { getCache, getCacheKey, hasCache, setCache } from '../cache.js';
import { DEFAULT_ADVANCED_MODEL, DEFAULT_FAST_MODEL } from '../llm/config.js';
import { createLLM } from '../llm/factory.js';
import { FACT_CHECK_RESULT_SCHEMA, FactCheckRequest, FactCheckResult } from '../types.js';

// Main fact-checking function
export const factCheckService = async (request: FactCheckRequest): Promise<FactCheckResult> => {
  const useAdvancedModel = request.useAdvancedModel ?? false;
  const cacheKey = getCacheKey(request.text + (useAdvancedModel ? 'advanced' : 'fast'));

  if (hasCache(cacheKey)) {
    return getCache(cacheKey)!;
  }

  const modelConfig = useAdvancedModel ? DEFAULT_ADVANCED_MODEL : DEFAULT_FAST_MODEL;
  const model = createLLM(modelConfig);

  const analysis = await analyzeWithSources(request.text, model);

  const result = FACT_CHECK_RESULT_SCHEMA.parse({
    originalText: request.text,
    ...analysis,
  });

  setCache(cacheKey, result);
  return result;
};
