import type { Story, StoryDefault } from "@ladle/react";
import HomePage from "./HomePage";

export default {
  title: "veritas/pages/HomePage",
} satisfies StoryDefault;

// Story completa da Home Page
export const Default: Story = () => (
  <div className="w-full h-screen overflow-hidden">
    <HomePage />
  </div>
);

// Story com container responsivo
export const Responsive: Story = () => (
  <div className="w-full h-screen overflow-hidden">
    <HomePage />
  </div>
);

// Story mobile
export const Mobile: Story = () => (
  <div className="w-[375px] h-screen overflow-hidden mx-auto border border-gray-300">
    <HomePage />
  </div>
);

// Story tablet
export const Tablet: Story = () => (
  <div className="w-[768px] h-screen overflow-hidden mx-auto border border-gray-300">
    <HomePage />
  </div>
);
