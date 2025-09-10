import type { Story, StoryDefault } from "@ladle/react";
import Tagline from "./Tagline";

export default {
  title: "veritas/common/Tagline",
} satisfies StoryDefault;

export const Default: Story = () => <Tagline />;
export const Large: Story = () => <Tagline size="lg" />;
export const Small: Story = () => <Tagline size="sm" />;


