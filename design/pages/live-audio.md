# Live Audio UI — LIVE-007 / LIVE-025 / LIVE-026

## Referência

- Protótipo HTML: `iniciatives/veritas-live/veritas-live-prototipo (1).html`
- Tokens Veritas em `frontend/src/app/globals.css` (`--veritas-purple-*`, gradiente `#f5f5f5` → `#eaeaea`)
- Contratos: `shared/types/live.ts`

## Componentes

| Componente | Arquivo | Papel |
|---|---|---|
| `ModeToggle` | `frontend/src/app/live/components/ModeToggle.tsx` | Texto / Áudio ao vivo |
| `LiveSetupPanel` | `frontend/src/app/live/components/LiveSetupPanel.tsx` | Fonte = aba desktop; CTA iniciar |
| `LiveAudioControls` | `frontend/src/app/live/components/LiveAudioControls.tsx` | Start/pause/stop + status |
| `LiveTranscript` | `frontend/src/app/live/components/LiveTranscript.tsx` | Segmentos, speakers, claims |
| `LiveWorkspace` | `frontend/src/app/live/components/LiveWorkspace.tsx` | Layout acompanhamento |

## Estados de feedback (separados)

- `captureFeedback`: idle / requesting_permission / capturing / paused / no_audio / permission_error / unsupported / connection_error / ending / ended
- `liveSessionState`: contrato do servidor (`IDLE`…`ERROR`)
- Chips extras: captura ativa, transcrição atrasada, pesquisa saturada, lacuna

## Comportamento

1. Clique do usuário → `getDisplayMedia` (LIVE-002) → `AudioChunker` (LIVE-003) → `START_LIVE_SESSION` + `AUDIO_CHUNK`
2. Vídeo da API permanece local; só PCM 16 kHz mono segue no socket
3. Segmentos upsert por `id`+`revision`; conflito de correção é sinalizado
4. Autoria desconhecida permanece explícita (sem inventar nome)
5. Microfone / mobile **não** aparecem como opção funcional no piloto

## i18n

Chaves em `t.live.*` (pt-BR / en-US).

## Testes

- `frontend/src/lib/live/__tests__/liveUiState.test.ts`
- `frontend/src/lib/store/__tests__/transcriptSync.test.ts`
- `frontend/src/lib/store/__tests__/factCheckStore.live.test.ts`

## Limitação de validação

Captura real de aba exige gesto do usuário no Chrome/Edge desktop; em CI/agente cloud a UI e a lógica de estados são cobertas por testes, mas o picker de `getDisplayMedia` não roda sem browser do usuário.
