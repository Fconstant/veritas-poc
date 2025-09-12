# Home Page - Design Specification

## Visão Geral
A Home Page do Veritas é a landing page principal que apresenta o produto de verificação de fatos. É uma página clean e minimalista com foco na funcionalidade principal: permitir que usuários coloquem texto para verificação. A página apresenta um layout assimétrico com hero section à esquerda e o formulário de verificação à direita.

## Código da Spec Completa (Figma)

```tsx
import { FileText, Volume2, Play } from "lucide-react"

interface HomePageProps {
  className?: string
}

function HomePage() {
  return (
    <div className="bg-gradient-to-b from-[#f5f5f5] opacity-90 relative size-full to-[#eaeaea]" data-name="1: Landing Page / Empty State" data-node-id="141:8191">
      {/* Top Bar */}
      <div className="absolute box-border content-stretch flex items-center justify-between left-20 pb-4 pt-8 px-2 top-0 w-[1280px]" data-name="Top-bar" data-node-id="141:8343">
        <TopBar />
      </div>
      
      {/* Background Decoration */}
      <div className="absolute bottom-0 flex h-[800px] items-center justify-center left-0 w-[1440px]">
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="h-[800px] relative w-[1440px]" data-node-id="141:8192">
            <img alt className="block max-w-none size-full" src={imgFrame44} />
          </div>
        </div>
      </div>
      
      {/* Hero Section - Left Side */}
      <div className="absolute content-stretch flex flex-col h-[315px] items-start justify-between left-24 translate-y-[-50%] w-[629px]" data-node-id="193:4759" style={{ top: "calc(50% + 0.5px)" }}>
        <Frame84 />
      </div>
      
      {/* Verification Form - Right Side */}
      <div className="absolute backdrop-blur-[1.5px] backdrop-filter bg-[#f2f2f2] box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] rounded-[16px] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[571px]" data-node-id="175:2508" style={{ left: "calc(50% + 338.5px)" }}>
        <Frame82 />
      </div>
    </div>
  );
}

// Hero Section Component
function Frame84() {
  return (
    <div className="content-stretch flex flex-col items-start justify-between relative size-full" data-node-id="193:4759">
      <div className="content-stretch flex flex-col gap-4 items-start justify-start leading-[0] not-italic relative shrink-0 w-full" data-node-id="141:8346">
        {/* Main Title */}
        <div className="flex flex-col font-['Inter:Extra_Light',_sans-serif] font-extralight justify-center relative shrink-0 text-[#381257] text-[64px] tracking-[0.64px] w-full" data-node-id="141:8347">
          <p className="leading-[80px] mb-0">Paste text. </p>
          <p className="leading-[80px]">
            <span className>Get it</span>
            <span className="font-['Inter:Bold',_sans-serif] font-bold not-italic"> </span>
            <span className="font-['Inter:Bold',_sans-serif] font-bold not-italic text-[#731fb8]">fact-checked</span>
            <span className>.</span>
          </p>
        </div>
        
        {/* Subtitle */}
        <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center opacity-70 relative shrink-0 text-[#47415f] text-[20px] tracking-[0.2px] w-full" data-node-id="141:8348">
          <p className="leading-[32px]">We verify claims, and return citations — privacy-first.</p>
        </div>
      </div>
      
      {/* Features Badge */}
      <div className="box-border content-stretch flex gap-2 items-center justify-start px-3 py-2 relative rounded-[16px] shrink-0" data-node-id="239:3308">
        <div className="overflow-clip relative shrink-0 size-5" data-name="lucide" data-node-id="239:3309">
          <FileText className="size-5 text-[#731fb8]" />
        </div>
        <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6e678a] text-[14px] text-nowrap" data-node-id="239:3311">
          <p className="leading-[24px] whitespace-pre">
            <span className>Text Files </span>
            <span className="text-[#9a94ad]">and</span>
          </p>
        </div>
        <div className="overflow-clip relative shrink-0 size-5" data-name="lucide" data-node-id="239:3312">
          <Volume2 className="size-5 text-[#731fb8]" />
        </div>
        <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6e678a] text-[14px] text-nowrap" data-node-id="239:3314">
          <p className="leading-[24px] whitespace-pre">Audio are coming soon</p>
        </div>
      </div>
    </div>
  );
}

// Verification Form Component
function Frame82() {
  return (
    <div className="backdrop-blur-[1.5px] backdrop-filter box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative rounded-[16px] size-full" data-node-id="175:2508">
      <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_20px_80px_0px_rgba(137,44,219,0.2)]" />
      
      {/* TextArea Component */}
      <div className="content-stretch flex flex-col gap-2 items-start justify-start relative shrink-0 w-[539px]" data-name="Text Area" data-node-id="299:2992">
        <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" id="node-I299_2992-242_6883">
          <div className="content-stretch flex gap-2 items-center justify-center relative shrink-0" id="node-I299_2992-242_6884">
            <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#6e678a] text-[16px] text-nowrap" id="node-I299_2992-242_6885">
              <p className="leading-[24px] whitespace-pre">Let's check the facts for...</p>
            </div>
          </div>
          <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(110,103,138,0.7)] text-nowrap" id="node-I299_2992-242_6886">
            <p className="leading-[24px] whitespace-pre">0/1024 characters limit</p>
          </div>
        </div>
        <div className="bg-[#f8f8f8] box-border content-stretch flex flex-col gap-2 h-48 items-start justify-start p-[12px] relative rounded-[8px] shrink-0 w-full" id="node-I299_2992-242_6891">
          <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="-webkit-box font-['Merriweather:Regular',_sans-serif] leading-[0] min-w-full not-italic opacity-50 overflow-ellipsis overflow-hidden relative shrink-0 text-[#383838] text-[14px] tracking-[0.14px]" id="node-I299_2992-242_6892" style={{ width: "min-content" }}>
            <p className="leading-[28px]">Entre o texto que deseja conferir as afirmações aqui...</p>
          </div>
          <div className="-webkit-box absolute css-v9ie98 font-['Merriweather:Regular',_sans-serif] leading-[0] left-[7px] not-italic overflow-ellipsis overflow-hidden text-[#383838] text-[20px] text-nowrap top-3 tracking-[0.2px]" id="node-I299_2992-242_6893">
            <p className="leading-[28px] whitespace-pre">|</p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-node-id="241:3654">
        {/* Use Example Button */}
        <div className="box-border content-stretch flex gap-2 items-center justify-center px-4 py-3 relative rounded-[8px] shrink-0" data-name="Buttons" data-node-id="241:3427">
          <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[#8a5cda] text-[16px] text-nowrap" id="node-I241_3427-241_3006">
            <p className="leading-[24px] whitespace-pre">Use Example</p>
          </div>
        </div>
        
        {/* Check Facts Button */}
        <div className="bg-[#844ae9] box-border content-stretch flex gap-2 items-center justify-center px-4 py-3 relative rounded-[8px] shrink-0" data-name="Buttons" data-node-id="241:3428">
          <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[8px]" />
          <div className="opacity-[0.45] overflow-clip relative shrink-0 size-6" data-name="lucide" id="node-I241_3428-241_3078">
            <Play className="size-6 text-white" />
          </div>
          <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic opacity-[0.45] relative shrink-0 text-[16px] text-nowrap text-white" id="node-I241_3428-241_3080">
            <p className="leading-[24px] whitespace-pre">Check Facts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Bar Component (reusing existing Header)
function TopBar() {
  return (
    <div className="box-border content-stretch flex items-center justify-between pb-4 pt-8 px-2 relative size-full" data-name="Top-bar" data-node-id="110:1568">
      <div aria-hidden="true" className="absolute border-[#d6d8db] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="content-stretch flex gap-2 items-end justify-start relative shrink-0" data-node-id="128:765">
        <div className="flex flex-col font-['Inria_Serif:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#102148] text-[24px] text-nowrap" data-node-id="108:703">
          <p className="leading-[28px] whitespace-pre">Veritas</p>
        </div>
        <div className="bg-[#dedfe3] box-border content-stretch flex gap-2 items-center justify-center px-1.5 py-1 relative rounded-[4px] shrink-0" data-node-id="108:705">
          <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic opacity-90 relative shrink-0 text-[#102148] text-[12px] text-nowrap tracking-[0.24px]" data-node-id="108:706">
            <p className="leading-[normal] whitespace-pre">Alpha v0.1</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic opacity-90 relative shrink-0 text-[#737a8b] text-[14px] text-nowrap tracking-[0.28px]" data-node-id="139:5975">
        <p className="leading-[normal] whitespace-pre">Automatize a verificação de fatos</p>
      </div>
    </div>
  );
}
```

## Especificações Técnicas (Baseadas na Spec)

### Layout Geral
- **Dimensões**: 1440px × 800px
- **Background**: Gradiente de `#f5f5f5` para `#eaeaea` com 90% de opacidade
- **Layout**: Flexbox com posicionamento absoluto para elementos específicos

### Top Bar (Header)
- **Posição**: Absoluta no topo
- **Dimensões**: 1280px de largura
- **Posicionamento**: `left-20`, `top-0`, `pb-4`, `pt-8`
- **Componente**: Reutiliza o Header.tsx existente

### Hero Section (Lado Esquerdo)
- **Posição**: Absoluta centralizada verticalmente
- **Dimensões**: 629px × 315px
- **Posicionamento**: `left-24`, `top: calc(50% + 0.5px)`
- **Conteúdo**: Título principal + subtítulo + badge de features

#### Título Principal
- **Texto**: "Paste text. Get it **fact-checked**."
- **Font**: Inter Extra Light, 64px, line-height 80px
- **Cor**: #381257 (principal), #731fb8 (destaque "fact-checked")
- **Tracking**: 0.64px

#### Subtítulo
- **Texto**: "We verify claims, and return citations — privacy-first."
- **Font**: Inter Regular, 20px, line-height 32px
- **Cor**: #47415f com 70% de opacidade
- **Tracking**: 0.2px

#### Features Badge
- **Background**: Transparente
- **Padding**: `px-3 py-2`
- **Border radius**: 16px
- **Ícones**: FileText e Volume2 (Lucide React)
- **Texto**: "Text Files and Audio are coming soon"
- **Font**: Inter Regular, 14px, line-height 24px
- **Cor**: #6e678a (principal), #9a94ad ("and")

### Verification Form (Lado Direito)
- **Posição**: Absoluta centralizada
- **Dimensões**: 571px × 320px
- **Posicionamento**: `left: calc(50% + 338.5px)`, `top: 50%`
- **Background**: #f2f2f2 com backdrop-blur
- **Padding**: 16px
- **Border radius**: 16px
- **Borda**: #351397 com sombra roxa

#### TextArea Section
- **Label**: "Let's check the facts for..."
- **Placeholder**: "Entre o texto que deseja conferir as afirmações aqui..."
- **Character limit**: "0/1024 characters limit"
- **Dimensões**: 539px de largura, 192px de altura (h-48)
- **Componente**: Reutiliza o Textarea.tsx existente

#### Action Buttons
- **Use Example Button**: 
  - Variante: outlined
  - Texto: "Use Example"
  - Cor: #8a5cda
- **Check Facts Button**: 
  - Variante: filled (disabled state)
  - Texto: "Check Facts"
  - Ícone: Play (Lucide React)
  - Opacidade: 45% (disabled)

### Background Decoration
- **Posição**: Absoluta no bottom
- **Dimensões**: 1440px × 800px
- **Transformação**: Rotação 180° + escala Y -100%
- **Asset**: Imagem SVG decorativa (Frame44)

## Implementação TypeScript

```typescript
interface HomePageProps {
  className?: string
  onUseExample?: () => void
  onCheckFacts?: () => void
  onTextChange?: (text: string) => void
}

interface HeroSectionProps {
  className?: string
}

interface VerificationFormProps {
  className?: string
  onUseExample?: () => void
  onCheckFacts?: () => void
  onTextChange?: (text: string) => void
  disabled?: boolean
}
```

## Componentes Reutilizados

### 1. Header.tsx (Top Bar)
- **Status**: ✅ Já implementado
- **Uso**: Reutilizar diretamente
- **Customização**: Nenhuma necessária

### 2. Textarea.tsx (Verification Input)
- **Status**: ✅ Já implementado
- **Uso**: Reutilizar com props específicas
- **Customizações**:
  - `label`: "Let's check the facts for..."
  - `placeholder`: "Entre o texto que deseja conferir as afirmações aqui..."
  - `maxLength`: 1024

### 3. Button.tsx (Action Buttons)
- **Status**: ✅ Já implementado
- **Uso**: Dois botões com variantes diferentes
- **Customizações**:
  - **Use Example**: Variante `outlined`, texto "Use Example"
  - **Check Facts**: Variante `filled`, texto "Check Facts", ícone Play, estado disabled

## Componentes a Criar

### 1. HeroSection.tsx
```tsx
interface HeroSectionProps {
  className?: string
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  return (
    <div className={cn("content-stretch flex flex-col items-start justify-between relative size-full", className)}>
      {/* Título e Subtítulo */}
      <div className="content-stretch flex flex-col gap-4 items-start justify-start leading-[0] not-italic relative shrink-0 w-full">
        {/* Título Principal */}
        <div className="flex flex-col font-extralight justify-center relative shrink-0 text-[#381257] text-[64px] tracking-[0.64px] w-full">
          <p className="leading-[80px] mb-0">Paste text. </p>
          <p className="leading-[80px]">
            <span>Get it</span>
            <span className="font-bold"> </span>
            <span className="font-bold text-[#731fb8]">fact-checked</span>
            <span>.</span>
          </p>
        </div>
        
        {/* Subtítulo */}
        <div className="flex flex-col font-normal justify-center opacity-70 relative shrink-0 text-[#47415f] text-[20px] tracking-[0.2px] w-full">
          <p className="leading-[32px]">We verify claims, and return citations — privacy-first.</p>
        </div>
      </div>
      
      {/* Features Badge */}
      <div className="box-border content-stretch flex gap-2 items-center justify-start px-3 py-2 relative rounded-[16px] shrink-0">
        <FileText className="size-5 text-[#731fb8]" />
        <span className="font-normal leading-[24px] text-[#6e678a] text-[14px] whitespace-pre">
          Text Files <span className="text-[#9a94ad]">and</span>
        </span>
        <Volume2 className="size-5 text-[#731fb8]" />
        <span className="font-normal leading-[24px] text-[#6e678a] text-[14px] whitespace-pre">
          Audio are coming soon
        </span>
      </div>
    </div>
  )
}
```

### 2. VerificationForm.tsx
```tsx
interface VerificationFormProps {
  className?: string
  onUseExample?: () => void
  onCheckFacts?: () => void
  onTextChange?: (text: string) => void
  disabled?: boolean
}

const VerificationForm: React.FC<VerificationFormProps> = ({
  className,
  onUseExample,
  onCheckFacts,
  onTextChange,
  disabled = false
}) => {
  return (
    <div className={cn(
      "backdrop-blur-[1.5px] backdrop-filter box-border content-stretch flex flex-col gap-4 items-start justify-start p-[16px] relative rounded-[16px] size-full bg-[#f2f2f2]",
      className
    )}>
      <div aria-hidden="true" className="absolute border border-[#351397] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_20px_80px_0px_rgba(137,44,219,0.2)]" />
      
      {/* TextArea */}
      <Textarea
        label="Let's check the facts for..."
        placeholder="Entre o texto que deseja conferir as afirmações aqui..."
        maxLength={1024}
        onChange={onTextChange}
        className="w-[539px]"
      />
      
      {/* Action Buttons */}
      <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
        <Button
          variant="outlined"
          onClick={onUseExample}
          className="px-4 py-3"
        >
          Use Example
        </Button>
        
        <Button
          variant="filled"
          onClick={onCheckFacts}
          disabled={disabled}
          className="px-4 py-3"
        >
          <Play className="size-6" />
          Check Facts
        </Button>
      </div>
    </div>
  )
}
```

## Ícones e Assets (Lucide React)

### ✅ CORRETO - Usar Lucide React
```tsx
import { FileText, Volume2, Play } from "lucide-react"

// Uso correto
<FileText className="size-5 text-[#731fb8]" />
<Volume2 className="size-5 text-[#731fb8]" />
<Play className="size-6 text-white" />
```

### ❌ INCORRETO - Nunca usar SVG puro
```tsx
// ❌ NUNCA fazer isso
<img src="path/to/icon.svg" />
<div dangerouslySetInnerHTML={{ __html: svgString }} />
```

## Font Implementation

### Título Principal
- **Font**: Inter Extra Light (font-extralight)
- **Tamanho**: 64px
- **Line-height**: 80px
- **Tracking**: 0.64px
- **Cor**: #381257 (principal), #731fb8 (destaque)

### Subtítulo
- **Font**: Inter Regular (font-normal)
- **Tamanho**: 20px
- **Line-height**: 32px
- **Tracking**: 0.2px
- **Cor**: #47415f com 70% opacidade

### Features Badge
- **Font**: Inter Regular (font-normal)
- **Tamanho**: 14px
- **Line-height**: 24px
- **Cor**: #6e678a (principal), #9a94ad ("and")

### Botões
- **Font**: Inter Semi Bold (font-semibold)
- **Tamanho**: 16px
- **Line-height**: 24px
- **Cor**: #8a5cda (outlined), white (filled)

## Responsividade

### Breakpoints
- **Desktop**: 1440px+ (design atual)
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

### Adaptações Necessárias
1. **Mobile**: Layout vertical, hero section acima do form
2. **Tablet**: Layout compacto, espaçamentos reduzidos
3. **Desktop**: Layout atual (assimétrico)

## Acessibilidade

### Estrutura Semântica
- **Header**: `<header>` com navegação
- **Main**: `<main>` com conteúdo principal
- **Hero**: `<section>` com título e descrição
- **Form**: `<section>` com formulário de verificação

### ARIA Labels
- **Botões**: Labels descritivos
- **TextArea**: Label associado
- **Ícones**: `aria-hidden="true"` para decorativos

### Focus Management
- **Tab order**: Top bar → TextArea → Use Example → Check Facts
- **Focus visible**: Contorno visível para navegação por teclado

## Referências

- [Figma Design - Home Page](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=141-8191&t=pdGW6MiEiOTir3rO-11)
- **Node ID**: 141:8191
- **Component Name**: 1: Landing Page / Empty State
- **Dimensões**: 1440px × 800px
- **Layout**: Assimétrico (hero left, form right)
- **Assets**: Ícones Lucide React (FileText, Volume2, Play)
- **Regra CRÍTICA**: NUNCA usar SVG puro - SEMPRE usar componentes Lucide React!
