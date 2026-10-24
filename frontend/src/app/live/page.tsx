"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LiveWorkspace from './components/LiveWorkspace';
import { useFactCheckStore } from '@/lib/store/factCheckStore';
import { isLiveSessionActive } from '@/lib/live/liveUiState';
import { useApiKeys } from '@/lib/hooks/useApiKeys';
import ApiSetupPage from '@/app/shared/components/ApiSetupPage';
import { useI18n } from '@/lib/i18n/I18nContext';

/**
 * Live accompaniment route (LIVE-007 / LIVE-025 / LIVE-026).
 * Requires an active capture/session; otherwise redirects to home setup.
 */
export default function LivePage() {
  const router = useRouter();
  const { t } = useI18n();
  const { apiKeys, isLoading, saveApiKeys, hasApiKeys } = useApiKeys();
  const captureFeedback = useFactCheckStore((s) => s.captureFeedback);
  const liveSessionState = useFactCheckStore((s) => s.liveSessionState);
  const sessionId = useFactCheckStore((s) => s.sessionId);

  const active = isLiveSessionActive(liveSessionState, captureFeedback);
  const endedWithSession =
    (captureFeedback === 'ended' || liveSessionState === 'ENDED') &&
    Boolean(sessionId);

  useEffect(() => {
    if (isLoading || !hasApiKeys) return;
    if (!active && !endedWithSession) {
      router.replace('/');
    }
  }, [active, endedWithSession, hasApiKeys, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f5f5] to-[#eaeaea]">
        <p className="text-gray-600">{t.common.loading}...</p>
      </div>
    );
  }

  if (!hasApiKeys) {
    return (
      <ApiSetupPage
        onComplete={saveApiKeys}
        initialKeys={apiKeys || undefined}
      />
    );
  }

  if (!active && !endedWithSession) {
    return null;
  }

  return <LiveWorkspace />;
}
