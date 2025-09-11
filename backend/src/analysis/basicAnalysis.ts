import { ApplicationLLM } from '#/llm/index.js';
import { ParsingError } from '#/utils/errors.js';
import { sanitizeJsonForTemplate } from '#/utils/langchain.js';
import {
  FACT_CHECK_RESULT_DATA_SCHEMA,
  FACT_CHECK_RESULT_SCHEMA,
  FactCheckRequest,
} from '#/ws/types.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { BaseChatMemory } from 'langchain/memory';
import z from 'zod';

type ChainInput = {
  input: string;
};
type ChainVars = ChainInput & {
  context?: string;
};

const INITIAL_ANALYSIS_SCHEMA = z.array(FACT_CHECK_RESULT_DATA_SCHEMA);
type InitialAnalysisArray = z.infer<typeof INITIAL_ANALYSIS_SCHEMA>;

const SYSTEM_PROMPT = `You are an expert fact-checker and debunking expert analyzing political statements.

Your task is to process the input text and return structured JSON according to the schema provided. Follow these rules:
- Evaluate the veracity of the statement(s) in the input.
- Provide clear reasoning for each claim. Each reasoning must not be empty.
- Extract zero, one, or more claims per input. Each extracted claim must be an item in the returned array.
- Include additional flags if applicable: ${FACT_CHECK_RESULT_SCHEMA.shape.data.shape.flags.unwrap().unwrap().options.join(', ')}.
- Preserve the original language of the input.
- Provide a reasoningConfidence value varying between 0-1 (float) for each claim. Examples: 1 = 100%, 0.5 = 50%, etc.
- Consider the previous context provided for more accurate assessment.
- Return only valid JSON. No markdown, code blocks, or explanatory text. Start directly with {{ and end with }}.
- Follow strictly the JSON structure defined in "JSON SCHEMA" block bellow. Do not add fields not specified.

JSON SCHEMA:
\`\`\`json
${sanitizeJsonForTemplate(z.toJSONSchema(INITIAL_ANALYSIS_SCHEMA))}
\`\`\`

PREVIOUS CONTEXT:
{context}

INPUT:
{input}
`;

const PROMPT_TEMPLATE = ChatPromptTemplate.fromTemplate(SYSTEM_PROMPT);

export type BasicAnalysisArgs = {
  factCheckReq: FactCheckRequest;
  memory: BaseChatMemory;
  chunks: string[];
};

export async function* basicAnalysis({
  factCheckReq,
  chunks,
  memory,
}: BasicAnalysisArgs) {
  const chain = RunnableSequence.from([
    {
      input: (i: ChainInput) => i.input,
      context: async () => {
        const mem = (await memory.loadMemoryVariables({})) as
          | ChainVars
          | undefined;
        return mem?.context ?? '';
      },
    },
    PROMPT_TEMPLATE,
    ApplicationLLM,
  ]);

  for (let i = 0, currSeq = 0; i < chunks.length; i++) {
    const response = await chain.invoke({ input: chunks[i] });

    let initialAnalysisArr: InitialAnalysisArray;
    try {
      initialAnalysisArr = INITIAL_ANALYSIS_SCHEMA.parse(
        JSON.parse(response.text),
      );
    } catch {
      throw new ParsingError(
        `Falha ao parsear JSON do chunk ${i.toString()}: ${response.text}`,
      );
    }

    for (const r of initialAnalysisArr) {
      yield FACT_CHECK_RESULT_SCHEMA.parse({
        data: r,
        meta: {
          fingerprint: factCheckReq.fingerprint,
          chunk: i,
          seq: currSeq++,
        },
      });
    }
  }
}
