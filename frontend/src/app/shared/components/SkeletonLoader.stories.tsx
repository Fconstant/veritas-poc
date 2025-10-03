import type { Story, StoryDefault } from "@ladle/react";
import SkeletonLoader, { ResultCardSkeleton } from "./SkeletonLoader";

export default {
  title: "Shared/SkeletonLoader",
} satisfies StoryDefault;

// Story básica com todas as variantes
export const AllVariants: Story = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Skeleton Loader - All Variants</h3>
        <p className="text-sm text-muted-foreground">
          Diferentes tipos de skeleton loading
        </p>
      </div>

      <div className="space-y-4">
        {/* Card variant */}
        <div>
          <h4 className="text-sm font-medium mb-2">Card Variant</h4>
          <SkeletonLoader variant="card" />
        </div>

        {/* Text variant */}
        <div>
          <h4 className="text-sm font-medium mb-2">Text Variant</h4>
          <SkeletonLoader variant="text" lines={3} />
        </div>

        {/* Button variant */}
        <div>
          <h4 className="text-sm font-medium mb-2">Button Variant</h4>
          <SkeletonLoader variant="button" />
        </div>

        {/* Circle variant */}
        <div>
          <h4 className="text-sm font-medium mb-2">Circle Variant</h4>
          <SkeletonLoader variant="circle" />
        </div>
      </div>
    </div>
  );
};

// Story com diferentes configurações de texto
export const TextVariants: Story = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Text Variants</h3>
        <p className="text-sm text-muted-foreground">
          Diferentes configurações de skeleton de texto
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">1 linha</h4>
          <SkeletonLoader variant="text" lines={1} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">3 linhas</h4>
          <SkeletonLoader variant="text" lines={3} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">5 linhas</h4>
          <SkeletonLoader variant="text" lines={5} />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Largura customizada</h4>
          <SkeletonLoader variant="text" lines={2} width="200px" />
        </div>
      </div>
    </div>
  );
};

// Story com ResultCardSkeleton
export const ResultCardSkeletons: Story = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Result Card Skeletons</h3>
        <p className="text-sm text-muted-foreground">
          Skeleton loading específico para cards de resultado
        </p>
      </div>

      <ResultCardSkeleton />
    </div>
  );
};

// Story em contexto de uso
export const InContext: Story = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">In Context</h3>
        <p className="text-sm text-muted-foreground">
          Como aparece em contextos reais de loading
        </p>
      </div>

      {/* Simulação de painel de resultados */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-lg font-semibold">Verificando...</div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <ResultCardSkeleton />
        </div>
      </div>

      {/* Simulação de lista de texto */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-3">Carregando conteúdo...</h4>
        <SkeletonLoader variant="text" lines={4} />
      </div>

      {/* Simulação de botões loading */}
      <div className="flex gap-4">
        <SkeletonLoader variant="button" width="120px" />
        <SkeletonLoader variant="button" width="100px" />
      </div>
    </div>
  );
};

// Story com comparação antes/depois
export const BeforeAfter: Story = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Before vs After</h3>
        <p className="text-sm text-muted-foreground">
          Comparação entre skeleton loading e conteúdo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skeleton state */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-600">Loading State</h4>
          <ResultCardSkeleton />
        </div>

        {/* Real content */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-600">Loaded Content</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Verified</span>
              </div>
              <div className="text-sm text-gray-500">85% confidence</div>
            </div>
            <p className="text-sm text-gray-900">
              Este é um exemplo de resultado verificado que aparece após o loading.
            </p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-600">
                <strong>Explanation:</strong> A verificação foi concluída com sucesso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
