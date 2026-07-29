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
