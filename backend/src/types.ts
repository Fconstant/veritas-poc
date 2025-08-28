// Types
import { z } from 'zod';

// Zod schemas
export const FACT_CHECK_REQUEST_SCHEMA = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  speaker: z.string().optional(),
  context: z.string().optional(),
  useAdvancedModel: z.boolean().optional(),
});

export const FACT_CHECK_RESULT_SCHEMA = z.object({
  originalText: z.string(),
  veracity: z.enum(['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIABLE', 'MISLEADING']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1, 'Reasoning cannot be empty'),
  sources: z.array(z.url()).optional(),
  flags: z.array(z.string()),
});

export const LLM_CONFIG_SCHEMA = z.object({
  provider: z.enum(['openai', 'anthropic', 'mistral', 'google']),
  model: z.string().min(1, 'Model name cannot be empty'),
  temperature: z.number().min(0).max(2),
});

export const SEARCH_RESULT_SCHEMA = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  url: z.url(),
  snippet: z.string().min(1, 'Snippet cannot be empty'),
});

// Inferred types from schemas
export type FactCheckRequest = z.infer<typeof FACT_CHECK_REQUEST_SCHEMA>;
export type FactCheckResult = z.infer<typeof FACT_CHECK_RESULT_SCHEMA>;
export type LLMConfig = z.infer<typeof LLM_CONFIG_SCHEMA>;
export type SearchResult = z.infer<typeof SEARCH_RESULT_SCHEMA>;
