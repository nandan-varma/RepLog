import { z } from 'zod';

export type ExerciseCategory =
  | 'strength'
  | 'cardio'
  | 'stretching'
  | 'plyometrics'
  | 'powerlifting'
  | 'strongman'
  | 'olympic weightlifting';

export type ExerciseLevel = 'beginner' | 'intermediate' | 'expert';
export type ExerciseForce = 'pull' | 'push' | 'static';
export type ExerciseMechanic = 'compound' | 'isolation';

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  'strength',
  'cardio',
  'stretching',
  'plyometrics',
  'powerlifting',
  'strongman',
  'olympic weightlifting',
];

export const EXERCISE_LEVELS: ExerciseLevel[] = ['beginner', 'intermediate', 'expert'];

export const EQUIPMENT_OPTIONS = [
  'bands',
  'barbell',
  'body only',
  'cable',
  'dumbbell',
  'e-z curl bar',
  'exercise ball',
  'foam roll',
  'kettlebells',
  'machine',
  'medicine ball',
  'other',
];

export const MUSCLE_OPTIONS = [
  'abdominals',
  'abductors',
  'adductors',
  'biceps',
  'calves',
  'chest',
  'forearms',
  'glutes',
  'hamstrings',
  'lats',
  'lower back',
  'middle back',
  'neck',
  'quadriceps',
  'shoulders',
  'traps',
  'triceps',
];

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  level: ExerciseLevel;
  force: ExerciseForce | null;
  mechanic: ExerciseMechanic | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

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
