import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] font-semibold transition-all disabled:pointer-events-none data-[state=loading]:pointer-events-none data-[state=loading]:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        // Filled (Figma: Filled Enabled/Hovered/Disabled)
        filled:
          "bg-[#844ae9] text-white border border-[#351397] hover:bg-[#5d13dd] disabled:opacity-45",
        // Outlined (Figma: Outlined Enabled/Hovered/Disabled) - Borda degradê com opacidade
        outlined:
          "bg-transparent text-[#8a5cda] hover:bg-[#f6f6f6] hover:text-[#5d13dd] disabled:opacity-50 disabled:text-[#9d6eed]",
        // Link (Figma: Link SM/Default) - Padding específico e hover com fundo
        link:
          "bg-transparent text-[#8a5cda] hover:text-[#5d13dd] hover:bg-[#F3EDFD] hover:underline disabled:text-[#8a5cda] disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0",
      },
      size: {
        // SM: 32px height para filled/outlined
        sm: "h-8 px-3 py-1 text-[14px] leading-[24px] [&_svg]:size-4",
        // Default: 48px height para filled/outlined  
        default: "h-12 px-4 py-3 text-[16px] leading-[24px] [&_svg]:size-6",
        icon: "size-12",
      },
    },
    compoundVariants: [
      // Link SM - Padding específico do Figma
      {
        variant: "link",
        size: "sm",
        class: "px-1 py-0.5 text-[14px] leading-normal [&_svg]:size-4",
      },
      // Link Default - Padding específico do Figma
      {
        variant: "link", 
        size: "default",
        class: "px-1.5 py-1 text-[16px] leading-normal [&_svg]:size-6",
      },
    ],
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }

const Button = React.forwardRef<React.ElementRef<"button">, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : ("button" as const)
    const isDisabled = Boolean(loading || disabled)

    // Estilos inline para borda degradê do outlined
    const getOutlinedStyles = () => {
      if (variant !== "outlined") return {}
      
      return {
        border: "1px solid transparent",
        background: `linear-gradient(white, white) padding-box, linear-gradient(90deg, rgba(53,19,151,0.5) 0%, rgba(53,19,151,0.5) 100%) border-box`,
      }
    }

    const getOutlinedHoverStyles = () => {
      if (variant !== "outlined") return {}
      
      return {
        background: `linear-gradient(#f6f6f6, #f6f6f6) padding-box, linear-gradient(90deg, rgba(53,19,151,1) 0%, rgba(53,19,151,1) 100%) border-box`,
      }
    }

    return (
      <Comp
        data-slot="button"
        data-state={loading ? "loading" : undefined}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={cn(
          buttonVariants({ variant, size, className }),
          // Garantir estilos de disabled mesmo em asChild via aria-disabled
          "aria-disabled:pointer-events-none aria-disabled:opacity-50"
        )}
        style={{
          ...getOutlinedStyles(),
          ...props.style,
        }}
        onMouseEnter={(e) => {
          if (variant === "outlined" && !isDisabled) {
            Object.assign(e.currentTarget.style, getOutlinedHoverStyles())
          }
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          if (variant === "outlined" && !isDisabled) {
            Object.assign(e.currentTarget.style, getOutlinedStyles())
          }
          props.onMouseLeave?.(e)
        }}
        ref={ref}
        {...(!asChild
          ? { type: "button", disabled: isDisabled }
          : { tabIndex: isDisabled ? -1 : props.tabIndex })}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
