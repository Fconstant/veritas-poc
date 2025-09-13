import React from 'react';
import { cn } from '@/lib/utils';
import { FileText, Volume2 } from 'lucide-react';

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  return (
    <div className={cn(
      "flex flex-col items-start justify-between relative w-full min-h-[315px]",
      className
    )}>
      {/* Título e Subtítulo */}
      <div className="flex flex-col gap-4 items-start justify-start w-full mb-8">
        {/* Título Principal */}
        <div className="flex flex-col font-extralight justify-center relative text-[#381257] w-full">
          <h1 className="text-[48px] md:text-[56px] lg:text-[64px] leading-[1.1] tracking-[0.64px] mb-2">
            Cole o texto.{' '}
            <span className="block">
              Receba{' '}
              <span className="font-bold text-[#731fb8]">verificação de fatos</span>.
            </span>
          </h1>
        </div>
        
        {/* Subtítulo */}
        <div className="flex flex-col font-normal justify-center opacity-70 relative text-[#47415f] w-full">
          <p className="text-[16px] md:text-[18px] lg:text-[20px] leading-[1.4] tracking-[0.2px] max-w-lg">
            Verificamos afirmações e retornamos citações — com privacidade em primeiro lugar.
          </p>
        </div>
      </div>
      
      {/* Features Badge */}
      <div className="flex flex-wrap gap-2 items-center justify-start px-2 py-2 rounded-[4px] backdrop-blur-sm border border-[#351397]/10">
        <div className="flex items-center gap-2">
          <FileText className="size-4 md:size-5 text-[#731fb8] flex-shrink-0" />
          <span className="font-normal text-[#6e678a] text-[12px] md:text-[14px] whitespace-nowrap">
            Arquivos de Texto
          </span>
        </div>
        
        <span className="text-[#9a94ad] text-[12px] md:text-[14px] mx-1">e</span>
        
        <div className="flex items-center gap-2">
          <Volume2 className="size-4 md:size-5 text-[#731fb8] flex-shrink-0" />
          <span className="font-normal text-[#6e678a] text-[12px] md:text-[14px] whitespace-nowrap">
            Áudio
          </span>
        </div>
        
        <span className="font-normal text-[#6e678a] text-[12px] md:text-[14px] ml-1">
          em breve
        </span>
      </div>
    </div>
  );
};

export default HeroSection;
