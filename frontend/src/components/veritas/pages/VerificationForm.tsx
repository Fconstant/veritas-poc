import React from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { WandSparkles, Loader2 } from 'lucide-react';

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
  const hasText = value.trim().length > 0;

  return (
    <div className={cn(
      "backdrop-blur-[1.5px] backdrop-filter flex flex-col gap-4 p-4 relative rounded-[16px] w-full bg-[#f2f2f2] border border-[bg-violet-900/20] shadow-[0px_20px_80px_0px_rgba(137,44,219,0.2)]",
      className
    )}>
      {/* TextArea */}
      <div className="flex flex-col gap-2 w-full">
        <Textarea
          label="Verificar os fatos de..."
          placeholder="Entre o texto que deseja verificar aqui..."
          maxLength={5000}
          value={value}
          onChange={onTextChange}
          disabled={disabled}
          className="w-full"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center w-full gap-4">
        <Button
          variant="outlined"
          size="default"
          onClick={onUseExample}
          disabled={disabled}
          className="px-4 py-3"
        >
          Usar Exemplo
        </Button>
        
        <Button
          variant="filled"
          size="default"
          onClick={onCheckFacts}
          disabled={!hasText || disabled}
          className="px-4 py-3"
        >
          <WandSparkles className="size-5" />
          Verificar Fatos
        </Button>
      </div>
    </div>
  );
};

export default VerificationForm;
