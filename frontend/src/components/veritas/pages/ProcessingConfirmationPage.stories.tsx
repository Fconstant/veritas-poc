import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import ProcessingConfirmationPage from "./ProcessingConfirmationPage";

export default {
  title: "veritas/pages/ProcessingConfirmationPage",
} satisfies StoryDefault;

// Story interativa para testar diferentes estados
export const Interactive: Story = () => {
  const [showPage, setShowPage] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Processing Confirmation Page</h3>
        <p className="text-sm text-muted-foreground">
          Página de confirmação que aparece durante o processamento do texto
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowPage(!showPage)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {showPage ? "Hide" : "Show"} Page
        </button>
      </div>

      {showPage && (
        <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: "600px" }}>
          <ProcessingConfirmationPage
            text="Este é um texto de exemplo para verificação de fatos..."
            autoRedirect={false}
          />
        </div>
      )}
    </div>
  );
};

// Story com auto-redirect
export const WithAutoRedirect: Story = () => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: "600px" }}>
      <ProcessingConfirmationPage
        text="Texto sendo processado..."
        autoRedirect={true}
        redirectDelay={3000}
      />
    </div>
  );
};

// Story com texto customizado
export const CustomText: Story = () => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: "600px" }}>
      <ProcessingConfirmationPage
        text="Processando texto muito longo que pode ser usado para testar como a página se comporta com diferentes tamanhos de conteúdo..."
        autoRedirect={false}
      />
    </div>
  );
};
