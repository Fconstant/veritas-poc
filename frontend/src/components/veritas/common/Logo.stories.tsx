import type { Story, StoryDefault } from "@ladle/react";
import Logo from "./Logo";

export default {
  title: "veritas/common/Logo",
} satisfies StoryDefault;

export const Default: Story = () => <Logo />;
export const Large: Story = () => <Logo size="lg" />;
export const Small: Story = () => <Logo size="sm" />;


