// Exemplo de teste da integração Frontend-Backend
// Este arquivo demonstra como testar a funcionalidade de verificação de fatos

import { factCheckService } from '@/lib/services/factCheckService';
import { API_CONFIG } from '@/lib/config/api';
import { factCheckStore } from '@/lib/store/factCheckStore';

// Exemplo de texto para verificação
const EXAMPLE_TEXT = `
Bolsonaro: Destinamos também a este estado maravilhoso aqui, mesmo sem comprovação científica,
mais de 400 mil unidades de cloroquina para o tratamento precoce da população.
Eu sou a prova viva de que deu certo. Muitos médicos defendem esse tratamento.
Sabemos que mais de 100 mil pessoas morreram no Brasil.
Caso tivessem sido tratadas lá atrás com esse medicamento,
poderiam essas vidas terem sido evitadas.
`;

// Função para testar a integração
export async function testFactCheckIntegration() {
  console.log('🧪 Iniciando teste da integração Frontend-Backend');
  console.log('📡 Backend URL:', API_CONFIG.BACKEND_URL);

  try {
    // 1. Configurar listener para mudanças de estado
    const unsubscribe = factCheckStore.subscribe((state) => {
      console.log('📊 Estado atualizado:', {
        status: state.status,
        message: state.message,
        resultsCount: state.results.length,
        chunkCount: state.chunkCount,
        error: state.error
      });

      if (state.chunkCount) {
        console.log(`📦 Texto dividido em ${state.chunkCount} chunks para processamento`);
      }

      if (state.results.length > 0) {
        console.log('📋 Resultados recebidos:');
        state.results.forEach((result, index) => {
          console.log(`  ${index + 1}. Chunk ${result.meta.chunk}:`, {
            claim: result.data.extractedClaim.substring(0, 100) + '...',
            confidence: result.data.reasoningConfidence,
            flags: result.data.flags,
            sourcesCount: result.data.sources?.length || 0
          });
        });
      }
    });

    // 2. Iniciar verificação
    console.log('🚀 Iniciando verificação de fatos...');
    const fingerprint = await factCheckService.requestFactCheck(EXAMPLE_TEXT, {
      // apiKeys podem ser configuradas aqui para teste
      // apiKeys: {
      //   google: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      //   tavily: process.env.NEXT_PUBLIC_TAVILY_API_KEY
      // }
    });

    console.log('✅ Verificação iniciada com fingerprint:', fingerprint);

    // 3. Aguardar conclusão (opcional - para testes automatizados)
    return new Promise<void>((resolve) => {
      const checkCompletion = () => {
        const state = factCheckService.getState();
        if (state.status === 'finished' || state.status === 'error') {
          console.log('🏁 Verificação concluída:', state.status);
          unsubscribe();
          resolve();
        } else if (state.status === 'processing') {
          // Continuar aguardando
          setTimeout(checkCompletion, 1000);
        }
      };

      // Iniciar verificação de conclusão após 2 segundos
      setTimeout(checkCompletion, 2000);
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}

// Função para testar diferentes cenários
export async function testDifferentScenarios() {
  console.log('🧪 Testando diferentes cenários...');

  const scenarios = [
    {
      name: 'Texto vazio',
      text: '',
      shouldFail: true
    },
    {
      name: 'Texto muito curto',
      text: 'Bolsonaro disse algo.',
      shouldFail: false
    },
    {
      name: 'Texto com caracteres especiais',
      text: 'Bolsonaro: "Destinamos também a este estado maravilhoso aqui, mesmo sem comprovação científica, mais de 400 mil unidades de cloroquina para o tratamento precoce da população."',
      shouldFail: false
    },
    {
      name: 'Texto muito longo',
      text: 'A'.repeat(10000),
      shouldFail: false
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📝 Testando: ${scenario.name}`);

    try {
      factCheckService.reset();

      if (scenario.shouldFail) {
        try {
          await factCheckService.requestFactCheck(scenario.text);
          console.log('⚠️  Esperava falha, mas sucedeu');
        } catch (error) {
          console.log('✅ Falha esperada:', error.message);
        }
      } else {
        const fingerprint = await factCheckService.requestFactCheck(scenario.text);
        console.log('✅ Sucesso:', fingerprint);
      }
    } catch (error) {
      console.log('❌ Erro inesperado:', error.message);
    }

    // Aguardar um pouco entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Função para testar conectividade
export async function testConnectivity() {
  console.log('🔌 Testando conectividade...');

  try {
    // Tentar conectar
    await factCheckService.connect();
    console.log('✅ Conectado com sucesso');

    // Verificar se está conectado
    const isConnected = factCheckService.isConnected();
    console.log('📡 Status da conexão:', isConnected);

    // Desconectar
    factCheckService.disconnect();
    console.log('🔌 Desconectado');

  } catch (error) {
    console.error('❌ Erro de conectividade:', error);
    throw error;
  }
}

// Função principal para executar todos os testes
export async function runAllTests() {
  console.log('🚀 Executando todos os testes da integração...\n');

  try {
    // Teste 1: Conectividade
    await testConnectivity();
    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 2: Cenários diferentes
    await testDifferentScenarios();
    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 3: Integração completa
    await testFactCheckIntegration();

    console.log('\n🎉 Todos os testes concluídos com sucesso!');

  } catch (error) {
    console.error('\n💥 Falha nos testes:', error);
    throw error;
  }
}

// Exportar para uso em componentes React (opcional)
export const testUtils = {
  testFactCheckIntegration,
  testDifferentScenarios,
  testConnectivity,
  runAllTests
};

// Para uso direto no console do navegador
if (typeof window !== 'undefined') {
  (window as typeof window & { testFactCheck: typeof testUtils }).testFactCheck = testUtils;
  console.log('🧪 Testes disponíveis em window.testFactCheck');
}
