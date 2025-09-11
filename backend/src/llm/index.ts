import { DEFAULT_FAST_MODEL } from './config.js';
import { createLLM } from './factory.js';

const modelConfig = DEFAULT_FAST_MODEL;
export const ApplicationLLM = createLLM(modelConfig);
