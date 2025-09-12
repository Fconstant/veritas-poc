import * as React from "react"

import { cn } from "@/lib/utils"

type NativeTextareaAttrs = React.TextareaHTMLAttributes<HTMLTextAreaElement>

interface TextAreaProps extends Omit<NativeTextareaAttrs, "value" | "onChange"> {
  value?: string
  placeholder?: string
  label?: string
  maxLength?: number
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  className?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  id?: string
  name?: string
  ariaLabel?: string
}

const Textarea: React.FC<TextAreaProps> = ({
  value = "",
  placeholder = "Placeholder text...",
  label = "Label",
  maxLength = 1024,
  disabled = false,
  readOnly = false,
  required = false,
  className,
  onChange,
  onFocus,
  onBlur,
  id,
  name,
  ariaLabel,
  ...rest
}) => {
  const [currentValue, setCurrentValue] = React.useState<string>(value)
  const [isFocused, setIsFocused] = React.useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setCurrentValue(newValue)
    onChange?.(newValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  // Opacidade do gradiente por estado:
  // - Default: 0.2
  // - Focused (sem texto): 0.5
  // - Entered (com texto): 1.0
  const gradientOpacity = currentValue.length > 0 ? 1 : (isFocused ? 0.5 : 0.2)
  const isError = !disabled && currentValue.length > maxLength
  const containerFill = disabled ? "#f8f8f8" : (currentValue.length > 0 ? "#ffffff" : "#f8f8f8")
  const containerBackground = disabled
    ? undefined
    : (isError 
      ? `linear-gradient(${containerFill},${containerFill}) padding-box, linear-gradient(90deg, rgba(239,68,68,0.5) 0%, rgba(220,38,38,0.5) 100%) border-box`
      : `linear-gradient(${containerFill},${containerFill}) padding-box, linear-gradient(90deg, rgba(53,19,151,${gradientOpacity}) 0%, rgba(8,133,185,${gradientOpacity}) 100%) border-box`)

  return (
    <div
      className={cn(
        "content-stretch flex flex-col gap-2 items-start justify-start relative size-full",
        className
      )}
    >
      {/* Header com Label e Contador */}
      <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
        <div className="content-stretch flex gap-2 items-center justify-center relative shrink-0">
          <div className={cn(
            "flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-nowrap",
            isError ? "text-red-500" : "text-[#6e678a]"
          )}>
            <p className="leading-[24px] whitespace-pre">{label}</p>
          </div>
        </div>
        <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-sm text-nowrap">
          <p className={cn(
            "leading-[24px] whitespace-pre",
            isError ? "text-red-500" : "text-[rgba(110,103,138,0.7)]"
          )}>
            {isError
              ? `${currentValue.length}/${maxLength} character limit exceeded`
              : `${currentValue.length}/${maxLength} character limit`}
          </p>
        </div>
      </div>

      {/* TextArea Container */}
      <div
        className={cn(
          "box-border content-stretch flex flex-col gap-2 h-48 items-start justify-start p-[12px] relative rounded-[8px] shrink-0 w-full",
          disabled && "cursor-not-allowed"
        )}
        style={{
          border: disabled ? "none" : "1px solid transparent",
          background: containerBackground ?? "#f8f8f8",
        }}
      >
        <textarea
          id={id}
          name={name}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel || label}
          data-slot="textarea"
          className={cn(
            "leading-[28px] min-w-full not-italic tracking-[0.14px] bg-transparent border-none outline-none resize-none w-full h-full text-[#383838] placeholder:text-[#383838] placeholder:opacity-50",
            disabled && "opacity-[0.65] cursor-not-allowed"
          )}
          style={{ width: "min-content", fontSize: "16px", fontFamily: "Merriweather, serif" }}
          {...rest}
        />
      </div>
    </div>
  )
}

export { Textarea }
