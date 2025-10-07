# Results_Header Component - Design Specification

## Visão Geral
O componente Results_Header é um cabeçalho que exibe o status da verificação de fatos, incluindo indicadores visuais de progresso e botões de ação contextual. É parte do sistema de design Veritas e apresenta três estados principais: Default (verificando), Error (erro na verificação) e Done (verificação completa).

## Código da Spec Completa (Figma)

```tsx
import { X, RotateCcw, Copy, Check, AlertCircle } from "lucide-react"

interface Component1Props {
  property1?: "Frame 98" | "Progress" | "Frame 95";
}

function Component1({ property1 = "Progress" }: Component1Props) {
  if (property1 === "Frame 98") {
    return (
      <div className="box-border content-stretch flex gap-2 items-center justify-center p-[8px] relative rounded-[100px] size-full" data-name="Property 1=Frame 98" data-node-id="154:14985">
        <div className="overflow-clip relative shrink-0 size-6" data-name="lucide" data-node-id="154:14982">
          <AlertCircle className="size-6 text-red-500" />
        </div>
      </div>
    );
  }
}

export default function ResultsHeader1() {
  return (
    <div className data-name="Results/Header" data-node-id="154:15964">
      {/* Estado Default - Verificando */}
      <div className="content-stretch flex items-start justify-start relative size-full" data-name="Property 1=Default" data-node-id="154:15868">
        <div className="bg-white content-stretch flex items-center justify-between relative shrink-0 w-[600px]" data-name="Header" data-node-id="154:15847">
          <div className="flex flex-row items-center self-stretch">
            <div className="content-stretch flex gap-4 h-full items-center justify-start relative shrink-0" id="node-I154_15847-154_14893">
              <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0" id="node-I154_15847-154_14987">
                <div className="relative shrink-0 size-6" data-name="Component 1" id="node-I154_15847-154_15003">
                  <div className="absolute bg-[#77e6a0] left-1/2 rounded-[9999px] size-6 top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Span" id="node-I154_15847-154_15003-154_14978" />
                  <div className="absolute bg-green-500 left-1/2 rounded-[9999px] size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Span" id="node-I154_15847-154_15003-154_14979" />
                </div>
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic opacity-70 relative shrink-0 text-[16px] text-nowrap text-slate-900" id="node-I154_15847-154_14894">
                  <p className="leading-[20px] whitespace-pre">Verificando...</p>
                </div>
              </div>
            </div>
          </div>
          <div className="box-border content-stretch flex gap-2 items-center justify-center px-3 py-2 relative rounded-[8px] shrink-0" data-name="Buttons" id="node-I154_15847-242_5893">
            <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="overflow-clip relative shrink-0 size-4" data-name="lucide" id="node-I154_15847-242_5893-241_3050">
              <X className="size-4" />
            </div>
            <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#8a5cda] text-[14px] text-nowrap" id="node-I154_15847-242_5893-241_3052">
              <p className="leading-[24px] whitespace-pre">Cancel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado Error - Erro na Verificação */}
      <div className="content-stretch flex items-start justify-start relative size-full" data-name="Property 1=error" data-node-id="154:15877">
        <div className="bg-white content-stretch flex items-center justify-between relative shrink-0 w-[600px]" data-name="Header" data-node-id="154:15044">
          <div className="flex flex-row items-center self-stretch">
            <div className="content-stretch flex gap-4 h-full items-center justify-start relative shrink-0" id="node-I154_15044-154_14893">
              <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0" id="node-I154_15044-154_14987">
                <div className="box-border content-stretch flex gap-2 items-center justify-center p-[8px] relative rounded-[100px] shrink-0 size-6" data-name="Component 1" id="node-I154_15044-154_15003">
                  <div className="overflow-clip relative shrink-0 size-6" data-name="lucide" id="node-I154_15044-154_15003-154_14982">
                    <AlertCircle className="size-6 text-red-500" />
                  </div>
                </div>
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#ea3f3f] text-[16px] text-nowrap" id="node-I154_15044-154_14894">
                  <p className="leading-[20px] whitespace-pre">Erro na Verificação</p>
                </div>
              </div>
            </div>
          </div>
          <div className="box-border content-stretch flex gap-2 items-center justify-center px-3 py-2 relative rounded-[8px] shrink-0" data-name="Buttons" id="node-I154_15044-242_5893">
            <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="overflow-clip relative shrink-0 size-4" data-name="lucide" id="node-I154_15044-242_5893-241_3050">
              <RotateCcw className="size-4" />
            </div>
            <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#8a5cda] text-[14px] text-nowrap" id="node-I154_15044-242_5893-241_3052">
              <p className="leading-[24px] whitespace-pre">Try again</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado Done - Verificação Completa */}
      <div className="content-stretch flex items-start justify-start relative size-full" data-name="Property 1=done" data-node-id="154:15886">
        <div className="bg-white content-stretch flex items-center justify-between relative shrink-0 w-[600px]" data-name="Header" data-node-id="154:15013">
          <div className="flex flex-row items-center self-stretch">
            <div className="content-stretch flex gap-4 h-full items-center justify-start relative shrink-0" id="node-I154_15013-154_14893">
              <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0" id="node-I154_15013-154_14987">
                <div className="box-border content-stretch flex gap-2 items-center justify-center opacity-50 p-[8px] relative rounded-[100px] shrink-0 size-6" data-name="Component 1" id="node-I154_15013-154_15003">
                  <div className="overflow-clip relative shrink-0 size-6" data-name="lucide" id="node-I154_15013-154_15003-154_14966">
                    <Check className="size-6 text-green-500" />
                  </div>
                </div>
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic opacity-70 relative shrink-0 text-[16px] text-nowrap text-slate-900" id="node-I154_15013-154_14894">
                  <p className="leading-[20px] whitespace-pre">Verificação Completa</p>
                </div>
              </div>
            </div>
          </div>
          <div className="box-border content-stretch flex gap-2 items-center justify-center px-3 py-2 relative rounded-[8px] shrink-0" data-name="Buttons" id="node-I154_15013-242_5893">
            <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" />
            <div className="overflow-clip relative shrink-0 size-4" data-name="lucide" id="node-I154_15013-242_5893-241_3050">
              <Copy className="size-4" />
            </div>
            <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#8a5cda] text-[14px] text-nowrap" id="node-I154_15013-242_5893-241_3052">
              <p className="leading-[24px] whitespace-pre">Copy Plain Text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Especificações Técnicas (Baseadas na Spec)

### Dimensões
- **Largura**: 600px (w-[600px])
- **Altura**: 40px (altura padrão do header)
- **Padding do botão**: 12px horizontal, 8px vertical (px-3 py-2)
- **Gap entre elementos**: 8px (gap-2)
- **Border radius do botão**: 8px (rounded-[8px])
- **Border radius do ícone**: 100px (rounded-[100px])

### Estados e Cores

#### Estado Default (Verificando)
- **Background**: #ffffff (branco)
- **Borda do botão**: #351397 (roxo Veritas)
- **Status text**: "Verificando..." com opacity-70 e text-slate-900
- **Ícone**: Círculo verde animado (#77e6a0 + green-500)
- **Botão text**: "Cancel" em #8a5cda
- **Ícone do botão**: X (cancelar)

#### Estado Error (Erro na Verificação)
- **Background**: #ffffff (branco)
- **Borda do botão**: #351397 (roxo Veritas)
- **Status text**: "Erro na Verificação" em #ea3f3f (vermelho)
- **Ícone**: Ícone de erro com padding
- **Botão text**: "Try again" em #8a5cda
- **Ícone do botão**: Refresh (tentar novamente)

#### Estado Done (Verificação Completa)
- **Background**: #ffffff (branco)
- **Borda do botão**: #351397 (roxo Veritas)
- **Status text**: "Verificação Completa" com opacity-70 e text-slate-900
- **Ícone**: Check com opacity-50
- **Botão text**: "Copy Plain Text" em #8a5cda
- **Ícone do botão**: Copy (copiar texto)

### Tipografia
- **Status font**: Inter Medium, 16px, line-height 20px
- **Botão font**: Inter Semi Bold, 14px, line-height 24px
- **Cores**: 
  - Default: text-slate-900 com opacity-70
  - Error: #ea3f3f (vermelho)
  - Done: text-slate-900 com opacity-70

### Ícones e Assets (Lucide React)
- **Ícone de progresso**: Círculo verde animado (2 círculos sobrepostos)
- **Ícone de erro**: AlertCircle (lucide-react)
- **Ícone de sucesso**: Check (lucide-react)
- **Ícone cancelar**: X (lucide-react)
- **Ícone refresh**: RotateCcw (lucide-react)
- **Ícone copy**: Copy (lucide-react)

**CRÍTICO**: Todos os ícones devem usar componentes do Lucide React - NUNCA SVG puro!

## Regras do Design System para Ícones

### ✅ CORRETO - Usar Lucide React
```tsx
import { X, RotateCcw, Copy, Check, AlertCircle } from "lucide-react"

// Uso correto
<X className="size-4" />
<Check className="size-6 text-green-500" />
<AlertCircle className="size-6 text-red-500" />
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
- **Tamanhos**: Use classes Tailwind `size-4`, `size-5`, `size-6`
- **Cores**: Use classes Tailwind `text-red-500`, `text-green-500`, `text-primary`
- **Responsividade**: Ícones se adaptam automaticamente ao tamanho do container

## Implementação TypeScript

```typescript
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
}
```

## Componente React Implementado

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { X, RotateCcw, Copy, Check } from "lucide-react"

type VerificationStatus = "verifying" | "error" | "done"

interface ResultsHeaderProps {
  status: VerificationStatus
  onCancel?: () => void
  onRetry?: () => void
  onCopy?: () => void
  className?: string
  disabled?: boolean
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  status,
  onCancel,
  onRetry,
  onCopy,
  className,
  disabled = false,
}) => {
  const getStatusConfig = (): StatusConfig => {
    switch (status) {
      case "verifying":
        return {
          text: "Verificando...",
          textColor: "text-slate-900 opacity-70",
          icon: (
            <div className="relative shrink-0 size-6">
              <div className="absolute bg-[#77e6a0] left-1/2 rounded-[9999px] size-6 top-1/2 translate-x-[-50%] translate-y-[-50%]" />
              <div className="absolute bg-green-500 left-1/2 rounded-[9999px] size-3 top-1/2 translate-x-[-50%] translate-y-[-50%]" />
            </div>
          ),
          buttonText: "Cancel",
          buttonIcon: <X className="size-4" />,
          onButtonClick: onCancel,
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
            <div className="box-border content-stretch flex gap-2 items-center justify-center opacity-50 p-[8px] relative rounded-[100px] shrink-0 size-6">
              <div className="overflow-clip relative shrink-0 size-6">
                <Check className="size-6 text-green-500" />
              </div>
            </div>
          ),
          buttonText: "Copy Plain Text",
          buttonIcon: <Copy className="size-4" />,
          onButtonClick: onCopy,
        }
      
      default:
        return {
          text: "Verificando...",
          textColor: "text-slate-900 opacity-70",
          icon: null,
          buttonText: "Cancel",
          buttonIcon: <X className="size-4" />,
          onButtonClick: onCancel,
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
      <div className="bg-white content-stretch flex items-center justify-between relative shrink-0 w-[600px]">
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
                <p className="leading-[20px] whitespace-pre">{config.text}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="box-border content-stretch flex gap-2 items-center justify-center px-3 py-2 relative rounded-[8px] shrink-0">
          <div 
            aria-hidden="true" 
            className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" 
          />
          <div className="overflow-clip relative shrink-0 size-4">
            {config.buttonIcon}
          </div>
          <div className="font-[var(--font-inter)] font-semibold leading-[0] not-italic relative shrink-0 text-[#8a5cda] text-[14px] text-nowrap">
            <p className="leading-[24px] whitespace-pre">{config.buttonText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export { ResultsHeader }
```

## Características Específicas da Implementação

### Estados Dinâmicos
O componente gerencia automaticamente três estados:

1. **Verifying**: Mostra animação de progresso + botão "Cancel"
2. **Error**: Mostra ícone de erro + botão "Try again"
3. **Done**: Mostra ícone de sucesso + botão "Copy Plain Text"

### Lógica de Estados
```tsx
const getStatusConfig = (): StatusConfig => {
  switch (status) {
    case "verifying": return { /* config verifying */ }
    case "error": return { /* config error */ }
    case "done": return { /* config done */ }
  }
}
```

### Ícones e Animações (Lucide React)
- **Progress**: Círculo verde com animação (2 círculos sobrepostos)
- **Error**: AlertCircle (lucide-react) com padding
- **Success**: Check (lucide-react) com opacity reduzida

### Botões Contextuais
- **Cancel**: Aparece durante verificação
- **Try again**: Aparece em caso de erro
- **Copy Plain Text**: Aparece quando verificação completa

### Font Implementation
- **Status text**: Inter Medium, 16px via CSS variable
- **Button text**: Inter Semi Bold, 14px via CSS variable
- **Cores específicas**: #ea3f3f para erro, #8a5cda para botões

### Acessibilidade
- **aria-hidden**: Aplicado na borda decorativa
- **Semantic structure**: Header com status e ação claramente separados
- **Focus management**: Botões com estados visuais claros

## Referências

- [Figma Design - Results Header Component](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-15964&t=pdGW6MiEiOTir3rO-11)
- **Node ID**: 154:15964
- **Component Name**: Results/Header
- **Estados**: Default (verifying), Error, Done
- **Dimensões**: 600px × 40px
- **Assets**: Ícones Lucide React (X, RotateCcw, Copy, Check, AlertCircle)
- **Regra CRÍTICA**: NUNCA usar SVG puro - SEMPRE usar componentes Lucide React!