import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { LLMConfig } from '../types.js';
import { ChatOpenAI } from '@langchain/openai';

// LLM Factory
export const createLLM = (config: LLMConfig): BaseChatModel => {
  switch (config.provider) {
    case 'google':
      return new ChatGoogleGenerativeAI({
        model: config.model,
        temperature: config.temperature,
        apiKey: config.apiKey,
      });
    case 'openai':
      return new ChatOpenAI({
        modelName: config.model,
        temperature: config.temperature,
        apiKey: config.apiKey,
      });
    default:
      throw new Error("Unsupported provider");
  }
};
