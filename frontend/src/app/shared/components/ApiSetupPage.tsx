"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, ArrowRight, Info } from 'lucide-react';
import ApiKeyCard from './ApiKeyCard';
import Header from './Header';
import { Button } from '@/app/shared/components/ui/button';

interface ApiSetupPageProps {
  onComplete: (keys: { google: string; tavily: string }) => void;
  initialKeys?: { google?: string; tavily?: string };
  className?: string;
}

const ApiSetupPage: React.FC<ApiSetupPageProps> = ({
  onComplete,
  initialKeys,
  className
}) => {
  const [googleKey, setGoogleKey] = useState(initialKeys?.google || '');
  const [tavilyKey, setTavilyKey] = useState(initialKeys?.tavily || '');
  const [isValid, setIsValid] = useState(false);

  // Valida se ambas as keys estão preenchidas
  useEffect(() => {
    const googleValid = googleKey.trim().length > 0;
    const tavilyValid = tavilyKey.trim().length > 0;
    setIsValid(googleValid && tavilyValid);
  }, [googleKey, tavilyKey]);

  const handleContinue = () => {
    if (isValid) {
      onComplete({
        google: googleKey.trim(),
        tavily: tavilyKey.trim()
      });
    }
  };

  const handleSkip = () => {
    // Permite pular se já tiver keys configuradas
    if (initialKeys?.google && initialKeys?.tavily) {
      onComplete({
        google: initialKeys.google,
        tavily: initialKeys.tavily
      });
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea]",
      className
    )}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <Header />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-20">
        <div className="w-full max-w-4xl mx-auto">
          
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-2xl mb-6 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo ao Veritas
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Para começar a verificar fatos, precisamos configurar duas chaves de API gratuitas.
              Não se preocupe, é rápido e fácil! 🚀
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 leading-relaxed">
                <strong className="font-semibold">Por que preciso disso?</strong> O Veritas usa inteligência artificial 
                para verificar fatos. As APIs são gratuitas e permitem que você use o serviço sem custos.
              </p>
            </div>
          </div>

          {/* API Keys Cards */}
          <div className="space-y-6 mb-8">
            <ApiKeyCard
              title="Google Gemini API"
              description="Usada para análise inteligente de textos e verificação de afirmações."
              placeholder="Cole sua chave do Google Gemini aqui..."
              value={googleKey}
              onChange={setGoogleKey}
              helpUrl="https://aistudio.google.com/app/apikey"
              helpText="Como obter minha chave do Gemini?"
              isConfigured={googleKey.trim().length > 0}
            />

            <ApiKeyCard
              title="Tavily API"
              description="Usada para buscar informações na web e validar fatos com fontes confiáveis."
              placeholder="Cole sua chave do Tavily aqui..."
              value={tavilyKey}
              onChange={setTavilyKey}
              helpUrl="https://tavily.com/"
              helpText="Como obter minha chave do Tavily?"
              isConfigured={tavilyKey.trim().length > 0}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              variant="filled"
              size="default"
              onClick={handleContinue}
              disabled={!isValid}
              disabledTooltip={
                !isValid && "Preencha ambas as chaves de API para continuar"
              }
            >
              Começar a Verificar
              <ArrowRight className="w-6 h-6" />
            </Button>

            {initialKeys?.google && initialKeys?.tavily && (
              <Button
                variant="link"
                size="default"
                onClick={handleSkip}
              >
                Usar configuração anterior
              </Button>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              🔒 Suas chaves são armazenadas apenas no seu navegador e nunca são enviadas para nossos servidores.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApiSetupPage;
