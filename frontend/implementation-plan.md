Plano detalhado e executável para implementar a UI do Veritas 100% pixel perfect baseado no design do Figma. 



## **🎯 Plano de Implementação UI Veritas - Pixel Perfect**

### **📋 FASE 1: Configuração Base (Prioridade ALTA)**

#### **1.1 Atualizar Sistema de Cores**
```css
/* Cores específicas do Veritas baseadas no Figma */
:root {
  /* Cores principais */
  --veritas-purple-primary: #351397;
  --veritas-purple-secondary: #844ae9;
  --veritas-purple-light: #a855f7;
  --veritas-blue-dark: #102148;
  --veritas-gray-light: #f7f7f7;
  --veritas-gray-border: #d7d4de;
  
  /* Cores de estado */
  --veritas-success: #10b981;
  --veritas-warning: #f59e0b;
  --veritas-error: #ef4444;
  --veritas-info: #3b82f6;
}
```

#### **1.2 Configurar Tipografia**
```css
/* Fontes do Figma */
--font-inria-serif: 'Inria Serif', serif;
--font-inter: 'Inter', sans-serif;
--font-merriweather: 'Merriweather', serif;
```

#### **1.3 Instalar Componentes shadcn/ui**
```bash
npx shadcn@latest add button input textarea card badge progress separator avatar dropdown-menu dialog toast skeleton alert tabs accordion
```

### **📱 FASE 2: Componentes de Layout (Prioridade ALTA)**

#### **2.1 Estrutura de Pastas**
```
frontend/src/components/
├── ui/                    # shadcn/ui base
├── veritas/
│   ├── layout/           # Header, Container, Footer
│   ├── common/           # Logo, AlphaBadge, PurpleBorder
│   ├── verification/     # Input, Button, Loading
│   ├── results/          # Card, Badge, Progress, Sources
│   └── pages/            # Páginas completas
```

#### **2.2 Componentes de Layout**
1. **Header.tsx** - Logo + Badge Alpha + Tagline
2. **Container.tsx** - Layout principal com bordas roxas
3. **Footer.tsx** - Rodapé com links
4. **PurpleBorder.tsx** - Sistema de bordas características

### **🎨 FASE 3: Componentes Comuns (Prioridade ALTA)**

#### **3.1 Logo e Branding**
- **Logo.tsx** - Logo "Veritas" com fonte Inria Serif
- **AlphaBadge.tsx** - Badge "Alpha v0.1"
- **Tagline.tsx** - "Automatize a verificação de fatos"

#### **3.2 Sistema de Bordas**
- **PurpleBorder.tsx** - Bordas roxas características
- **BorderVariants** - Diferentes estilos de borda

### **⚡ FASE 4: Componentes de Verificação (Prioridade ALTA)**

#### **4.1 Input de Verificação**
- **VerificationInput.tsx** - Campo principal de texto
- **Estados**: Default, Focus, Loading, Error, Disabled
- **Animações**: Transições suaves

#### **4.2 Botão de Verificação**
- **VerificationButton.tsx** - CTA principal
- **Estados**: Default, Hover, Loading, Disabled
- **Animações**: Loading spinner, hover effects

#### **4.3 Indicadores de Loading**
- **LoadingIndicator.tsx** - Spinner durante verificação
- **ProgressBar.tsx** - Barra de progresso
- **SkeletonLoader.tsx** - Placeholders de loading

### **📊 FASE 5: Componentes de Resultados (Prioridade MÉDIA)**

#### **5.1 Card de Resultado**
- **ResultCard.tsx** - Container principal de resultados
- **Layout**: Header + Content + Actions

#### **5.2 Badge de Veracidade**
- **TruthBadge.tsx** - Indicador visual (Verdadeiro/Falso)
- **Variantes**: Verdadeiro, Falso, Parcialmente Verdadeiro, Não Verificável

#### **5.3 Barra de Confiança**
- **ConfidenceBar.tsx** - Indicador de confiança (0-100%)
- **Cores**: Verde (alta), Amarelo (média), Vermelho (baixa)

#### **5.4 Lista de Fontes**
- **SourceList.tsx** - Lista de referências
- **SourceItem.tsx** - Item individual de fonte
- **Link externo**: Abertura em nova aba

### **🖼️ FASE 6: Páginas Completas (Prioridade MÉDIA)**

#### **6.1 Landing Page**
- **Layout**: Header + Hero Section + CTA
- **Hero**: Título + Descrição + Botão + Ilustração
- **Responsive**: Mobile-first design

#### **6.2 Página de Verificação**
- **Layout**: Header + Input + Button + Loading States
- **Estados**: Empty, Typing, Loading, Error, Success

#### **6.3 Página de Resultados**
- **Layout**: Header + Result Card + Sources + Actions
- **Estados**: Loading, Success, Error, Empty

### **🎭 FASE 7: Animações e Interações (Prioridade BAIXA)**

#### **7.1 Transições**
- **Framer Motion**: Animações suaves
- **Page Transitions**: Transições entre páginas
- **Component Transitions**: Entrada/saída de componentes

#### **7.2 Micro-interações**
- **Hover Effects**: Efeitos de hover
- **Click Feedback**: Feedback visual de cliques
- **Loading Animations**: Animações de loading

### **📱 FASE 8: Responsividade (Prioridade BAIXA)**

#### **8.1 Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

#### **8.2 Adaptações**
- **Layout**: Grid responsivo
- **Tipografia**: Escalas responsivas
- **Componentes**: Adaptações mobile

### **🧪 FASE 9: Testes e Validação (Prioridade BAIXA)**

#### **9.1 Stories do Ladle**
- **Todas as variações**: Estados, tamanhos, cores
- **Responsive**: Diferentes breakpoints
- **Acessibilidade**: Testes de acessibilidade

#### **9.2 Validação Pixel Perfect**
- **Comparação**: Design vs Implementação
- **Medidas**: Espaçamentos exatos
- **Cores**: Paleta exata
- **Tipografia**: Fontes e tamanhos exatos

### **📋 Cronograma de Implementação**

#### **Semana 1: Base + Layout**
- ✅ Configuração de cores e tipografia
- ✅ Instalação de componentes shadcn/ui
- ✅ Componentes de layout (Header, Container)
- ✅ Componentes comuns (Logo, AlphaBadge)

#### **Semana 2: Verificação**
- ✅ Componentes de verificação (Input, Button)
- ✅ Estados de loading e error
- ✅ Animações básicas

#### **Semana 3: Resultados**
- ✅ Componentes de resultados (Card, Badge, Progress)
- ✅ Lista de fontes
- ✅ Estados de resultado

#### **Semana 4: Páginas + Polimento**
- ✅ Páginas completas
- ✅ Responsividade
- ✅ Animações avançadas
- ✅ Testes finais

### **🚀 Próximos Passos Imediatos**

1. **Criar estrutura de pastas**
2. **Configurar cores e tipografia**
3. **Instalar componentes shadcn/ui**
4. **Implementar Header com Logo**
5. **Criar stories no Ladle**

Quer que eu comece implementando a **Fase 1** (Configuração Base) agora? Posso começar criando a estrutura de pastas e configurando as cores e tipografia do Veritas.