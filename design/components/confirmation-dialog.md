# ConfirmationDialog - Modal de Confirmação

## Visão Geral
O `ConfirmationDialog` é um componente modal que permite confirmar ações importantes do usuário. Foi implementado para dois cenários específicos: cancelar uma verificação em andamento e adicionar um novo texto para verificação.

## Design do Figma
- **Cancelar Verificação**: [Figma Link](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=177-3276&t=qpmCsx79zBf2qjqJ-11)
- **Novo Texto**: [Figma Link](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=177-3861&t=qpmCsx79zBf2qjqJ-11)

## Especificações Técnicas

### Dimensões e Layout
- **Largura**: 516px
- **Fundo**: neutral-50
- **Bordas**: 16px radius
- **Padding**: 40px horizontal, 32px vertical
- **Gap**: 16px entre elementos

### Cores e Sombras
- **Sombra**: `0px 4px 8px 0px rgba(0,0,0,0.15), 0px 20px 80px 0px rgba(137,44,219,0.2)`
- **Outline**: 1px solid #351397
- **Ícone**: #8A5CDA
- **Fundo do ícone**: rgba(132,74,233,0.1)
- **Texto**: #383838

### Tipografia
- **Fonte**: Inter (var(--font-inter))
- **Tamanho**: 16px
- **Altura da linha**: 24px
- **Tracking**: 0.16px
- **Peso**: normal

## Variants Disponíveis

### 1. `cancel-verification` (Padrão)
- **Ícone**: AlertTriangle (Lucide React)
- **Texto padrão**: "Tem certeza de que deseja cancelar esta verificação? Se você cancelar, tudo que foi feito até agora será perdido."
- **Botão principal**: "Cancelar"
- **Botão secundário**: "Fechar"

### 2. `new-text`
- **Ícone**: FileText (Lucide React)
- **Texto padrão**: "Deseja adicionar um novo texto para verificação? O texto atual será substituído e toda a análise anterior será perdida."
- **Botão principal**: "Novo Texto"
- **Botão secundário**: "Cancelar"

## Interface TypeScript

```tsx
type ConfirmationDialogVariant = "cancel-verification" | "new-text"

interface ConfirmationDialogProps {
  isOpen?: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm?: () => void
  variant?: ConfirmationDialogVariant
  description?: string
  confirmText?: string
  cancelText?: string
  className?: string
}
```

## Comportamento

### Redirecionamento Automático
Quando o usuário confirma a ação (clica no botão principal), o componente automaticamente redireciona para a página inicial (`/`) usando `window.location.href = '/'`.

### Callbacks
- `onConfirm`: Executado antes do redirecionamento
- `onCancel`: Executado quando o usuário cancela
- `onClose`: Executado quando o modal é fechado

## Exemplos de Uso

### Cancelar Verificação
```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  variant="cancel-verification"
  onConfirm={() => {
    // Lógica adicional antes do redirecionamento
    console.log("Verificação cancelada");
  }}
/>
```

### Novo Texto
```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  variant="new-text"
  onConfirm={() => {
    // Lógica adicional antes do redirecionamento
    console.log("Novo texto iniciado");
  }}
/>
```

### Customizado
```tsx
<ConfirmationDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  variant="cancel-verification"
  description="Mensagem customizada aqui."
  confirmText="Confirmar Ação"
  cancelText="Voltar"
/>
```

## Stories do Ladle
- **CancelVerification**: Demonstra o variant de cancelar verificação
- **NewText**: Demonstra o variant de novo texto
- **Interactive**: Permite alternar entre variants
- **Customized**: Mostra uso com props customizadas

## Implementação
**Localização**: `frontend/src/components/veritas/common/ConfirmationDialog.tsx`
**Stories**: `frontend/src/components/veritas/common/ConfirmationDialog.stories.tsx`

## Dependências
- **Lucide React**: Para ícones (AlertTriangle, FileText)
- **shadcn/ui**: Para componentes base (Dialog, Button)
- **Tailwind CSS**: Para estilização
- **Inter Font**: Para tipografia

## Acessibilidade
- Modal com foco adequado
- Botões com labels descritivos
- Suporte a navegação por teclado
- Contraste adequado para leitura
