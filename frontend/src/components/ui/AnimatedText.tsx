"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  interval?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  interval = 500
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <span className={cn(className)}>
      {text}{dots}
    </span>
  );
};

export default AnimatedText;
