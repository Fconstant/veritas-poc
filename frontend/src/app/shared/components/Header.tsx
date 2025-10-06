import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';
import { Button } from '@/app/shared/components/ui/button';

interface HeaderProps {
  className?: string;
  onSettingsClick?: () => void;
  showSettings?: boolean;
  rightContent?: React.ReactNode;
}

/**
 * Header - Top-bar consistente em todas as páginas
 * Design v0.2: Conforme especificado no design document
 * 
 * Especificações:
 * - Logo: Inria Serif Bold, 24px, #102148
 * - Tagline: Inter Regular, 12px, #737b91, opacity 90%
 * - Botão Settings: Ícone 24px, texto 16px, cor #8a5cda
 * - Divider: 1px linha horizontal
 * - Padding: 16px top, 0px bottom
 * - Background: #f5f5f5 (neutral-100)
 */
const Header: React.FC<HeaderProps> = ({ className, onSettingsClick, showSettings = false, rightContent }) => {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 pt-4 pb-0 relative w-full bg-neutral-100',
        className
      )}
    >
      {/* Container principal */}
      <div className="flex items-end justify-between">
        {/* Logo e Tagline à esquerda */}
        <Link 
          href="/" 
          aria-label="Veritas Home"
          className="flex flex-col leading-[0]"
        >
          <span 
            className="font-bold text-[24px] leading-[32px] tracking-[0.48px] whitespace-pre-wrap"
            style={{ 
              color: '#102148',
              fontFamily: 'var(--font-inria-serif), "Inria Serif", Georgia, serif'
            }}
          >
            Veritas
          </span>
          <span 
            className="font-normal text-[12px] leading-[20px] tracking-[0.24px] whitespace-pre-wrap opacity-90"
            style={{ 
              color: '#737b91',
              fontFamily: 'var(--font-inter), Inter, sans-serif'
            }}
          >
            Automatizando a verificação de fatos
          </span>
        </Link>
        
        {/* Botão Configurations (Settings) */}
        {rightContent ? (
          rightContent
        ) : (
          showSettings && onSettingsClick && (
            <Button
              variant="link"
              size="default"
              onClick={onSettingsClick}
              aria-label="Configurações de API"
              title="Configurar API Keys"
            >
              <Settings className="w-6 h-6" />
              Configurations
            </Button>
          )
        )}
      </div>

      {/* Divider */}
      <div className="h-0 w-full relative">
        <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t" style={{ borderColor: 'var(--divider)' }} />
      </div>
    </header>
  );
};

export default Header;


