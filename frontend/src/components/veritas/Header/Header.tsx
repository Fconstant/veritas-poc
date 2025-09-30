import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';

interface HeaderProps {
  className?: string;
  onSettingsClick?: () => void;
  showSettings?: boolean;
}

const Header: React.FC<HeaderProps> = ({ className, onSettingsClick, showSettings = false }) => {
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
      
      {/* Direita: Tagline + Settings */}
      <div className="flex items-center gap-4">
        {/* Tagline - responsivo: esconde em telas pequenas */}
        <p
          className={cn(
            "font-[var(--font-inter)] font-normal text-[14px] leading-normal text-[#737a8b] opacity-90 tracking-[0.28px] whitespace-nowrap",
            "hidden sm:block"
          )}
        >
          Automatize a verificação de fatos
        </p>
        
        {/* Settings Button */}
        {showSettings && onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Configurações de API"
            title="Configurar API Keys"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

