import { FactCheckRequest, ServerToClientEvents } from '#/ws/types.js';
import { ValidationError } from '#/utils/errors.js';
import * as Consts from '#/constants.js';
import { applyChunking } from '#/chunking/index.js';
import { basicAnalysis, deepResearch } from '#/analysis/index.js';
import { createConversationMemory } from '#/memory/createConversationMemory.js';

type EventsPayload = Parameters<
  ServerToClientEvents["FACT_CHECK_RESULT" | "CHUNK_COUNT"]
>[0];

// Main fact-checking function
export async function* factCheckService(
  content: string,
  factCheckReq: FactCheckRequest,
): AsyncGenerator<EventsPayload> {
  if (content.trim().length === 0) {
    throw new ValidationError('Text is required');
  }

  if (content.length > Consts.MAX_TEXT_LENGTH) {
    throw new ValidationError(
      `Text too long (max ${Consts.MAX_TEXT_LENGTH.toFixed(0)} characters)`,
    );
  }

  // TODO: apply proper caching
  // const cacheKey = factCheckReq.fingerprint;
  // if (hasCache(cacheKey)) {
  //   return getCache(cacheKey)!;
  // }

  const chunks = await applyChunking(content);

  yield {
    meta: { fingerprint: factCheckReq.fingerprint },
    data: { chunkCount: chunks.length },
  };
  const memory = createConversationMemory();

  const basicAnalysisGenerator = basicAnalysis({
    factCheckReq,
    chunks,
    memory,
  });
  const threshold =
    factCheckReq.researchThreshold ?? Consts.DEFAULT_NEED_RESEARCH_THRESHOLD;
  for await (const result of basicAnalysisGenerator) {
    console.log('🔍 Resultado da análise básica:', {
      confidence: result.data.reasoningConfidence,
      threshold,
      needsResearch: result.data.reasoningConfidence <= threshold,
      extractedClaim: result.data.extractedClaim,
      hasFlags: !!result.data.flags,
      flags: result.data.flags
    });

    if (result.data.reasoningConfidence <= threshold) {
      console.log('🔬 Iniciando pesquisa profunda para:', result.data.extractedClaim);
      const { sources, summary } = await deepResearch(
        result.data.extractedClaim,
      );
      console.log('📚 Resultado da pesquisa profunda:', {
        sourcesCount: sources.length,
        sources: sources,
        summaryLength: summary.length
      });
      
      const finalResult = { 
        ...result, 
        data: { 
          ...result.data, 
          reasoning: summary, 
          sources 
        } 
      };
      console.log('📤 Enviando resultado final com fontes:', {
        hasSources: !!finalResult.data.sources,
        sourcesCount: finalResult.data.sources?.length || 0,
        sources: finalResult.data.sources
      });
      
      yield finalResult as typeof result;
    } else {
      console.log('✅ Alta confiança - enviando resultado sem pesquisa:', {
        confidence: result.data.reasoningConfidence,
        hasSources: !!result.data.sources,
        sourcesCount: result.data.sources?.length || 0
      });
      yield result;
    }
  }
}
