import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { FACT_CHECK_RESULT_SCHEMA, FactCheckResult, SEARCH_RESULT_SCHEMA, SearchResult } from '../types.js';
import { analyzeStatement } from './analyseStatement.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import * as Consts from '../constants.js';

// Web search function
const getWebSearchQuery = (query: string): SearchResult[] => {
  try {
    // Mock search - replace with real API like SerpAPI
    return [
      SEARCH_RESULT_SCHEMA.parse({
        title: `Search result for: ${query.slice(0, 30)}...`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Mock search result snippet for verification of: ${query.slice(0, 50)}...`
      })
    ];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};


// Enhanced analysis with external sources
export const analyzeWithSources = async (
  text: string,
  model: BaseChatModel
): Promise<Omit<FactCheckResult, 'originalText'>> => {
  const basicAnalysis = await analyzeStatement(text, model);

  // If confidence is low, search for external sources
  if (basicAnalysis.confidence < Consts.CONFIDENCE_CUTOFF) {
    const searchResults = getWebSearchQuery(text.slice(0, 100));

    if (searchResults.length > 0) {
      const contextPrompt = `
        Original statement: "${text}"

        Search results for verification:
        ${searchResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

        Re-analyze the statement with this additional context and provide updated assessment.
      `;

      try {
        const enhancedResponse = await model.invoke([
          new SystemMessage('You are a fact-checker with access to search results for verification.'),
          new HumanMessage(contextPrompt)
        ]);

        const enhancedResult = FACT_CHECK_RESULT_SCHEMA.parse(JSON.parse(enhancedResponse.content as string));
        return {
          ...enhancedResult,
          sources: searchResults.map(r => r.url),
        };
      } catch {
        return {
          ...basicAnalysis,
          sources: searchResults.map(r => r.url),
        };
      }
    }
  }

  return basicAnalysis;
};
