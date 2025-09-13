# Plano de Implementação Pixel-Perfect - Fluxo de Verificação

## Visão Geral

Este documento detalha o plano completo para implementar o fluxo de verificação de fatos pixel-perfect, baseado no design do Figma e seguindo exatamente as especificações do documento `flow-results.md`.

**Design Reference**: https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=175-2518&t=qpmCsx79zBf2qjqJ-11

## Análise do Estado Atual

### ✅ Componentes Existentes
- `HomePage.tsx` - Página principal com layout básico
- `ResultsPage.tsx` - Página de resultados com layout de duas colunas
- `VerificationForm.tsx` - Formulário de verificação
- `HeroSection.tsx` - Seção hero com título e features
- `ProcessedTextPanel.tsx` - Painel do texto processado
- `ResultsPanel.tsx` - Painel de resultados
- `ResultCard.tsx` - Card individual de resultado
- `ConfirmationDialog.tsx` - Dialog de confirmação
- `AnimatedText.tsx` - Componente de texto animado
- `LoadingSpinner.tsx` - Spinner de loading

### ❌ Componentes Faltando
- `ProcessingConfirmationPage.tsx` - Página de confirmação de processamento
- `TransitionManager.tsx` - Gerenciador de transições entre estados
- `AnimatedDots.tsx` - Componente de pontos animados para loading
- `PulsingIcon.tsx` - Ícone com animação de pulsação
- `SkeletonLoader.tsx` - Componente de skeleton loading

### 🔧 Modificações Necessárias
- Sistema de transições animadas entre estados
- Gerenciamento de estado mais robusto
- Animações de loading específicas
- Fluxo de navegação otimizado

## Plano de Implementação Detalhado

### Fase 1: Componentes Base e Animações

#### 1.1 Criar ProcessingConfirmationPage.tsx
**Localização**: `frontend/src/components/veritas/pages/ProcessingConfirmationPage.tsx`

**Especificações**:
- Página de transição que aparece por 2-3 segundos
- Mostra confirmação de que o texto foi recebido
- Animação de transição suave para ResultsPage
- Layout minimalista com apenas header

**Design Reference**: https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-12550&t=qpmCsx79zBf2qjqJ-11

#### 1.2 Criar AnimatedDots.tsx
**Localização**: `frontend/src/components/ui/AnimatedDots.tsx`

**Especificações**:
- Anima os três pontos ("Lendo Texto...")
- Ciclo: "." → ".." → "..." → (reinicia)
- Configurável para diferentes textos
- Integração com AnimatedText existente

#### 1.3 Criar PulsingIcon.tsx
**Localização**: `frontend/src/components/ui/PulsingIcon.tsx`

**Especificações**:
- Ícone com animação de pulsação
- Usado no header "Verificando..." 
- Baseado no ícone CheckCircle do Lucide
- Animação suave de opacidade e escala

#### 1.4 Criar SkeletonLoader.tsx
**Localização**: `frontend/src/components/ui/SkeletonLoader.tsx`

**Especificações**:
- Loading skeleton para cards de resultado
- Animação de shimmer
- Múltiplas variantes (card, text, button)
- Baseado no design do Figma

### Fase 2: Sistema de Transições

#### 2.1 Criar TransitionManager.tsx
**Localização**: `frontend/src/components/veritas/pages/TransitionManager.tsx`

**Especificações**:
- Gerencia todas as transições entre estados
- Animações de entrada/saída de componentes
- Coordena timing das transições
- Estados: idle → processing → confirmation → results

#### 2.2 Modificar HomePage.tsx
**Modificações**:
- Implementar transição animada do VerificationForm para o centro
- Animar HeroSection saindo da tela
- Desabilitar TextArea durante processamento
- Substituir botões por loading animado
- Integrar com TransitionManager

#### 2.3 Modificar VerificationForm.tsx
**Modificações**:
- Adicionar estado de loading com animação
- Implementar transição para centro da tela
- Substituir botões por "Lendo Texto..." animado
- Usar Loader2 do Lucide com animação personalizada

### Fase 3: Fluxo de Navegação

#### 3.1 Implementar Roteamento com Transições
**Modificações**:
- `app/page.tsx` - Integrar ProcessingConfirmationPage
- `app/results/page.tsx` - Melhorar transição de entrada
- Implementar navegação programática com animações

#### 3.2 Gerenciamento de Estado Global
**Criar**: `frontend/src/lib/contexts/VerificationContext.tsx`

**Especificações**:
- Estado global para todo o fluxo de verificação
- Persistência do texto entre páginas
- Controle de estados de transição
- Integração com factCheckService

### Fase 4: Animações Específicas do Design

#### 4.1 Animação "Lendo Texto..."
**Especificações**:
- Texto base: "Lendo Texto"
- Pontos animados: "." → ".." → "..."
- Timing: 500ms por estado
- Ícone: Loader2 do Lucide girando

#### 4.2 Animação "Verificando..."
**Especificações**:
- Texto base: "Verificando"
- Pontos animados: "." → ".." → "..."
- Ícone: CheckCircle pulsando (opacidade 0.5 → 1.0)
- Timing: 800ms por estado

#### 4.3 Transição do VerificationForm
**Especificações**:
- Movimento suave para centro da tela
- Duração: 800ms
- Easing: ease-in-out
- Simultâneo com saída do HeroSection

#### 4.4 Skeleton Loading dos Resultados
**Especificações**:
- 3 cards de skeleton
- Animação de shimmer
- Altura e espaçamento idênticos aos cards reais
- Duração: 2 segundos antes de mostrar resultados reais

### Fase 5: Estados e Comportamentos

#### 5.1 Estados de Loading
1. **Conectando**: "Conectando com servidor..."
2. **Processando**: "Lendo Texto..." (com pontos animados)
3. **Verificando**: "Verificando..." (com ícone pulsando)
4. **Resultados**: Cards aparecendo progressivamente

#### 5.2 Tratamento de Erros
- Conexão falhada
- Timeout de processamento
- Erro no servidor
- Cancelamento pelo usuário

#### 5.3 Diálogos de Confirmação
- Cancelar verificação em andamento
- Nova verificação (substituir texto atual)
- Estados de erro com opções de retry

### Fase 6: Otimizações e Polimento

#### 6.1 Performance
- Lazy loading de componentes pesados
- Debounce em animações
- Otimização de re-renders
- Memoização de componentes

#### 6.2 Acessibilidade
- ARIA labels para estados de loading
- Navegação por teclado
- Screen reader support
- Contraste adequado

#### 6.3 Responsividade
- Adaptação para mobile/tablet
- Breakpoints específicos
- Touch interactions
- Layout flexível

## Cronograma de Implementação

### Sprint 1 (Semana 1): Componentes Base
- [ ] ProcessingConfirmationPage.tsx
- [ ] AnimatedDots.tsx
- [ ] PulsingIcon.tsx
- [ ] SkeletonLoader.tsx

### Sprint 2 (Semana 2): Sistema de Transições
- [ ] TransitionManager.tsx
- [ ] Modificações no HomePage.tsx
- [ ] Modificações no VerificationForm.tsx
- [ ] Animações de transição

### Sprint 3 (Semana 3): Fluxo Completo
- [ ] VerificationContext.tsx
- [ ] Integração de navegação
- [ ] Estados de loading específicos
- [ ] Tratamento de erros

### Sprint 4 (Semana 4): Polimento
- [ ] Otimizações de performance
- [ ] Acessibilidade
- [ ] Responsividade
- [ ] Testes e ajustes finais

## Especificações Técnicas

### Animações CSS
```css
/* Transição do VerificationForm */
@keyframes slideToCenter {
  from { transform: translateX(0); }
  to { transform: translateX(-50%) translateY(-50%); }
}

/* Pulsação do ícone */
@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Shimmer do skeleton */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
```

### Timing das Transições
- **HeroSection fade out**: 600ms
- **VerificationForm slide**: 800ms
- **Loading dots**: 500ms por ponto
- **Icon pulse**: 800ms por ciclo
- **Skeleton shimmer**: 1500ms
- **Results appearance**: 300ms cada card

### Estados do Fluxo
```typescript
type VerificationFlowState = 
  | 'idle'           // Estado inicial
  | 'connecting'     // Testando conexão
  | 'processing'     // Enviando para backend
  | 'confirmation'   // Página de confirmação
  | 'analyzing'      // Backend processando
  | 'results'        // Mostrando resultados
  | 'error'          // Estado de erro
  | 'cancelled';     // Cancelado pelo usuário
```

## Critérios de Aceitação

### Funcionalidade
- [ ] Fluxo completo funciona sem erros
- [ ] Todas as transições são suaves
- [ ] Estados de loading são informativos
- [ ] Tratamento de erros é robusto

### Design
- [ ] Pixel-perfect match com Figma
- [ ] Animações seguem especificações
- [ ] Timing das transições está correto
- [ ] Responsividade mantida

### Performance
- [ ] Transições são fluidas (60fps)
- [ ] Não há memory leaks
- [ ] Loading times são aceitáveis
- [ ] Bundle size otimizado

### Acessibilidade
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] ARIA labels adequados
- [ ] Contraste de cores

## Próximos Passos

1. **Revisar plano** com stakeholders
2. **Aprovar especificações** técnicas
3. **Iniciar Sprint 1** com componentes base
4. **Testar integrações** a cada fase
5. **Validar com design** do Figma

---

**Última atualização**: 2024-12-19
**Versão**: 1.0
**Status**: Pronto para implementação
