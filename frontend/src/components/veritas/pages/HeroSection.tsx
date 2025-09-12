import React from 'react';
import { cn } from '@/lib/utils';
import { FileText, Volume2 } from 'lucide-react';

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  return (
    <div className={cn(
      "content-stretch flex flex-col items-start justify-between relative size-full",
      className
    )}>
      {/* Título e Subtítulo */}
      <div className="content-stretch flex flex-col gap-4 items-start justify-start leading-[0] not-italic relative shrink-0 w-full">
        {/* Título Principal */}
        <div className="flex flex-col font-extralight justify-center relative shrink-0 text-[#381257] text-[64px] tracking-[0.64px] w-full">
          <p className="leading-[80px] mb-0">Paste text. </p>
          <p className="leading-[80px]">
            <span>Get it</span>
            <span className="font-bold"> </span>
            <span className="font-bold text-[#731fb8]">fact-checked</span>
            <span>.</span>
          </p>
        </div>
        
        {/* Subtítulo */}
        <div className="flex flex-col font-normal justify-center opacity-70 relative shrink-0 text-[#47415f] text-[20px] tracking-[0.2px] w-full">
          <p className="leading-[32px]">We verify claims, and return citations — privacy-first.</p>
        </div>
      </div>
      
      {/* Features Badge */}
      <div className="box-border content-stretch flex gap-2 items-center justify-start px-3 py-2 relative rounded-[16px] shrink-0">
        <div className="overflow-clip relative shrink-0 size-5">
          <FileText className="size-5 text-[#731fb8]" />
        </div>
        <div className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6e678a] text-[14px] text-nowrap">
          <p className="leading-[24px] whitespace-pre">
            <span>Text Files </span>
            <span className="text-[#9a94ad]">and</span>
          </p>
        </div>
        <div className="overflow-clip relative shrink-0 size-5">
          <Volume2 className="size-5 text-[#731fb8]" />
        </div>
        <div className="flex flex-col font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6e678a] text-[14px] text-nowrap">
          <p className="leading-[24px] whitespace-pre">Audio are coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
