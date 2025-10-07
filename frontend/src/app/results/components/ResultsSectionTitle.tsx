"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ResultsSectionTitleProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
  textClassName?: string;
}

/**
 * Shared title wrapper used across results panels to keep icon and text styling consistent.
 */
const ResultsSectionTitle: React.FC<ResultsSectionTitleProps> = ({
  icon,
  text,
  className,
  textClassName,
}) => {
  return (
    <div
      className={cn(
        "content-stretch flex gap-[8px] h-full items-center relative shrink-0",
        className
      )}
    >
      <div className="box-border content-stretch flex gap-[8px] items-center justify-center opacity-50 p-[8px] relative rounded-[100px] shrink-0 size-[24px]">
        <div className="overflow-clip relative shrink-0 size-[24px]">{icon}</div>
      </div>
      <div
        className={cn(
          "flex flex-col font-[var(--font-inter)] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-slate-900 whitespace-nowrap",
          textClassName
        )}
      >
        <p className="leading-[20px]">{text}</p>
      </div>
    </div>
  );
};

export default ResultsSectionTitle;
