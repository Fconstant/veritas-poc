import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import { Textarea } from "./textarea";

export default {
  title: "ui/Textarea",
} satisfies StoryDefault;

export const Default: Story = () => (
  <Textarea placeholder="Escreva sua mensagem..." />
);

export const Disabled: Story = () => (
  <Textarea placeholder="Desabilitado" disabled />
);

export const Placeholder: Story = () => (
  <Textarea placeholder="Ex.: Cole aqui um texto para análise" />
);

export const Error: Story = () => (
  <div className="space-y-1.5">
    <Textarea aria-invalid placeholder="Mensagem com erro" />
    <p className="text-xs text-destructive">Mensagem de erro explicativa.</p>
  </div>
);

export const WithCounter: Story = () => {
  const [value, setValue] = useState("");
  const max = 200;

  return (
    <div className="space-y-1.5">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Com contador (máx. 200)"
        maxLength={max}
      />
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {value.length}/{max}
        </span>
      </div>
    </div>
  );
};
