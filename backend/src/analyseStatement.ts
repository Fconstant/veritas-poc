import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { FACT_CHECK_RESULT_SCHEMA, FactCheckResult } from './types.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import z from 'zod';

const systemPrompt = `You are an expert fact-checker analyzing political statements.

Your task:
1. Evaluate the veracity of the given statement
2. Classify as: TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIABLE, or MISLEADING
3. Provide confidence score (0-100)
4. Give clear reasoning
5. Identify potential red flags

Respond in JSON format:
${JSON.stringify(z.toJSONSchema(FACT_CHECK_RESULT_SCHEMA))}
`;

// Core fact-checking logic
export const analyzeStatement = async (
  text: string,
  model: BaseChatModel
): Promise<Omit<FactCheckResult, 'originalText'>> => {

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Analyze this statement: "${text}"`)
  ]);

  try {
    const result = JSON.parse(response.content as string) as FactCheckResult;
    return {
      veracity: result.veracity,
      confidence: result.confidence,
      reasoning: result.reasoning,
      flags: result.flags,
    };
  } catch {
    return {
      veracity: 'UNVERIFIABLE',
      confidence: 0,
      reasoning: 'Failed to parse LLM response',
      flags: ['PROCESSING_ERROR'],
    };
  }
};
