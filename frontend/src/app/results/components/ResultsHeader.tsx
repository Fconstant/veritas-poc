"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/app/shared/components/ui/button"
import { X, RotateCcw, Copy, CircleCheck, AlertCircle, Check } from "lucide-react"
import AnimatedDots from "@/app/shared/components/ui/AnimatedDots"

type VerificationStatus = "verifying" | "error" | "done"

interface ResultsHeaderProps {
  status: VerificationStatus
  onCancel?: () => void
  onRetry?: () => void
  onCopy?: () => void
  className?: string
  disabled?: boolean
}

interface StatusConfig {
  text: string
  textColor: string
  icon: React.ReactNode
  buttonText: string
  buttonIcon: React.ReactNode
  onButtonClick?: () => void
  useAnimatedDots?: boolean
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  status,
  onCancel,
  onRetry,
  onCopy,
  className,
  disabled = false,
}) => {
  const [isCopied, setIsCopied] = React.useState(false)

  const handleCopy = () => {
    if (onCopy) {
      onCopy()
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2500)
    }
  }

  const getStatusConfig = (): StatusConfig => {
    switch (status) {
      case "verifying":
        return {
          text: "Verificando",
          textColor: "text-slate-900 opacity-70",
          icon: (
            <div className="relative shrink-0 size-6">
              <div className="absolute bg-[#77e6a0] left-1/2 rounded-[9999px] size-6 top-1/2 translate-x-[-50%] translate-y-[-50%]" 
                   style={{
                     animation: 'fadePulse 1.5s ease-in-out infinite'
                   }} />
              <div className="absolute bg-green-500 left-1/2 rounded-[9999px] size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]" />
            </div>
          ),
          buttonText: "Cancel",
          buttonIcon: <X className="size-4" />,
          onButtonClick: onCancel,
          useAnimatedDots: true,
        }
      
      case "error":
        return {
          text: "Erro na Verificação",
          textColor: "text-[#ea3f3f]",
          icon: (
            <div className="box-border content-stretch flex gap-2 items-center justify-center p-[8px] relative rounded-[100px] shrink-0 size-6">
              <div className="overflow-clip relative shrink-0 size-6">
                <AlertCircle className="size-6 text-red-500" />
              </div>
            </div>
          ),
          buttonText: "Try again",
          buttonIcon: <RotateCcw className="size-4" />,
          onButtonClick: onRetry,
        }
      
      case "done":
        return {
          text: "Verificação Completa",
          textColor: "text-slate-900 opacity-70",
          icon: (
            <div className="box-border content-stretch flex gap-2 items-center justify-center p-[8px] relative rounded-[100px] shrink-0 size-6">
              <div className="overflow-clip relative shrink-0 size-6">
                <CircleCheck className="size-6 text-green-500" />
              </div>
            </div>
          ),
          buttonText: isCopied ? "Copiado!" : "Copy Plain Text",
          buttonIcon: isCopied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />,
          onButtonClick: handleCopy,
        }
      
      default:
        return {
          text: "Verificando",
          textColor: "text-slate-900 opacity-70",
          icon: null,
          buttonText: "Cancel",
          buttonIcon: <X className="size-4" />,
          onButtonClick: onCancel,
          useAnimatedDots: true,
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div
      className={cn(
        "content-stretch flex items-start justify-start relative size-full",
        className
      )}
    >
      <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
        {/* Status Section */}
        <div className="flex flex-row items-center self-stretch">
          <div className="content-stretch flex gap-4 h-full items-center justify-start relative shrink-0">
            <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0">
              {/* Status Icon */}
              {config.icon}
              
              {/* Status Text */}
              <div className={cn(
                "flex flex-col font-[var(--font-inter)] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap",
                config.textColor
              )}>
                {config.useAnimatedDots ? (
                  <AnimatedDots 
                    text={config.text} 
                    className="leading-[20px] whitespace-pre"
                    interval={500}
                  />
                ) : (
                  <p className="leading-[20px] whitespace-pre">{config.text}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="outlined"
          size="sm"
          onClick={config.onButtonClick}
          disabled={disabled}
          className="gap-2"
        >
          {config.buttonIcon}
          {config.buttonText}
        </Button>
      </div>
    </div>
  )
}

export { ResultsHeader }
export type { ResultsHeaderProps, VerificationStatus }
