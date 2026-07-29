import { generateText } from 'ai';
import { coachRequestSchema } from 'replog-shared';

import { json, readJson } from '../../src/http.js';
import { largeModel } from '../../src/models.js';

export async function POST(request: Request): Promise<Response> {
  const body = coachRequestSchema.parse(await readJson(request));
  const { text } = await generateText({
    model: largeModel(),
    system:
      'You are a concise, knowledgeable strength-training coach. Use the workout stats provided as context. Keep replies under 150 words.',
    prompt: `Workout stats:\n${body.context}\n\nQuestion: ${body.message}`,
  });
  return json({ text });
}
