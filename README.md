# RepLog

A completely local workout tracker: search exercises, log sets, and get AI help along the way. No accounts, no server-side workout data — everything lives on-device.

Live: [replog.nandan.fyi](https://replog.nandan.fyi)

## Structure

- `app/` — Expo app (Expo Router, TypeScript). The product.
- `server/` — plain Vercel Functions (one file per route, no framework) proxying AI calls so provider keys never ship in the app, plus the homepage/privacy pages required by the app stores.
- `packages/shared/` — Zod schemas and TypeScript types shared between `app` and `server`, built to `dist/` via `postinstall` (needed as real compiled output, not raw source, so Vercel's deployed function can resolve it).

## Develop

```bash
pnpm install

pnpm app      # expo start, from app/
pnpm server   # vercel dev, from server/ - exercises the same routing Vercel uses in production
```

Server env vars (put in `server/.env.local`, see `server/.env.example`):

```
OPENAI_API_KEY=
AI_SMALL_MODEL=gpt-5.6-luna   # fast/cheap tier: search parsing, quick-log, tips, summaries
AI_LARGE_MODEL=gpt-5.6-terra  # reasoning tier: the Coach
```

## Deploy

- **Server → Vercel**: `vercel deploy --prod` from the repo root (the project's Root Directory is set to `server`, so it must run from one level up). Env vars are set via `vercel env add <NAME> production` or the dashboard — `OPENAI_API_KEY` is required, `AI_SMALL_MODEL`/`AI_LARGE_MODEL` are optional (fall back to the defaults above).
- **App → EAS**: `cd app && eas build --profile production --platform ios|android`, then `eas submit`. `EXPO_PUBLIC_API_URL` in `app/.env` already points at the production server; update it (and `ios.bundleIdentifier` / `android.package` in `app.json`) if you fork this to your own accounts. Needs an Apple Developer and Google Play Console account, configured via `eas credentials`.
