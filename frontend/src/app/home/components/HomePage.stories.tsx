import type { Story, StoryDefault } from "@ladle/react";
import React from "react";
import HomePage from "./HomePage";

// Mock do router para o Ladle
const mockRouter = {
  push: (url: string) => {
    console.log(`Mock router push: ${url}`);
  },
};

export default {
  title: "Pages/Home",
} satisfies StoryDefault;

// Story completa da Home Page
export const Default: Story = () => (
  <div className="w-full h-screen overflow-hidden">
    <HomePage router={mockRouter} />
  </div>
);

// Story mobile
export const Mobile: Story = () => (
  <div className="w-[375px] h-screen overflow-hidden mx-auto border border-gray-300">
    <HomePage router={mockRouter} />
  </div>
);

