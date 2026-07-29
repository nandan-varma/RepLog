import { Hono } from 'hono';

import { homePage, privacyPage } from './pages.js';
import { ai } from './routes/ai.js';

export const app = new Hono();

app.get('/', (c) => c.html(homePage()));
app.get('/privacy', (c) => c.html(privacyPage()));
app.route('/api/ai', ai);

export default app;
