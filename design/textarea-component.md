# TextArea Component - Design Specification

## Visão Geral
O componente TextArea é um elemento de entrada de texto multilinha que permite aos usuários inserir e editar texto em múltiplas linhas. É parte do sistema de design Veritas e segue os padrões de acessibilidade e usabilidade estabelecidos.

## Especificações Técnicas

### Dimensões
- **Largura**: 100% do container pai
- **Altura mínima**: 120px
- **Altura máxima**: 300px (com scroll automático)
- **Padding interno**: 16px (horizontal e vertical)
- **Border radius**: 8px
- **Border width**: 1px

### Cores e Estados

#### Estado Normal
- **Background**: #FFFFFF (branco)
- **Border**: #D6D8DB (cinza claro)
- **Text**: #102148 (azul escuro)
- **Placeholder**: #737A8B (cinza médio)

#### Estado Focus
- **Background**: #FFFFFF (branco)
- **Border**: #8B5CF6 (roxo)
- **Text**: #102148 (azul escuro)
- **Shadow**: 0 0 0 3px rgba(139, 92, 246, 0.1)

#### Estado Error
- **Background**: #FFFFFF (branco)
- **Border**: #EF4444 (vermelho)
- **Text**: #102148 (azul escuro)
- **Shadow**: 0 0 0 3px rgba(239, 68, 68, 0.1)

#### Estado Disabled
- **Background**: #F8F9FA (cinza muito claro)
- **Border**: #E5E7EB (cinza claro)
- **Text**: #9CA3AF (cinza)
- **Placeholder**: #D1D5DB (cinza claro)

### Tipografia
- **Font family**: Inter (var(--font-inter))
- **Font size**: 16px
- **Font weight**: 400 (normal)
- **Line height**: 1.5
- **Letter spacing**: 0.32px

### Acessibilidade
- **ARIA labels**: Suporte completo para screen readers
- **Keyboard navigation**: Tab para focar, Enter para quebrar linha
- **Focus indicators**: Contorno visual claro no estado focus
- **Color contrast**: Mínimo de 4.5:1 para texto normal

## Variantes do Componente

### 1. TextArea Padrão
- Altura mínima de 120px
- Scroll automático quando necessário
- Placeholder text opcional

### 2. TextArea Compacto
- Altura mínima de 80px
- Ideal para formulários com espaço limitado
- Mantém todas as funcionalidades do padrão

### 3. TextArea Expandível
- Altura inicial de 120px
- Cresce automaticamente com o conteúdo
- Máximo de 300px antes do scroll

### 4. TextArea com Contador
- Mostra contador de caracteres
- Limite configurável
- Mudança de cor quando próximo do limite

## Props e Interface

```typescript
interface TextAreaProps {
  // Conteúdo
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  
  // Comportamento
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  
  // Validação
  error?: boolean;
  errorMessage?: string;
  
  // Estilo
  className?: string;
  variant?: 'default' | 'compact' | 'expandable' | 'withCounter';
  
  // Eventos
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  
  // Acessibilidade
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}
```

## Estados e Interações

### Estados Visuais
1. **Normal**: Estado padrão, pronto para entrada
2. **Focus**: Quando o usuário clica ou navega com Tab
3. **Error**: Quando há erro de validação
4. **Disabled**: Quando o campo está desabilitado
5. **ReadOnly**: Quando o campo é somente leitura

### Interações
- **Click**: Foca no campo e posiciona cursor
- **Tab**: Navega para o próximo elemento
- **Shift+Tab**: Navega para o elemento anterior
- **Enter**: Quebra linha (não submete formulário)
- **Ctrl+A**: Seleciona todo o texto
- **Ctrl+C/V**: Copia/cola texto
- **Scroll**: Quando o conteúdo excede a altura máxima

## Casos de Uso

### 1. Formulário de Contato
- Campo para mensagem do usuário
- Placeholder explicativo
- Validação de comprimento mínimo

### 2. Comentários e Feedback
- Área para comentários detalhados
- Contador de caracteres
- Suporte a formatação básica

### 3. Descrições e Notas
- Campos para descrições longas
- Modo somente leitura para exibição
- Suporte a texto formatado

## Implementação

### Estrutura HTML
```html
<div class="textarea-container">
  <label for="textarea-id" class="textarea-label">
    Label do Campo
  </label>
  <textarea
    id="textarea-id"
    class="textarea-input"
    placeholder="Placeholder text"
    aria-describedby="textarea-help"
  ></textarea>
  <div id="textarea-help" class="textarea-help">
    Texto de ajuda opcional
  </div>
  <div class="textarea-error" role="alert">
    Mensagem de erro
  </div>
</div>
```

### Classes CSS
```css
.textarea-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.textarea-input {
  width: 100%;
  min-height: 120px;
  max-height: 300px;
  padding: 16px;
  border: 1px solid #D6D8DB;
  border-radius: 8px;
  font-family: var(--font-inter);
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
}

.textarea-input:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.textarea-input:disabled {
  background-color: #F8F9FA;
  border-color: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
}
```

## Testes

### Testes de Acessibilidade
- [ ] Navegação por teclado funciona corretamente
- [ ] Screen readers anunciam o campo adequadamente
- [ ] Contraste de cores atende aos padrões WCAG
- [ ] Estados de erro são anunciados

### Testes de Funcionalidade
- [ ] Entrada de texto funciona corretamente
- [ ] Quebra de linha funciona com Enter
- [ ] Scroll aparece quando necessário
- [ ] Validação funciona corretamente
- [ ] Estados visuais mudam conforme esperado

### Testes de Responsividade
- [ ] Componente se adapta a diferentes tamanhos de tela
- [ ] Texto permanece legível em dispositivos móveis
- [ ] Interações touch funcionam corretamente

## Notas de Implementação

1. **Performance**: Use `useCallback` para handlers de eventos
2. **Acessibilidade**: Sempre forneça labels e descrições adequadas
3. **Validação**: Implemente validação tanto no cliente quanto no servidor
4. **Responsividade**: Teste em diferentes dispositivos e orientações
5. **Consistência**: Mantenha consistência com outros componentes do sistema

## Referências

- [Figma Design](https://www.figma.com/design/QyHxg2phuY29PoHaxF631K/Veritas---FactChecker-Agent?node-id=175-2518&t=pdGW6MiEiOTir3rO-11)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Textarea Documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea)
