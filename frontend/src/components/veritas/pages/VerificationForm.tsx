import React from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface VerificationFormProps {
  className?: string;
  onUseExample?: () => void;
  onCheckFacts?: () => void;
  onTextChange?: (text: string) => void;
  disabled?: boolean;
  value?: string;
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  className,
  onUseExample,
  onCheckFacts,
  onTextChange,
  disabled = false,
  value = ""
}) => {
  return (
    <div className={cn(
      "backdrop-blur-[1.5px] backdrop-filter box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative rounded-[16px] size-full bg-[#f2f2f2]",
      className
    )}>
      <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_20px_80px_0px_rgba(137,44,219,0.2)]" />
      
      {/* TextArea */}
      <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 w-[539px]">
        <Textarea
          label="Let's check the facts for..."
          placeholder="Entre o texto que deseja conferir as afirmações aqui..."
          maxLength={1024}
          value={value}
          onChange={onTextChange}
          disabled={disabled}
          className="w-full"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
        <Button
          variant="outlined"
          size="default"
          onClick={onUseExample}
          disabled={disabled}
          className="px-4 py-3"
        >
          Use Example
        </Button>
        
        <Button
          variant="filled"
          size="default"
          onClick={onCheckFacts}
          disabled={disabled}
          className="px-4 py-3"
        >
          <Play className="size-6" />
          Check Facts
        </Button>
      </div>
    </div>
  );
};

export default VerificationForm;
