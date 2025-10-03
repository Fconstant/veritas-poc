"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Loader2, AlertCircle, XCircle } from 'lucide-react';

interface PulsingIconProps {
  icon?: 'check' | 'loader' | 'alert' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
  animate?: boolean;
}

const PulsingIcon: React.FC<PulsingIconProps> = ({
  icon = 'check',
  size = 'md',
  className,
  color,
  animate = true
}) => {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8'
  };

  const colorClasses = {
    check: 'text-green-500',
    loader: 'text-primary',
    alert: 'text-yellow-500',
    error: 'text-red-500'
  };

  const getIcon = () => {
    switch (icon) {
      case 'loader':
        return <Loader2 className={cn(sizeClasses[size], 'animate-spin')} />;
      case 'alert':
        return <AlertCircle className={sizeClasses[size]} />;
      case 'error':
        return <XCircle className={sizeClasses[size]} />;
      case 'check':
      default:
        return <CheckCircle className={sizeClasses[size]} />;
    }
  };

  const pulseClasses = animate ? 'animate-pulse' : '';

  return (
    <div 
      className={cn(
        'flex items-center justify-center',
        colorClasses[icon],
        pulseClasses,
        className
      )}
      style={color ? { color } : undefined}
    >
      {getIcon()}
    </div>
  );
};

export default PulsingIcon;
