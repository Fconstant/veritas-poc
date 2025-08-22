import type { Story, StoryDefault } from "@ladle/react";
import { Button } from "./button";

export default {
  title: "ui/Button",
} satisfies StoryDefault;

export const Primary: Story = () => <Button>Click me</Button>;
