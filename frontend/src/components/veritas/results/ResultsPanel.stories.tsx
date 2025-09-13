import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import ResultsPanel from "./ResultsPanel";
import { ResultData } from "./ResultCard";

export default {
  title: "veritas/results/ResultsPanel",
} satisfies StoryDefault;

const sampleResults: ResultData[] = [
  {
    id: '1',
    text: 'Este é um texto de exemplo para demonstração',
    confidence: 0.95,
    status: 'verified',
    sources: ['https://example.com/source1'],
    explanation: 'Esta afirmação foi verificada através de múltiplas fontes confiáveis.'
  },
  {
    id: '2',
    text: 'da página de resultados',
    confidence: 0.87,
    status: 'verified',
    sources: ['https://example.com/source2'],
    explanation: 'Confirmado por fontes oficiais.'
  }
];

export const Loading: Story = () => (
  <div className="h-96 border border-gray-200 rounded-lg">
    <ResultsPanel
      status="loading"
      results={[]}
    />
  </div>
);

export const Partial: Story = () => (
  <div className="h-96 border border-gray-200 rounded-lg">
    <ResultsPanel
      status="partial"
      results={sampleResults.slice(0, 1)}
    />
  </div>
);

export const Complete: Story = () => (
  <div className="h-96 border border-gray-200 rounded-lg">
    <ResultsPanel
      status="complete"
      results={sampleResults}
    />
  </div>
);

export const Error: Story = () => (
  <div className="h-96 border border-gray-200 rounded-lg">
    <ResultsPanel
      status="error"
      results={[]}
    />
  </div>
);

export const Empty: Story = () => (
  <div className="h-96 border border-gray-200 rounded-lg">
    <ResultsPanel
      status="complete"
      results={[]}
    />
  </div>
);

export const Interactive: Story = () => {
  const [status, setStatus] = useState<'loading' | 'partial' | 'complete' | 'error'>('loading');
  const [results, setResults] = useState<ResultData[]>([]);

  const simulateLoading = () => {
    setStatus('loading');
    setResults([]);
    
    setTimeout(() => {
      setStatus('partial');
      setResults([sampleResults[0]]);
    }, 2000);
    
    setTimeout(() => {
      setStatus('complete');
      setResults(sampleResults);
    }, 4000);
  };

  const simulateError = () => {
    setStatus('error');
    setResults([]);
  };

  const reset = () => {
    setStatus('loading');
    setResults([]);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">ResultsPanel Interativo</h3>
        <p className="text-sm text-muted-foreground">
          Simule diferentes estados do painel de resultados
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={simulateLoading}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
        >
          Simular Carregamento
        </button>
        <button 
          onClick={simulateError}
          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
        >
          Simular Erro
        </button>
        <button 
          onClick={reset}
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
        >
          Reset
        </button>
      </div>

      <div className="h-96 border border-gray-200 rounded-lg">
        <ResultsPanel
          status={status}
          results={results}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Status atual:</strong> {status}</p>
        <p><strong>Resultados:</strong> {results.length}</p>
      </div>
    </div>
  );
};
