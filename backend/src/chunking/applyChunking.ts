import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
});

export async function applyChunking(transcript: string) {
  const chunks = await splitter.splitText(transcript);
  return chunks;
}

