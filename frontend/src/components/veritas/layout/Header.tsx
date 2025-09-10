import React from 'react';
import { cn } from '@/lib/utils';
import Logo from '../common/Logo';
import AlphaBadge from '../common/AlphaBadge';
import Tagline from '../common/Tagline';

interface HeaderProps {
  className?: string;
  showTagline?: boolean;
}

const Header: React.FC<HeaderProps> = ({ className, showTagline = true }) => {
  return (
    <header
      className={cn(
        'flex flex-col items-center gap-4 py-8 px-4',
        'bg-background border-b border-[var(--veritas-gray-border)]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Logo size="lg" />
        <AlphaBadge />
      </div>
      
      {showTagline && (
        <Tagline size="lg" className="text-center" />
      )}
    </header>
  );
};

export default Header;

