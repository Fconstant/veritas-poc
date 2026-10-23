/* global DisplayMediaStreamOptions, Event, MediaDevices, MediaStream, MediaStreamTrack, Navigator */
/**
 * Tab audio capture for Veritas Live (LIVE-002).
 *
 * `getDisplayMedia()` is the only browser API that can capture the audio of a
 * tab. The API forces a video track to exist, but that track is **never**
 * exposed nor sent to the backend: the returned handle only publishes the audio
 * track and keeps the video track alive because stopping it would also end the
 * audio capture.
 *
 * Browser globals are only touched inside functions, so importing this module in
 * Node (tests, SSR) is safe. Nothing here starts a capture automatically and
 * nothing here restarts a capture: a new share always requires a new user click.
 */

export type TabCaptureErrorCode =
  /** The browser has no `navigator.mediaDevices.getDisplayMedia`. */
  | 'UNSUPPORTED'
  /** The user denied the permission, or there was no user gesture. */
  | 'PERMISSION_DENIED'
  /** The share picker was dismissed / the request was aborted. */
  | 'ABORTED'
  /** The share was granted but carries no audio track. */
  | 'NO_AUDIO_TRACK'
  /** Display media could not be obtained (no source, unreadable capture). */
  | 'NO_DISPLAY_MEDIA';

/**
 * Typed capture error. `code` is stable and safe to branch on in the UI;
 * `message` is user-facing (pt-BR, consistent with the rest of the product).
 */
export class TabCaptureError extends Error {
  readonly code: TabCaptureErrorCode;

  constructor(
    code: TabCaptureErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'TabCaptureError';
    this.code = code;
  }
}

export interface TabCaptureEndInfo {
  /** Which signal ended the share. */
  reason: 'audio-track-ended' | 'stream-inactive' | 'stopped';
}

export interface TabAudioCapture {
  /** The original display media stream (contains the hidden video track). */
  readonly stream: MediaStream;
  /** The audio track that feeds the chunker. */
  readonly audioTrack: MediaStreamTrack;
  /** `false` once the share ended or `stop()` was called. */
  readonly active: boolean;
  /** Releases every track of the share. Idempotent. */
  stop(): void;
  /** Called once when the share ends (user clicks "Stop sharing", tab closed, ...). */
  onEnded(listener: (info: TabCaptureEndInfo) => void): () => void;
  /** Called for asynchronous capture problems after the share started. */
  onError(listener: (error: TabCaptureError) => void): () => void;
}

export interface StartTabAudioCaptureOptions {
  /**
   * Reject when the browser exposes `navigator.userActivation` and the
   * transient activation is already gone. Enabled by default: `getDisplayMedia`
   * must be called from a click handler, and failing early gives a clear error
   * instead of a silent rejected promise.
   */
  requireUserActivation?: boolean;
}

const DISPLAY_MEDIA_CONSTRAINTS = {
  // The API requires a video track. It stays alive but is never exposed nor
  // forwarded; only `audioTrack` leaves this module.
  video: true,
  audio: {
    // These are speech-capture hostile: they alter the captured audio and break
    // transcription. They must be explicitly disabled.
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
  // Do not silently pre-select the Veritas tab itself: the user must pick the
  // tab that is actually playing the debate.
  preferCurrentTab: false,
} as DisplayMediaStreamOptions;

/**
 * Maps a rejection from `getDisplayMedia` to a stable code.
 *
 * DOMException names differ between browsers, so unknown names fall back to
 * `NO_DISPLAY_MEDIA` ("could not obtain display media") instead of guessing a
 * permission problem.
 */
export function mapDisplayMediaError(error: unknown): TabCaptureError {
  if (error instanceof TabCaptureError) {
    return error;
  }

  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name?: unknown }).name)
      : '';
  const detail =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message)
      : error instanceof Error
        ? error.message
        : String(error);

  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return new TabCaptureError(
        'PERMISSION_DENIED',
        'Permissão para compartilhar a aba foi negada. Autorize o compartilhamento de tela e de áudio para continuar.',
        { cause: error },
      );
    case 'AbortError':
      return new TabCaptureError(
        'ABORTED',
        'O compartilhamento foi cancelado antes de começar. Selecione a aba e autorize o áudio para tentar novamente.',
        { cause: error },
      );
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'NotReadableError':
    case 'InvalidStateError':
      return new TabCaptureError(
        'NO_DISPLAY_MEDIA',
        'Nenhuma fonte de compartilhamento disponível para captura.',
        { cause: error },
      );
    case 'NotSupportedError':
    case 'OverconstrainedError':
    case 'TypeError':
      return new TabCaptureError(
        'UNSUPPORTED',
        'Este navegador não suporta captura de áudio de aba com os parâmetros necessários.',
        { cause: error },
      );
    default:
      return new TabCaptureError(
        'NO_DISPLAY_MEDIA',
        `Não foi possível capturar a aba${detail ? `: ${detail}` : '.'}`,
        { cause: error },
      );
  }
}

/** `true` when the current environment can call `getDisplayMedia()`. */
export function isTabAudioCaptureSupported(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const mediaDevices = navigator.mediaDevices as
    | (MediaDevices & { getDisplayMedia?: unknown })
    | undefined;

  return typeof mediaDevices?.getDisplayMedia === 'function';
}

/**
 * Checks the transient user activation when the browser exposes it.
 *
 * `getDisplayMedia` is only allowed from a user gesture; detecting it early
 * gives an actionable error instead of an opaque rejection.
 */
function assertUserGesture(): void {
  if (typeof navigator === 'undefined') {
    return;
  }

  const activation = (
    navigator as Navigator & {
      userActivation?: { isActive?: boolean };
    }
  ).userActivation;

  if (activation && activation.isActive === false) {
    throw new TabCaptureError(
      'PERMISSION_DENIED',
      'A captura precisa ser iniciada por um clique do usuário. Clique em "Iniciar escuta" novamente.',
    );
  }
}

/**
 * Requests tab capture. **Must be called from a user gesture handler.**
 *
 * Resolves only when an audio track is present. Every failure path stops the
 * tracks it acquired, so a rejected capture never leaks a running share.
 */
export async function startTabAudioCapture(
  options: StartTabAudioCaptureOptions = {},
): Promise<TabAudioCapture> {
  const { requireUserActivation = true } = options;

  if (!isTabAudioCaptureSupported()) {
    throw new TabCaptureError(
      'UNSUPPORTED',
      'Este navegador não permite capturar o áudio de uma aba. Use Chrome ou Edge no desktop.',
    );
  }

  if (requireUserActivation) {
    assertUserGesture();
  }

  let stream: MediaStream | undefined;

  try {
    stream = await navigator.mediaDevices.getDisplayMedia(
      DISPLAY_MEDIA_CONSTRAINTS,
    );
  } catch (error) {
    throw mapDisplayMediaError(error);
  }

  if (!stream) {
    throw new TabCaptureError(
      'NO_DISPLAY_MEDIA',
      'Nenhum fluxo de compartilhamento foi retornado pelo navegador.',
    );
  }

  const audioTrack = stream.getAudioTracks()[0];

  if (!audioTrack || audioTrack.readyState === 'ended') {
    stopAllTracks(stream);
    throw new TabCaptureError(
      'NO_AUDIO_TRACK',
      'A aba foi compartilhada sem áudio. Escolha a aba e marque a opção "Compartilhar áudio da aba".',
    );
  }

  return new TabAudioCaptureSession(stream, audioTrack);
}

function stopAllTracks(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    if (track.readyState !== 'ended') {
      try {
        track.stop();
      } catch {
        // A track that is already gone must not break the teardown.
      }
    }
  }
}

/**
 * Live capture handle. Keeps the (required) video track running but never
 * exposes it; `stop()` releases every track of the share.
 */
class TabAudioCaptureSession implements TabAudioCapture {
  readonly stream: MediaStream;
  readonly audioTrack: MediaStreamTrack;

  private readonly endedListeners = new Set<(info: TabCaptureEndInfo) => void>();
  private readonly errorListeners = new Set<(error: TabCaptureError) => void>();
  private activeCapture = true;

  constructor(stream: MediaStream, audioTrack: MediaStreamTrack) {
    this.stream = stream;
    this.audioTrack = audioTrack;

    // The video track required by `getDisplayMedia` is intentionally not stored
    // anywhere: it stays alive inside `stream` (stopping it would also stop the
    // audio) and is never forwarded to the backend.

    // Both signals are used: `ended` on the audio track fires when the share is
    // stopped/closed; `inactive` on the stream covers browsers that only mark
    // the stream as ended.
    this.audioTrack.addEventListener('ended', this.handleTrackEnded);
    this.stream.addEventListener('inactive', this.handleStreamInactive);
    this.stream.addEventListener('removetrack', this.handleRemoveTrack);
    this.audioTrack.addEventListener('error', this.handleTrackError);
  }

  get active(): boolean {
    return this.activeCapture;
  }

  /** Releases the audio and the hidden video track. Idempotent. */
  stop(): void {
    if (!this.activeCapture) {
      return;
    }

    this.activeCapture = false;
    this.detachListeners();
    stopAllTracks(this.stream);
    this.endedListeners.clear();
    this.errorListeners.clear();
  }

  onEnded(listener: (info: TabCaptureEndInfo) => void): () => void {
    this.endedListeners.add(listener);
    return () => {
      this.endedListeners.delete(listener);
    };
  }

  onError(listener: (error: TabCaptureError) => void): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  private readonly handleTrackEnded = (): void => {
    this.finish('audio-track-ended');
  };

  private readonly handleStreamInactive = (): void => {
    this.finish('stream-inactive');
  };

  private readonly handleRemoveTrack = (): void => {
    if (this.stream.getAudioTracks().length === 0) {
      this.emitError(
        new TabCaptureError(
          'NO_AUDIO_TRACK',
          'O áudio da aba foi interrompido. Inicie a escuta novamente.',
        ),
      );
      this.finish('stream-inactive');
    }
  };

  private readonly handleTrackError = (event: Event): void => {
    const error = (event as Event & { error?: unknown }).error;
    this.emitError(
      new TabCaptureError(
        'NO_DISPLAY_MEDIA',
        'O navegador interrompeu a captura da aba por um erro de mídia.',
        { cause: error },
      ),
    );
    this.finish('stream-inactive');
  };

  /**
   * Ends the capture once. Releases every track (including the video one) so the
   * browser stops showing the "sharing" indicator, then notifies listeners.
   * Deliberately does not restart the capture: a new share requires a new click.
   */
  private finish(reason: TabCaptureEndInfo['reason']): void {
    if (!this.activeCapture) {
      return;
    }

    this.activeCapture = false;
    this.detachListeners();
    stopAllTracks(this.stream);

    const info: TabCaptureEndInfo = { reason };
    for (const listener of [...this.endedListeners]) {
      try {
        listener(info);
      } catch (error) {
        this.emitError(
          new TabCaptureError(
            'NO_DISPLAY_MEDIA',
            'Falha inesperada ao encerrar a captura da aba.',
            { cause: error },
          ),
        );
      }
    }
  }

  private emitError(error: TabCaptureError): void {
    for (const listener of [...this.errorListeners]) {
      try {
        listener(error);
      } catch {
        // A broken listener must not break the capture teardown.
      }
    }
  }

  private detachListeners(): void {
    this.audioTrack.removeEventListener('ended', this.handleTrackEnded);
    this.stream.removeEventListener('inactive', this.handleStreamInactive);
    this.stream.removeEventListener('removetrack', this.handleRemoveTrack);
    this.audioTrack.removeEventListener('error', this.handleTrackError);
  }
}
