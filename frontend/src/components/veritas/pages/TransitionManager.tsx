import React from 'react';
import { cn } from '@/lib/utils';

interface TransitionManagerProps {
  state: 'idle' | 'connecting' | 'processing' | 'confirmation' | 'results' | 'error';
  children: React.ReactNode;
  className?: string;
}

// Container que aplica classes utilitárias para transições de tela
const TransitionManager: React.FC<TransitionManagerProps> = ({ state, children, className }) => {
  const stateClasses: Record<TransitionManagerProps['state'], string> = {
    idle: 'opacity-100 translate-y-0',
    connecting: 'opacity-100 translate-y-0',
    processing: 'opacity-100 translate-y-0',
    confirmation: 'opacity-100 translate-y-0',
    results: 'opacity-100 translate-y-0',
    error: 'opacity-100 translate-y-0',
  };

  return (
    <div
      data-transition-state={state}
      className={cn(
        'transition-all duration-700 ease-in-out will-change-transform will-change-opacity',
        stateClasses[state],
        className
      )}
    >
      {children}
    </div>
  );
};

export default TransitionManager;
