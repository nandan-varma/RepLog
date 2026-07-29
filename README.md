# RepLog

A completely local workout tracker: search exercises, log sets, and get AI help along the way. No accounts, no server-side workout data — everything lives on-device.

## Structure

- `app/` — Expo app (Expo Router, TypeScript). The product.
- `server/` — Hono server (deployed to Vercel). Proxies AI calls so provider keys never ship in the app, and serves the homepage/privacy pages required by the app stores.
- `packages/shared/` — Zod schemas and TypeScript types shared between `app` and `server`.

## Develop

```bash
pnpm install

pnpm app      # expo start, from app/
pnpm server   # hono dev server on :3000, from server/
```

Server env vars (put in `server/.env.local`, see `server/.env.example`):

```
OPENAI_API_KEY=
AI_SMALL_MODEL=gpt-5.6-luna   # fast/cheap tier: search parsing, quick-log, tips, summaries
AI_LARGE_MODEL=gpt-5.6-terra  # reasoning tier: the Coach
```

## Deploy

- **Server → Vercel**: `cd server && vercel deploy`. Set `OPENAI_API_KEY` (and optionally `AI_SMALL_MODEL`/`AI_LARGE_MODEL`) as Vercel project env vars.
- **App → EAS**: `cd app && eas build --profile production --platform ios|android`, then `eas submit`. Before the first build, set `EXPO_PUBLIC_API_URL` in `app/.env` to the deployed server URL (it defaults to `http://localhost:3000` for local dev) and update `ios.bundleIdentifier` / `android.package` in `app.json` if you don't own `me.nandanvarma.replog`. Needs an Apple Developer and Google Play Console account, configured via `eas credentials`.
