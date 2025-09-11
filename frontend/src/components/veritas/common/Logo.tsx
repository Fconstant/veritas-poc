import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <h1
      className={cn(
        'font-[var(--font-inria-serif)] font-bold text-[var(--veritas-purple-primary)]',
        sizeClasses[size],
        className
      )}
    >
      Veritas
    </h1>
  );
};

export default Logo;
