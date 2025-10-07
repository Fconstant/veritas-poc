# Ladle Stories - Componentes v0.2

Documentação dos stories criados/atualizados para visualização no Ladle.

## 📦 Stories Criados

### 1. ComingSoonBanner.stories.tsx
**Localização:** `/frontend/src/app/shared/components/ComingSoonBanner.stories.tsx`

**Variantes:**
- **Default** - Banner com ícones FileText e Audio

**Para testar:**
```bash
npm run ladle
# Acesse: Shared/ComingSoonBanner
```

---

### 2. HelperAccordion.stories.tsx
**Localização:** `/frontend/src/app/shared/components/HelperAccordion.stories.tsx`

**Variantes:**
- **Default** - Accordion com background do design (gradiente)
- **Isolated** - Accordion sem background para visualização isolada

**Interação:**
- Click para expandir/colapsar
- Animação de 300ms
- Ícone muda de ChevronDown para ChevronUp

**Para testar:**
```bash
npm run ladle
# Acesse: Shared/HelperAccordion
# Click no componente para ver animação
```

---

### 3. APIsRegistrationFlow.stories.tsx
**Localização:** `/frontend/src/app/shared/components/APIsRegistrationFlow.stories.tsx`

**Variantes:**
- **Empty** - Estado inicial vazio (Estado 1)
- **WithInitialKeys** - Com keys pré-preenchidas
- **Interactive** - Com instruções completas e feedback visual

**Estados demonstrados:**
1. **Empty** - Ambos inputs vazios
2. **Gemini Filled** - Apenas Gemini preenchido
3. **Invalid** - Formato inválido (background vermelho)
4. **Validating** - Spinner de validação
5. **Valid** - Tudo válido, botão habilitado

**Como testar cada estado:**
```
Estado 1: Deixe ambos vazios
Estado 2: Preencha apenas Gemini (qualquer texto)
Estado 3: Preencha com formato inválido
  - Gemini: "abc123" (não começa com AI ou não tem 39 chars)
  - Tavily: "123" (menos de 10 chars)
Estado 4: Preencha com formato válido → auto-valida
  - Gemini: "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ123456" (39 chars, começa com AI)
  - Tavily: "tvly-1234567890" (>10 chars)
Estado 5: Após validação (aparece automaticamente 1.5s após Estado 4)
```

**Para testar:**
```bash
npm run ladle
# Acesse: Shared/APIsRegistrationFlow/Interactive
# Siga as instruções no card branco
```

---

### 4. VerificationTextArea.stories.tsx
**Localização:** `/frontend/src/app/shared/components/VerificationTextArea.stories.tsx`

**Variantes:**
- **Empty** - Textarea vazio (botão desabilitado)
- **WithText** - Com texto de exemplo
- **NearLimit** - Perto do limite (4550 chars) - counter amarelo
- **OverLimit** - Acima do limite (5100 chars) - counter vermelho
- **Interactive** - Com instruções e feedback visual

**Character Counter:**
- 0-4500 chars: Cor normal (#716793)
- 4501-5000 chars: Warning (#f59e0b)
- >5000 chars: Error (#ef4444) + botão desabilitado

**Para testar:**
```bash
npm run ladle
# Acesse: Shared/VerificationTextArea/Interactive
# Digite/apague texto para ver counter mudar de cor
```

---

### 5. AnimatedDots.stories.tsx (Novo)
**Localização:** `/frontend/src/app/shared/components/ui/AnimatedDots.stories.tsx`

**Variantes:**
- **Default** - Dots com label "Loading"
- **InText** - Exemplos de uso em diferentes contextos
- **DifferentSizes** - Tamanhos variados (sm, base, lg, 2xl)
- **InButtons** - Uso dentro de botões

**Para testar:**
```bash
npm run ladle
# Acesse: UI/AnimatedDots
```

---

### 6. Header.stories.tsx (Atualizado)
**Localização:** `/frontend/src/app/shared/components/Header.stories.tsx`

**Variantes:**
- **WithoutSettings** - Sem botão Configurations (usado em /first-access e /setup)
- **WithSettings** - Com botão Configurations (usado em /verification e /results)
- **Default** - Variante padrão

**Para testar:**
```bash
npm run ladle
# Acesse: Shared/Header
# Click em "Configurations" na variante WithSettings
```

---

## 🚀 Como Executar

```bash
# No diretório frontend
cd frontend

# Instalar dependências (se necessário)
pnpm install

# Executar Ladle
npm run ladle

# Ou com pnpm
pnpm ladle

# Acesse http://localhost:61000
```

## 📋 Checklist de Stories

### Componentes Novos (v0.2)
- [x] ComingSoonBanner
- [x] HelperAccordion
- [x] APIsRegistrationFlow
- [x] VerificationTextArea
- [x] AnimatedDots (criado para resolver build error)

### Componentes Atualizados
- [x] Header (adicionadas variantes WithSettings e WithoutSettings)

### Componentes Existentes (mantidos)
- [x] AlphaBadge
- [x] ApiSetupPage
- [x] ConfirmationDialog
- [x] LoadingSpinner
- [x] Logo
- [x] PulsingIcon
- [x] SkeletonLoader
- [x] Tagline
- [x] UI/Button
- [x] UI/Textarea

## 🎨 Estrutura de Stories

Todos os stories seguem o padrão:

```typescript
import type { Story, StoryDefault } from "@ladle/react";
import ComponentName from "./ComponentName";

export default {
  title: "Category/ComponentName",
} satisfies StoryDefault;

export const VariantName: Story = () => (
  // JSX do componente
);
```

## 📝 Boas Práticas Aplicadas

1. **Backgrounds consistentes** - Todos os stories de componentes v0.2 usam o mesmo gradiente do design
2. **Instruções inline** - Stories interativos incluem cards com instruções
3. **Feedback visual** - Console.logs e alerts para demonstrar callbacks
4. **Múltiplas variantes** - Cada componente tem pelo menos 2 variantes
5. **Casos de uso realistas** - Stories mostram uso prático dos componentes

## 🧪 Casos de Teste por Story

### APIsRegistrationFlow (Interactive)
1. ✓ Estado Empty - ambos vazios
2. ✓ Estado Gemini Filled - só Gemini preenchido
3. ✓ Estado Invalid - formato inválido
4. ✓ Estado Validating - spinner durante validação
5. ✓ Estado Valid - tudo OK, botão habilitado
6. ✓ Toggle show/hide password
7. ✓ Links externos funcionando
8. ✓ Callback onComplete

### VerificationTextArea (Interactive)
1. ✓ Botão desabilitado quando vazio
2. ✓ Character counter 0-4500 (cor normal)
3. ✓ Character counter 4501-5000 (warning)
4. ✓ Character counter >5000 (error)
5. ✓ Botão desabilitado quando >5000
6. ✓ Botão "Usar exemplo" preenche textarea
7. ✓ Callback onVerify
8. ✓ Callback onChange

### HelperAccordion
1. ✓ Estado collapsed (88px)
2. ✓ Estado expanded (height dinâmico)
3. ✓ Animação 300ms
4. ✓ Ícone muda (ChevronDown ↔ ChevronUp)
5. ✓ Conteúdo com 4 itens de lista

### Header
1. ✓ Logo com fonte Inria Serif
2. ✓ Tagline com fonte Inter
3. ✓ Botão Configurations (quando showSettings=true)
4. ✓ Callback onSettingsClick
5. ✓ Divider horizontal

### ComingSoonBanner
1. ✓ Ícones FileText e AudioLines
2. ✓ Texto "Text Files and Audio are coming soon"
3. ✓ Estilo conforme design

### AnimatedDots
1. ✓ Três pontos animados
2. ✓ Delays escalonados (0ms, 150ms, 300ms)
3. ✓ Adaptação a diferentes tamanhos
4. ✓ Uso em diferentes contextos

## 📊 Cobertura de Componentes

**Total de componentes v0.2:** 6
- ComingSoonBanner ✅
- Header (atualizado) ✅
- HelperAccordion ✅
- APIsRegistrationFlow ✅
- VerificationTextArea ✅
- AnimatedDots ✅

**Cobertura de stories:** 100% ✅

## 🎯 Próximos Passos

1. ✅ Stories criados para todos os componentes v0.2
2. ⏭️ Adicionar testes de acessibilidade nos stories
3. ⏭️ Adicionar testes de responsividade
4. ⏭️ Documentar comportamento em diferentes browsers
5. ⏭️ Adicionar stories para páginas completas (First Access, Setup, Verification)

---

**Documentação criada em:** 2025-10-04  
**Stories criados:** 5 novos + 1 atualizado  
**Status:** ✅ Completo e pronto para uso no Ladle
