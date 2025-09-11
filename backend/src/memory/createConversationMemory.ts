import { ApplicationLLM } from '#/llm/index.js';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ConversationSummaryMemory } from 'langchain/memory';

export function createConversationMemory(model: BaseChatModel = ApplicationLLM) {

  const memory = new ConversationSummaryMemory({
    llm: model,
    inputKey: "input",
    memoryKey: "context",
  });

  return memory;
}
