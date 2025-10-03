import type { Story, StoryDefault } from "@ladle/react";
import PulsingIcon from "./PulsingIcon";

export default {
  title: "Shared/PulsingIcon",
} satisfies StoryDefault;

// Story básica com todos os tipos de ícones
export const AllVariants: Story = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Pulsing Icon - All Variants</h3>
        <p className="text-sm text-muted-foreground">
          Diferentes tipos de ícones com animação de pulsação
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <PulsingIcon icon="check" animate={true} />
          <span>Check (pulsing)</span>
        </div>
        
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <PulsingIcon icon="check" animate={false} />
          <span>Check (static)</span>
        </div>
        
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <PulsingIcon icon="loader" animate={true} />
          <span>Loader (spinning)</span>
        </div>
        
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <PulsingIcon icon="alert" animate={true} />
          <span>Alert (pulsing)</span>
        </div>
        
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <PulsingIcon icon="error" animate={true} />
          <span>Error (pulsing)</span>
        </div>
      </div>
    </div>
  );
};

// Story com diferentes tamanhos
export const DifferentSizes: Story = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Different Sizes</h3>
        <p className="text-sm text-muted-foreground">
          Ícones em diferentes tamanhos
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <PulsingIcon icon="check" size="sm" animate={true} />
          <span>Small</span>
        </div>
        
        <div className="flex items-center gap-2">
          <PulsingIcon icon="check" size="md" animate={true} />
          <span>Medium</span>
        </div>
        
        <div className="flex items-center gap-2">
          <PulsingIcon icon="check" size="lg" animate={true} />
          <span>Large</span>
        </div>
      </div>
    </div>
  );
};

// Story com cores customizadas
export const CustomColors: Story = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Colors</h3>
        <p className="text-sm text-muted-foreground">
          Ícones com cores personalizadas
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <PulsingIcon icon="check" color="#10b981" animate={true} />
          <span>Green</span>
        </div>
        
        <div className="flex items-center gap-2">
          <PulsingIcon icon="alert" color="#f59e0b" animate={true} />
          <span>Orange</span>
        </div>
        
        <div className="flex items-center gap-2">
          <PulsingIcon icon="error" color="#ef4444" animate={true} />
          <span>Red</span>
        </div>
        
        <div className="flex items-center gap-2">
          <PulsingIcon icon="loader" color="#3b82f6" animate={true} />
          <span>Blue</span>
        </div>
      </div>
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
          Como aparece em contextos reais de verificação
        </p>
      </div>

      {/* Header de verificação */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <PulsingIcon icon="check" size="md" animate={true} />
          <div className="text-lg font-semibold">
            Verificando...
          </div>
        </div>
      </div>

      {/* Status de loading */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <PulsingIcon icon="loader" size="sm" animate={true} />
          <div className="text-sm">
            Conectando com servidor...
          </div>
        </div>
      </div>

      {/* Status de erro */}
      <div className="bg-white border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <PulsingIcon icon="error" size="sm" animate={true} />
          <div className="text-sm text-red-600">
            Erro na conexão
          </div>
        </div>
      </div>
    </div>
  );
};
