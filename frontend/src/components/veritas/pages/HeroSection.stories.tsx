import type { Story, StoryDefault } from "@ladle/react";
import { HeroSection } from "./HeroSection";

export default {
  title: "veritas/pages/HeroSection",
} satisfies StoryDefault;

// Story padrão
export const Default: Story = () => (
  <div className="w-[629px] h-[315px] p-4 bg-white">
    <HeroSection />
  </div>
);

// Story com container maior para visualização
export const FullWidth: Story = () => (
  <div className="w-full max-w-4xl p-8 bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea]">
    <div className="w-[629px] h-[315px]">
      <HeroSection />
    </div>
  </div>
);

// Story responsiva
export const Responsive: Story = () => (
  <div className="w-full p-4 bg-white">
    <div className="max-w-2xl mx-auto">
      <HeroSection className="w-full" />
    </div>
  </div>
);
