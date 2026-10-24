## Learned User Preferences
- Preferir respostas em português.
- Não editar arquivos `.env` / `.env.local`; o usuário pode guardá-los só como referência pessoal.
- Na validação de API keys, aceitar os formatos reais atuais de cada provedor (Gemini e Tavily), em vez de regras rígidas legadas (ex.: só `AI` + exatamente 39 caracteres).

## Learned Workspace Facts
- Monorepo Veritas: frontend Next.js em `frontend/` (local tipicamente `:3001`) e backend em `backend/` (tipicamente `:3000`); subir com `pnpm dev` na raiz.
- Branch de trabalho atual do PoC: `new-veritas` (código na raiz do monorepo).
- `untitled-project/` é o workspace do Command Code para o Veritas — não é branch Git; não confundir com o código na raiz.
- Chaves Google/Gemini e Tavily entram pelo fluxo de setup da UI (`/setup`), ficam no `localStorage` (`veritas_api_keys`) e são enviadas nas verificações — não vêm do `.env` do servidor.
- Env do Next fica em `frontend/.env.local` (ex.: `NEXT_PUBLIC_BACKEND_URL`); env do backend em `backend/.env` (a partir de `backend/.env.example`).
- Modelos Gemini ficam em `backend/src/llm/config.ts`; neste PoC: fast `gemini-3.5-flash-lite`, advanced `gemini-3.6-flash` (`gemini-2.5-*` bloqueado para contas novas; `gemini-3.8-flash` costuma dar 503/alta demanda e trava com retries).
- O backend não tem hot-reload; após mudanças de config/código do backend, reiniciar o `pnpm dev`.
- Chaves Gemini podem ser clássicas `AIza…` ou auth keys novas `AQ.`; Tavily usa prefixos `tvly-` / `tvly-dev-` / `tvly-prod-`.
