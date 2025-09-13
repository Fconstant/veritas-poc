// Simple text chunking implementation to avoid LangChain dependency issues
export async function applyChunking(transcript: string): Promise<string[]> {
  const chunkSize = 1000;
  const chunkOverlap = 200;
  
  if (transcript.length <= chunkSize) {
    return [transcript];
  }
  
  const chunks: string[] = [];
  let start = 0;
  
  while (start < transcript.length) {
    let end = start + chunkSize;
    
    // Try to break at sentence boundaries
    if (end < transcript.length) {
      const lastPeriod = transcript.lastIndexOf('.', end);
      const lastExclamation = transcript.lastIndexOf('!', end);
      const lastQuestion = transcript.lastIndexOf('?', end);
      
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
      
      if (lastSentenceEnd > start + chunkSize * 0.5) {
        end = lastSentenceEnd + 1;
      }
    }
    
    const chunk = transcript.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    start = end - chunkOverlap;
    if (start >= transcript.length) break;
  }
  
  return chunks;
}

