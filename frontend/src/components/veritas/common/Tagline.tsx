import React from 'react';
import { cn } from '@/lib/utils';

interface TaglineProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Tagline: React.FC<TaglineProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <p
      className={cn(
        'text-muted-foreground font-medium',
        sizeClasses[size],
        className
      )}
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      Automatize a verificação de fatos
    </p>
  );
};

export default Tagline;
