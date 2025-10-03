import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import ResultCard, { ResultData } from "./ResultCard";
// AVISO: ResultCard está desativado. As histórias abaixo são mantidas para referência
// e podem ser removidas quando migrarmos definitivamente para status globais.

export default {
  title: "Results/ResultCard",
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

export const DisabledNotice: Story = () => (
  <div className="p-6 max-w-2xl">
    <ResultCard result={sampleResults[0]} />
  </div>
);

// As histórias específicas foram descontinuadas temporariamente.

// export const Pending ...

// export const Loading ...

// export const AllStates ...

// export const MultipleResults ...

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
          Componente desativado — exibindo apenas o aviso acima
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
        <p className="text-muted-foreground text-center py-8">
          ResultCard desativado no projeto atual
        </p>
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Total de resultados:</strong> {results.length}</p>
      </div>
    </div>
  );
};
