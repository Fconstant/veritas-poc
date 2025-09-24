import { LLMConfig } from '../types.js';

// LLM Models Configuration
export const DEFAULT_FAST_MODEL: LLMConfig = {
  provider: 'google',
  model: 'gemini-2.5-flash',
  temperature: 0.1,
};

export const DEFAULT_ADVANCED_MODEL: LLMConfig = {
  provider: 'google',
  model: 'gemini-2.5-pro',
  temperature: 0.1,
};
