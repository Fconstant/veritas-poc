'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nContext';

interface TaglineProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Tagline: React.FC<TaglineProps> = ({ className, size = 'md' }) => {
  const { t } = useI18n();
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
      {t.tagline.text}
    </p>
  );
};

export default Tagline;
