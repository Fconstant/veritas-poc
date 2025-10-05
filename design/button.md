# Button Component - Design System

## Figma Link
[Button Component Design](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=241-3196&t=pdGW6MiEiOTir3rO-11)

## Design Specifications

### Variants
O componente Button possui 3 variantes principais:

1. **Filled** - Botão preenchido com fundo roxo
2. **Outlined** - Botão com borda roxa e fundo transparente
3. **Link** - Botão sem borda, apenas texto

### Sizes
- **SM (Small)**: 
  - Filled/Outlined: 32px altura, padding `px-3 py-1`
  - Link: padding `px-1 py-0.5` (sem altura fixa)
- **Default**: 
  - Filled/Outlined: 48px altura, padding `px-4 py-3`
  - Link: padding `px-1.5 py-1` (sem altura fixa)

### States
Cada variante possui 3 estados:
- **Enabled** - Estado padrão
- **Hovered** - Estado ao passar o mouse
- **Disabled** - Estado desabilitado

## Colors

### Filled Variant
- **Enabled**: Background `#c4b5fd` (violet-300), Text `#5b21b6` (violet-800), Icon `#5b21b6`, Outline `#351397`, Shadow `0px 4px 16px rgba(27,0,85,0.60)`
- **Hovered**: Background `#a78bfa` (violet-400), Text `#5b21b6`, Icon `#5b21b6`, Outline `#351397`, Shadow `0px 4px 16px rgba(27,0,85,0.60)`
- **Disabled**: Opacity `0.45` (mantém todas as cores base)

### Outlined Variant
- **Enabled**: Background `transparent`, Border `rgba(53,19,151,0.5)` (degradê 50% opacidade), Text `#8a5cda`, Icon `#8a5cda`
- **Hovered**: Background `#f6f6f6`, Border `rgba(53,19,151,1)` (degradê 100% opacidade), Text `#5d13dd`, Icon `#5d13dd`
- **Disabled**: Background `transparent`, Border `rgba(53,19,151,0.5)`, Text `#9d6eed`, Icon `#9d6eed`, Opacity `0.5`

**Nota**: A borda do botão outlined é um degradê horizontal com opacidade de 50% no estado enabled e 100% no estado hovered.

### Link Variant
- **Enabled**: Background `transparent`, Text `#8a5cda`, Icon `#8a5cda`
- **Hovered**: Background `#f6f6f6`, Text `#5d13dd`, Icon `#5d13dd`, **Underline**
- **Disabled**: Background `transparent`, Text `#8a5cda`, Icon `#8a5cda`, Opacity `0.5`

## Typography
- **Font**: Inter Semi Bold (`font-semibold`)
- **SM Size**: `text-[14px]` com `leading-[24px]`
- **Default Size**: `text-[16px]` com `leading-[24px]`

## Layout
- **Border Radius**: `rounded-[8px]`
- **Gap**: `gap-2` entre ícone e texto
- **Icon Size**: `size-4` para SM, `size-6` para Default
- **Border**: `border-[#351397]` para variantes outlined

## Component Structure

```tsx
interface ButtonProps {
  variant?: "filled" | "outlined" | "link";
  size?: "sm" | "default";
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
```

## Implementation Notes

### CSS Custom Properties
```css
:root {
  --veritas-purple-primary: #351397;
  --veritas-purple-secondary: #844ae9;
  --veritas-purple-light: #5d13dd;
  --veritas-purple-text: #8a5cda;
  --veritas-purple-text-disabled: #9d6eed;
}
```

### Borda Degradê - Outlined Variant
A variante outlined usa uma técnica especial para criar bordas degradê:

```tsx
// Estado Enabled (50% opacidade)
background: `linear-gradient(white, white) padding-box, linear-gradient(90deg, rgba(53,19,151,0.5) 0%, rgba(53,19,151,0.5) 100%) border-box`

// Estado Hovered (100% opacidade + fundo #f6f6f6)  
background: `linear-gradient(#f6f6f6, #f6f6f6) padding-box, linear-gradient(90deg, rgba(53,19,151,1) 0%, rgba(53,19,151,1) 100%) border-box`
```

**Técnica**: Usa `padding-box` para o fundo branco e `border-box` para o degradê da borda.

### Tailwind Classes
- Use `font-semibold` para Inter Semi Bold
- Use `rounded-[8px]` para border radius
- Use `gap-2` para espaçamento entre ícone e texto
- Use `size-4` e `size-6` para tamanhos de ícone
- Use cores hardcoded do Figma quando necessário

### States Management
- Implementar estados hover com `:hover` pseudo-class
- Implementar estados disabled com `disabled:` prefix
- Usar opacity para estados disabled quando necessário
- **Outlined**: Usar estilos inline para borda degradê com eventos `onMouseEnter`/`onMouseLeave`

## Ladle Stories
Criar stories para todas as combinações de variantes, tamanhos e estados:
- Filled SM/Default (Enabled, Hovered, Disabled)
- Outlined SM/Default (Enabled, Hovered, Disabled)  
- Link SM/Default (Enabled, Hovered, Disabled)

## Accessibility
- Adicionar `aria-disabled` para estados disabled
- Adicionar `aria-busy` para estados loading
- Manter foco visível com `focus-visible:ring-2`
- Usar `data-slot="button"` para targeting CSS
