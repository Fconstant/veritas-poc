import type { Story, StoryDefault } from "@ladle/react";
import Header from "./Header";

export default {
  title: "veritas/layout/Header",
} satisfies StoryDefault;

export const Default: Story = () => <Header />;
export const WithoutTagline: Story = () => <Header showTagline={false} />;


