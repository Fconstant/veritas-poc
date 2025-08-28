import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { InternalFactCheckResult, INTERNAL_FACT_CHECK_RESULT_SCHEMA } from '../types.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import z from 'zod';

const systemPrompt = `You are an expert fact-checker analyzing political statements.

Your task:
1. Evaluate the veracity of the given statement
2. Classify as: TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIABLE, or MISLEADING
3. Provide confidence score (0-100)
4. Give clear reasoning
5. Identify potential red flags
6. The response should be concise and answered in the original language of the statement/user.

CRITICAL: Your response must be ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Start your response directly with { and end with }. No \`\`\`json blocks or any other formatting.

Expected JSON structure:
${JSON.stringify(z.toJSONSchema(INTERNAL_FACT_CHECK_RESULT_SCHEMA).properties, null, 2)}
`;

// Core fact-checking logic
export const analyzeStatement = async (
  text: string,
  model: BaseChatModel
): Promise<InternalFactCheckResult> => {

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Analyze this statement: "${text}"`)
  ]);

  console.log('LLM Response: ', response.content);

  try {
    const result = INTERNAL_FACT_CHECK_RESULT_SCHEMA.parse(JSON.parse(response.content as string));
    return {
      veracity: result.veracity,
      confidence: result.confidence,
      reasoning: result.reasoning,
      flags: result.flags,
    };
  } catch(err) {
    console.error(err);
    return {
      veracity: 'UNVERIFIABLE',
      confidence: 0,
      reasoning: 'Failed to parse LLM response',
      flags: ['PROCESSING_ERROR'],
    };
  }
};
