# Dialog Component - Design Specification

## Visão Geral
O componente ConfirmationDialog é um modal de confirmação que exibe uma mensagem de aviso com duas opções de ação. É usado para confirmar ações destrutivas como cancelar uma verificação em andamento. O componente apresenta um design elegante com ícone de alerta (AlertTriangle), mensagem clara e botões de ação contextual.

## Código da Spec Completa (Figma)

```tsx
import { AlertTriangle, X } from "lucide-react"

interface DialogProps {
  isOpen?: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm?: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "warning" | "error" | "info"
  className?: string
}

function Dialog() {
  return (
    <div className="bg-neutral-50 relative rounded-[16px] size-full" data-name="Dialog" data-node-id="299:2944">
      <div className="box-border content-stretch flex flex-col gap-4 items-end justify-start overflow-clip px-10 py-8 relative size-full">
        <div className="content-stretch flex flex-col gap-6 items-center justify-start relative shrink-0 w-full" data-node-id="177:3860">
          <div className="bg-[rgba(132,74,233,0.1)] box-border content-stretch flex gap-2 items-center justify-start p-[24px] relative rounded-[15px] shrink-0" data-node-id="177:3858">
            <div className="overflow-clip relative shrink-0 size-12" data-name="lucide" data-node-id="177:3855">
              <AlertTriangle className="size-12 text-[#8A5CDA]" />
            </div>
          </div>
          <div className="font-[var(--font-inter)] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#383838] text-[16px] tracking-[0.16px]" data-node-id="177:3839" style={{ width: "min-content" }}>
            <p className="leading-[24px]">Are you sure you want to cancel this verification? If you cancel, everything done so far will be lost.</p>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-node-id="177:3801">
          <div className="box-border content-stretch flex gap-2 items-center justify-center px-3 py-2 relative rounded-[8px] shrink-0" data-name="Buttons" data-node-id="299:2940">
            <div className="font-[var(--font-inter)] font-semibold leading-[0] not-italic relative shrink-0 text-[#8a5cda] text-[14px] text-nowrap" id="node-I299_2940-241_3052">
              <p className="leading-[24px] whitespace-pre">Close</p>
            </div>
          </div>
          <div className="box-border content-stretch flex gap-2 items-center justify-center px-3 py-2 relative rounded-[8px] shrink-0" data-name="Buttons" data-node-id="299:2935">
            <div className="box-border content-stretch flex gap-2 items-center justify-center px-3 py-2 relative rounded-[8px] size-full" data-name="Property 1=Outlined Enabled SM" data-node-id="241:3162">
              <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" />
              <div className="font-[var(--font-inter)] font-semibold leading-[0] not-italic relative shrink-0 text-[#8a5cda] text-[14px] text-nowrap" data-node-id="241:3052">
                <p className="leading-[24px] whitespace-pre">Cancel</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15),0px_20px_80px_0px_rgba(137,44,219,0.2)]" />
    </div>
  );
}
```

## Especificações Técnicas (Baseadas na Spec)

### Dimensões
- **Largura**: 516px (w-[516px])
- **Altura**: 288px (h-[288px])
- **Padding interno**: 40px horizontal, 32px vertical (px-10 py-8)
- **Border radius**: 16px (rounded-[16px])
- **Gap entre seções**: 16px (gap-4)
- **Gap no conteúdo**: 24px (gap-6)
- **Padding do ícone**: 24px (p-[24px])
- **Border radius do ícone**: 15px (rounded-[15px])

### Estados e Cores

#### Estado Default (Warning)
- **Background**: #f5f5f5 (neutral-50)
- **Borda**: #351397 (roxo Veritas) com outline
- **Ícone background**: rgba(132,74,233,0.1) (violet-600/10)
- **Ícone**: AlertTriangle em #8A5CDA (violet-500)
- **Texto**: #383838 (neutral-700) com Inter Regular
- **Botão Close**: Texto apenas em #8a5cda
- **Botão Cancel**: Background transparente com borda #351397

### Tipografia
- **Mensagem font**: Inter Regular, 16px, line-height 24px
- **Botão font**: Inter Semi Bold, 14px, line-height 24px
- **Tracking**: 0.16px para o texto principal
- **Cores**: 
  - Texto principal: #383838 (neutral-700)
  - Botões: #8a5cda (violet-500)

### Ícones e Assets (Lucide React)
- **Ícone de alerta**: AlertTriangle (lucide-react)
- **Ícone de fechar**: X (lucide-react) - para o botão de fechar do modal

**CRÍTICO**: Todos os ícones devem usar componentes do Lucide React - NUNCA SVG puro!

## Regras do Design System para Ícones

### ✅ CORRETO - Usar Lucide React
```tsx
import { AlertTriangle, X } from "lucide-react"

// Uso correto
<AlertTriangle className="size-12 text-[#8A5CDA]" />
<X className="size-4" />
```

### ❌ INCORRETO - Nunca usar SVG puro
```tsx
// ❌ NUNCA fazer isso
<img src="path/to/icon.svg" />
<div dangerouslySetInnerHTML={{ __html: svgString }} />

// ❌ NUNCA criar componentes SVG customizados
const CustomIcon = () => (
  <svg>...</svg>
)
```

### Implementação de Ícones
- **Importação**: `import { IconName } from "lucide-react"`
- **Tamanhos**: Use classes Tailwind `size-12` para ícones grandes
- **Cores**: Use classes Tailwind `text-[#8A5CDA]` para cores específicas
- **Responsividade**: Ícones se adaptam automaticamente ao tamanho do container

## Implementação TypeScript

```typescript
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
```

## Componente React Implementado

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, X, AlertCircle, Info } from "lucide-react"
import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DialogProps {
  isOpen?: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm?: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "warning" | "error" | "info"
  className?: string
}

const ConfirmationDialog: React.FC<DialogProps> = ({
  isOpen = false,
  onClose,
  onCancel,
  onConfirm,
  title,
  description = "Are you sure you want to cancel this verification? If you cancel, everything done so far will be lost.",
  confirmText = "Cancel",
  cancelText = "Close",
  variant = "warning",
  className,
}) => {
  const getIconConfig = (): { icon: React.ReactNode; bgColor: string; iconColor: string } => {
    switch (variant) {
      case "warning":
        return {
          icon: <AlertTriangle className="size-12" />,
          bgColor: "bg-[rgba(132,74,233,0.1)]",
          iconColor: "text-[#8A5CDA]",
        }
      case "error":
        return {
          icon: <AlertCircle className="size-12" />,
          bgColor: "bg-red-50",
          iconColor: "text-red-500",
        }
      case "info":
        return {
          icon: <Info className="size-12" />,
          bgColor: "bg-blue-50",
          iconColor: "text-blue-500",
        }
      default:
        return {
          icon: <AlertTriangle className="size-12" />,
          bgColor: "bg-[rgba(132,74,233,0.1)]",
          iconColor: "text-[#8A5CDA]",
        }
    }
  }

  const iconConfig = getIconConfig()

  return (
    <DialogPrimitive open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "w-[516px] bg-neutral-50 rounded-[16px] p-10 gap-4",
          "shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15),0px_20px_80px_0px_rgba(137,44,219,0.2)]",
          "outline outline-1 outline-offset-[-1px] outline-[#351397]",
          className
        )}
        showCloseButton={false}
      >
        <div className="flex flex-col gap-6 items-center justify-start w-full">
          {/* Icon Section */}
          <div className={cn(
            "flex items-center justify-center p-[24px] rounded-[15px]",
            iconConfig.bgColor
          )}>
            <div className={cn("flex items-center justify-center", iconConfig.iconColor)}>
              {iconConfig.icon}
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
        <DialogFooter className="flex items-center justify-between w-full">
          <button
            onClick={onCancel || onClose}
            className="px-3 py-2 text-[#8a5cda] text-[14px] font-[var(--font-inter)] font-semibold leading-[24px] hover:bg-gray-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm || onClose}
            className="px-3 py-2 rounded-lg border border-[#351397] text-[#8a5cda] text-[14px] font-[var(--font-inter)] font-semibold leading-[24px] hover:bg-[#351397]/5 transition-colors relative"
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
export type { DialogProps }
```

## Características Específicas da Implementação

### Estados Dinâmicos
O componente apresenta um design fixo com ícone de alerta:

1. **Warning**: Ícone AlertTriangle com background roxo claro (rgba(132,74,233,0.1))

### Ícones e Animações
- **Warning**: AlertTriangle em roxo (#8A5CDA)

### Botões Contextuais
- **Close**: Botão de texto simples (ação secundária) - posicionado à esquerda
- **Cancel/Confirm**: Botão com borda (ação primária) - posicionado à direita
- **Layout**: Ambos os botões ocupam 100% da largura disponível com gap entre eles

### Font Implementation
- **Mensagem**: Inter Regular, 16px via CSS variable
- **Botões**: Inter Semi Bold, 14px via CSS variable
- **Cores específicas**: #8a5cda para botões, #383838 para texto

### Acessibilidade
- **Dialog primitives**: Usa Radix UI para acessibilidade completa
- **Focus management**: Gerenciamento automático de foco
- **Keyboard navigation**: Suporte completo ao teclado
- **Screen readers**: Labels e descrições apropriadas

## Referências

- [Figma Design - Dialog Component](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=299-2944&t=pdGW6MiEiOTir3rO-11)
- **Node ID**: 299:2944
- **Component Name**: ConfirmationDialog
- **Variante**: Warning (única)
- **Dimensões**: 516px × 288px
- **Assets**: Ícones Lucide React (AlertTriangle)
- **Regra CRÍTICA**: NUNCA usar SVG puro - SEMPRE usar componentes Lucide React!
