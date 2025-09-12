import { ZodType } from 'zod';

export function sanitizeJsonForTemplate(input: Record<string, unknown>) {
  return JSON.stringify(input, null, 2).replace(/{/g, '{{').replace(/}/g, '}}');
}

export function parseLLMJsonResponse<Schema extends ZodType>(
  schema: Schema,
  input: string,
) {
  return schema.safeParse(JSON.parse(input.replace(/```(?:json)?\s*|\s*```/g, '').trim()))
    .data;
}
