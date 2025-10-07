import type { Story, StoryDefault } from "@ladle/react";
import APIsRegistrationFlow from "./APIsRegistrationFlow";

export default {
  title: "Shared/APIsRegistrationFlow",
} satisfies StoryDefault;

export const EmptyState: Story = () => (
  <div className="bg-neutral-100 min-h-screen flex items-center justify-center p-8">
    <APIsRegistrationFlow
      onComplete={(keys) => console.log("Chaves confirmadas:", keys)}
    />
  </div>
);

export const WithInitialKeys: Story = () => (
  <div className="bg-neutral-100 min-h-screen flex items-center justify-center p-8">
    <APIsRegistrationFlow
      initialKeys={{ gemini: "AI1234567890123456789012345678901234567", tavily: "tvly-demo-key-1234567890" }}
      onComplete={(keys) => console.log("Revisão concluída:", keys)}
    />
  </div>
);
