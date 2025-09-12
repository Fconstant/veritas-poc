import type { Story, StoryDefault } from "@ladle/react";
import { useState } from "react";
import VerificationForm from "./VerificationForm";

export default {
  title: "veritas/pages/VerificationForm",
} satisfies StoryDefault;

// Story interativa
export const Interactive: Story = () => {
  const [textValue, setTextValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUseExample = () => {
    const exampleText = "O presidente anunciou hoje que a economia cresceu 5% no último trimestre, segundo dados do IBGE. Esta é a maior taxa de crescimento dos últimos 10 anos e representa um marco histórico para o país.";
    setTextValue(exampleText);
  };

  const handleCheckFacts = () => {
    if (textValue.trim()) {
      setIsLoading(true);
      console.log('Verificando fatos para:', textValue);
      
      // Simular loading
      setTimeout(() => {
        setIsLoading(false);
        console.log('Verificação concluída');
      }, 3000);
    }
  };

  return (
    <div className="w-full max-w-[571px] p-4 bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea]">
      <VerificationForm
        onUseExample={handleUseExample}
        onCheckFacts={handleCheckFacts}
        onTextChange={setTextValue}
        loading={isLoading}
        value={textValue}
      />
    </div>
  );
};

// Story com texto pré-preenchido
export const WithText: Story = () => {
  const [textValue, setTextValue] = useState("Este é um exemplo de texto para verificação de fatos. O componente está funcionando corretamente.");

  return (
    <div className="w-[571px] p-4 bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea]">
      <VerificationForm
        onUseExample={() => setTextValue("Novo texto de exemplo")}
        onCheckFacts={() => console.log('Verificando:', textValue)}
        onTextChange={setTextValue}
        value={textValue}
      />
    </div>
  );
};

// Story com loading
export const Loading: Story = () => {
  const [textValue, setTextValue] = useState("Texto para verificação...");

  return (
    <div className="w-full max-w-[571px] p-4 bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea]">
      <VerificationForm
        onUseExample={() => {}}
        onCheckFacts={() => {}}
        onTextChange={setTextValue}
        loading={true}
        value={textValue}
      />
    </div>
  );
};

// Story com texto longo (teste de limite)
export const LongText: Story = () => {
  const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20);
  const [textValue, setTextValue] = useState(longText);

  return (
    <div className="w-[571px] p-4 bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea]">
      <VerificationForm
        onUseExample={() => setTextValue(longText)}
        onCheckFacts={() => console.log('Verificando texto longo:', textValue)}
        onTextChange={setTextValue}
        value={textValue}
      />
    </div>
  );
};
