import { LLMConfig } from '../types.js';

// LLM Models Configuration
export const DEFAULT_FAST_MODEL: LLMConfig = {
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  temperature: 0.1,
};

export const DEFAULT_ADVANCED_MODEL: LLMConfig = {
  provider: 'anthropic',
  model: 'claude-3-haiku-20240307',
  temperature: 0.1,
};
