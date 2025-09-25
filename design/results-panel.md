### Veritas — Results Panel

- **Figma (Results States)**: [`Results/ States`](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=332-7199&t=qpmCsx79zBf2qjqJ-11)
- **Figma (Results Header States)**: [`Results/Header/States`](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-15964&t=qpmCsx79zBf2qjqJ-11)

#### Tokens (Figma → CSS)
- Primary Purple: `#351397`
- Secondary Purple: `#844ae9`
- Blue Dark: `#102148`
- Gray Border: `#d7d4de`
- Success Dot Outer: `#77e6a0`
- Success Dot Inner: `#22c55e` (Tailwind `green-500`)
- Error Text: `#cb1f1f`

#### Typography
- Label size: 16px, line-height: 20px, Inter Medium

#### Header Variantes
- Default/Loading: Left success dot + label "Verificando..."; Right outline button with purple border and label "Cancel" + `Ban` icon.
- Error: Left `AlertTriangle` in red + label "Erro na Verificação" (color `#cb1f1f`); Right outline button label "Try again" + `RefreshCw`.
- Done: Left `CheckCircle` in green + label "Verificação Completa"; Right outline button label "Copy Plain Text" + `Play`.
- Text processed (referência visual): filled button `#844ae9` with white label (não usada diretamente pelo componente atual).

#### Variante de Erro
- **Borda**: `border-[#cb1f1f]` (vermelho) em vez da borda roxa padrão
- **Ícone**: `AlertTriangle` em vermelho (`text-red-500`)
- **Texto**: "Erro na Verificação" em cor `#cb1f1f`
- **Botão**: "Try again" com ícone `RotateCcw` (RefreshCw)
- **Design**: Baseado no Figma node `332-7483`

#### Comportamento
- Os botões do cabeçalho são somente visuais neste momento; callbacks podem ser passados depois via props.
- Ícones: sempre Lucide React.

#### Estrutura do componente
- **Largura**: Fixa em `664px` (baseada no design do Figma) para consistência entre todos os estados
- **Altura**: Sempre abraça o conteúdo interno até atingir altura máxima (`max-h-[calc(100vh-4rem)]`)
- **Rolagem**: Automática quando conteúdo ultrapassa altura máxima da página
- **Garantia**: Altura máxima nunca ultrapassa a viewport (margem de segurança de 4rem)
- Container principal: altura máxima limitada à viewport com rolagem automática
- Container do cabeçalho: `px-6 py-4 flex-shrink-0`, borda `#d7d4de`, fundo `white`.
- Grupo esquerdo: ícone + label (gap-2/gap-3 conforme layout estreito).
- Grupo direito: botão com borda de 1px `#351397`, raio 8px, texto `#8a5cda`.
- Área de conteúdo: `px-6 py-6 flex-1 overflow-y-auto`, sempre com rolagem quando necessário.

#### Skeleton Card (Loading State)
- **Design**: Baseado no Figma node `332-7120`
- **Container**: `border border-[#351397]`, `bg-[#f9f9f9]`, `rounded-[8px]`, `pl-3 pr-4 py-4`
- **Status Dot**: Círculo externo `bg-[#e7ebeb]` size-4, círculo interno `bg-[#cbd0d5]` size-2
- **Text Skeleton**: Duas linhas com gradiente `from-[#e7ebeb] via-[#cbd0d5] to-[#e7ebeb]`
- **Animação**: `animate-[shimmer_1.5s_ease-in-out_infinite]` com `bg-[length:200px_100%]`
- **Dimensões**: Primeira linha `w-full`, segunda linha `w-72`

#### Estado "Nenhum Resultado Encontrado"
- **Condição**: `status === 'complete'` e `results.length === 0`
- **Card**: Fundo `bg-[rgba(132,74,233,0.1)]` (roxo claro com 10% opacidade)
- **Ícone**: `CheckCircle` em roxo `text-[#844ae9]` size-12
- **Texto**: "Nenhum resultado encontrado!" em `text-[#383838]` 14px
- **Layout**: Centralizado com gap-4 entre card e texto
- **Design**: Baseado no Figma node `417-15635`

#### Links úteis
- Ladle: [ResultsPanel Stories](http://localhost:61000/?story=veritas/results/ResultsPanel--Empty)


