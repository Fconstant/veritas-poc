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
        // Outlined (Figma: Outlined Enabled/Hovered/Disabled)
        outlined:
          "border border-[#351397] bg-transparent text-[#8a5cda] hover:bg-[#f6f6f6] hover:text-[#5d13dd] disabled:opacity-50 disabled:text-[#9d6eed]",
        // Link (Figma: Link SM/MD)
        link:
          "bg-transparent text-[#8a5cda] hover:text-[#5d13dd] disabled:text-[#9d6eed] disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0",
        // Legacy variants for compatibility
        default:
          "bg-[#844ae9] text-white border border-[#351397] hover:bg-[#5d13dd] disabled:opacity-45",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 dark:bg-destructive/60 dark:hover:bg-destructive/70 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-[#351397] bg-transparent text-[#8a5cda] hover:bg-[#f6f6f6] hover:text-[#5d13dd] disabled:opacity-50 disabled:text-[#9d6eed]",
      },
      size: {
        // SM: 32px height, MD: 48px height (Figma)
        sm: "h-8 px-3 py-1 text-[14px] leading-[24px] [&_svg]:size-4",
        md: "h-12 px-4 py-3 text-[16px] leading-[24px] [&_svg]:size-6",
        // Legacy sizes for compatibility
        default: "h-12 px-4 py-3 text-[16px] leading-[24px] [&_svg]:size-6",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
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
