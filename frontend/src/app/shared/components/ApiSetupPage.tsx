"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, ArrowRight, Info } from 'lucide-react';
import ApiKeyCard from './ApiKeyCard';
import Header from './Header';
import { Button } from '@/app/shared/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';

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
  const { t } = useI18n();
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
              {t.apiSetup.welcome}
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t.apiSetup.intro}
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 leading-relaxed">
                <strong className="font-semibold">{t.apiSetup.whyTitle}</strong> {t.apiSetup.whyDescription}
              </p>
            </div>
          </div>

          {/* API Keys Cards */}
          <div className="space-y-6 mb-8">
            <ApiKeyCard
              title={t.apiSetup.googleTitle}
              description={t.apiSetup.googleDescription}
              placeholder={t.apiSetup.googlePlaceholder}
              value={googleKey}
              onChange={setGoogleKey}
              helpUrl="https://www.youtube.com/watch?v=eExl7-zSnKg"
              helpText={t.apiSetup.googleHelpText}
              isConfigured={googleKey.trim().length > 0}
            />

            <ApiKeyCard
              title={t.apiSetup.tavilyTitle}
              description={t.apiSetup.tavilyDescription}
              placeholder={t.apiSetup.tavilyPlaceholder}
              value={tavilyKey}
              onChange={setTavilyKey}
              helpUrl="https://www.youtube.com/watch?v=eExl7-zSnKg"
              helpText={t.apiSetup.tavilyHelpText}
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
                !isValid && t.apiSetup.fillBothKeys
              }
            >
              {t.apiSetup.startVerifying}
              <ArrowRight className="w-6 h-6" />
            </Button>

            {initialKeys?.google && initialKeys?.tavily && (
              <Button
                variant="link"
                size="default"
                onClick={handleSkip}
              >
                {t.apiSetup.usePreviousConfig}
              </Button>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              {t.apiSetup.securityNote}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApiSetupPage;
