"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/shared/components/Header';
import HelperAccordion from '@/app/shared/components/HelperAccordion';
import APIsRegistrationFlow from '@/app/shared/components/APIsRegistrationFlow';
import { useApiKeys } from '@/lib/hooks/useApiKeys';
import { Button } from '@/app/shared/components/ui/button';
import { Wand2 } from 'lucide-react';

/**
 * Setup Page - Configuração de API Keys
 * Design v0.2: Node 658:15976
 * 
 * Fluxo: First Access → **Setup** → Verification
 * 
 * Especificações:
 * - Background: Gradiente #f5f5f5 → #eaeaea + overlay
 * - Card: 570px width, centralizado vertical e horizontalmente
 * - Helper: Sobrepõe o card (margin-bottom: -28px)
 * - Padding: 64px top, 120px bottom
 */
export default function SetupPage() {
  const router = useRouter();
  const { apiKeys, saveApiKeys } = useApiKeys();

  const handleComplete = async (keys: { gemini: string; tavily: string }) => {
    // Salva as keys no localStorage
    saveApiKeys({ google: keys.gemini, tavily: keys.tavily });
    
    // Navega para a página de verificação
    router.push('/verification');
  };

  // Navegação para "Verificações" respeitando a lógica central em '/'
  const handleGoToVerifications = () => {
    // A rota raiz já redireciona para /first-access ou /verification
    router.push('/');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
      {/* Background overlay - z-1 */}
      <div className="absolute inset-0 opacity-70 z-[1]">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent from-[62.687%] to-[var(--bg-overlay)] to-[97.25%]"
        />
      </div>

      {/* Top-bar - z-30 */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-[1440px] mx-auto px-20">
          <Header
            showSettings={false}
            rightContent={
              <Button
                variant="link"
                size="default"
                onClick={handleGoToVerifications}
                aria-label="Verificações"
                title="Ir para Verificações"
              >
                <Wand2 className="w-6 h-6" />
                Verificações
              </Button>
            }
          />
        </div>
      </div>

      {/* Setup Content - z-20 */}
      <div className="relative z-20 flex justify-center min-h-screen pt-21 pb-[120px]">
        <div className="flex flex-col items-center w-[570px] gap-5">
          
          {/* Título */}
          <h1 
            className="pt-16 font-[var(--font-inter)] font-medium text-[28px] leading-[40px] tracking-[0.28px] text-center w-full"
            style={{ color: 'var(--text-title)' }}
          >
            Configurar Chaves de API
          </h1>

          {/* Container com Helper + APIs Flow */}
          <div className="flex flex-col items-center w-full pb-7 px-0 pt-0">
            {/* Helper Accordion - fica atrás do card */}
            <div className="w-[514px] mb-[-2px] relative z-0">
              <HelperAccordion />
            </div>

            {/* APIs Registration Flow */}
            <div className="relative z-10">
              <APIsRegistrationFlow 
                onComplete={handleComplete}
                initialKeys={apiKeys ? { gemini: apiKeys.google, tavily: apiKeys.tavily } : undefined}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
