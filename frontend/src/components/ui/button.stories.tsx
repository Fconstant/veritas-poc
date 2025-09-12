import type { Story, StoryDefault } from "@ladle/react";
import { Button } from "./button";
import { Play } from "lucide-react";

export default {
  title: "ui/Button",
} satisfies StoryDefault;

export const Filled_Default_Enabled: Story = () => (
  <Button>
    <Play className="size-4" /> Filled Enabled
  </Button>
);

export const Filled_Default_Disabled: Story = () => (
  <Button disabled>
    <Play className="size-4" /> Filled Disabled
  </Button>
);

export const Filled_SM_Enabled: Story = () => (
  <Button size="sm">
    <Play className="size-4" /> Filled Enabled
  </Button>
);

export const Filled_SM_Disabled: Story = () => (
  <Button size="sm" disabled>
    <Play className="size-4" /> Filled Disabled
  </Button>
);

export const Outlined_Default_Enabled: Story = () => (
  <Button variant="outline">
    <Play className="size-4" /> Outlined Enabled
  </Button>
);

export const Outlined_Default_Disabled: Story = () => (
  <Button variant="outline" disabled>
    <Play className="size-4" /> Outlined Disabled
  </Button>
);

export const Outlined_SM_Enabled: Story = () => (
  <Button variant="outline" size="sm">
    <Play className="size-4" /> Outlined Enabled
  </Button>
);

export const Outlined_SM_Disabled: Story = () => (
  <Button variant="outline" size="sm" disabled>
    <Play className="size-4" /> Outlined Disabled
  </Button>
);

export const Matrix_All: Story = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-6">
      <Button variant="outline" size="sm" disabled>
        <Play className="size-4" /> Outlined Disabled (SM)
      </Button>
      <Button variant="outline" size="sm">
        <Play className="size-4" /> Outlined Enabled (SM)
      </Button>
      <Button variant="outline" size="sm">
        <Play className="size-4" /> Outlined Hover (SM)
      </Button>
    </div>
    <div className="flex items-center gap-6">
      <Button variant="outline" disabled>
        <Play className="size-4" /> Outlined Disabled
      </Button>
      <Button variant="outline">
        <Play className="size-4" /> Outlined Enabled
      </Button>
      <Button variant="outline">
        <Play className="size-4" /> Outlined Hover
      </Button>
    </div>
    <div className="flex items-center gap-6">
      <Button size="sm" disabled>
        <Play className="size-4" /> Filled Disabled (SM)
      </Button>
      <Button size="sm">
        <Play className="size-4" /> Filled Enabled (SM)
      </Button>
      <Button size="sm">
        <Play className="size-4" /> Filled Hover (SM)
      </Button>
    </div>
    <div className="flex items-center gap-6">
      <Button disabled>
        <Play className="size-4" /> Filled Disabled
      </Button>
      <Button>
        <Play className="size-4" /> Filled Enabled
      </Button>
      <Button>
        <Play className="size-4" /> Filled Hover
      </Button>
    </div>
    <p className="text-xs text-foreground/70 mt-2">
      Dica: passe o mouse sobre os botões “Hover” para visualizar o estado de hover.
    </p>
  </div>
);
