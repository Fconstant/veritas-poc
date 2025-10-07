# Diffs específicos das correções do PR

Este documento complementa o `PR-CORRECOES-IMAGENS.md` com os diffs detalhados de cada arquivo modificado.

---

## 1. `frontend/src/lib/store/factCheckStore.ts` (arquivo criado)

**Mudança:** Store Zustand criada para gerenciar estado da verificação.

```typescript
import { create } from 'zustand';
import type { FactCheckResult, VerificationState, VerificationStatus } from '../types/api';

interface FactCheckStoreState extends VerificationState {
  // VerificationState já inclui processedText e fingerprint do shared/types/api.ts
  // Não precisamos redefinir aqui
}

interface FactCheckStoreActions {
  update: (updates: Partial<FactCheckStoreState>) => void;
  setStatus: (status: VerificationStatus, message?: string) => void;
  addResult: (result: FactCheckResult) => void;
  reset: () => void;
}

export type FactCheckStore = FactCheckStoreState & FactCheckStoreActions;

const initialState: FactCheckStoreState = {
  status: 'idle',
  results: [],
  processedText: '',
  fingerprint: null,
};

export const useFactCheckStore = create<FactCheckStore>((set) => ({
  ...initialState,
  update: (updates) => set((state) => ({ ...state, ...updates })),
  setStatus: (status, message) =>
    set((state) => ({
      ...state,
      status,
      message,
    })),
  addResult: (result) =>
    set((state) => ({
      ...state,
      results: [...state.results, result],
    })),
  reset: () =>
    set(() => ({
      ...initialState,
    })),
}));

// Exporta a store para uso no serviço (sem React)
export const factCheckStore = {
  getState: () => useFactCheckStore.getState(),
  setState: (updates: Partial<FactCheckStoreState>) => useFactCheckStore.setState(updates),
  subscribe: (listener: (state: FactCheckStore) => void) => useFactCheckStore.subscribe(listener),
};
```

---

## 2. `frontend/src/lib/services/factCheckService.ts`

### 2.1 Importação da store Zustand

```diff
  import { io, Socket } from 'socket.io-client';
  import CryptoJS from 'crypto-js';
  import { API_CONFIG } from '../config/api';
  import {
    FactCheckRequest,
    FactCheckResult,
    UpdateStatus,
    ChunkCount,
    VerificationState,
    VerificationStatus,
    ClientToServerEvents,
    ServerToClientEvents
  } from '../types/api';
+ import { factCheckStore } from '../store/factCheckStore';
```

### 2.2 Listener `FACT_CHECK_RESULT` com double-check

```diff
      // Eventos específicos da verificação de fatos
      this.socket.on('FACT_CHECK_RESULT', (result: FactCheckResult) => {
        console.log('Resultado recebido:', result);
        
+       // Double check: verifica estrutura do resultado
+       if (!result.data || !result.data.extractedClaim || typeof result.data.reasoningConfidence !== 'number' || !result.meta) {
+         console.warn('⚠️ API pode ter mudado: estrutura do FACT_CHECK_RESULT diferente do esperado');
+       }
        
+       const currentState = factCheckStore.getState();
+       factCheckStore.setState({
+         results: [...currentState.results, result]
+       });
      });
```

### 2.3 Listener `UPDATE_STATUS` com atualização da store

```diff
      this.socket.on('UPDATE_STATUS', (status: UpdateStatus) => {
        console.log('Status atualizado:', status);
        
        let newStatus: VerificationStatus = 'idle';
        switch (status.data.status) {
          case 'PROCESSING':
            newStatus = 'processing';
            break;
          case 'FINISHED':
            newStatus = 'finished';
            break;
          case 'EXCEPTION':
            newStatus = 'error';
            break;
          case 'INTERRUPTED':
            newStatus = 'interrupted';
            break;
        }

+       factCheckStore.setState({
+         status: newStatus,
+         message: status.data.message
+       });
      });
```

### 2.4 Listener `CHUNK_COUNT` com atualização da store

```diff
      this.socket.on('CHUNK_COUNT', (chunkCount: ChunkCount) => {
        console.log('Contagem de chunks:', chunkCount);
        console.log(`📦 Texto dividido em ${chunkCount.data.chunkCount} chunks para processamento`);
+       factCheckStore.setState({
+         chunkCount: chunkCount.data.chunkCount
+       });
      });
```

### 2.5 Double-check no `testConnection()`

```diff
    public async testConnection(): Promise<boolean> {
      try {
        console.log('🧪 Testando conectividade com o backend...');
        console.log('🌐 URL:', this.backendUrl);
        
        // Testa HTTP primeiro
        const response = await fetch(`${this.backendUrl}/health`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const healthData = await response.json();
        console.log('✅ Health check OK:', healthData);
        
+       // Double check: verifica se a API retorna o formato esperado
+       if (!healthData.status) {
+         console.warn('⚠️ API pode ter mudado: campo "status" não encontrado na resposta');
+       }
        
        // Testa WebSocket
        await this.connect();
        console.log('✅ WebSocket conectado');
        
        return true;
      } catch (error) {
        console.error('❌ Teste de conectividade falhou:', error);
        return false;
      }
    }
```

### 2.6 Tipo compartilhado em `requestFactCheck()`

```diff
    public async requestFactCheck(
      content: string, 
-     options: {
-       researchThreshold?: number;
-       apiKeys?: {
-         google?: string;
-         tavily?: string;
-       };
-     } = {}
+     options: Partial<Omit<FactCheckRequest, 'fingerprint'>> = {}
    ): Promise<string> {
```

### 2.7 Atualização da store em `requestFactCheck()`

```diff
      try {
        // Garante conexão com o backend (auto-conectável)
        if (!this.isConnected()) {
          await this.connect();
        }

        // Gera novo fingerprint
        const fingerprint = this.generateFingerprint();

        // Limpa resultados anteriores e atualiza estado
+       factCheckStore.setState({
+         status: 'connecting',
+         results: [],
+         chunkCount: undefined,
+         error: undefined,
+         message: 'Conectando ao servidor...',
+         processedText: content,
+         fingerprint
+       });

        // Prepara a requisição
        const request: FactCheckRequest = {
          fingerprint,
          researchThreshold: options.researchThreshold ?? API_CONFIG.DEFAULT_RESEARCH_THRESHOLD,
          apiKeys: options.apiKeys
        };

        // Envia a requisição
        if (!this.socket) {
          throw new Error('Conexão com o backend não está disponível.');
        }
        this.socket.emit('REQUEST_FACT_CHECK', content, request);

        return fingerprint;
      } catch (error) {
        console.error('Erro ao enviar requisição de verificação:', error);
+       factCheckStore.setState({
+         status: 'error',
+         error: error instanceof Error ? error.message : 'Erro desconhecido'
+       });
        throw error;
      }
```

### 2.8 Novos métodos públicos

```diff
+   /**
+    * Registra um listener para mudanças de estado usando Zustand
+    */
+   public onStateChange(listener: (state: VerificationState) => void): () => void {
+     // Chama o listener imediatamente com o estado atual
+     listener(factCheckStore.getState());
+     
+     // Subscreve às mudanças da store
+     return factCheckStore.subscribe((state) => {
+       listener(state);
+     });
+   }

+   /**
+    * Obtém o estado atual da verificação
+    */
+   public getState(): VerificationState {
+     return factCheckStore.getState();
+   }

+   /**
+    * Obtém o texto processado
+    */
+   public getProcessedText(): string {
+     return factCheckStore.getState().processedText;
+   }

+   /**
+    * Limpa o estado atual
+    */
+   public reset(): void {
+     factCheckStore.setState({
+       status: 'idle',
+       results: [],
+       chunkCount: undefined,
+       error: undefined,
+       message: undefined,
+       processedText: '',
+       fingerprint: null
+     });
+   }
```

---

## 3. `frontend/src/app/home/components/HomePage.tsx`

### 3.1 Imports e constante de exemplo

```diff
  "use client";

  import React, { useState, useCallback, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { cn } from '@/lib/utils';
  import { X } from 'lucide-react';
  import Header from '@/app/shared/components/Header';
  import HeroSection from './HeroSection';
  import VerificationForm from './VerificationForm';
  import HomePageToast from './HomePageToast';
  import { factCheckService } from '@/lib/services/factCheckService';
+ import { useFactCheckStore } from '@/lib/store/factCheckStore';
+ import { useApiKeys } from '@/lib/hooks/useApiKeys';
  import ApiSetupPage from '@/app/shared/components/ApiSetupPage';
  import { Button } from '@/app/shared/components/ui/button';

+ // Constante para o texto de exemplo
+ const EXAMPLE_FACT_CHECK_TEXT = "As vacinas contra COVID-19 foram desenvolvidas em tempo recorde em 2020. O Brasil iniciou sua campanha de vacinação em janeiro de 2021. Estudos mostram que as vacinas reduziram significativamente as hospitalizações e mortes pela doença.";
```

### 3.2 Uso da store e API keys

```diff
  const HomePage: React.FC<HomePageProps> = ({ className, router: propRouter }) => {
    const nextRouter = useRouter();
    const router = propRouter || nextRouter;
+   const { apiKeys, isLoading, saveApiKeys, hasApiKeys } = useApiKeys();
    const [textValue, setTextValue] = useState<string>("");
    const [showSettings, setShowSettings] = useState(false);
+   const verificationState = useFactCheckStore();
    const [toast, setToast] = useState<{
      type: 'success' | 'error' | 'info';
      message: string;
      isVisible: boolean;
    }>({
      type: 'info',
      message: '',
      isVisible: false
    });
```

### 3.3 Callback `handleUseExample` simplificado

```diff
    const handleUseExample = useCallback(() => {
-     const exampleText = "Bolsonaro: Destinamos também a este estado maravilhoso aqui, mesmo sendo...";
-     setTextValue(exampleText);
+     setTextValue(EXAMPLE_FACT_CHECK_TEXT);
    }, []);
```

### 3.4 Effect para observar mudanças de estado

```diff
+   // Escuta mudanças no estado da verificação
+   useEffect(() => {
+     // Atualiza toast baseado no status
+     if (verificationState.status === 'finished') {
+       setToast({
+         type: 'success',
+         message: 'Verificação concluída! Redirecionando para os resultados...',
+         isVisible: true
+       });
+       
+       // Auto-hide toast após 2 segundos e redirecionar
+       setTimeout(() => {
+         setToast(prev => ({ ...prev, isVisible: false }));
+         router.push('/results');
+       }, 2000);
+     } else if (verificationState.status === 'error') {
+       setToast({
+         type: 'error',
+         message: verificationState.error || 'Erro na verificação. Tente novamente.',
+         isVisible: true
+       });
+       
+       // Auto-hide toast após 5 segundos
+       setTimeout(() => {
+         setToast(prev => ({ ...prev, isVisible: false }));
+       }, 5000);
+     } else if (verificationState.status === 'interrupted') {
+       setToast({
+         type: 'error',
+         message: 'Verificação interrompida. Tente novamente.',
+         isVisible: true
+       });
+       
+       setTimeout(() => {
+         setToast(prev => ({ ...prev, isVisible: false }));
+       }, 5000);
+     }
+   }, [verificationState.status, verificationState.error, router]);
```

### 3.5 Teste de conectividade e envio de API keys

```diff
    const handleCheckFacts = useCallback(async () => {
      if (!textValue.trim()) {
        setToast({
          type: 'error',
          message: 'Por favor, insira um texto para verificar.',
          isVisible: true
        });
        return;
      }

      try {
        // Limpa estado anterior
        factCheckService.reset();
        
+       // Testa conectividade primeiro
+       console.log('🧪 Testando conectividade antes de enviar requisição...');
+       const isConnected = await factCheckService.testConnection();
+       
+       if (!isConnected) {
+         setToast({
+           type: 'error',
+           message: 'Não foi possível conectar com o servidor. Verifique se o backend está rodando na porta 3000.',
+           isVisible: true
+         });
+         return;
+       }
        
        // Envia requisição para o backend com as API keys
-       const fingerprint = await factCheckService.requestFactCheck(textValue);
+       const fingerprint = await factCheckService.requestFactCheck(textValue, {
+         apiKeys: {
+           google: apiKeys?.google,
+           tavily: apiKeys?.tavily
+         }
+       });

        console.log('✅ Verificação iniciada com fingerprint:', fingerprint);

        // Aguarda um pouco para garantir que o texto foi processado
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redireciona direto para a página de resultados
        router.push('/results');
        
      } catch (error) {
        console.error('❌ Erro ao iniciar verificação:', error);
        setToast({
          type: 'error',
          message: error instanceof Error ? error.message : 'Erro interno. Tente novamente mais tarde.',
          isVisible: true
        });
        
        setTimeout(() => {
          setToast(prev => ({ ...prev, isVisible: false }));
        }, 5000);
      }
-   }, [textValue, router]);
+   }, [textValue, router, apiKeys]);
```

---

## 4. `frontend/src/app/home/components/VerificationForm.tsx`

### 4.1 Constante exportada

```diff
  import React from 'react';
  import { cn } from '@/lib/utils';
  import { Textarea } from '@/app/shared/components/ui/textarea';
  import { Button } from '@/app/shared/components/ui/button';
  import { WandSparkles, Loader2 } from 'lucide-react';

+ // Constante para o comprimento máximo do texto a ser verificado
+ export const TEXT_TO_BE_REVIEWED_LENGTH = 5000;
```

### 4.2 Uso da constante

```diff
  const VerificationForm: React.FC<VerificationFormProps> = ({
    className,
    onUseExample,
    onCheckFacts,
    onTextChange,
    disabled = false,
    value = ""
  }) => {
    const hasText = value.trim().length > 0;
-   const isOverLimit = value.length > 5000;
+   const isOverLimit = value.length > TEXT_TO_BE_REVIEWED_LENGTH;

    // Mensagem do tooltip para botão desabilitado
    const getDisabledTooltip = () => {
      if (disabled) {
        return "Aguarde o processamento atual terminar";
      }
      if (isOverLimit) {
-       return `O texto excede o limite de 5000 caracteres. Remova ${value.length - 5000} caracteres para continuar.`;
+       return `O texto excede o limite de ${TEXT_TO_BE_REVIEWED_LENGTH} caracteres. Remova ${value.length - TEXT_TO_BE_REVIEWED_LENGTH} caracteres para continuar.`;
      }
      if (!hasText) {
        return "Digite ou cole um texto para verificar";
      }
      return null;
    };
```

### 4.3 maxLength no Textarea

```diff
        <Textarea
          label="Verificar os fatos de..."
          placeholder="Entre o texto que deseja verificar aqui..."
-         maxLength={5000}
+         maxLength={TEXT_TO_BE_REVIEWED_LENGTH}
          value={value}
          onChange={onTextChange}
          disabled={disabled}
          className="w-full"
        />
```

---

## 5. `shared/types/api.ts` (arquivo criado)

Arquivo completo com schemas Zod e tipos TypeScript:

```typescript
import { z } from 'zod';

// ===== Schemas Zod =====
const METADATA_SCHEMA = z.object({
  fingerprint: z.string().min(1),
});

const RESULT_META_SCHEMA = METADATA_SCHEMA.extend({
  chunk: z.number().gte(0),
  seq: z.number().gte(0),
});

const buildResponseSchema = <Z extends z.ZodType, ZZ extends z.ZodType>(
  data: Z,
  meta: ZZ,
) => {
  return z.object({ data, meta });
};

export const FACT_CHECK_REQUEST_SCHEMA = METADATA_SCHEMA.pick({
  fingerprint: true,
}).extend({
  researchThreshold: z.number().gte(0).lte(1).optional(),
  apiKeys: z.object({
    google: z.string().optional(),
    tavily: z.string().optional(),
  }).optional(),
});

export const FACT_CHECK_RESULT_DATA_SCHEMA = z.object({
  extractedClaim: z.string(),
  reasoningConfidence: z.number().gte(0).lte(1),
  reasoning: z.string().min(1, 'Reasoning cannot be empty'),
  flags: z
    .array(z.enum(['UNVERIFIABLE', 'MISLEADING', 'INCONCLUSIVE', 'AMBIGUOUS']))
    .optional(),
  sources: z.array(z.string().url()).optional(),
});

export const FACT_CHECK_RESULT_SCHEMA = buildResponseSchema(
  FACT_CHECK_RESULT_DATA_SCHEMA,
  RESULT_META_SCHEMA,
);

export const UPDATE_STATUS_SCHEMA = buildResponseSchema(
  z.object({
    status: z.enum(['PROCESSING', 'FINISHED', 'EXCEPTION', 'INTERRUPTED']),
    message: z.string().optional(),
  }),
  METADATA_SCHEMA,
);

export const CHUNK_COUNT_SCHEMA = buildResponseSchema(
  z.object({
    chunkCount: z.number().gte(0),
  }),
  METADATA_SCHEMA,
);

// ===== TypeScript Types =====
export type FactCheckRequest = z.infer<typeof FACT_CHECK_REQUEST_SCHEMA>;
export type FactCheckResultData = z.infer<typeof FACT_CHECK_RESULT_DATA_SCHEMA>;
export type FactCheckResult = z.infer<typeof FACT_CHECK_RESULT_SCHEMA>;
export type UpdateStatus = z.infer<typeof UPDATE_STATUS_SCHEMA>;
export type UpdateStatusData = UpdateStatus['data'];
export type ChunkCount = z.infer<typeof CHUNK_COUNT_SCHEMA>;
export type ChunkCountData = ChunkCount['data'];

// ===== Socket.IO Events =====
export type ClientToServerEvents = {
  REQUEST_FACT_CHECK: (content: string, request: FactCheckRequest) => void;
};

export type ServerToClientEvents = {
  FACT_CHECK_RESULT: (data: FactCheckResult) => void;
  UPDATE_STATUS: (data: UpdateStatus) => void;
  CHUNK_COUNT: (data: ChunkCount) => void;
};

// ===== Estados da Verificação (Frontend) =====
export type VerificationStatus = 
  | 'idle'
  | 'connecting'
  | 'processing'
  | 'finished'
  | 'error'
  | 'interrupted';

export interface VerificationState {
  status: VerificationStatus;
  message?: string;
  results: FactCheckResult[];
  chunkCount?: number;
  error?: string;
  processedText: string;
  fingerprint: string | null;
}
```

---

## 6. `frontend/src/lib/types/api.ts`

Reexport dos tipos do módulo compartilhado:

```typescript
// Re-exporta todos os tipos do módulo compartilhado
// Isso mantém a compatibilidade com o código existente
// enquanto centraliza as definições de tipos
export {
  // Schemas Zod (se necessário no frontend)
  FACT_CHECK_REQUEST_SCHEMA,
  FACT_CHECK_RESULT_DATA_SCHEMA,
  FACT_CHECK_RESULT_SCHEMA,
  UPDATE_STATUS_SCHEMA,
  CHUNK_COUNT_SCHEMA,
  
  // Types TypeScript
  type FactCheckRequest,
  type FactCheckResultData,
  type FactCheckResult,
  type UpdateStatus,
  type UpdateStatusData,
  type ChunkCount,
  type ChunkCountData,
  
  // Eventos Socket.IO
  type ClientToServerEvents,
  type ServerToClientEvents,
  
  // Estados da Verificação
  type VerificationStatus,
  type VerificationState
} from '@veritas/shared';
```

---

## 7. `pnpm-workspace.yaml`

```diff
  packages:
    - frontend
    - backend
+   - shared

  catalog:
    typescript: ~5.9

  onlyBuiltDependencies:
    - protobufjs
```

---

## 8. `shared/package.json` (arquivo criado)

```json
{
  "name": "@veritas/shared",
  "version": "1.0.0",
  "description": "Shared types and utilities for Veritas",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3"
  }
}
```

---

## 9. `frontend/package.json`

```diff
  {
    "name": "frontend",
    "version": "0.1.0",
    "private": true,
    "packageManager": "pnpm@10.17.1",
    "dependencies": {
      "@radix-ui/react-accordion": "^1.2.12",
      // ... outras dependências
+     "@veritas/shared": "workspace:*",
      "class-variance-authority": "^0.7.1",
      // ... resto das dependências
    }
  }
```

---

## Resumo de arquivos

### Criados:
1. `shared/types/api.ts`
2. `shared/index.ts`
3. `shared/package.json`
4. `shared/tsconfig.json`
5. `frontend/src/lib/store/factCheckStore.ts`

### Modificados:
1. `frontend/src/lib/services/factCheckService.ts`
2. `frontend/src/app/home/components/HomePage.tsx`
3. `frontend/src/app/home/components/VerificationForm.tsx`
4. `frontend/src/lib/types/api.ts`
5. `pnpm-workspace.yaml`
6. `frontend/package.json`

### NÃO modificados:
- Todo o diretório `backend/` (conforme restrição do PR)
