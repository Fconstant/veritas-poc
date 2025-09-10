import type { Story, StoryDefault } from "@ladle/react";
import AlphaBadge from "./AlphaBadge";

export default {
  title: "veritas/common/AlphaBadge",
} satisfies StoryDefault;

export const Default: Story = () => <AlphaBadge />;
export const Outline: Story = () => <AlphaBadge variant="outline" />;


