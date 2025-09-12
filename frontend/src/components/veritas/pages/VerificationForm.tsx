import React from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';

interface VerificationFormProps {
  className?: string;
  onUseExample?: () => void;
  onCheckFacts?: () => void;
  onTextChange?: (text: string) => void;
  disabled?: boolean;
  value?: string;
  loading?: boolean;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  className,
  onUseExample,
  onCheckFacts,
  onTextChange,
  disabled = false,
  value = "",
  loading = false
}) => {
  const hasText = value.trim().length > 0;
  const isProcessing = disabled || loading;

  return (
    <div className={cn(
      "backdrop-blur-[1.5px] backdrop-filter flex flex-col gap-6 p-4 md:p-6 relative rounded-[16px] w-full bg-[#f2f2f2] border border-[#351397] shadow-[0px_20px_80px_0px_rgba(137,44,219,0.2)]",
      className
    )}>
      {/* TextArea */}
      <div className="flex flex-col gap-2 w-full">
        <Textarea
          label="Let's check the facts for..."
          placeholder="Entre o texto que deseja conferir as afirmações aqui..."
          maxLength={1024}
          value={value}
          onChange={onTextChange}
          disabled={isProcessing}
          className="w-full"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          variant="outlined"
          size="default"
          onClick={onUseExample}
          disabled={isProcessing}
          className="flex-1 sm:flex-none px-4 py-3"
        >
          Use Example
        </Button>
        
        <Button
          variant="filled"
          size="default"
          onClick={onCheckFacts}
          disabled={!hasText || isProcessing}
          className="flex-1 sm:flex-none px-4 py-3"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Play className="size-5" />
          )}
          {loading ? 'Checking...' : 'Check Facts'}
        </Button>
      </div>
      
      {/* Helper text */}
      {hasText && (
        <div className="text-xs text-[#6e678a] opacity-70 text-center">
          Ready to verify {value.length} characters
        </div>
      )}
    </div>
  );
};

export default VerificationForm;
