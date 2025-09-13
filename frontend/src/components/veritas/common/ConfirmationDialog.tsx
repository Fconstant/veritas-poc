import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ConfirmationDialogProps {
  isOpen?: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm?: () => void
  description?: string
  confirmText?: string
  cancelText?: string
  className?: string
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen = false,
  onClose,
  onCancel,
  onConfirm,
  description = "Tem certeza de que deseja cancelar esta verificação? Se você cancelar, tudo que foi feito até agora será perdido.",
  confirmText = "Cancelar",
  cancelText = "Fechar",
  className,
}) => {

  return (
    <DialogPrimitive open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "w-[516px] bg-neutral-50 rounded-[16px] px-10 py-8 gap-4",
          "shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15),0px_20px_80px_0px_rgba(137,44,219,0.2)]",
          "outline outline-1 outline-offset-[-1px] outline-[#351397]",
          className
        )}
        showCloseButton={false}
      >
        <div className="flex flex-col gap-6 items-center justify-start w-full">
          {/* Icon Section */}
          <div className="flex items-center justify-center p-[24px] rounded-[15px] bg-[rgba(132,74,233,0.1)]">
            <div className="flex items-center justify-center text-[#8A5CDA]">
              <AlertTriangle className="size-12" />
            </div>
          </div>
          
          {/* Message Section */}
          <div className="w-full text-center">
            <DialogDescription className="text-[#383838] text-[16px] leading-[24px] tracking-[0.16px] font-[var(--font-inter)] font-normal">
              {description}
            </DialogDescription>
          </div>
        </div>

        {/* Actions Section */}
        <DialogFooter className="flex items-center w-full gap-2">
          <div className="flex w-full items-center">
            <Button
              variant="link"
              size="sm"
              onClick={onCancel || onClose}
              className="ml-0"
            >
              {cancelText}
            </Button>
            <div className="flex-1" />
            <Button
              variant="outlined"
              size="sm"
              onClick={onConfirm || onClose}
              className="mr-0"
            >
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </DialogPrimitive>
  )
}

export { ConfirmationDialog }
export type { ConfirmationDialogProps }
