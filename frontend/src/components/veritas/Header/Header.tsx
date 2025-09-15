import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header
      className={cn(
        'flex items-center justify-between pb-4 pt-8 relative w-full',
        'border-b border-[#d6d8db]',
        className
      )}
    >
      {/* Logo e Badge à esquerda */}
      <div className="flex items-end gap-2">
        <Link 
          href="/" 
          aria-label="Veritas Home"
          className="font-serif font-bold text-[24px] leading-[28px] text-[#102148] whitespace-nowrap"
        >
          Veritas
        </Link>
        <span 
          aria-label="Alpha v0.1"
          className="bg-[#dedfe3] px-1.5 py-1 rounded-[4px] font-[var(--font-inter)] font-normal text-[12px] leading-normal text-[#102148] opacity-90 tracking-[0.24px] whitespace-nowrap"
        >
          Alpha v0.1
        </span>
      </div>
      
      {/* Tagline à direita - responsivo: esconde em telas pequenas */}
      <p
        className={cn(
          "font-[var(--font-inter)] font-normal text-[14px] leading-normal text-[#737a8b] opacity-90 tracking-[0.28px] whitespace-nowrap",
          "hidden sm:block"
        )}
      >
        Automatize a verificação de fatos
      </p>
    </header>
  );
};

export default Header;

