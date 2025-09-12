import type { Story, StoryDefault } from "@ladle/react";
import { HomePage } from "./HomePage";

export default {
  title: "veritas/pages/HomePage",
} satisfies StoryDefault;

// Story completa da Home Page
export const Default: Story = () => (
  <div className="w-[1440px] h-[800px] overflow-hidden">
    <HomePage />
  </div>
);

// Story com container responsivo
export const Responsive: Story = () => (
  <div className="w-full max-w-7xl mx-auto h-screen overflow-hidden">
    <HomePage />
  </div>
);

// Story em tamanho menor para visualização
export const Compact: Story = () => (
  <div className="w-[1200px] h-[600px] overflow-hidden">
    <HomePage />
  </div>
);
