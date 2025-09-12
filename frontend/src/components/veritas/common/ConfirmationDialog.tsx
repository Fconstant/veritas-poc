import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"
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
  description = "Are you sure you want to cancel this verification? If you cancel, everything done so far will be lost.",
  confirmText = "Cancel",
  cancelText = "Close",
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
          <button
            onClick={onCancel || onClose}
            className="flex-1 px-3 py-2 text-[#8a5cda] text-[14px] font-[var(--font-inter)] font-semibold leading-[24px] hover:bg-gray-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm || onClose}
            className="flex-1 px-3 py-2 rounded-lg text-[#8a5cda] text-[14px] font-[var(--font-inter)] font-semibold leading-[24px] hover:bg-[#351397]/5 transition-colors relative"
          >
            <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-lg" />
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </DialogPrimitive>
  )
}

export { ConfirmationDialog }
export type { ConfirmationDialogProps }
