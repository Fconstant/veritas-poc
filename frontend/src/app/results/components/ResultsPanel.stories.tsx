import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import ResultsPanel from "./ResultsPanel";
import { ResultData } from "./ResultCard";

export default {
  title: "Results/ResultsPanel",
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
  <div className="w-[664px] rounded-lg">
    <ResultsPanel
      status="loading"
      results={[]}
      onCancel={() => console.log("Cancel clicked")}
    />
  </div>
);

export const Partial: Story = () => (
  <div className="w-[664px] rounded-lg">
    <ResultsPanel
      status="partial"
      results={sampleResults.slice(0, 1)}
      onCancel={() => console.log("Cancel clicked")}
    />
  </div>
);

export const Complete: Story = () => (
  <div className="w-[664px] rounded-lg">
    <ResultsPanel
      status="complete"
      results={sampleResults}
      onCopyPlainText={() => console.log("Copy Plain Text clicked")}
    />
  </div>
);

export const Scrollable: Story = () => {
  // Criar muitos resultados para demonstrar rolagem
  const manyResults = Array.from({ length: 10 }, (_, i) => ({
    id: `result-${i + 1}`,
    text: `Este é o resultado número ${i + 1} para demonstrar o comportamento de rolagem quando há muitos resultados.`,
    confidence: 0.85 + (i * 0.01),
    status: 'verified' as const,
    sources: [`https://example.com/source${i + 1}`],
    explanation: `Esta é a explicação detalhada para o resultado ${i + 1}, incluindo análise e verificação das fontes.`
  }));

  return (
    <div className="space-y-6 w-[664px]">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Comportamento de Rolagem</h3>
        <p className="text-sm text-muted-foreground">
          Demonstração do comportamento quando há muitos resultados e o painel precisa de rolagem
        </p>
      </div>

      <div className="h-screen rounded-lg">
        <ResultsPanel
          status="complete"
          results={manyResults}
          onCopyPlainText={() => console.log("Copy Plain Text clicked")}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Estado:</strong> Complete (10 resultados)</p>
        <p><strong>Comportamento:</strong> Rolagem automática quando necessário</p>
        <p><strong>Altura máxima:</strong> Limitada à viewport disponível</p>
      </div>
    </div>
  );
};

export const Error: Story = () => (
  <div className="space-y-6 w-[664px]">
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Variante de Erro</h3>
      <p className="text-sm text-muted-foreground">
        Painel com estado de erro - borda vermelha, ícone AlertTriangle e botão "Try again"
      </p>
    </div>

    <div className="rounded-lg">
      <ResultsPanel
        status="error"
        results={[]}
        onRetry={() => console.log("Retry clicked")}
      />
    </div>

    <div className="text-xs text-muted-foreground">
      <p><strong>Estado:</strong> Error</p>
      <p><strong>Borda:</strong> Vermelha (#cb1f1f)</p>
      <p><strong>Design:</strong> Baseado no Figma node 332-7483</p>
    </div>
  </div>
);

export const Empty: Story = () => (
  <div className="space-y-6 w-[664px]">
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Nenhum Resultado Encontrado</h3>
      <p className="text-sm text-muted-foreground">
        Estado quando a verificação termina mas nenhum resultado é encontrado
      </p>
    </div>

    <div className="rounded-lg">
      <ResultsPanel
        status="complete"
        results={[]}
        onCopyPlainText={() => console.log("Copy Plain Text clicked")}
      />
    </div>

    <div className="text-xs text-muted-foreground">
      <p><strong>Estado:</strong> Complete (sem resultados)</p>
      <p><strong>Design:</strong> Card roxo claro com ícone CheckCircle</p>
      <p><strong>Figma:</strong> Baseado no node 417-15635</p>
    </div>
  </div>
);

export const Interactive: Story = () => {
  const [status, setStatus] = useState<'loading' | 'partial' | 'complete' | 'error'>('loading');
  const [results, setResults] = useState<ResultData[]>([]);
  const [lastAction, setLastAction] = useState<string>("");

  const simulateLoading = () => {
    setStatus('loading');
    setResults([]);
    setLastAction("Iniciando carregamento...");
    
    setTimeout(() => {
      setStatus('partial');
      setResults([sampleResults[0]]);
      setLastAction("Carregamento parcial...");
    }, 2000);
    
    setTimeout(() => {
      setStatus('complete');
      setResults(sampleResults);
      setLastAction("Carregamento completo!");
    }, 4000);
  };

  const simulateError = () => {
    setStatus('error');
    setResults([]);
    setLastAction("Erro simulado");
  };

  const reset = () => {
    setStatus('loading');
    setResults([]);
    setLastAction("Reset executado");
  };

  const handleCancel = () => {
    setLastAction("Cancel clicked");
    console.log("Cancel action triggered");
  };

  const handleRetry = () => {
    setLastAction("Retry clicked");
    setStatus('loading');
    console.log("Retry action triggered");
  };

  const handleCopy = () => {
    setLastAction("Copy Plain Text clicked");
    console.log("Copy action triggered");
  };

  return (
    <div className="space-y-6 w-[664px]">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">ResultsPanel Interativo</h3>
        <p className="text-sm text-muted-foreground">
          Simule diferentes estados do painel de resultados. Agora usa o ResultsHeader integrado.
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

      <div className="rounded-lg">
        <ResultsPanel
          status={status}
          results={results}
          onCancel={handleCancel}
          onRetry={handleRetry}
          onCopyPlainText={handleCopy}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Status atual:</strong> {status}</p>
        <p><strong>Resultados:</strong> {results.length}</p>
        <p><strong>Última ação:</strong> {lastAction || "Nenhuma"}</p>
      </div>
    </div>
  );
};
