"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Header from '@/components/veritas/Header/Header';
import HeroSection from './HeroSection';
import VerificationForm from './VerificationForm';
import HomePageToast from './HomePageToast';
import { factCheckService } from '@/lib/services/factCheckService';
import { VerificationState } from '@/lib/types/api';

interface HomePageProps {
  className?: string;
  router?: {
    push: (url: string) => void;
  };
}

const HomePage: React.FC<HomePageProps> = ({ className, router: propRouter }) => {
  const nextRouter = useRouter();
  const router = propRouter || nextRouter;
  const [textValue, setTextValue] = useState<string>("");
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'idle',
    results: []
  });
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false
  });

  const handleUseExample = useCallback(() => {
    const exampleText = "Bolsonaro: Destinamos também a este estado maravilhoso aqui, mesmo sem comprovação científica, mais de 400 mil unidades de cloroquina para o tratamento precoce da população. Eu sou a prova viva de que deu certo. Muitos médicos defendem esse tratamento. Sabemos que mais de 100 mil pessoas morreram no Brasil. Caso tivessem sido tratadas lá atrás com esse medicamento, poderiam essas vidas terem sido evitadas.";
    setTextValue(exampleText);
  }, []);

  // Escuta mudanças no estado da verificação
  useEffect(() => {
    const unsubscribe = factCheckService.onStateChange((state) => {
      setVerificationState(state);
      
      // Atualiza toast baseado no status
      if (state.status === 'finished') {
        setToast({
          type: 'success',
          message: 'Verificação concluída! Redirecionando para os resultados...',
          isVisible: true
        });
        
        // Auto-hide toast após 2 segundos e redirecionar
        setTimeout(() => {
          setToast(prev => ({ ...prev, isVisible: false }));
          router.push('/results');
        }, 2000);
      } else if (state.status === 'error') {
        setToast({
          type: 'error',
          message: state.error || 'Erro na verificação. Tente novamente.',
          isVisible: true
        });
        
        // Auto-hide toast após 5 segundos
        setTimeout(() => {
          setToast(prev => ({ ...prev, isVisible: false }));
        }, 5000);
      } else if (state.status === 'interrupted') {
        setToast({
          type: 'error',
          message: 'Verificação interrompida. Tente novamente.',
          isVisible: true
        });
        
        setTimeout(() => {
          setToast(prev => ({ ...prev, isVisible: false }));
        }, 5000);
      }
    });

    return unsubscribe;
  }, [router]);

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      factCheckService.disconnect();
    };
  }, []);

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
      
      // Testa conectividade primeiro
      console.log('🧪 Testando conectividade antes de enviar requisição...');
      const isConnected = await factCheckService.testConnection();
      
      if (!isConnected) {
        setToast({
          type: 'error',
          message: 'Não foi possível conectar com o servidor. Verifique se o backend está rodando na porta 3000.',
          isVisible: true
        });
        return;
      }
      
      // Envia requisição para o backend
      const fingerprint = await factCheckService.requestFactCheck(textValue, {
        // researchThreshold usa o valor padrão da configuração
        // apiKeys podem ser configuradas aqui se necessário
        // apiKeys: {
        //   gemini: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        //   tavily: process.env.NEXT_PUBLIC_TAVILY_API_KEY
        // }
      });

      console.log('✅ Verificação iniciada com fingerprint:', fingerprint);
      
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
  }, [textValue]);

  const handleTextChange = useCallback((text: string) => {
    setTextValue(text);
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <div className={cn(
      "bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea] relative w-full min-h-screen overflow-hidden",
      className
    )}>
      {/* Barra Superior */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <Header />
        </div>
      </div>
      
      
      {/* Container Principal de Conteúdo */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-20">
        <div className="w-full max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Seção Hero - Lado Esquerdo */}
            <div className="order-1 lg:order-1">
              <HeroSection className="max-w-[629px] mx-auto lg:mx-0" />
            </div>
            
            {/* Formulário de Verificação - Lado Direito */}
            <div className="order-2 lg:order-2">
              <div className="max-w-[571px] mx-auto lg:mx-0">
                <VerificationForm
                  onUseExample={handleUseExample}
                  onCheckFacts={handleCheckFacts}
                  onTextChange={handleTextChange}
                  loading={verificationState.status === 'processing' || verificationState.status === 'connecting'}
                  value={textValue}
                />
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Ajustes específicos para Mobile/Tablet */}
      <div className="lg:hidden">
        {/* Espaçamento adicional para mobile */}
        <div className="h-16" />
      </div>
      
      {/* Notificação Toast */}
      <HomePageToast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default HomePage;