import { LLMConfig } from '../types.js';

// LLM Models Configuration
export const DEFAULT_FAST_MODEL: LLMConfig = {
  provider: 'google',
  model: 'gemini-2.5-flash',
  temperature: 0.1,
  apiKey: process.env.GOOGLE_API_KEY,
};

export const DEFAULT_ADVANCED_MODEL: LLMConfig = {
  provider: 'google',
  model: 'gemini-2.5-pro',
  temperature: 0.1,
  apiKey: process.env.GOOGLE_API_KEY,
};
