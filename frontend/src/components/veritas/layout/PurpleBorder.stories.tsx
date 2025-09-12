import type { Story, StoryDefault } from "@ladle/react";
import PurpleBorder from "./PurpleBorder";

export default {
  title: "veritas/layout/PurpleBorder",
} satisfies StoryDefault;

export const Default: Story = () => (
  <PurpleBorder>
    <div className="h-24 flex items-center justify-center">Borda padrão</div>
  </PurpleBorder>
);

export const Thick: Story = () => (
  <PurpleBorder variant="thick">
    <div className="h-24 flex items-center justify-center">Borda grossa</div>
  </PurpleBorder>
);

export const Dashed: Story = () => (
  <PurpleBorder variant="dashed">
    <div className="h-24 flex items-center justify-center">Tracejada</div>
  </PurpleBorder>
);

export const Gradient: Story = () => (
  <PurpleBorder variant="gradient">
    <div className="h-24 flex items-center justify-center">Gradiente</div>
  </PurpleBorder>
);



