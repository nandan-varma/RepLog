import { Hono } from 'hono';

import { homePage, privacyPage } from './pages';
import { ai } from './routes/ai';

export const app = new Hono();

app.get('/', (c) => c.html(homePage()));
app.get('/privacy', (c) => c.html(privacyPage()));
app.route('/api/ai', ai);

export default app;
