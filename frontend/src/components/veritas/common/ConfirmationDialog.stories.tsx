import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";

export default {
  title: "veritas/common/ConfirmationDialog",
} satisfies StoryDefault;

// Story para Cancelar Verificação
export const CancelVerification: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Cancelar Verificação</h3>
        <p className="text-sm text-muted-foreground">
          Modal de confirmação para cancelar uma verificação em andamento
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Abrir Modal de Cancelamento
        </button>

        <ConfirmationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          variant="cancel-verification"
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Variante:</strong> cancel-verification</p>
        <p><strong>Ícone:</strong> AlertTriangle</p>
        <p><strong>Botão Principal:</strong> Cancelar</p>
        <p><strong>Botão Secundário:</strong> Fechar</p>
      </div>
    </div>
  );
};

// Story para Novo Texto
export const NewText: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Novo Texto</h3>
        <p className="text-sm text-muted-foreground">
          Modal de confirmação para adicionar um novo texto para verificação
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Abrir Modal de Novo Texto
        </button>

        <ConfirmationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          variant="new-text"
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Variante:</strong> new-text</p>
        <p><strong>Ícone:</strong> FileText</p>
        <p><strong>Botão Principal:</strong> Novo Texto</p>
        <p><strong>Botão Secundário:</strong> Cancelar</p>
      </div>
    </div>
  );
};

// Story Interativa - Alternando entre variants
export const Interactive: Story = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<"cancel-verification" | "new-text">("cancel-verification");

  const openModal = (variant: "cancel-verification" | "new-text") => {
    setCurrentVariant(variant);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">ConfirmationDialog Interativo</h3>
        <p className="text-sm text-muted-foreground">
          Teste ambos os variants do modal de confirmação
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => openModal("cancel-verification")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancelar Verificação
          </button>
          <button
            onClick={() => openModal("new-text")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Novo Texto
          </button>
        </div>

        <ConfirmationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          variant={currentVariant}
          onConfirm={() => {
            console.log(`Confirmado: ${currentVariant}`);
            setIsOpen(false);
          }}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Variante Atual:</strong> {currentVariant}</p>
        <p><strong>Status:</strong> {isOpen ? "Aberto" : "Fechado"}</p>
        <p><strong>Comportamento:</strong> Ao confirmar, redireciona para a página inicial</p>
      </div>
    </div>
  );
};

// Story com Customização
export const Customized: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Modal Customizado</h3>
        <p className="text-sm text-muted-foreground">
          Exemplo com texto e botões customizados
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Abrir Modal Customizado
        </button>

        <ConfirmationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          variant="cancel-verification"
          description="Esta é uma mensagem customizada para demonstrar a flexibilidade do componente."
          confirmText="Confirmar Ação"
          cancelText="Voltar"
          onConfirm={() => {
            console.log("Ação customizada confirmada!");
            setIsOpen(false);
          }}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p><strong>Características:</strong> Texto e botões totalmente customizados</p>
        <p><strong>Comportamento:</strong> Callback customizado para onConfirm</p>
      </div>
    </div>
  );
};