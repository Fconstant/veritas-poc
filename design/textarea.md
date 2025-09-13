# TextArea Component - Design Specification

## Visão Geral
O componente TextArea é um elemento de entrada de texto multilinha que permite aos usuários inserir e editar texto em múltiplas linhas. É parte do sistema de design Veritas e segue os padrões de acessibilidade e usabilidade estabelecidos.

## Código da Spec Completa (Figma)

```tsx
export default function Property1Enabled() {
  return (
    <div className="content-stretch flex flex-col gap-2 items-start justify-start relative size-full" data-name="Property 1=Enabled" data-node-id="242:6935">
      <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-node-id="242:6922">
        <div className="content-stretch flex gap-2 items-center justify-center relative shrink-0" data-node-id="242:6923">
          <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#6e678a] text-[16px] text-nowrap" data-node-id="242:6924">
            <p className="leading-[normal] whitespace-pre">Label</p>
          </div>
        </div>
        <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(110,103,138,0.7)] text-nowrap" data-node-id="242:6925">
          <p className="leading-[normal] whitespace-pre">5000 characters limit</p>
        </div>
      </div>
      <div className="bg-[#f8f8f8] box-border content-stretch flex flex-col gap-2 h-48 items-start justify-start p-[12px] relative rounded-[8px] shrink-0 w-full" data-node-id="242:6930">
        <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="-webkit-box font-['Merriweather:Regular',_sans-serif] leading-[28px] min-w-full not-italic opacity-50 overflow-ellipsis overflow-hidden relative shrink-0 text-[#383838] text-[14px] tracking-[0.14px]" data-node-id="242:6931" style={{ width: "min-content" }}>
          <p className="mb-0">Placeholder text...</p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">&nbsp;</p>
          <p className>&nbsp;</p>
        </div>
      </div>
    </div>
  );
}
```

## Especificações Técnicas (Baseadas na Spec)

### Dimensões
- **Largura**: 100% do container pai
- **Altura**: 192px (h-48 = 12rem = 192px)
- **Padding interno**: 12px (p-[12px])
- **Border radius**: 8px (rounded-[8px])
- **Gap entre elementos**: 8px (gap-2)

### Cores e Estados

#### Estado Default (sem texto, sem foco)
- **Background**: #f8f8f8 (cinza muito claro)
- **Borda**: Gradiente com opacidade 0.20
- **Label text**: #6e678a (cinza médio)
- **Character limit text**: rgba(110,103,138,0.7) (cinza médio com 70% opacidade)
- **Placeholder text**: #383838 (cinza escuro) com 50% opacidade

#### Estado Focused (sem texto, com foco)
- **Background**: #f8f8f8 (cinza muito claro)
- **Borda**: Gradiente com opacidade 0.50
- **Label text**: #6e678a (cinza médio)
- **Character limit text**: rgba(110,103,138,0.7) (cinza médio com 70% opacidade)
- **Placeholder text**: #383838 (cinza escuro) com 50% opacidade

#### Estado Entered (com texto)
- **Background**: #ffffff (branco)
- **Borda**: Gradiente com opacidade 1.0
- **Label text**: #6e678a (cinza médio)
- **Character limit text**: rgba(110,103,138,0.7) (cinza médio com 70% opacidade)
- **Text content**: #383838 (cinza escuro)

#### Estado Error (excede limite de caracteres)
- **Background**: #ffffff (branco)
- **Borda**: Gradiente vermelho (rgba(239,68,68,0.5) a rgba(220,38,38,0.5))
- **Label text**: #cb1f1f (vermelho)
- **Character limit text**: #cb1f1f (vermelho) + texto "exceeded"
- **Text content**: #383838 (cinza escuro)

#### Estado Disabled (campo desabilitado)
- **Background**: #f8f8f8 (cinza muito claro)
- **Borda**: Nenhuma (sem gradiente)
- **Label text**: #6e678a (cinza médio)
- **Character limit text**: rgba(110,103,138,0.7) (cinza médio com 70% opacidade)
- **Text content**: #383838 (cinza escuro) com 65% opacidade
- **Placeholder text**: #383838 (cinza escuro) com 65% opacidade
- **Cursor**: not-allowed

### Tipografia
- **Label font**: Inter Medium, 16px, line-height 24px
- **Character limit font**: Inter Medium, 14px, line-height 24px
- **Text content font**: Merriweather Regular, 16px, line-height 28px
- **Placeholder font**: Merriweather Regular, 16px, line-height 28px
- **Letter spacing**: 0.14px

## Implementação TypeScript

```typescript
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
```

## Componente React Implementado

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea: React.FC<TextAreaProps> = ({
  value = "",
  placeholder = "Placeholder text...",
  label = "Label",
  maxLength = 5000,
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
```

## Características Específicas da Implementação

### Estados Dinâmicos
O componente gerencia automaticamente todos os estados:

1. **Default**: Gradiente com opacidade 0.20, background #f8f8f8
2. **Focused**: Gradiente com opacidade 0.50 (ao clicar)
3. **Entered**: Gradiente com opacidade 1.0 + background branco (ao digitar)
4. **Error**: Gradiente vermelho quando excede 5000 caracteres
5. **Disabled**: Sem gradiente + opacidade 0.65 + cursor not-allowed

### Lógica de Gradiente
```tsx
const gradientOpacity = currentValue.length > 0 ? 1 : (isFocused ? 0.5 : 0.2)
```

### Lógica de Background
```tsx
const containerFill = disabled ? "#f8f8f8" : (currentValue.length > 0 ? "#ffffff" : "#f8f8f8")
```

### Lógica de Error
```tsx
const isError = !disabled && currentValue.length > maxLength
```

### CSS Custom (globals.css)
```css
/* Força Merriweather no textarea placeholder */
textarea[data-slot="textarea"]::placeholder {
  font-family: Merriweather, serif !important;
  font-size: 16px !important;
}

/* Estado disabled - placeholder com opacidade reduzida */
textarea[data-slot="textarea"]:disabled::placeholder {
  opacity: 0.65 !important;
}
```

### Font Implementation
- **Fonte**: Merriweather aplicada via inline style `fontFamily: "Merriweather, serif"`
- **Tamanho**: 16px aplicado via inline style `fontSize: "16px"`
- **Line-height**: 28px via Tailwind `leading-[28px]`
- **Tracking**: 0.14px via Tailwind `tracking-[0.14px]`

### Acessibilidade
- **aria-label**: Usa label como fallback
- **data-slot**: Para CSS targeting
- **disabled**: Aplica cursor not-allowed
- **required**: Suporte nativo HTML5

## Referências

- [Figma Design - TextArea Component](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=242-6935&m=dev)
- [Ladle Stories - TextArea Component](http://localhost:61000/?story=ui--textarea)
- **Node ID**: 242:6935
- **Component Name**: Property1Enabled
- **Estados**: Default, Focused, Entered, Error, Disabled
- **Stories**: Interactive, Disabled