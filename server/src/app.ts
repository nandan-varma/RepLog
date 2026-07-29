import { Hono } from 'hono';

import { homePage, privacyPage } from './pages';

export const app = new Hono();

app.get('/', (c) => c.html(homePage()));
app.get('/privacy', (c) => c.html(privacyPage()));

export default app;
