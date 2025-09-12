import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'flex flex-col items-center gap-4 py-8 px-4',
        'bg-[var(--veritas-gray-light)] border-t border-[var(--veritas-gray-border)]',
        'text-muted-foreground text-sm',
        className
      )}
    >
      <div className="flex flex-wrap justify-center gap-6">
        <a
          href="#sobre"
          className="hover:text-[var(--veritas-purple-primary)] transition-colors"
        >
          Sobre
        </a>
        <a
          href="#como-funciona"
          className="hover:text-[var(--veritas-purple-primary)] transition-colors"
        >
          Como Funciona
        </a>
        <a
          href="#privacidade"
          className="hover:text-[var(--veritas-purple-primary)] transition-colors"
        >
          Privacidade
        </a>
        <a
          href="#contato"
          className="hover:text-[var(--veritas-purple-primary)] transition-colors"
        >
          Contato
        </a>
      </div>
      
      <div className="text-center">
        <p>&copy; {currentYear} Veritas. Todos os direitos reservados.</p>
        <p className="text-xs mt-1">
          Desenvolvido com ❤️ para democratizar a verificação de fatos
        </p>
      </div>
    </footer>
  );
};

export default Footer;


