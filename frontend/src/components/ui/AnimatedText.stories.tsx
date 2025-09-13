import type { Story, StoryDefault } from "@ladle/react";
import AnimatedText from "./AnimatedText";

export default {
  title: "ui/AnimatedText",
} satisfies StoryDefault;

export const Default: Story = () => (
  <div className="p-6">
    <AnimatedText text="Verificando" />
  </div>
);

export const CustomInterval: Story = () => (
  <div className="p-6 space-y-4">
    <div>
      <h3 className="text-sm font-medium mb-2">Fast (200ms)</h3>
      <AnimatedText text="Carregando" interval={200} />
    </div>
    <div>
      <h3 className="text-sm font-medium mb-2">Normal (500ms)</h3>
      <AnimatedText text="Processando" interval={500} />
    </div>
    <div>
      <h3 className="text-sm font-medium mb-2">Slow (1000ms)</h3>
      <AnimatedText text="Analisando" interval={1000} />
    </div>
  </div>
);

export const DifferentTexts: Story = () => (
  <div className="p-6 space-y-4">
    <div>
      <AnimatedText text="Lendo Texto" />
    </div>
    <div>
      <AnimatedText text="Verificando Fatos" />
    </div>
    <div>
      <AnimatedText text="Processando Dados" />
    </div>
  </div>
);
