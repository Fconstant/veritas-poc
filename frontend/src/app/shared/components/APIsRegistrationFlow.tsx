"use client";

import React, { useState, useEffect } from 'react';
import { Key, AlertTriangle, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/shared/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';
import { isValidGeminiApiKey, isValidTavilyApiKey } from '@/lib/utils/apiKeyValidation';

type APIFlowState = 'empty' | 'gemini-filled' | 'invalid' | 'validating' | 'valid';

interface APIsRegistrationFlowProps {
  className?: string;
  onComplete?: (keys: { gemini: string; tavily: string }) => void;
  initialKeys?: { gemini?: string; tavily?: string };
}

/**
 * APIsRegistrationFlow - Formulário de registro de API keys
 * Design v0.2: Node 543:39609 (5 estados)
 *
 * Estados (Property1):
 * 1. "empty" - Ambos vazios
 * 2. "gemini-filled" - Gemini preenchido, Tavily vazio
 * 3. "invalid" - Ambos preenchidos mas inválidos
 * 4. "validating" - Validando com backend
 * 5. "valid" - Tudo válido e pronto
 *
 * Especificações:
 * - Dimensões: 570px × 408px
 * - Background: #f2f2f2
 * - Border: 1px solid #b8b8b8
 * - Border radius: 24px
 * - Padding: 32px bottom, 24px horizontal, 20px top
 */
export const APIsRegistrationFlow: React.FC<APIsRegistrationFlowProps> = ({
  className,
  onComplete,
  initialKeys
}) => {
  const { t } = useI18n();
  const [geminiKey, setGeminiKey] = useState(initialKeys?.gemini || '');
  const [tavilyKey, setTavilyKey] = useState(initialKeys?.tavily || '');
  const [showGemini, setShowGemini] = useState(false);
  const [showTavily, setShowTavily] = useState(false);
  const [flowState, setFlowState] = useState<APIFlowState>('empty');
  const [geminiInvalid, setGeminiInvalid] = useState(false);
  const [tavilyInvalid, setTavilyInvalid] = useState(false);

  // Sincroniza os campos quando initialKeys muda (ex.: após carregar do localStorage)
  // Não sobrescreve valores já digitados pelo usuário
  useEffect(() => {
    if (!initialKeys) return;
    setGeminiKey(prev => (prev ? prev : initialKeys.gemini || ''));
    setTavilyKey(prev => (prev ? prev : initialKeys.tavily || ''));
  }, [initialKeys]);

  // Determina o estado do fluxo baseado nos valores
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (!geminiKey && !tavilyKey) {
      setFlowState('empty');
      setGeminiInvalid(false);
      setTavilyInvalid(false);
    } else if (geminiKey && !tavilyKey) {
      setFlowState('gemini-filled');
      setGeminiInvalid(false);
      setTavilyInvalid(false);
    } else if (geminiKey && tavilyKey) {
      const geminiOk = isValidGeminiApiKey(geminiKey);
      const tavilyOk = isValidTavilyApiKey(tavilyKey);

      setGeminiInvalid(!geminiOk);
      setTavilyInvalid(!tavilyOk);

      if (!geminiOk || !tavilyOk) {
        setFlowState('invalid');
      } else {
        setFlowState('validating');
        timeoutId = setTimeout(() => {
          setFlowState('valid');
        }, 1500);
      }
    } else {
      // Só Tavily preenchido — ainda incompleto
      setFlowState('empty');
      setGeminiInvalid(false);
      setTavilyInvalid(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [geminiKey, tavilyKey]);

  const handleComplete = () => {
    if (flowState === 'valid' && onComplete) {
      onComplete({ gemini: geminiKey.trim(), tavily: tavilyKey.trim() });
    }
  };

  // Mensagem do tooltip para botão desabilitado
  const getDisabledTooltip = () => {
    switch (flowState) {
      case 'empty':
        return t.apiFlow.tooltips.empty;
      case 'gemini-filled':
        return t.apiFlow.tooltips.geminiOnly;
      case 'invalid':
        return t.apiFlow.tooltips.invalid;
      case 'validating':
        return t.apiFlow.tooltips.validating;
      case 'valid':
        return null;
      default: {
        const _exhaustive: never = flowState;
        return _exhaustive;
      }
    }
  };

  const getStatusBadge = () => {
    switch (flowState) {
      case 'empty':
      case 'gemini-filled':
        return {
          text: t.apiFlow.status.notConfigured,
          icon: <AlertTriangle className="w-6 h-6" style={{ color: 'var(--warning-amber)' }} />,
          color: 'var(--text-helper)'
        };
      case 'invalid':
        return {
          text: t.apiFlow.status.invalid,
          icon: <AlertCircle className="w-6 h-6" style={{ color: 'var(--error-red)' }} />,
          color: 'var(--error-red)'
        };
      case 'validating':
        return {
          text: t.apiFlow.status.validating,
          icon: <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--validating-purple)' }} />,
          color: 'var(--validating-purple)'
        };
      case 'valid':
        return {
          text: t.apiFlow.status.ready,
          icon: <CheckCircle className="w-6 h-6" style={{ color: 'var(--success-green)' }} />,
          color: 'var(--success-green)'
        };
      default: {
        const _exhaustive: never = flowState;
        return _exhaustive;
      }
    }
  };

  const statusBadge = getStatusBadge();

  const getInputIcon = (fieldInvalid: boolean, hasValue: boolean, isGemini: boolean) => {
    if (fieldInvalid) {
      return <AlertCircle className="w-5 h-5" style={{ color: 'var(--error-red)' }} />;
    }
    if (flowState === 'validating') {
      return <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--validating-purple)' }} />;
    }
    if (flowState === 'valid' || (isGemini && flowState === 'gemini-filled' && hasValue)) {
      return <CheckCircle className="w-5 h-5" style={{ color: 'var(--success-green)' }} />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 items-end w-[570px] max-w-[624px] min-w-[300px] rounded-[24px] border pt-0 pb-8 px-6 shadow-[0px_8px_32px_0px_rgba(0,0,0,0.20)]",
        "bg-[var(--card-bg)] border-[var(--card-border)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-5 items-start justify-center pt-5 w-full">
        <div className="flex flex-wrap gap-2 items-center justify-between w-full">
          {/* Título */}
          <div className="flex gap-2 items-center">
            <Key className="w-6 h-6 opacity-50" />
            <span className="font-[var(--font-inter)] font-semibold text-[18px] leading-[24px] text-slate-900">
              {t.apiFlow.title}
            </span>
          </div>
          {/* Status Badge */}
          <div className="flex gap-2 items-center">
            <span
              className="font-[var(--font-inter)] font-medium text-[14px] leading-[24px]"
              style={{ color: statusBadge.color }}
            >
              {statusBadge.text}
            </span>
            {statusBadge.icon}
          </div>
        </div>
        {/* Divider */}
        <div className="h-0 w-full relative">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t" style={{ borderColor: 'var(--divider)' }} />
        </div>
      </div>

      {/* Campos de API */}
      <div className="flex flex-col gap-6 items-start w-full">
        {/* Gemini API */}
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex gap-2 items-center w-full">
            <div className="flex flex-1 gap-2 items-center min-h-0 min-w-0">
              <span className="font-[var(--font-inter)] text-[16px] leading-[24px]" style={{ color: 'var(--purple-medium)' }}>
                <span className="font-medium">{t.apiFlow.gemini.label}</span>
                <span className="font-normal"> {t.apiFlow.gemini.sublabel}</span>
              </span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2 items-center font-[var(--font-inter)] font-medium text-[14px] leading-[24px] hover:underline"
              style={{ color: 'var(--purple-link)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {t.apiFlow.gemini.link}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div
            className={cn(
              "flex gap-2 items-center p-3 w-full rounded-lg border",
              geminiInvalid
                ? 'bg-[var(--error-background)] border-[var(--error-red)]'
                : 'bg-[var(--input-bg)] border-[var(--purple-primary)]'
            )}
          >
            <input
              type={showGemini ? 'text' : 'password'}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={t.apiFlow.gemini.placeholder}
              className="flex-1 bg-transparent font-[var(--font-merriweather)] text-[14px] leading-[28px] tracking-[0.14px] outline-none"
              style={{ color: geminiKey ? 'var(--text-active)' : 'var(--text-placeholder)' }}
              onClick={(e) => e.stopPropagation()}
            />
            {getInputIcon(geminiInvalid, !!geminiKey, true)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowGemini(!showGemini);
              }}
              className="p-0"
            >
              {showGemini ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {geminiInvalid && (
            <p className="font-[var(--font-inter)] font-normal text-[12px]" style={{ color: 'var(--error-red)' }}>
              {t.apiFlow.errors.invalidFormat}
            </p>
          )}
        </div>

        {/* Tavily API */}
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex gap-2 items-center w-full">
            <div className="flex flex-1 gap-2 items-center min-h-0 min-w-0">
              <span className="font-[var(--font-inter)] text-[16px] leading-[24px]" style={{ color: 'var(--purple-medium)' }}>
                <span className="font-medium">{t.apiFlow.tavily.label}</span>
                <span className="font-normal"> {t.apiFlow.tavily.sublabel}</span>
              </span>
            </div>
            <a
              href="https://tavily.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2 items-center font-[var(--font-inter)] font-medium text-[14px] leading-[24px] hover:underline"
              style={{ color: 'var(--purple-link)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {t.apiFlow.tavily.link}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div
            className={cn(
              "flex gap-2 items-center p-3 w-full rounded-lg border",
              tavilyInvalid
                ? 'bg-[var(--error-background)] border-[var(--error-red)]'
                : flowState === 'empty'
                  ? 'bg-[var(--input-bg-secondary)] border-[var(--purple-primary)]'
                  : 'bg-[var(--input-bg)] border-[var(--purple-primary)]'
            )}
          >
            <input
              type={showTavily ? 'text' : 'password'}
              value={tavilyKey}
              onChange={(e) => setTavilyKey(e.target.value)}
              placeholder={t.apiFlow.tavily.placeholder}
              className="flex-1 bg-transparent font-[var(--font-merriweather)] text-[14px] leading-[28px] tracking-[0.14px] outline-none"
              style={{ color: tavilyKey ? 'var(--text-active)' : 'var(--text-placeholder)' }}
              onClick={(e) => e.stopPropagation()}
            />
            {getInputIcon(tavilyInvalid, !!tavilyKey, false)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTavily(!showTavily);
              }}
              className="p-0"
            >
              {showTavily ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {tavilyInvalid && (
            <p className="font-[var(--font-inter)] font-normal text-[12px]" style={{ color: 'var(--error-red)' }}>
              {t.apiFlow.errors.invalidFormat}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-6 items-end w-full">
        {/* Divider */}
        <div className="h-0 w-full relative">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-t" style={{ borderColor: 'var(--divider)' }} />
        </div>

        {/* Botão Começar */}
        <Button
          variant="filled"
          size="default"
          onClick={handleComplete}
          disabled={flowState !== 'valid'}
          disabledTooltip={getDisabledTooltip()}
        >
          {t.apiFlow.button}
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default APIsRegistrationFlow;
