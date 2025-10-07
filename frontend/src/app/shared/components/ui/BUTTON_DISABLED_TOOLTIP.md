# Tooltip em Botões Desabilitados

## 📋 Visão Geral

Esta funcionalidade melhora a acessibilidade dos botões desabilitados ao exibir um tooltip explicativo quando o usuário interage com eles.

## ✨ Benefícios de Acessibilidade

Seguindo as melhores práticas de UX/UI, quando um botão está desabilitado, o tooltip:

- **Aparece no hover** (mouse)
- **Aparece no focus** (navegação via teclado com Tab)
- **Aparece no tap/click** (dispositivos touch)
- **Mantém o cursor `not-allowed`** para indicar que está desabilitado
- **Preserva aria-disabled** para leitores de tela

## 🚀 Como Usar

### Uso Básico

```tsx
import { Button } from "@/app/shared/components/ui/button";

<Button
  variant="filled"
  disabled
  disabledTooltip="Preencha todos os campos para continuar"
>
  Continuar
</Button>
```

### Com Ícone

```tsx
import { Save } from "lucide-react";

<Button
  variant="outlined"
  disabled
  disabledTooltip="Salve suas alterações antes de sair"
>
  <Save />
  Salvar
</Button>
```

### Tooltip Condicional

```tsx
const [isValid, setIsValid] = useState(false);

<Button
  disabled={!isValid}
  disabledTooltip={
    !isValid && "Complete os campos obrigatórios: nome e email"
  }
>
  Enviar
</Button>
```

### Tooltip com Lista

```tsx
<Button
  disabled
  disabledTooltip={
    <>
      Para ativar, você precisa:
      <br />• Verificar seu email
      <br />• Aceitar os termos
    </>
  }
>
  Ativar Conta
</Button>
```

## 🎯 Quando Usar

### ✅ Use quando:

- O usuário pode ficar confuso sobre por que o botão está desabilitado
- Há condições específicas que precisam ser atendidas
- Você quer guiar o usuário sobre o próximo passo

### ❌ Evite quando:

- O motivo é óbvio do contexto (ex: botão "Próximo" em wizard com campos vazios visíveis)
- O tooltip ficaria muito longo (considere usar um banner informativo)
- O botão nunca será habilitado (nesse caso, considere remover ou ocultar)

## 🔧 Props do Componente

### `disabledTooltip`

- **Tipo**: `React.ReactNode | undefined`
- **Opcional**: Sim
- **Descrição**: Conteúdo do tooltip a ser exibido quando o botão está desabilitado

## 📝 Exemplo Real no Projeto

No arquivo `ApiSetupPage.tsx`:

```tsx
<Button
  variant="filled"
  disabled={!isValid}
  disabledTooltip={
    !isValid && "Preencha ambas as chaves de API para continuar"
  }
>
  Começar a Verificar
  <ArrowRight />
</Button>
```

## 🎨 Aparência do Tooltip

- **Cor de fundo**: Cinza escuro (`#1f2937`)
- **Cor do texto**: Branco
- **Animação**: Fade in/out suave
- **Posicionamento**: Automático (top/bottom/left/right baseado no espaço disponível)
- **Delay**: 200ms após hover/focus

## ⚠️ Importante

1. O tooltip **só aparece quando o botão está desabilitado**
2. Se `disabledTooltip` não for fornecido, o botão se comporta normalmente (sem tooltip)
3. O botão permanece focusável via Tab quando tem tooltip (para acessibilidade)
4. Cliques são bloqueados mesmo com o tooltip visível

## 🔍 Detalhes Técnicos

A implementação usa:
- **@radix-ui/react-tooltip** para o componente de tooltip
- **aria-disabled** para acessibilidade
- **Foco preservado** quando desabilitado com tooltip
- **onClick bloqueado** via preventDefault quando desabilitado

## 📚 Referências

- [WCAG 2.1 - Success Criterion 3.3.1: Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)
- [Radix UI Tooltip](https://www.radix-ui.com/docs/primitives/components/tooltip)
