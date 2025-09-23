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
    if (result.data.reasoningConfidence <= threshold) {
      const deepResearchResult = await deepResearch(
        result.data.extractedClaim,
        memory
      );
      yield { ...result, ...deepResearchResult };
    } else {
      yield result;
    }
  }
}
