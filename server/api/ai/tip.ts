import { generateText } from 'ai';
import { tipRequestSchema } from 'replog-shared';

import { json, readJson } from '../../src/http.js';
import { smallModel } from '../../src/models.js';

export async function POST(request: Request): Promise<Response> {
  const body = tipRequestSchema.parse(await readJson(request));
  const prompt =
    body.kind === 'form'
      ? `Give one concise, actionable form cue (max 2 sentences) for performing "${body.exerciseName}" safely.`
      : `Suggest one equipment-free substitute exercise (max 2 sentences) for "${body.exerciseName}".`;
  const { text } = await generateText({ model: smallModel(), prompt });
  return json({ text });
}
