"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Header from '@/app/shared/components/Header';
import ComingSoonBanner from '@/app/shared/components/ComingSoonBanner';
import { Button } from '@/app/shared/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * First Access Page - Home page para primeiros acessos
 * Design v0.2: Node 598:17066
 *
 * Fluxo: First Access → Setup → Verification
 *
 * Especificações:
 * - Background: Gradiente #f5f5f5 → #eaeaea
 * - Overlay: Imagem com 70% opacity + gradiente
 * - Título: Inter Extra Light/Bold, 64px
 * - Subtítulo: Inter Regular, 20px
 * - CTA: "Configure para começar", roxo #844ae9
 * - Badge: "É grátis!", texto #6e678a
 */
export default function FirstAccessPage() {
  const router = useRouter();
  const { t } = useI18n();

  const handleConfigureClick = () => {
    router.push('/setup');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[var(--bg-gradient-start)] to-[var(--bg-gradient-end)]">
      {/* Background overlay - z-1 */}
      <div className="absolute inset-0 opacity-70 z-[1]">
        {/* Imagem de fundo poderia ir aqui */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent from-[62.687%] to-[var(--bg-overlay)] to-[97.25%]"
        />
      </div>

      {/* Top-bar - z-30 */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-[1440px] mx-auto px-20">
          <Header showSettings={false} />
        </div>
      </div>

      {/* Hero Content - z-20 */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center text-center max-w-[786px] gap-6">

          {/* Título Principal */}
          <h1 className="font-[var(--font-inter)] text-[64px] leading-[80px] tracking-[0.64px]">
            <span className="font-extralight" style={{ color: 'var(--purple-dark)' }}>
              {t.firstAccess.title.part1}{' '}
            </span>
            <span className="font-extralight">{t.firstAccess.title.part2} </span>
            <span className="font-bold" style={{ color: 'var(--purple-accent)' }}>
              {t.firstAccess.title.part3}
            </span>
          </h1>

          {/* Subtítulo */}
          <p
            className="font-[var(--font-inter)] font-normal text-[20px] leading-[32px] tracking-[0.2px]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {t.firstAccess.subtitle}
          </p>

          {/* CTA Button */}
          <Button
            variant="filled"
            size="default"
            onClick={handleConfigureClick}
          >
            {t.firstAccess.cta}
            <ArrowRight className="w-6 h-6" />
          </Button>

          {/* Badge "É grátis!" */}
          <p
            className="font-[var(--font-inter)] font-normal text-[14px] leading-[24px]"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.firstAccess.badge}
          </p>

          {/* Coming Soon Banner */}
          <ComingSoonBanner />

        </div>
      </div>
    </div>
  );
}
