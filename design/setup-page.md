# API Setup - Onboarding de Configuração

## 📋 Visão Geral

Sistema de onboarding para configuração de API keys do Veritas. Garante que os usuários configurem as chaves necessárias antes de usar o verificador de fatos.

## 🎯 Componentes

### `ApiSetupPage`
Página completa de onboarding que guia o usuário na configuração das API keys.

**Features:**
- ✅ Design didático e não-técnico
- ✅ Links diretos para obter as chaves
- ✅ Validação em tempo real
- ✅ Feedback visual de progresso
- ✅ Suporte para edição de keys existentes
- ✅ Armazenamento seguro no localStorage

### `ApiKeyCard`
Card individual para configuração de uma API key.

**Features:**
- ✅ Campo com toggle de visibilidade (show/hide)
- ✅ Indicador de status "Configurado"
- ✅ Link de ajuda para obter a chave
- ✅ Feedback visual ao focar
- ✅ Animações suaves

## 🔧 Hook: `useApiKeys`

Hook customizado para gerenciar API keys:

```typescript
const { apiKeys, isLoading, saveApiKeys, clearApiKeys, hasApiKeys } = useApiKeys();
```

**Funcionalidades:**
- Carrega keys do localStorage automaticamente
- Salva keys de forma segura
- Valida se as keys estão configuradas
- Limpa keys quando necessário

## 🎨 Fluxo de Usuário

### 1. Primeira Visita
```
Usuário acessa Veritas
    ↓
Não tem API keys configuradas
    ↓
Mostra ApiSetupPage (onboarding)
    ↓
Usuário configura as keys
    ↓
Keys salvas no localStorage
    ↓
Redireciona para HomePage (verificador)
```

### 2. Visitas Subsequentes
```
Usuário acessa Veritas
    ↓
Tem API keys configuradas
    ↓
Mostra HomePage diretamente
    ↓
Botão de Settings no header para editar keys
```

## 🔐 Segurança

- **Armazenamento Local**: Keys ficam apenas no navegador do usuário
- **Nunca enviadas para nossos servidores**: Keys vão direto para Google/Tavily
- **Criptografia**: Armazenadas em localStorage (navegador já protege)

## 📱 Responsividade

- ✅ Mobile-first design
- ✅ Adapta layout para tablets e desktops
- ✅ Cards empilham verticalmente em telas pequenas
- ✅ Botões e textos ajustam tamanho

## 🎨 Design System

### Cores
- **Verde Principal**: `#22c55e` (sucesso, botões primários)
- **Verde Hover**: `#16a34a`
- **Azul Info**: `#3b82f6` (banners informativos)
- **Cinza**: `#f5f5f5` → `#eaeaea` (gradiente de fundo)

### Tipografia
- **Títulos**: Font-bold, tamanhos 24px-32px
- **Corpo**: Font-normal, 14px-16px
- **Mono**: Campos de API key (font-mono)

### Espaçamento
- **Cards**: padding 24px (p-6)
- **Gaps**: 16px-24px entre elementos
- **Bordas**: rounded-2xl (16px)

## 🚀 Como Usar

### Integração na HomePage

```typescript
import { useApiKeys } from '@/lib/hooks/useApiKeys';
import ApiSetupPage from '../setup/ApiSetupPage';

const HomePage = () => {
  const { apiKeys, isLoading, saveApiKeys, hasApiKeys } = useApiKeys();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Mostra setup se não tiver keys
  if (!hasApiKeys) {
    return (
      <ApiSetupPage
        onComplete={saveApiKeys}
        initialKeys={apiKeys || undefined}
      />
    );
  }

  // Mostra app normal
  return <YourApp />;
};
```

### Modal de Configurações

```typescript
const [showSettings, setShowSettings] = useState(false);

<Header 
  showSettings={true}
  onSettingsClick={() => setShowSettings(true)}
/>

{showSettings && (
  <Modal>
    <ApiSetupPage
      onComplete={(keys) => {
        saveApiKeys(keys);
        setShowSettings(false);
      }}
      initialKeys={apiKeys}
    />
  </Modal>
)}
```

## 📚 Storybook

Visualize os componentes:

```bash
pnpm ladle:dev
```

Navegue para:
- `veritas/setup/ApiSetupPage` - Página completa
- Stories disponíveis:
  - `FirstTime` - Primeira configuração
  - `WithExistingKeys` - Edição de keys existentes

## 🔄 Atualizações Futuras

- [ ] Validação de formato das keys
- [ ] Teste de conectividade com as APIs
- [ ] Suporte para mais providers de IA
- [ ] Exportar/importar configurações
- [ ] Modo escuro
