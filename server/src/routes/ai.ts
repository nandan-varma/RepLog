import { generateObject, generateText } from 'ai';
import { Hono } from 'hono';
import {
  coachRequestSchema,
  parsedLogSchema,
  searchFilterSchema,
  summaryRequestSchema,
  tipRequestSchema,
} from 'replog-shared';

import { largeModel, smallModel } from '../models.js';

export const ai = new Hono();

ai.post('/search', async (c) => {
  const { query } = await c.req.json();
  const { object } = await generateObject({
    model: smallModel(),
    schema: searchFilterSchema,
    prompt: `Extract exercise search filters from this query. Use null for anything not mentioned. Query: "${query}"`,
  });
  return c.json(object);
});

ai.post('/log', async (c) => {
  const { text } = await c.req.json();
  const { object } = await generateObject({
    model: smallModel(),
    schema: parsedLogSchema,
    prompt: `Parse this workout log entry into an exercise name and a list of sets (weight, reps). Text: "${text}"`,
  });
  return c.json(object);
});

ai.post('/tip', async (c) => {
  const body = tipRequestSchema.parse(await c.req.json());
  const prompt =
    body.kind === 'form'
      ? `Give one concise, actionable form cue (max 2 sentences) for performing "${body.exerciseName}" safely.`
      : `Suggest one equipment-free substitute exercise (max 2 sentences) for "${body.exerciseName}".`;
  const { text } = await generateText({ model: smallModel(), prompt });
  return c.json({ text });
});

ai.post('/summary', async (c) => {
  const body = summaryRequestSchema.parse(await c.req.json());
  const { text } = await generateText({
    model: smallModel(),
    prompt: `Write one short, encouraging sentence summarizing this workout: exercises = ${body.exerciseNames.join(', ')}, total sets = ${body.totalSets}.`,
  });
  return c.json({ text });
});

ai.post('/coach', async (c) => {
  const body = coachRequestSchema.parse(await c.req.json());
  const { text } = await generateText({
    model: largeModel(),
    system:
      'You are a concise, knowledgeable strength-training coach. Use the workout stats provided as context. Keep replies under 150 words.',
    prompt: `Workout stats:\n${body.context}\n\nQuestion: ${body.message}`,
  });
  return c.json({ text });
});
