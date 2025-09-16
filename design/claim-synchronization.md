# Sincronização CLAIMS ↔ Texto Íntegro

## Visão Geral

Este documento descreve o sistema de sincronização bidirecional implementado entre os CLAIMS extraídos e o texto íntegro processado, permitindo que o usuário identifique facilmente onde cada afirmação foi encontrada no texto original.

## Funcionalidades Implementadas

### 1. **Highlight Interativo no Texto**
- **Localização**: `frontend/src/components/veritas/results/InteractiveText.tsx`
- **Funcionalidade**: Destaca automaticamente os CLAIMS no texto com numeração de referência
- **Design**: 
  - 🎯 **Cor Única**: Roxo (`text-[#5d13dd] bg-purple-50`) para todos os CLAIMS
  - 📝 **Numeração**: Números na frente de cada CLAIM (1., 2., 3...)
  - 📚 **Estilo**: Similar a referências acadêmicas

### 2. **Numeração Consistente**
- **Texto**: CLAIMS destacados com numeração visual
- **Resultados**: Cards numerados (1, 2, 3...) correspondentes aos CLAIMS
- **Sincronização**: Mesma numeração em ambos os painéis

### 3. **Interação Bidirecional**
- **Click no CLAIM** → Destaca resultado correspondente + scroll automático
- **Click no Resultado** → Destaca CLAIM no texto + scroll automático
- **Estados Visuais**: Hover, seleção, e feedback visual em tempo real

### 4. **Scroll Automático**
- **Smooth scrolling** para elementos correspondentes
- **Centralização** do elemento focado na viewport
- **IDs únicos** para navegação precisa (`claim-{id}`, `result-{id}`)

## Arquitetura Técnica

### Componentes Principais

#### `InteractiveText.tsx`
```typescript
interface InteractiveTextProps {
  text: string;
  results: ResultData[];
  onClaimClick?: (claimId: string) => void;
  selectedClaimId?: string;
  className?: string;
}
```

**Funcionalidades**:
- Busca automática de CLAIMS no texto usando `indexOf()`
- Renderização com highlights coloridos
- Gerenciamento de estados (hover, seleção)
- Tooltips informativos

#### `ProcessedTextPanel.tsx` (Atualizado)
```typescript
interface ProcessedTextPanelProps {
  text: string;
  results?: ResultData[];
  onNewVerification: () => void;
  onClaimClick?: (claimId: string) => void;
  selectedClaimId?: string;
  className?: string;
}
```

**Melhorias**:
- Integração com `InteractiveText`
- Suporte a sincronização bidirecional
- Preservação da fonte Merriweather

#### `ResultsPanel.tsx` (Atualizado)
```typescript
interface ResultsPanelProps {
  // ... props existentes
  onResultClick?: (resultId: string) => void;
  selectedResultId?: string;
}
```

**Melhorias**:
- Numeração visual dos resultados
- Estados de seleção e hover
- IDs únicos para navegação

#### `ResultsPage.tsx` (Atualizado)
```typescript
const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>();

const handleClaimClick = useCallback((claimId: string) => {
  setSelectedClaimId(claimId);
  // Scroll para resultado correspondente
}, []);

const handleResultClick = useCallback((resultId: string) => {
  setSelectedClaimId(resultId);
  // Scroll para CLAIM correspondente
}, []);
```

## Fluxo de Sincronização

### 1. **Inicialização**
```
Texto Processado → Busca CLAIMS → Destaca no texto
Resultados → Numeração → Estados visuais
```

### 2. **Interação do Usuário**
```
Click CLAIM → setSelectedClaimId → Scroll para Resultado
Click Resultado → setSelectedClaimId → Scroll para CLAIM
```

### 3. **Estados Visuais**
```
selectedClaimId === claimId → Highlight + Ring + Background
hoveredClaimId === claimId → Shadow + Opacity
```

## Algoritmo de Busca de CLAIMS

### Estratégia de Correspondência
1. **Limpeza**: Remove aspas do início/fim dos CLAIMS
2. **Busca**: Usa `indexOf()` para localizar no texto
3. **Validação**: Verifica se encontrou correspondência
4. **Ordenação**: Ordena por posição no texto
5. **Renderização**: Aplica highlights com cores específicas

### Exemplo de Implementação
```typescript
const findClaimsInText = useCallback((text: string, results: ResultData[]): ClaimHighlight[] => {
  const highlights: ClaimHighlight[] = [];
  
  results.forEach((result, index) => {
    const claimText = result.text.trim();
    const cleanClaimText = claimText.replace(/^["']|["']$/g, '');
    const startIndex = text.indexOf(cleanClaimText);
    
    if (startIndex !== -1) {
      highlights.push({
        id: result.id,
        text: cleanClaimText,
        startIndex,
        endIndex: startIndex + cleanClaimText.length,
        claimNumber: index + 1,
        status: result.status
      });
    }
  });
  
  return highlights.sort((a, b) => a.startIndex - b.startIndex);
}, []);
```

## Benefícios da Implementação

### 1. **Experiência do Usuário**
- ✅ **Clareza**: Usuário vê exatamente onde cada CLAIM foi extraído
- ✅ **Navegação**: Click para navegar entre texto e resultados
- ✅ **Contexto**: Mantém contexto visual durante a verificação

### 2. **Acessibilidade**
- ✅ **Tooltips**: Informações detalhadas no hover
- ✅ **Contraste**: Cores com bom contraste para leitura
- ✅ **Navegação**: Suporte a navegação por teclado (futuro)

### 3. **Performance**
- ✅ **Otimizado**: Busca eficiente usando `indexOf()`
- ✅ **Memoização**: `useMemo` para evitar recálculos
- ✅ **Transições**: Animações suaves com CSS transitions

## Design System Compliance

### Cores do Figma
- **CLAIM Highlight**: `#5d13dd` (roxo único para todos os CLAIMS)
- **Background**: `bg-purple-50` (fundo claro)
- **Ring**: `ring-purple-500` (borda de seleção)
- **Numeração**: `text-[#5d13dd]` (mesma cor do highlight)

### Tipografia
- **Fonte**: Merriweather (conforme especificação)
- **Tamanho**: `text-sm` (14px)
- **Leading**: `leading-7` (28px)

### Espaçamento
- **Padding**: `px-1 py-0.5` (highlight interno)
- **Border Radius**: `rounded` (cantos arredondados)
- **Gap**: `gap-3` (espaçamento entre elementos)

## Próximos Passos

### Melhorias Futuras
1. **Busca Inteligente**: Algoritmo de correspondência mais sofisticado
2. **Navegação por Teclado**: Suporte completo a acessibilidade
3. **Animações**: Transições mais elaboradas
4. **Cache**: Cache de posições para melhor performance
5. **Testes**: Testes unitários e de integração

### Possíveis Extensões
1. **Filtros**: Filtrar CLAIMS por status
2. **Exportação**: Exportar texto com highlights
3. **Compartilhamento**: Compartilhar CLAIMS específicos
4. **Histórico**: Histórico de navegação entre CLAIMS

## Conclusão

O sistema de sincronização implementado oferece uma experiência intuitiva e eficiente para navegar entre CLAIMS e texto íntegro, seguindo as especificações do design do Figma e mantendo a consistência visual do sistema Veritas.

A implementação é escalável, performática e oferece uma base sólida para futuras melhorias na experiência do usuário.
