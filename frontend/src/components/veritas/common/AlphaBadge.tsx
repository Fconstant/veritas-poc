import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AlphaBadgeProps {
  className?: string;
  variant?: 'default' | 'outline';
}

const AlphaBadge: React.FC<AlphaBadgeProps> = ({ className, variant = 'default' }) => {
  return (
    <Badge
      variant={variant}
      className={cn(
        'bg-[var(--veritas-purple-secondary)] text-white hover:bg-[var(--veritas-purple-primary)]',
        'border-[var(--veritas-purple-secondary)]',
        className
      )}
    >
      Alpha v0.1
    </Badge>
  );
};

export default AlphaBadge;
