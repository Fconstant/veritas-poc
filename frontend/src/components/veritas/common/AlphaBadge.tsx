import React from 'react';
import { cn } from '@/lib/utils';

interface AlphaBadgeProps {
  className?: string;
}

const AlphaBadge: React.FC<AlphaBadgeProps> = ({ className }) => {
  return (
    <span 
      aria-label="Alpha v0.1"
      className={cn(
        'bg-[#dedfe3] px-1.5 py-1 rounded-[4px] font-[var(--font-inter)] font-normal text-[12px] leading-normal text-[#102148] opacity-90 tracking-[0.24px] whitespace-nowrap',
        className
      )}
    >
      Alpha v0.1
    </span>
  );
};

export default AlphaBadge;
