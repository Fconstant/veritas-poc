import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import ResultCard, { ResultData } from "./ResultCard";

export default {
  title: "veritas/results/ResultCard",
} satisfies StoryDefault;

const sampleResults: ResultData[] = [
  {
    id: '1',
    text: 'Este é um texto de exemplo para demonstração',
    confidence: 0.95,
    status: 'verified',
    sources: ['https://example.com/source1', 'https://example.com/source2'],
    explanation: 'Esta afirmação foi verificada através de múltiplas fontes confiáveis.'
  },
  {
    id: '2',
    text: 'da página de resultados',
    confidence: 0.87,
    status: 'verified',
    sources: ['https://example.com/source2'],
    explanation: 'Confirmado por fontes oficiais.'
  },
  {
    id: '3',
    text: 'O texto será processado e verificado',
    confidence: 0.92,
    status: 'verified',
    sources: ['https://example.com/source3'],
    explanation: 'Processo de verificação concluído com sucesso.'
  },
  {
    id: '4',
    text: 'Esta afirmação é falsa',
    confidence: 0.78,
    status: 'unverified',
    sources: ['https://example.com/source4'],
    explanation: 'Esta informação não pôde ser verificada por fontes confiáveis.'
  },
  {
    id: '5',
    text: 'Esta informação está sendo verificada',
    confidence: 0.0,
    status: 'pending',
    sources: [],
    explanation: 'Verificação em andamento...'
  }
];

export const Verified: Story = () => (
  <div className="p-6 max-w-2xl">
    <ResultCard result={sampleResults[0]} />
  </div>
);

export const Unverified: Story = () => (
  <div className="p-6 max-w-2xl">
    <ResultCard result={sampleResults[3]} />
  </div>
);

export const Pending: Story = () => (
  <div className="p-6 max-w-2xl">
    <ResultCard result={sampleResults[4]} />
  </div>
);

export const Loading: Story = () => (
  <div className="p-6 max-w-2xl">
    <ResultCard 
      result={{
        id: 'loading',
        text: '',
        confidence: 0,
        status: 'loading'
      }} 
    />
  </div>
);

export const AllStates: Story = () => (
  <div className="p-6 space-y-4 max-w-2xl">
    <div>
      <h3 className="text-sm font-medium mb-2">Loading State</h3>
      <ResultCard 
        result={{
          id: 'loading',
          text: '',
          confidence: 0,
          status: 'loading'
        }} 
      />
    </div>
    
    <div>
      <h3 className="text-sm font-medium mb-2">Verified State</h3>
      <ResultCard result={sampleResults[0]} />
    </div>
    
    <div>
      <h3 className="text-sm font-medium mb-2">Unverified State</h3>
      <ResultCard result={sampleResults[3]} />
    </div>
    
    <div>
      <h3 className="text-sm font-medium mb-2">Pending State</h3>
      <ResultCard result={sampleResults[4]} />
    </div>
  </div>
);

export const MultipleResults: Story = () => (
  <div className="p-6 space-y-4 max-w-2xl">
    {sampleResults.map((result) => (
      <ResultCard key={result.id} result={result} />
    ))}
  </div>
);

export const Interactive: Story = () => {
  const [results, setResults] = useState<ResultData[]>([]);

  const addResult = (status: ResultData['status']) => {
    const newResult: ResultData = {
      id: `result-${Date.now()}`,
      text: `Novo resultado ${status} - ${new Date().toLocaleTimeString()}`,
      confidence: Math.random(),
      status,
      sources: ['https://example.com/source'],
      explanation: `Explicação para resultado ${status}`
    };
    setResults(prev => [...prev, newResult]);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">ResultCard Interativo</h3>
        <p className="text-sm text-muted-foreground">
          Adicione diferentes tipos de resultados para testar os estados
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => addResult('verified')}
          className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
        >
          Adicionar Verificado
        </button>
        <button 
          onClick={() => addResult('unverified')}
          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
        >
          Adicionar Não Verificado
        </button>
        <button 
          onClick={() => addResult('pending')}
          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
        >
          Adicionar Pendente
        </button>
        <button 
          onClick={() => addResult('loading')}
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
        >
          Adicionar Loading
        </button>
        <button 
          onClick={clearResults}
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
        >
          Limpar Todos
        </button>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum resultado adicionado ainda
          </p>
        ) : (
          results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Total de resultados:</strong> {results.length}</p>
      </div>
    </div>
  );
};
