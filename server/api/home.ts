import { html } from '../src/http.js';
import { homePage } from '../src/pages.js';

export function GET(): Response {
  return html(homePage());
}
