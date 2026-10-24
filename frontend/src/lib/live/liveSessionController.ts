/**
 * Orchestrates tab capture + AudioChunker + live WebSocket session (LIVE-007/025).
 *
 * Starts only from an explicit user click. Never auto-recaptures when the share
 * ends. Video from getDisplayMedia is never forwarded — only PCM audio chunks.
 */

import type { AudioChunkMetaPayload } from '@/lib/audio/audioStream';
import { AudioChunker, AudioChunkerError } from '@/lib/audio/audioStream';
import type { GapRange } from '@/lib/audio/flowControl';
import {
  startTabAudioCapture,
  TabCaptureError,
  type TabAudioCapture,
} from '@/lib/audio/tabCapture';
import { factCheckService } from '@/lib/services/factCheckService';
import { useFactCheckStore } from '@/lib/store/factCheckStore';
import { captureFeedbackFromErrorCode } from '@/lib/live/liveUiState';

export interface LiveSessionStartOptions {
  apiKeys?: { google?: string; tavily?: string };
  language?: 'pt-BR';
  /** Injected for tests. */
  createSessionId?: () => string;
  /** Injected for tests — skip real getDisplayMedia. */
  startCapture?: () => Promise<TabAudioCapture>;
  /** Injected for tests. */
  createChunker?: () => AudioChunker;
}

export type LiveSessionControllerPhase =
  | 'idle'
  | 'starting'
  | 'running'
  | 'paused'
  | 'stopping'
  | 'stopped'
  | 'error';

function defaultSessionId(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.randomUUID === 'function') {
    return webCrypto.randomUUID();
  }
  return `live-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export class LiveSessionController {
  private capture: TabAudioCapture | null = null;
  private chunker: AudioChunker | null = null;
  private sessionId: string | null = null;
  private phase: LiveSessionControllerPhase = 'idle';
  private unsubscribeAck: (() => void) | null = null;
  private unbindCaptureEnded: (() => void) | null = null;
  private unbindCaptureError: (() => void) | null = null;

  getPhase(): LiveSessionControllerPhase {
    return this.phase;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  async start(options: LiveSessionStartOptions = {}): Promise<string> {
    if (this.phase === 'starting' || this.phase === 'running' || this.phase === 'paused') {
      throw new Error('Uma sessão Live já está em andamento.');
    }

    const store = useFactCheckStore.getState();
    store.reset();
    store.setCaptureFeedback('requesting_permission');
    this.phase = 'starting';

    const sessionId = (options.createSessionId ?? defaultSessionId)();
    this.sessionId = sessionId;

    try {
      await factCheckService.ensureConnected();
    } catch (error) {
      this.failLocal(
        'connection_error',
        error instanceof Error
          ? error.message
          : 'Não foi possível conectar ao servidor.',
      );
      throw error;
    }

    let capture: TabAudioCapture;
    try {
      const startCapture = options.startCapture ?? (() => startTabAudioCapture());
      capture = await startCapture();
    } catch (error) {
      this.handleCaptureStartError(error);
      throw error;
    }

    this.capture = capture;
    store.setCaptureFeedback('capturing');
    store.update({ sessionId });

    const chunker = options.createChunker?.() ?? new AudioChunker();
    this.chunker = chunker;

    this.unsubscribeAck = factCheckService.onAudioChunkAck((chunkSeq, accepted) => {
      if (!this.chunker) return;
      if (accepted) {
        this.chunker.ack(chunkSeq);
      } else {
        this.chunker.fail(chunkSeq);
      }
    });

    this.unbindCaptureEnded = capture.onEnded(() => {
      void this.handleShareEnded();
    });
    this.unbindCaptureError = capture.onError((error) => {
      store.setCaptureFeedback(
        captureFeedbackFromErrorCode(error.code),
        error.message,
      );
    });

    try {
      await chunker.start(capture.stream, {
        onChunk: (meta, buffer) => this.emitChunk(meta, buffer),
        onError: (error) => {
          store.setCaptureFeedback(
            captureFeedbackFromErrorCode(error.code),
            error.message,
          );
        },
        onGap: (gap) => this.emitGap(gap),
      });
    } catch (error) {
      await this.teardownCapture({ flush: false });
      this.handleCaptureStartError(error);
      throw error;
    }

    factCheckService.startLiveSession({
      sessionId,
      source: 'TAB',
      language: options.language ?? 'pt-BR',
      consent: true,
      apiKeys: options.apiKeys,
    });

    store.setLiveSessionState('CONNECTING');
    store.setStatus('processing', 'CONNECTING');
    this.phase = 'running';
    return sessionId;
  }

  async pause(): Promise<void> {
    if (!this.sessionId || !this.chunker) return;
    this.chunker.pause();
    factCheckService.pauseLiveSession({ sessionId: this.sessionId });
    useFactCheckStore.getState().setCaptureFeedback('paused');
    useFactCheckStore.getState().setLiveSessionState('PAUSED');
    this.phase = 'paused';
  }

  async resume(): Promise<void> {
    if (!this.sessionId || !this.chunker) return;
    await this.chunker.resume();
    factCheckService.resumeLiveSession({ sessionId: this.sessionId });
    useFactCheckStore.getState().setCaptureFeedback('capturing');
    useFactCheckStore.getState().setLiveSessionState('LISTENING');
    this.phase = 'running';
  }

  async stop(options: { cancel?: boolean } = {}): Promise<void> {
    if (this.phase === 'idle' || this.phase === 'stopped') return;

    this.phase = 'stopping';
    const store = useFactCheckStore.getState();
    store.setCaptureFeedback('ending');
    store.setLiveSessionState('ENDING');

    const sessionId = this.sessionId;
    await this.teardownCapture({ flush: !options.cancel });

    if (sessionId) {
      if (options.cancel) {
        factCheckService.cancelLiveSession({ sessionId });
      } else {
        factCheckService.endLiveSession({ sessionId });
      }
    }

    store.setCaptureFeedback('ended');
    store.setLiveSessionState('ENDED');
    this.phase = 'stopped';
    this.sessionId = null;
  }

  private emitChunk(meta: AudioChunkMetaPayload, buffer: ArrayBuffer): void {
    const sessionId = this.sessionId;
    if (!sessionId) return;

    const capturedAt =
      this.chunker?.capturedAt ?? new Date().toISOString();

    try {
      factCheckService.sendAudioChunk(
        {
          sessionId,
          chunkSeq: meta.chunkSeq,
          encoding: meta.encoding,
          sampleRate: meta.sampleRate,
          channels: meta.channels,
          samples: meta.samples,
          startSample: meta.startSample,
          capturedAt,
        },
        buffer,
      );
    } catch (error) {
      this.chunker?.fail(meta.chunkSeq);
      useFactCheckStore.getState().setCaptureFeedback(
        'connection_error',
        error instanceof Error ? error.message : 'Falha ao enviar áudio.',
      );
    }
  }

  private emitGap(gap: GapRange): void {
    const sessionId = this.sessionId;
    if (!sessionId) return;
    useFactCheckStore.getState().pushLiveGap({
      sessionId,
      fromSample: gap.fromSample,
      toSample: gap.toSample,
      reason: gap.reason,
    });
  }

  private async handleShareEnded(): Promise<void> {
    if (this.phase === 'stopping' || this.phase === 'stopped') return;
    useFactCheckStore
      .getState()
      .setCaptureFeedback('ended', 'O compartilhamento da aba foi encerrado.');
    await this.stop();
  }

  private handleCaptureStartError(error: unknown): void {
    if (error instanceof TabCaptureError || error instanceof AudioChunkerError) {
      this.failLocal(captureFeedbackFromErrorCode(error.code), error.message);
      return;
    }
    this.failLocal(
      'connection_error',
      error instanceof Error ? error.message : 'Falha ao iniciar a captura.',
    );
  }

  private failLocal(
    feedback: ReturnType<typeof captureFeedbackFromErrorCode>,
    message: string,
  ): void {
    useFactCheckStore.getState().setCaptureFeedback(feedback, message);
    this.phase = 'error';
    this.sessionId = null;
  }

  private async teardownCapture(options: { flush: boolean }): Promise<void> {
    this.unbindCaptureEnded?.();
    this.unbindCaptureEnded = null;
    this.unbindCaptureError?.();
    this.unbindCaptureError = null;
    this.unsubscribeAck?.();
    this.unsubscribeAck = null;

    if (this.chunker) {
      try {
        await this.chunker.stop({ flush: options.flush });
      } catch {
        // Teardown must not throw — share tracks still need release.
      }
      this.chunker = null;
    }

    if (this.capture) {
      this.capture.stop();
      this.capture = null;
    }
  }
}

/** Singleton used by the Live UI. */
export const liveSessionController = new LiveSessionController();
