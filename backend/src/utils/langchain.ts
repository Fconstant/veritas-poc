export function sanitizeJsonForTemplate(input: Record<string, unknown>) {
  return JSON.stringify(input, null, 2)
    .replace(/{/g, '{{')
    .replace(/}/g, '}}');
}
