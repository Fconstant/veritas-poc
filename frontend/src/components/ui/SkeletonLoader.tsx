"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'button' | 'circle';
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  className,
  lines = 1,
  width,
  height
}) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%] animate-[shimmer_1.5s_ease-in-out_infinite]";

  const variants = {
    card: "rounded-lg p-4 space-y-3",
    text: "rounded h-4",
    button: "rounded-md h-10",
    circle: "rounded-full"
  };

  if (variant === 'card') {
    return (
      <div className={cn(
        "bg-white border border-[#d6d8db] rounded-lg p-4 space-y-3 shadow-sm",
        className
      )}>
        {/* Header com ícone e badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(baseClasses, "w-5 h-5 rounded-full")}></div>
            <div className={cn(baseClasses, "h-4 w-20 rounded")}></div>
          </div>
          <div className={cn(baseClasses, "h-4 w-16 rounded")}></div>
        </div>

        {/* Conteúdo do card */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                "h-4 rounded",
                index === lines - 1 ? "w-3/4" : "w-full"
              )}
            ></div>
          ))}
        </div>

        {/* Área de explicação */}
        <div className="bg-gray-50 p-3 rounded-md space-y-2">
          <div className={cn(baseClasses, "h-3 w-24 rounded")}></div>
          <div className={cn(baseClasses, "h-3 w-full rounded")}></div>
          <div className={cn(baseClasses, "h-3 w-2/3 rounded")}></div>
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              "rounded h-4",
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={{
              width: width || undefined,
              height: height || undefined
            }}
          ></div>
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div
        className={cn(baseClasses, "rounded-md", className)}
        style={{
          width: width || '120px',
          height: height || '40px'
        }}
      ></div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={cn(baseClasses, "rounded-full", className)}
        style={{
          width: width || '24px',
          height: height || '24px'
        }}
      ></div>
    );
  }

  return null;
};

// Componente específico para skeleton de cards de resultado
export const ResultCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {[1, 2, 3].map((i) => (
        <SkeletonLoader key={i} variant="card" lines={2} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
