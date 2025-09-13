# Processing Confirmation - Text Processing

## Design Link
https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=154-9500&t=qpmCsx79zBf2qjqJ-4

## Descrição
Esta página é uma confirmação ao usuário de que recebemos o texto e começamos a análise. Mostrar essa tela não mais de 2 ou 3 segundos, e então fazer uma animação de transição para a tela de Resultados em si.

## Comportamento e Animações

### Transição do Landing Page
Assim que o usuário clicar em VERIFICAR FATOS, iremos fazer uma transição bem smooth, com animações do VERIFICATION FORM se movendo para o centro da tela, e o TEXT AREA mudando para o estado de DISABLED, desabilitando a edição do texto inserido.

A HERO SECTION vai desaparecendo da tela.

### Estado de Loading
Quando o VERIFICATION FORM chegar ao centro, os BOTOES USAR EXEMPLO E VERIFICAR FATOS desapareceram, e entrará o LOADING, com um ícone animado de loading girando, vamos usar o ícone "loader" do Lucide.

A label será "Lendo Texto..." - E os três pontos ao final, serão animados, mostrando primeiro:
- 1º: 1 ponto: "."
- 2º 2 pontos ".."
- Por fim 3 pontos: "..."
- Depois, recomeça o loop com 1 ponto "."

## Especificações Visuais Extraídas do Figma

### Layout Principal
- **Background**: `bg-neutral-100 opacity-90` (fundo neutro com opacidade)
- **Dimensões**: 1440x800px
- **Posicionamento**: Container centralizado

### Header (TopBar)
- **Posição**: `absolute top-0 left-20`
- **Dimensões**: 1280x76px
- **Background**: Transparente com borda inferior
- **Borda**: `border-[#d6d8db] border-b`

#### Logo e Badge
- **Logo**: "Veritas" em Inria Serif Bold, 24px, cor #102148
- **Badge**: Background #dedfe3, texto "Alpha v0.1" em Inter Regular 12px
- **Tagline**: "Automatize a verificação de fatos" em Inter Regular 14px, cor #737a8b

### Container Principal (Verification Form)
- **Posição**: Centralizado (`top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]`)
- **Dimensões**: 571x320px
- **Background**: #f9f9f9
- **Padding**: 16px
- **Border Radius**: 16px
- **Borda**: 1px solid #351397 (roxo Veritas)
- **Shadow**: `0px 20px 80px 0px rgba(137,44,219,0.2)`

### Text Area
- **Container**: 539px de largura
- **Label**: "Verificar fatos de..." em Inter Medium 16px, cor #6e678a
- **Character Count**: "893/1024 characters limit" em Inter Medium 14px, cor rgba(110,103,138,0.7)
- **Text Area Background**: #f8f8f8
- **Padding**: 12px
- **Border Radius**: 8px
- **Altura**: 192px (h-48)
- **Texto**: Merriweather Regular 14px, cor #383838, opacity 0.65 (disabled state)
- **Line Height**: 28px

### Loading State
- **Container**: Flex com gap-2, padding 16px
- **Ícone**: Lucide Loader2, tamanho 24px (size-6)
- **Texto**: "Lendo Texto..." em Inter Regular 16px, cor #383838
- **Posicionamento**: Centralizado no container

## Cores Utilizadas
- **Background Principal**: #f5f5f5 (neutral-100)
- **Background Container**: #f9f9f9
- **Background Text Area**: #f8f8f8
- **Texto Principal**: #383838
- **Texto Secundário**: #6e678a
- **Texto Disabled**: #383838 com opacity 0.65
- **Borda Container**: #351397 (roxo Veritas)
- **Borda Header**: #d6d8db
- **Logo**: #102148
- **Tagline**: #737a8b
- **Badge Background**: #dedfe3

## Tipografia
- **Logo**: Inria Serif Bold, 24px
- **Badge**: Inter Regular, 12px
- **Tagline**: Inter Regular, 14px
- **Label**: Inter Medium, 16px
- **Character Count**: Inter Medium, 14px
- **Texto Area**: Merriweather Regular, 14px
- **Loading Text**: Inter Regular, 16px

## Animações CSS Necessárias

### Loading Dots Animation
```css
@keyframes loadingDots {
  0%, 20% { content: "."; }
  40% { content: ".."; }
  60%, 100% { content: "..."; }
}

.loading-text::after {
  content: "...";
  animation: loadingDots 1.5s infinite;
}
```

### Transição do Form
- **Duração**: 1 segundo 
- **Easing**: smooth transition
- **Movimento**: Do posicionamento original para o centro da tela
- **Estados**: 
  1. Formulário original com botões
  2. Formulário centralizado com textarea disabled
  3. Loading state com ícone girando

## Componentes Necessários
1. **ProcessingConfirmationPage**: Página principal
2. **LoadingSpinner**: Componente de loading com ícone Lucide
3. **AnimatedText**: Texto com animação dos pontos
4. **DisabledTextArea**: Textarea no estado disabled

## Integração com WebSocket
- Aguardar confirmação do backend
- Transição automática após 2-3 segundos
- Preparar para receber resultados em tempo real

## Estados do Componente
1. **Initial**: Formulário original
2. **Transitioning**: Movendo para centro, hero desaparecendo
3. **Processing**: Loading com "Lendo Texto..."
4. **Ready**: Pronto para transição para Results

## Acessibilidade
- **ARIA Labels**: Para estados de loading
- **Screen Reader**: Anunciar mudança de estado
- **Keyboard Navigation**: Manter foco durante transições
- **Focus Management**: Durante animações
