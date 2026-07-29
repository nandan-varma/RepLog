import { z } from 'zod';

import { EQUIPMENT_OPTIONS, EXERCISE_CATEGORIES, EXERCISE_LEVELS, MUSCLE_OPTIONS } from './exercise';

export const searchFilterSchema = z.object({
  category: z.enum(EXERCISE_CATEGORIES as [string, ...string[]]).nullable(),
  equipment: z.enum(EQUIPMENT_OPTIONS as [string, ...string[]]).nullable(),
  muscle: z.enum(MUSCLE_OPTIONS as [string, ...string[]]).nullable(),
  level: z.enum(EXERCISE_LEVELS as [string, ...string[]]).nullable(),
});
export type SearchFilterResult = z.infer<typeof searchFilterSchema>;

export const parsedLogSchema = z.object({
  exerciseName: z.string(),
  sets: z.array(
    z.object({
      weight: z.number(),
      reps: z.number(),
    }),
  ),
});
export type ParsedLog = z.infer<typeof parsedLogSchema>;

export const tipRequestSchema = z.object({
  exerciseName: z.string(),
  kind: z.enum(['form', 'substitute']),
});
export type TipRequest = z.infer<typeof tipRequestSchema>;

export const summaryRequestSchema = z.object({
  exerciseNames: z.array(z.string()),
  totalSets: z.number(),
});
export type SummaryRequest = z.infer<typeof summaryRequestSchema>;

export const coachRequestSchema = z.object({
  message: z.string(),
  context: z.string(),
});
export type CoachRequest = z.infer<typeof coachRequestSchema>;

export const textReplySchema = z.object({ text: z.string() });
export type TextReply = z.infer<typeof textReplySchema>;
