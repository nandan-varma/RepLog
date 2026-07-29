import { generateObject } from 'ai';
import { searchFilterSchema } from 'replog-shared';

import { json, readJson } from '../../src/http.js';
import { smallModel } from '../../src/models.js';

export async function POST(request: Request): Promise<Response> {
  const { query } = await readJson<{ query: string }>(request);
  const { object } = await generateObject({
    model: smallModel(),
    schema: searchFilterSchema,
    prompt: `Extract exercise search filters from this query. Use null for anything not mentioned. Query: "${query}"`,
  });
  return json(object);
}
