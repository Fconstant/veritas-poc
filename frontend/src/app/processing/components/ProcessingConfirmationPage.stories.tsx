import type { Story, StoryDefault } from "@ladle/react";
import ProcessingConfirmationPage from "./ProcessingConfirmationPage";

export default {
  title: "Pages/ProcessingConfirmationPage",
} satisfies StoryDefault;

// Estado padrão usado na plataforma (auto redirect ativado)
export const Default: Story = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: "640px" }}>
    <ProcessingConfirmationPage
      // text="Estamos lendo o texto enviado e preparando a verificação de fatos completa."
      onComplete={() => console.log("Redirecionando para /results (mockado na story)")}
    />
  </div>
);

// Variante usada quando queremos impedir o redirecionamento automático (ex.: debug)
export const WithoutAutoRedirect: Story = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: "640px" }}>
    <ProcessingConfirmationPage
      // text="Processando texto para visualização contínua (sem redirecionamento automático)."
      autoRedirect={false}
    />
  </div>
);
