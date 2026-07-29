import { Hono } from 'hono';

import { homePage, privacyPage } from './pages.js';
import * as aiRoutes from './routes/ai.js';

export const app = new Hono();

app.get('/', (c) => c.html(homePage()));
app.get('/privacy', (c) => c.html(privacyPage()));
app.post('/api/ai/search', aiRoutes.search);
app.post('/api/ai/log', aiRoutes.log);
app.post('/api/ai/tip', aiRoutes.tip);
app.post('/api/ai/summary', aiRoutes.summary);
app.post('/api/ai/coach', aiRoutes.coach);

export default app;
