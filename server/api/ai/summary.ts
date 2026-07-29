import { generateText } from 'ai';
import { summaryRequestSchema } from 'replog-shared';

import { json, readJson } from '../../src/http.js';
import { smallModel } from '../../src/models.js';

export async function POST(request: Request): Promise<Response> {
  const body = summaryRequestSchema.parse(await readJson(request));
  const { text } = await generateText({
    model: smallModel(),
    prompt: `Write one short, encouraging sentence summarizing this workout: exercises = ${body.exerciseNames.join(', ')}, total sets = ${body.totalSets}.`,
  });
  return json({ text });
}
