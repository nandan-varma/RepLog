import type { Exercise } from 'replog-shared';

import raw from './exercises.json';

export const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export const exercises: Exercise[] = raw as Exercise[];

export const exercisesById: Record<string, Exercise> = Object.fromEntries(exercises.map((e) => [e.id, e]));

export function imageUrl(path: string): string {
  return `${IMAGE_BASE_URL}${path}`;
}
