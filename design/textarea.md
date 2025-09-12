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
          <p className="leading-[normal] whitespace-pre">1024 characters limit</p>
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

#### Estado Enabled (Ativo)
- **Background**: #f8f8f8 (cinza muito claro)
- **Border**: #351397 (roxo escuro)
- **Label text**: #6e678a (cinza médio)
- **Character limit text**: rgba(110,103,138,0.7) (cinza médio com 70% opacidade)
- **Placeholder text**: #383838 (cinza escuro) com 50% opacidade

#### Estado Disabled (Desabilitado)
- **Background**: #f8f8f8 (cinza muito claro)
- **Border**: Nenhuma (sem gradiente)
- **Label text**: #6e678a (cinza médio)
- **Character limit text**: rgba(110,103,138,0.7) (cinza médio com 70% opacidade)
- **Text content**: #383838 (cinza escuro) com 65% opacidade
- **Placeholder text**: #383838 (cinza escuro) com 65% opacidade
- **Cursor**: not-allowed

### Tipografia
- **Label font**: Inter Medium, 16px
- **Character limit font**: Inter Medium, 14px
- **Placeholder font**: Merriweather Regular, 16px
- **Text content font**: Merriweather Regular, 16px
- **Placeholder line height**: 28px
- **Text line height**: 28px
- **Letter spacing**: 0.14px

## Estrutura do Componente

### Layout Principal
- **Container principal**: `flex flex-col gap-2` - Layout vertical com espaçamento de 8px
- **Header**: `flex items-end justify-between` - Label à esquerda, contador à direita
- **TextArea**: `bg-[#f8f8f8] h-48 p-[12px] rounded-[8px]` - Área de texto com altura fixa

### Elementos Visuais
1. **Label**: Texto "Label" em Inter Medium, 16px, cor #6e678a
2. **Character Counter**: "1024 characters limit" em Inter Medium, 14px, cor rgba(110,103,138,0.7)
3. **Border**: Borda roxa #351397 com 1px de espessura
4. **Placeholder**: Texto em Merriweather Regular, 14px, cor #383838 com 50% opacidade

## Implementação TypeScript

```typescript
interface TextAreaProps {
  // Conteúdo
  value?: string;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  
  // Comportamento
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  
  // Estilo
  className?: string;
  
  // Eventos
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Acessibilidade
  id?: string;
  name?: string;
  ariaLabel?: string;
}
```

## Componente React Implementado

```tsx
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps {
  value?: string;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  ariaLabel?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  value = '',
  placeholder = 'Placeholder text...',
  label = 'Label',
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
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn(
      'content-stretch flex flex-col gap-2 items-start justify-start relative size-full',
      className
    )}>
      {/* Header com Label e Contador */}
      <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
        <div className="content-stretch flex gap-2 items-center justify-center relative shrink-0">
          <div className="flex flex-col font-[\'Inter:Medium\',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#6e678a] text-[16px] text-nowrap">
            <p className="leading-[normal] whitespace-pre">{label}</p>
          </div>
        </div>
        <div className="flex flex-col font-[\'Inter:Medium\',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(110,103,138,0.7)] text-nowrap">
          <p className="leading-[normal] whitespace-pre">{maxLength} characters limit</p>
        </div>
      </div>
      
      {/* TextArea Container */}
      <div className="bg-[#f8f8f8] box-border content-stretch flex flex-col gap-2 h-48 items-start justify-start p-[12px] relative rounded-[8px] shrink-0 w-full">
        <div 
          aria-hidden="true" 
          className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" 
        />
        <textarea
          id={id}
          name={name}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-label={ariaLabel || label}
          className="font-[\'Merriweather:Regular\',_sans-serif] leading-[28px] min-w-full not-italic text-[#383838] text-[14px] tracking-[0.14px] bg-transparent border-none outline-none resize-none w-full h-full"
          style={{ width: "min-content" }}
        />
      </div>
    </div>
  );
};

export default TextArea;
```

## Características Específicas da Spec

### Layout e Estrutura
- **Container principal**: Flexbox vertical com gap de 8px
- **Header**: Flexbox horizontal com justify-between para label e contador
- **TextArea**: Altura fixa de 192px (h-48) com padding de 12px
- **Border**: Borda absoluta posicionada sobre o container

### Fontes e Tipografia
- **Label**: Inter Medium, 16px, cor #6e678a, Line heigh: 24px
- **Contador**: Inter Medium, 14px, cor rgba(110,103,138,0.7)
- **Placeholder**: Merriweather Regular, 14px, cor #383838 com 50% opacidade
- **Line height**: 28px para o placeholder

### Cores do Sistema
- **Background**: #f8f8f8 (cinza muito claro)
- **Border**: #351397 (roxo escuro)
- **Label**: #6e678a (cinza médio)
- **Contador**: rgba(110,103,138,0.7) (cinza médio com 70% opacidade)
- **Placeholder**: #383838 (cinza escuro) com 50% opacidade

## Referências

- [Figma Design - TextArea Component](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=242-6935&m=dev)
- **Node ID**: 242:6935
- **Component Name**: Property1Enabled
