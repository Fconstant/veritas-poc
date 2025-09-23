import { DEFAULT_ADVANCED_MODEL, DEFAULT_FAST_MODEL } from './config.js';
import { createLLM } from './factory.js';

export const LiteLLM = createLLM(DEFAULT_FAST_MODEL);
export const AdvancedLLM = createLLM(DEFAULT_ADVANCED_MODEL);
