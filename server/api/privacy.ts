import { html } from '../src/http.js';
import { privacyPage } from '../src/pages.js';

export function GET(): Response {
  return html(privacyPage());
}
