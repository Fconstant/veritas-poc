import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { TavilySearch, TavilySearchResponse } from '@langchain/tavily';
import { ApplicationLLM } from '#/llm/index.js';

// Tipagem explícita para entrada e saída
export type DeepResearchInput = {
  query: string;
}

export type DeepResearchOutput = {
  summary: string;
  sources: string[];
}

// Ferramenta de busca Tavily
const searchTool = new TavilySearch({
  maxResults: 5,
});

// Prompt para síntese da pesquisa
const researchPrompt = PromptTemplate.fromTemplate(`
You are an expert fact-checker and debunking expert analyzing political statements.
Resuma as informações encontradas sobre a seguinte questão: "{query}".

Use os trechos de pesquisa abaixo:
{search_results}

Regras:
- Seja objetivo, máximo 2 parágrafos.
- Inclua sempre uma seção "Fontes" listando as URLs relevantes.
`);


const researchChain = RunnableSequence.from<DeepResearchInput, DeepResearchOutput>([
  {
    query: (input) => input.query,
    search_results: async (input) => {
      const response = await searchTool.invoke({ query: input.query }) as TavilySearchResponse;
      return JSON.stringify(response, null, 2);
    },
  },
  researchPrompt,
  ApplicationLLM,
  new StringOutputParser(),
  // Parser final para separar resumo e fontes
  (output: string) => {
    const [summaryPart, sourcesPart] = output.split("Fontes:");
    const sources = sourcesPart
      ? sourcesPart
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];
    return {
      summary: summaryPart.trim(),
      sources,
    };
  },
]);

export function deepResearch(query: string) {
  return researchChain.invoke({ query });
}
