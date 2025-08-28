import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { LLMConfig } from '../types.js';

// LLM Factory
export const createLLM = (config: LLMConfig): BaseChatModel => {
  switch (config.provider) {
    case 'google':
      return new ChatGoogleGenerativeAI({
        model: config.model,
        temperature: config.temperature,
      });
    // case 'openai':
    //   return new ChatOpenAI({
    //     modelName: config.model,
    //     temperature: config.temperature,
    //   });
    // case 'anthropic':
    //   return new ChatAnthropic({
    //     modelName: config.model,
    //     temperature: config.temperature,
    //   });
    // case 'mistral':
    //   return new ChatMistralAI({
    //     modelName: config.model,
    //     temperature: config.temperature,
    //   });
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
};
