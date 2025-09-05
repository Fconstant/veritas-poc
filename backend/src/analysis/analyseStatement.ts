import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { InternalFactCheckResult, INTERNAL_FACT_CHECK_RESULT_SCHEMA } from '../types.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import z from 'zod';

const SYSTEM_PROMPT = `You are an expert fact-checker and debunking expert analyzing political statements.

Your task:
1. Evaluate the veracity of the given statement
2. Classify as: TRUE, FALSE, PARTIALLY_TRUE, UNVERIFIABLE, MISLEADING, or LACK_OF_BASIS
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
): Promise<InternalFactCheckResult | undefined> => {

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Analyze this statement: "${text}"`)
  ]);

  console.log('LLM Response: ', response.content);

  try {
    const result = INTERNAL_FACT_CHECK_RESULT_SCHEMA.parse(JSON.parse(response.content as string));
    return result;
  } catch(err) {
    // TODO: Add proper error handling
    console.error(err);
  }
  return undefined;
};
