import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header
      className={cn(
        'flex items-center justify-between px-6 py-4 relative w-full',
        'border-b border-[#d6d8db]',
        className
      )}
    >
      {/* Logo e Badge à esquerda */}
      <div className="flex items-end gap-2">
        <a 
          href="/" 
          aria-label="Veritas Home"
          className="font-serif font-bold text-[24px] leading-[28px] text-[#102148] whitespace-nowrap"
        >
          Veritas
        </a>
        <span 
          aria-label="Alpha v0.1"
          className="bg-[#dedfe3] px-1.5 py-1 rounded-[4px] font-[var(--font-inter)] font-normal text-[12px] leading-normal text-[#102148] opacity-90 tracking-[0.24px] whitespace-nowrap"
        >
          Alpha v0.1
        </span>
      </div>
      
      {/* Tagline à direita */}
      <p className="font-[var(--font-inter)] font-normal text-[14px] leading-normal text-[#737a8b] opacity-90 tracking-[0.28px] whitespace-nowrap">
        Automatize a verificação de fatos
      </p>
    </header>
  );
};

export default Header;

