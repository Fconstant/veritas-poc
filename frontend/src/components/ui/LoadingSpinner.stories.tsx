import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default {
  title: "ui/LoadingSpinner",
} satisfies StoryDefault;

export const Default: Story = () => (
  <div className="p-6">
    <LoadingSpinner />
  </div>
);

export const WithText: Story = () => (
  <div className="p-6">
    <LoadingSpinner showText text="Carregando dados..." />
  </div>
);

export const DifferentSizes: Story = () => (
  <div className="p-6 space-y-4">
    <div>
      <h3 className="text-sm font-medium mb-2">Small</h3>
      <LoadingSpinner size="sm" showText text="Small spinner" />
    </div>
    <div>
      <h3 className="text-sm font-medium mb-2">Medium</h3>
      <LoadingSpinner size="md" showText text="Medium spinner" />
    </div>
    <div>
      <h3 className="text-sm font-medium mb-2">Large</h3>
      <LoadingSpinner size="lg" showText text="Large spinner" />
    </div>
  </div>
);

export const CustomText: Story = () => (
  <div className="p-6">
    <LoadingSpinner showText text="Verificando fatos..." />
  </div>
);
