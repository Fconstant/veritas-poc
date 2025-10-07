# Results Page - Página de Resultados

## Design Reference
**Figma Link**: https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11628&t=qpmCsx79zBf2qjqJ-11

## Layout Structure

### Interface Dividida em Duas Colunas

#### Coluna Esquerda - Texto Processado
- **Header**: 
  - Título: "Text processed"
  - Botão "New" para nova verificação
- **Conteúdo**: 
  - Texto original inserido pelo usuário
  - Scroll vertical quando necessário
  - Estado disabled (não editável)

#### Coluna Direita - Área de Resultados
- **Estados da Área de Resultados**:
  1. **Verificação em andamento** (1-2 segundos após carregamento)
  2. **Primeiros resultados** (quando back-end envia dados)
  3. **Verificação completa** (todos os resultados)

### Estado 1: Verificação em Andamento
- **Header**: "Verificando..."
  - Animação nos três pontos "..."
  - Ícone verde pulsando
- **Results**: Card com lazy loading animado
- **Design**: https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-11628&t=qpmCsx79zBf2qjqJ-11

### Estado 2: Primeiros Resultados
- **Design**: https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-12766&t=qpmCsx79zBf2qjqJ-11
- Cards com primeiros resultados do back-end

### Estado 3: Verificação Completa
- **Design**: https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-13092&t=qpmCsx79zBf2qjqJ-11
- Todos os resultados exibidos

## Componentes Necessários

### 1. ResultsPage
- Layout principal com duas colunas
- Gerenciamento de estados
- Integração com WebSocket para resultados em tempo real

### 2. ProcessedTextPanel
- Exibição do texto original
- Header com título e botão "New"
- Scroll vertical

### 3. ResultsPanel
- Área de resultados com estados dinâmicos
- Header com animações
- Cards de resultados

### 4. LoadingSpinner
- Ícone de loading animado (Lucide Loader2)
- Animação de pontos "..." no texto
- Pulsação do ícone verde

### 5. ResultCard
- Card individual para cada resultado
- Estados de loading e conteúdo
- Animações de entrada

## Animações e Transições

### Loading Animation
```css
.loader {
  width: 60px;
  aspect-ratio: 4;
  background: radial-gradient(circle closest-side,#000 90%,#0000) 0/calc(100%/3) 100% space;
  clip-path: inset(0 100% 0 0);
  animation: l1 1s steps(4) infinite;
}
@keyframes l1 {to{clip-path: inset(0 -34% 0 0)}}
```

### Text Animation (Pontos)
- "Lendo Texto." (1 ponto)
- "Lendo Texto.." (2 pontos)  
- "Lendo Texto..." (3 pontos)
- Loop infinito

### Icon Pulsing
- Ícone verde com animação de pulso
- Fade in/out suave

## Estados da Interface

### Estado Inicial
- Coluna esquerda aparece primeiro
- Coluna direita aparece após 1-2 segundos

### Estado de Loading
- Header: "Verificando..." com animação
- Cards com skeleton loading
- Ícone pulsando

### Estado de Resultados
- Cards aparecem conforme dados chegam
- Animações de entrada suaves
- Scroll automático para novos resultados

## Integração com Backend

### WebSocket Connection
- Conectar ao WebSocket do backend
- Escutar eventos de resultados
- Atualizar interface em tempo real

### Estados de Conexão
- Conectando
- Conectado
- Desconectado
- Erro de conexão

## Responsividade

### Desktop (1024px+)
- Layout de duas colunas lado a lado
- Coluna esquerda: 40% da largura
- Coluna direita: 60% da largura

### Tablet (768px - 1023px)
- Layout de duas colunas empilhadas
- Coluna esquerda em cima
- Coluna direita embaixo

### Mobile (< 768px)
- Layout de coluna única
- Coluna esquerda primeiro
- Coluna direita depois
- Botões de navegação otimizados

## Acessibilidade

### ARIA Labels
- `aria-label` para botões
- `aria-live` para atualizações dinâmicas
- `role="status"` para área de resultados

### Navegação por Teclado
- Tab navigation entre elementos
- Enter/Space para ativar botões
- Escape para fechar modais

### Screen Readers
- Anúncios de mudanças de estado
- Descrições de resultados
- Instruções de navegação

## TypeScript Interfaces

```typescript
interface ResultsPageProps {
  text: string;
  onNewVerification: () => void;
  onCancelVerification: () => void;
}

interface ResultData {
  id: string;
  text: string;
  confidence: number;
  status: 'verified' | 'unverified' | 'pending';
  sources?: string[];
}

interface ResultsState {
  status: 'loading' | 'partial' | 'complete' | 'error';
  results: ResultData[];
  isLoading: boolean;
}
```

## Ladle Stories

### Stories Necessárias
1. **ResultsPage.stories.tsx**
   - Estado de loading
   - Estado com resultados parciais
   - Estado com resultados completos
   - Estado de erro

2. **ProcessedTextPanel.stories.tsx**
   - Texto curto
   - Texto longo com scroll
   - Estado disabled

3. **ResultsPanel.stories.tsx**
   - Estado de loading
   - Estado com resultados
   - Estado vazio

4. **LoadingSpinner.stories.tsx**
   - Spinner básico
   - Com texto animado
   - Com ícone pulsando

5. **ResultCard.stories.tsx**
   - Card de loading
   - Card com resultado
   - Card com erro
