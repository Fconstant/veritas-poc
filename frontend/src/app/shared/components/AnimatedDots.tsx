"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedDotsProps {
  text: string;
  className?: string;
  interval?: number;
  maxDots?: number;
}

const AnimatedDots: React.FC<AnimatedDotsProps> = ({
  text,
  className,
  interval = 500,
  maxDots = 3
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => {
        if (prev.length < maxDots) {
          return prev + '.';
        }
        return '';
      });
    }, interval);

    return () => clearInterval(timer);
  }, [interval, maxDots]);

  return (
    <span
      className={cn(className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {text}
      <span className="inline-block min-w-[1em]">
        {dots}
      </span>
    </span>
  );
};

export default AnimatedDots;
