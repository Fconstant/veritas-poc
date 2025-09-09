import React from 'react';
import { cn } from '@/lib/utils';

interface PurpleBorderProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'thick' | 'dashed' | 'gradient';
  position?: 'all' | 'top' | 'bottom' | 'left' | 'right';
}

const PurpleBorder: React.FC<PurpleBorderProps> = ({
  children,
  className,
  variant = 'default',
  position = 'all',
}) => {
  const variantClasses = {
    default: 'border-2 border-[var(--veritas-purple-primary)]',
    thick: 'border-4 border-[var(--veritas-purple-primary)]',
    dashed: 'border-2 border-dashed border-[var(--veritas-purple-primary)]',
    gradient: 'border-2 border-transparent bg-gradient-to-r from-[var(--veritas-purple-primary)] to-[var(--veritas-purple-secondary)] bg-clip-border',
  };

  const positionClasses = {
    all: 'border',
    top: 'border-t-2',
    bottom: 'border-b-2',
    left: 'border-l-2',
    right: 'border-r-2',
  };

  return (
    <div
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  );
};

export default PurpleBorder;
