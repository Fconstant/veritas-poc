import type { Story, StoryDefault } from "@ladle/react";
import { Button } from "./button";
import { Play } from "lucide-react";

export default {
  title: "ui/Button",
} satisfies StoryDefault;

// Filled Variants
export const Filled_MD_Enabled: Story = () => (
  <Button variant="filled" size="md">
    <Play /> Filled Enabled
  </Button>
);

export const Filled_MD_Disabled: Story = () => (
  <Button variant="filled" size="md" disabled>
    <Play /> Filled Disabled
  </Button>
);

export const Filled_SM_Enabled: Story = () => (
  <Button variant="filled" size="sm">
    <Play /> Filled Enabled
  </Button>
);

export const Filled_SM_Disabled: Story = () => (
  <Button variant="filled" size="sm" disabled>
    <Play /> Filled Disabled
  </Button>
);

// Outlined Variants
export const Outlined_MD_Enabled: Story = () => (
  <Button variant="outlined" size="md">
    <Play /> Outlined Enabled
  </Button>
);

export const Outlined_MD_Disabled: Story = () => (
  <Button variant="outlined" size="md" disabled>
    <Play /> Outlined Disabled
  </Button>
);

export const Outlined_SM_Enabled: Story = () => (
  <Button variant="outlined" size="sm">
    <Play /> Outlined Enabled
  </Button>
);

export const Outlined_SM_Disabled: Story = () => (
  <Button variant="outlined" size="sm" disabled>
    <Play /> Outlined Disabled
  </Button>
);

// Link Variants
export const Link_MD_Enabled: Story = () => (
  <Button variant="link" size="md">
    <Play /> Link Enabled
  </Button>
);

export const Link_MD_Disabled: Story = () => (
  <Button variant="link" size="md" disabled>
    <Play /> Link Disabled
  </Button>
);

export const Link_SM_Enabled: Story = () => (
  <Button variant="link" size="sm">
    <Play /> Link Enabled
  </Button>
);

export const Link_SM_Disabled: Story = () => (
  <Button variant="link" size="sm" disabled>
    <Play /> Link Disabled
  </Button>
);

// Matrix - All Variants
export const Matrix_All: Story = () => (
  <div className="flex flex-col gap-6">
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Filled Variants</h3>
      <div className="flex items-center gap-6">
        <Button variant="filled" size="sm" disabled>
          <Play /> Filled Disabled (SM)
        </Button>
        <Button variant="filled" size="sm">
          <Play /> Filled Enabled (SM)
        </Button>
        <Button variant="filled" size="sm">
          <Play /> Filled Hover (SM)
        </Button>
      </div>
      <div className="flex items-center gap-6">
        <Button variant="filled" size="md" disabled>
          <Play /> Filled Disabled (MD)
        </Button>
        <Button variant="filled" size="md">
          <Play /> Filled Enabled (MD)
        </Button>
        <Button variant="filled" size="md">
          <Play /> Filled Hover (MD)
        </Button>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Outlined Variants</h3>
      <div className="flex items-center gap-6">
        <Button variant="outlined" size="sm" disabled>
          <Play /> Outlined Disabled (SM)
        </Button>
        <Button variant="outlined" size="sm">
          <Play /> Outlined Enabled (SM)
        </Button>
        <Button variant="outlined" size="sm">
          <Play /> Outlined Hover (SM)
        </Button>
      </div>
      <div className="flex items-center gap-6">
        <Button variant="outlined" size="md" disabled>
          <Play /> Outlined Disabled (MD)
        </Button>
        <Button variant="outlined" size="md">
          <Play /> Outlined Enabled (MD)
        </Button>
        <Button variant="outlined" size="md">
          <Play /> Outlined Hover (MD)
        </Button>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Link Variants</h3>
      <div className="flex items-center gap-6">
        <Button variant="link" size="sm" disabled>
          <Play /> Link Disabled (SM)
        </Button>
        <Button variant="link" size="sm">
          <Play /> Link Enabled (SM)
        </Button>
        <Button variant="link" size="sm">
          <Play /> Link Hover (SM)
        </Button>
      </div>
      <div className="flex items-center gap-6">
        <Button variant="link" size="md" disabled>
          <Play /> Link Disabled (MD)
        </Button>
        <Button variant="link" size="md">
          <Play /> Link Enabled (MD)
        </Button>
        <Button variant="link" size="md">
          <Play /> Link Hover (MD)
        </Button>
      </div>
    </div>

    <p className="text-xs text-foreground/70 mt-2">
      Dica: passe o mouse sobre os botões "Hover" para visualizar o estado de hover.
    </p>
  </div>
);

// Interactive Story
export const Interactive: Story = () => {
  const [disabled, setDisabled] = React.useState(false);
  const [variant, setVariant] = React.useState<"filled" | "outlined" | "link">("filled");
  const [size, setSize] = React.useState<"sm" | "md">("md");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Button Interativo</h3>
        <p className="text-sm text-muted-foreground">
          Teste diferentes variantes, tamanhos e estados do botão
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Variante:</label>
          <select 
            value={variant} 
            onChange={(e) => setVariant(e.target.value as "filled" | "outlined" | "link")}
            className="px-2 py-1 border rounded"
          >
            <option value="filled">Filled</option>
            <option value="outlined">Outlined</option>
            <option value="link">Link</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Tamanho:</label>
          <select 
            value={size} 
            onChange={(e) => setSize(e.target.value as "sm" | "md")}
            className="px-2 py-1 border rounded"
          >
            <option value="sm">Small (SM)</option>
            <option value="md">Medium (MD)</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Estado:</label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={disabled} 
              onChange={(e) => setDisabled(e.target.checked)}
            />
            <span className="text-sm">Desabilitado</span>
          </label>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-gray-50">
        <Button 
          variant={variant} 
          size={size} 
          disabled={disabled}
          onClick={() => alert('Botão clicado!')}
        >
          <Play /> Botão de Teste
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Configuração atual:</strong> {variant} / {size} / {disabled ? 'Desabilitado' : 'Habilitado'}</p>
      </div>
    </div>
  );
};
