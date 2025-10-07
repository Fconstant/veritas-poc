# HomePage - Página Principal do Veritas

## Visão Geral
A `HomePage` é a página principal da aplicação Veritas, implementada como um componente React completo que serve como ponto de entrada para a verificação de fatos automatizada.

## Funcionalidades Implementadas

### 1. Verificação de Fatos
- Validação de texto obrigatório
- Tratamento de erros robusto
- Feedback visual com toast notifications
- Redirecionamento automático para `/results`

### 2. Exemplo de Texto
- Texto de exemplo pré-definido
- Preenchimento automático do formulário
- Otimizado com `useCallback`

### 3. Sistema de Notificações
- Toast notifications com auto-hide
- Tipos: success, error, info
- Posicionamento fixo (top-right)

## Layout e Design

### Estrutura Visual
- Header fixo no topo
- Layout em 2 colunas no desktop (Hero + Form)
- Layout empilhado no mobile (Form primeiro, depois Hero)
- Background com gradiente e decoração SVG

### Responsividade
- Desktop: Layout em 2 colunas
- Mobile/Tablet: Layout empilhado
- Breakpoints: `lg:` para desktop (1024px+)

## Integração com Next.js

### Roteamento
```tsx
// app/page.tsx
import { HomePage } from "@/components/veritas/pages";

export default function Home() {
  return <HomePage />;
}
```

### Navegação
- Uso do `useRouter` do Next.js 15
- Redirecionamento para `/results` após verificação bem-sucedida

## Componentes Integrados

1. **Header** - Cabeçalho fixo e responsivo
2. **HeroSection** - Seção de apresentação (esquerda)
3. **VerificationForm** - Formulário principal (direita)
4. **HomePageToast** - Sistema de notificações

## Otimizações de Performance

- Todos os handlers otimizados com `useCallback`
- Tratamento assíncrono com async/await
- Error handling robusto
- Responsive design otimizado

## Estados Gerenciados

- `textValue`: string - Texto a ser verificado
- `isLoading`: boolean - Estado de carregamento
- `toast`: objeto - Notificações de feedback

## Testes e Validação

- ✅ Build bem-sucedido
- ✅ TypeScript validation
- ✅ Component integration
- ✅ Responsividade testada

## Conclusão

A `HomePage` está completamente implementada e funcional como página principal do Veritas, oferecendo uma experiência de usuário otimizada com feedback visual, tratamento de erros robusto e design responsivo.