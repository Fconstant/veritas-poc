"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApiKeys } from '@/lib/hooks/useApiKeys';

/**
 * Root Page - Redireciona baseado no estado das API keys
 * 
 * Fluxo de navegação v0.2:
 * - Sem API keys → /first-access (Hero page)
 * - Com API keys → /verification (Página principal)
 * 
 * Rotas:
 * - /first-access - Hero com CTA "Configure para começar"
 * - /setup - Modal de configuração de API keys
 * - /verification - Página de entrada de texto para verificar
 * - /results - Página de resultados da verificação
 */
export default function Home() {
  const router = useRouter();
  const { hasApiKeys, isLoading } = useApiKeys();

  useEffect(() => {
    if (!isLoading) {
      if (hasApiKeys) {
        router.push('/verification');
      } else {
        router.push('/first-access');
      }
    }
  }, [hasApiKeys, isLoading, router]);

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--success-green)] mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}
