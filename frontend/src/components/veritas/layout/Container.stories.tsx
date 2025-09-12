import type { Story, StoryDefault } from "@ladle/react";
import Container from "./Container";

export default {
  title: "veritas/layout/Container",
} satisfies StoryDefault;

export const Default: Story = () => (
  <Container>
    <div className="h-24 flex items-center justify-center">Conteúdo</div>
  </Container>
);

export const GradientBorder: Story = () => (
  <Container borderVariant="gradient">
    <div className="h-24 flex items-center justify-center">Com gradiente</div>
  </Container>
);



