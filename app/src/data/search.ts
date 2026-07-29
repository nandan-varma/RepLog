import Fuse from 'fuse.js';
import type { Exercise, ExerciseCategory, ExerciseLevel } from 'replog-shared';

import { exercises } from './exercises';

const fuse = new Fuse(exercises, {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'primaryMuscles', weight: 2 },
    { name: 'secondaryMuscles', weight: 1 },
    { name: 'equipment', weight: 1 },
    { name: 'category', weight: 1 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
});

export interface ExerciseFilters {
  category?: ExerciseCategory;
  equipment?: string;
  muscle?: string;
  level?: ExerciseLevel;
}

function matchesFilters(exercise: Exercise, filters?: ExerciseFilters): boolean {
  if (!filters) return true;
  if (filters.category && exercise.category !== filters.category) return false;
  if (filters.equipment && exercise.equipment !== filters.equipment) return false;
  if (filters.level && exercise.level !== filters.level) return false;
  if (filters.muscle) {
    const muscle = filters.muscle.toLowerCase();
    const inPrimary = exercise.primaryMuscles.some((m) => m.toLowerCase() === muscle);
    const inSecondary = exercise.secondaryMuscles.some((m) => m.toLowerCase() === muscle);
    if (!inPrimary && !inSecondary) return false;
  }
  return true;
}

export function searchExercises(query: string, filters?: ExerciseFilters): Exercise[] {
  const trimmed = query.trim();
  const results = trimmed ? fuse.search(trimmed).map((r) => r.item) : exercises;
  return results.filter((e) => matchesFilters(e, filters));
}
