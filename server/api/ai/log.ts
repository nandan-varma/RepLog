import { generateObject } from 'ai';
import { parsedLogSchema } from 'replog-shared';

import { json, readJson } from '../../src/http.js';
import { smallModel } from '../../src/models.js';

export async function POST(request: Request): Promise<Response> {
  const { text } = await readJson<{ text: string }>(request);
  const { object } = await generateObject({
    model: smallModel(),
    schema: parsedLogSchema,
    prompt: `Parse this workout log entry into an exercise name and a list of sets (weight, reps). Text: "${text}"`,
  });
  return json(object);
}
