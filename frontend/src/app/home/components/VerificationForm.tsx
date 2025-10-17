import React from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/app/shared/components/ui/textarea';
import { Button } from '@/app/shared/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useI18n, interpolate } from '@/lib/i18n/I18nContext';

// Constante para o comprimento máximo do texto a ser verificado
export const TEXT_TO_BE_REVIEWED_LENGTH = 5000;

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
  const { t } = useI18n();
  const hasText = value.trim().length > 0;
  const isOverLimit = value.length > TEXT_TO_BE_REVIEWED_LENGTH;

  // Mensagem do tooltip para botão desabilitado
  const getDisabledTooltip = () => {
    if (disabled) {
      return t.verificationForm.tooltipWaitProcessing;
    }
    if (isOverLimit) {
      return interpolate(t.verificationForm.tooltipExceedsLimit, {
        limit: TEXT_TO_BE_REVIEWED_LENGTH,
        excess: value.length - TEXT_TO_BE_REVIEWED_LENGTH
      });
    }
    if (!hasText) {
      return t.verificationForm.tooltipEnterText;
    }
    return null;
  };

  return (
    <div className={cn(
      "backdrop-blur-[1.5px] backdrop-filter flex flex-col gap-4 p-4 relative rounded-[16px] w-full bg-[#f2f2f2] border border-[bg-violet-900/20] shadow-[0px_20px_80px_0px_rgba(137,44,219,0.2)]",
      className
    )}>
      {/* TextArea */}
      <div className="flex flex-col gap-2 w-full">
        <Textarea
          label={t.verificationForm.label}
          placeholder={t.verificationForm.placeholder}
          maxLength={TEXT_TO_BE_REVIEWED_LENGTH}
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
          disabledTooltip={
            disabled ? t.verificationForm.tooltipWaitProcessing : null
          }
          className="px-4 py-3"
        >
          {t.verificationForm.useExample}
        </Button>

        <Button
          variant="filled"
          size="default"
          onClick={onCheckFacts}
          disabled={!hasText || disabled || isOverLimit}
          disabledTooltip={getDisabledTooltip()}
          className="px-4 py-3"
        >
          <Sparkles className="size-5" />
          {t.verificationForm.checkFacts}
        </Button>
      </div>
    </div>
  );
};

export default VerificationForm;
