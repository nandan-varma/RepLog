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
