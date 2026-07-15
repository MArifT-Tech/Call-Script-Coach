# [New Joiner Call Coach]


## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

Mobile app (Expo) for India-based PACS support teams to practice US customer calls via AI role play. Trainees pick a scenario, the AI plays the customer, and they reply in **text or voice**. Voice mode records the agent's reply via the browser mic, transcribes it, sends it through the regular chat flow, and reads the customer's response back aloud.

## Architecture decisions

- Voice mode works on **web, iOS, and Android**. Web uses browser `MediaRecorder` + `HTMLAudioElement`; native (iOS/Android) uses `expo-audio` (`useAudioRecorder` + `createAudioPlayer`) with `expo-file-system/legacy` for base64 read/write. Both code paths live behind a `Platform.OS === "web"` branch inside `hooks/useVoiceRecorder.ts` and `hooks/useAudioPlayer.ts`. iOS mic permission is declared in `app.json` (`NSMicrophoneUsageDescription` + `expo-audio` plugin config).
- `expo-audio` and `expo-file-system` are pinned to the SDK 54 compatible versions (`~1.1.1` and `~19.0.22`). Do **not** let pnpm pick the latest (55.x) — those are for SDK 55 and Expo will warn at startup.
- Audio is shipped as **base64 JSON** (not multipart) end-to-end. Express body limit is bumped to 25mb in `app.ts` to accommodate ~30s clips.
- **STT** uses `gpt-4o-mini-transcribe` via `openai.audio.transcriptions.create` (Replit OpenAI proxy supports this; `whisper-1` is not supported).
- **TTS** uses `gpt-audio-mini` via `chat.completions.create` with `modalities: ["text","audio"]` and a strict "read verbatim" system prompt. The proxy does not support `/audio/speech`, so the chat-completion audio output is the supported path.
- `toFile` from the `openai` SDK is re-exported through `@workspace/integrations-openai-ai-server` so route code doesn't need a direct `openai` dependency.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
