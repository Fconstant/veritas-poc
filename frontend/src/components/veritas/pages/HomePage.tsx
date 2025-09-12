import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Header from '@/components/veritas/Header/Header';
import HeroSection from './HeroSection';
import VerificationForm from './VerificationForm';

interface HomePageProps {
  className?: string;
}

const HomePage: React.FC<HomePageProps> = ({ className }) => {
  const [textValue, setTextValue] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const handleUseExample = () => {
    const exampleText = "O presidente anunciou hoje que a economia cresceu 5% no último trimestre, segundo dados do IBGE. Esta é a maior taxa de crescimento dos últimos 10 anos e representa um marco histórico para o país.";
    setTextValue(exampleText);
  };

  const handleCheckFacts = () => {
    if (textValue.trim()) {
      setIsDisabled(true);
      // Aqui seria feita a chamada para a API de verificação
      console.log('Verificando fatos para:', textValue);
      
      // Simular loading
      setTimeout(() => {
        setIsDisabled(false);
        // Aqui seria redirecionado para a página de resultados
        console.log('Verificação concluída');
      }, 2000);
    }
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
  };

  return (
    <div className={cn(
      "bg-gradient-to-b from-[#f5f5f5] opacity-90 relative size-full to-[#eaeaea] min-h-screen",
      className
    )}>
      {/* Top Bar */}
      <div className="absolute box-border content-stretch flex items-center justify-between left-20 pb-4 pt-8 px-2 top-0 w-[1280px]">
        <Header />
      </div>
      
      {/* Background Decoration - Placeholder para o SVG decorativo */}
      <div className="absolute bottom-0 flex h-[800px] items-center justify-center left-0 w-[1440px] pointer-events-none">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="h-[800px] relative w-[1440px] opacity-10">
            {/* Placeholder para o SVG decorativo - será implementado quando necessário */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#351397]/5 rounded-t-full" />
          </div>
        </div>
      </div>
      
      {/* Hero Section - Left Side */}
      <div 
        className="absolute content-stretch flex flex-col h-[315px] items-start justify-between left-24 translate-y-[-50%] w-[629px]"
        style={{ top: "calc(50% + 0.5px)" }}
      >
        <HeroSection />
      </div>
      
      {/* Verification Form - Right Side */}
      <div 
        className="absolute backdrop-blur-[1.5px] backdrop-filter bg-[#f2f2f2] box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] rounded-[16px] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[571px]"
        style={{ left: "calc(50% + 338.5px)" }}
      >
        <VerificationForm
          onUseExample={handleUseExample}
          onCheckFacts={handleCheckFacts}
          onTextChange={handleTextChange}
          disabled={isDisabled}
          value={textValue}
        />
      </div>
    </div>
  );
};

export default HomePage;
