"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface ResultCardProps {
  // Content
  text: string;
  explanation?: string;
  sources?: string[];
  index: number; // For numbered list
  
  // State
  isSelected?: boolean;
  
  // Behavior
  onClick?: () => void;
  
  // Styling
  className?: string;
  
  // Accessibility
  id?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  text,
  explanation,
  sources,
  index,
  isSelected = false,
  onClick,
  className,
  id
}) => {
  return (
    <div
      id={id}
      className={cn(
        // Base styles
        "bg-[#FCFCFC] relative rounded-2xl shrink-0 w-full transition-all duration-200 cursor-pointer",
        // Default outline
        "outline outline-1 outline-zinc-300 outline-offset-[-1px]",
        // Hover state
        "bg-[#FAF7FF] hover:outline-2 hover:outline-[var(--border-hover-purple)] hover:outline-offset-[-2px] hover:shadow-[var(--shadow-card-hover)]",
        // Selected state
        isSelected && [
          "outline-2 outline-[var(--border-selected-purple)] outline-offset-[-2px]",
          "bg-white",
          "shadow-[var(--shadow-card-selected)]"
        ],
        className
      )}
      onClick={onClick}
    >
      <div className="box-border content-stretch flex flex-col gap-4 items-start overflow-clip pb-4 pt-6 px-4 relative rounded-[inherit] w-full">
        {/* Claim Text com numeração */}
        <div className="box-border content-stretch flex gap-2 items-start justify-center pl-0 pr-4 py-0 relative rounded-lg shrink-0 w-full">
          <div className="flex-[1_0_0] flex-col justify-center min-h-px min-w-px not-italic relative shrink-0 text-sm text-[var(--text-opacity-dark)]">
            <ol 
              className="list-decimal" 
              start={index}
              style={{ fontFamily: 'var(--font-merriweather)' }}
            >
              <li className="ms-[21px]">
                <span 
                  className="leading-7 line-clamp-2"
                  style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  "{text}"
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Análise e Fontes */}
        <div className="content-stretch flex flex-col gap-3 items-center relative shrink-0 w-full">
          {/* Explanation/Análise */}
          {explanation && (
            <div className="bg-[var(--bg-analysis)] border border-[var(--border-analysis)] border-solid box-border content-stretch flex flex-col gap-2 items-start p-4 relative rounded-xl shrink-0 w-full">
              <div className="content-stretch flex gap-2 items-center relative shrink-0 w-full">
                <div className="flex flex-col font-['Inter'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[var(--text-helper)] text-sm whitespace-nowrap">
                  <p className="leading-6">Análise</p>
                </div>
              </div>
              <div className="flex flex-col font-['Inter'] font-normal justify-center leading-7 min-w-full not-italic relative shrink-0 text-base text-[var(--text-opacity-dark)] w-[min-content] whitespace-pre-wrap">
                <p>{explanation}</p>
              </div>
            </div>
          )}

          {/* Sources/Fontes */}
          {sources && sources.length > 0 && (
            <div className="box-border content-stretch flex flex-col gap-2 items-start px-2 py-0 relative shrink-0 w-full">
              <div className="box-border content-stretch flex gap-2 items-center px-2 py-0 relative shrink-0 w-full">
                <div className="flex flex-col font-['Inter'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[var(--text-helper)] text-sm whitespace-nowrap">
                  <p className="leading-6">Fontes</p>
                </div>
              </div>
              <div className="content-start flex flex-wrap gap-1 gap-x-2 items-start relative shrink-0 w-full">
                {sources.map((source: string, sourceIndex: number) => {
                  let displayText = source;
                  try {
                    displayText = new URL(source).hostname.replace('www.', '');
                  } catch {
                    // Se não for uma URL válida, usa o texto original
                    displayText = source.length > 30 ? source.substring(0, 30) + '...' : source;
                  }
                  
                  const isFirstLink = sourceIndex === 0;
                  
                  return (
                    <div 
                      key={sourceIndex} 
                      className={cn(
                        "box-border content-stretch flex gap-2 items-center justify-center px-1.5 py-0.5 relative rounded-lg shrink-0",
                        isFirstLink && "bg-neutral-100"
                      )}
                    >
                      <a 
                        href={source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn(
                          "font-['Inter'] font-normal leading-6 not-italic relative shrink-0 text-[13px]",
                          isFirstLink ? [
                            "text-[var(--purple-link)] underline decoration-solid",
                            "[text-underline-offset:55%]"
                          ] : "text-[var(--purple-hover)]",
                          "hover:text-[var(--link-hover)]"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {displayText}
                      </a>
                      <div className="overflow-clip relative shrink-0 size-4">
                        <ExternalLink 
                          className={cn(
                            "size-4",
                            isFirstLink ? "text-[var(--purple-link)]" : "text-[var(--purple-hover)]"
                          )} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
