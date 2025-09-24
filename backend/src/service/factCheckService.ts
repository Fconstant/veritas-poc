import { FactCheckRequest, ServerToClientEvents } from '#/ws/types.js';
import { ValidationError } from '#/utils/errors.js';
import * as Consts from '#/constants.js';
import { applyChunking } from '#/chunking/index.js';
import { basicAnalysis, deepResearch } from '#/analysis/index.js';
import { createConversationMemory } from '#/memory/createConversationMemory.js';
import { getAdvancedLLM, getLiteLLM } from '#/llm/index.js';

type EventsPayload = Parameters<
  ServerToClientEvents[ "FACT_CHECK_RESULT" | "CHUNK_COUNT" ]
>[ 0 ];

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

  const liteLLM = getLiteLLM(factCheckReq.apiKeys.google);
  const advancedLLM = getAdvancedLLM(factCheckReq.apiKeys.google);
  const chunks = await applyChunking(content);

  yield {
    meta: { fingerprint: factCheckReq.fingerprint },
    data: { chunkCount: chunks.length },
  };
  const memory = createConversationMemory(liteLLM);

  const basicAnalysisGenerator = basicAnalysis({
    factCheckReq,
    chunks,
    memory,
    llm: liteLLM,
  });
  const threshold =
    factCheckReq.researchThreshold ?? Consts.DEFAULT_NEED_RESEARCH_THRESHOLD;
  for await (const result of basicAnalysisGenerator) {
    if (result.data.reasoningConfidence <= threshold) {
      const deepResearchResult = await deepResearch({
        query: result.data.extractedClaim,
        memory,
        llm: advancedLLM,
        tavilyApiKey: factCheckReq.apiKeys.tavily,
      });
      yield { ...result, data: { ...result.data, ...deepResearchResult } };
    } else {
      yield result;
    }
  }
}
