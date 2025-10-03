"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Header from '@/app/shared/components/Header';
import AnimatedDots from '@/app/shared/components/AnimatedDots';
import { Loader2 } from 'lucide-react';

interface ProcessingConfirmationPageProps {
  className?: string;
  text?: string;
  onComplete?: () => void;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

const ProcessingConfirmationPage: React.FC<ProcessingConfirmationPageProps> = ({
  className,
  text = "",
  onComplete,
  autoRedirect = true,
  redirectDelay = 2500
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRedirect) return;

    const redirectTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        router.push('/results');
      }
    }, redirectDelay);

    return () => clearTimeout(redirectTimer);
  }, [autoRedirect, redirectDelay, onComplete, router]);

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea] relative w-full overflow-hidden transition-opacity duration-500",
      isVisible ? "opacity-100" : "opacity-0",
      className
    )}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <Header />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[571px] mx-auto">
          {/* Card de Confirmação */}
          <div className={cn(
            "backdrop-blur-[1.5px] backdrop-filter flex flex-col items-center justify-center gap-6 p-8 relative rounded-[16px] w-full bg-[#f2f2f2] border border-[bg-violet-900/20] shadow-[0px_20px_80px_0px_rgba(137,44,219,0.2)] transition-all duration-700",
            isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
          )}>
            {/* Ícone de Loading */}
            <div className="flex items-center justify-center p-4 rounded-full bg-[rgba(132,74,233,0.1)]">
              <Loader2 className="size-8 text-[#8A5CDA] animate-spin" />
            </div>

            {/* Texto de Confirmação */}
            <div className="text-center space-y-2">
              <AnimatedDots 
                text="Lendo Texto" 
                className="text-[18px] font-medium text-[#102148] [font-family:var(--font-inter)]"
                interval={500}
              />
              <p className="text-[14px] text-[#6e678a] [font-family:var(--font-inter)]">
                Processando seu texto para verificação de fatos...
              </p>
            </div>

            {/* Indicador de Progresso */}
            <div className="w-full max-w-[200px] h-1 bg-[#e0e0e0] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#8A5CDA] to-[#731fb8] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingConfirmationPage;
