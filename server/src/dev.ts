import { serve } from '@hono/node-server';

try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local present - env vars must come from the environment instead
}

const { app } = await import('./app');

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`RepLog server listening on http://localhost:${info.port}`);
});
