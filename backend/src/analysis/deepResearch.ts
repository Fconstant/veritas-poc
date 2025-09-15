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
- SEMPRE inclua uma seção "Fontes:" no final com as URLs encontradas nos resultados de pesquisa.
- Liste cada URL em uma linha separada.
- Use apenas URLs que começam com http:// ou https://

Formato obrigatório:
[Seu resumo aqui]

Fontes:
https://exemplo.com/fonte1
https://exemplo.com/fonte2
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
    console.log('🔍 Output do LLM para pesquisa:', output);
    
    const [summaryPart, sourcesPart] = output.split("Fontes:");
    const sources = sourcesPart
      ? sourcesPart
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .filter((s) => s.startsWith('http')) // Filtrar apenas URLs válidas
      : [];
    
    console.log('📋 Parsing resultado:', {
      summaryLength: summaryPart.trim().length,
      sourcesCount: sources.length,
      sources: sources
    });
    
    return {
      summary: summaryPart.trim(),
      sources,
    };
  },
]);

export function deepResearch(query: string) {
  return researchChain.invoke({ query });
}
