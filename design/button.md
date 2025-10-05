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
- **Enabled**: Background `#844ae9`, Border `#351397`, Text `white`, Icon `white`
- **Hovered**: Background `#5d13dd`, Border `#351397`, Text `white`, Icon `white`
- **Disabled**: Background `#c1a4f4`, Border `#351397`, Text `#5d0bbc`, Icon `#7f34d4`

### Outlined Variant
- **Enabled**: Background `transparent`, Border `#351397` (sólida), Text `#8a5cda`, Icon `#9d6eed`
- **Hovered**: Background `#f5f5f5` (neutral-100), Border `#351397`, Text `#5d13dd`, Icon `#5d13dd`
- **Disabled**: Background `transparent`, Border `#351397`, Text `#9d6eed`, Icon `#9d6eed`, Opacity `0.5`

### Link Variant
- **Enabled**: Background `transparent`, Text `#8a5cda`, Icon `#9d6eed`, Font Weight `normal`
- **Hovered**: Background `#f6f6f6`, Text `#5d13dd`, Icon `#5d13dd`, Font Weight `semibold`, **Underline**
- **Disabled**: Background `transparent`, Text `#8a5cda`, Icon `#8a5cda`, Font Weight `normal`, Opacity `0.5`

## Typography
- **Font Family**: Inter
- **Font Weight**: 
  - Filled/Outlined: Semi Bold (600)
  - Link: Normal (400) / Semi Bold (600) on hover
- **Font Size**: 
  - SM: 14px
  - Default: 16px
- **Line Height**: 24px

## Layout
- **Border Radius**: `rounded-[8px]`
- **Gap**: `gap-2` entre ícone e texto
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
