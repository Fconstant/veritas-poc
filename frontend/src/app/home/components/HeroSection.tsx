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
        <div className="flex flex-col font-extralight justify-center relative text-[var(--purple-dark)] w-full">
          <h1 className="text-5xl md:text-[56px] lg:text-6xl leading-[1.1] tracking-[0.64px] mb-2">
            Cole o texto.{' '}
            <span className="block">
              Receba{' '}
              <span className="font-bold text-[var(--purple-accent)]">verificação de fatos</span>.
            </span>
          </h1>
        </div>
        
        {/* Subtítulo */}
        <div className="flex flex-col font-normal justify-center opacity-70 relative text-[var(--purple-medium)] w-full">
          <p className="text-base md:text-lg lg:text-xl leading-[1.4] tracking-[0.2px] max-w-lg">
            Verificamos afirmações e retornamos citações — com privacidade em primeiro lugar.
          </p>
        </div>
      </div>
      
      {/* Features Badge */}
      <div className="flex flex-wrap gap-2 items-center justify-start px-2 py-2 rounded backdrop-blur-sm border border-[var(--purple-primary)]/10">
        <div className="flex items-center gap-2">
          <FileText className="size-4 md:size-5 text-[var(--purple-accent)] flex-shrink-0" />
          <span className="font-normal text-[var(--text-muted)] text-xs md:text-sm whitespace-nowrap">
            Arquivos de Texto
          </span>
        </div>
        
        <span className="text-[var(--text-muted)] text-xs md:text-sm mx-1 opacity-75">e</span>
        
        <div className="flex items-center gap-2">
          <Volume2 className="size-4 md:size-5 text-[var(--purple-accent)] flex-shrink-0" />
          <span className="font-normal text-[var(--text-muted)] text-xs md:text-sm whitespace-nowrap">
            Áudio
          </span>
        </div>
        
        <span className="font-normal text-[var(--text-muted)] text-xs md:text-sm ml-1">
          em breve
        </span>
      </div>
    </div>
  );
};

export default HeroSection;
