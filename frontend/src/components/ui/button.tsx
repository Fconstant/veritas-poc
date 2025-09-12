import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=loading]:pointer-events-none data-[state=loading]:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
  {
    variants: {
      variant: {
        // Filled (Figma: Filled Enabled/Hovered/Disabled)
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 dark:bg-destructive/60 dark:hover:bg-destructive/70 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        // Outlined (Figma: Outlined Enabled/Hovered/Disabled)
        outline:
          "border border-input bg-background text-primary hover:bg-primary/10",
        link:
          "h-auto p-0 text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:ring-0 focus-visible:ring-offset-0",
      },
      size: {
        // Default: 48px height, Small: 40px height (Figma)
        default: "h-12 px-5 has-[>svg]:px-4",
        sm: "h-10 px-4 has-[>svg]:px-3",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
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
