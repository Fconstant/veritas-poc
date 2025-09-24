import { DEFAULT_ADVANCED_MODEL, DEFAULT_FAST_MODEL } from './config.js';
import { createLLM } from './factory.js';

export const getLiteLLM = (apiKey: string) => createLLM({ ...DEFAULT_FAST_MODEL, apiKey });
export const getAdvancedLLM = (apiKey: string) => createLLM({ ...DEFAULT_ADVANCED_MODEL, apiKey });
