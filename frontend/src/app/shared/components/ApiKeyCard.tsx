import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, CheckCircle2, ExternalLink } from 'lucide-react';

export interface ApiKeyCardProps {
  title: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  helpUrl: string;
  helpText: string;
  isConfigured?: boolean;
  className?: string;
}

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  title,
  description,
  placeholder,
  value,
  onChange,
  helpUrl,
  helpText,
  isConfigured = false,
  className
}) => {
  const [showKey, setShowKey] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn(
      "relative bg-white rounded-2xl border-2 transition-all duration-200",
      isFocused ? "border-[#22c55e] shadow-lg" : "border-gray-200",
      isConfigured && !isFocused && "border-green-200 bg-green-50/30",
      className
    )}>
      {/* Status Badge */}
      {isConfigured && (
        <div className="absolute -top-3 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-md">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Configurado
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Input Field */}
        <div className="relative mb-4">
          <input
            type={showKey ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              "w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200",
              "font-mono text-sm",
              "focus:outline-none focus:ring-0",
              isFocused ? "border-[#22c55e] bg-white" : "border-gray-200 bg-gray-50",
              "placeholder:text-gray-400 placeholder:font-sans"
            )}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showKey ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Help Link */}
        <a
          href={helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-[#22c55e] hover:text-[#16a34a] transition-colors group"
        >
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          {helpText}
        </a>
      </div>
    </div>
  );
};

export default ApiKeyCard;
