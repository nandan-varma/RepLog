import { getWorkout, listWorkouts } from '@/db';
import { exercisesById } from '@/data/exercises';

const RECENT_WORKOUT_LIMIT = 5;

export async function buildCoachContext(): Promise<string> {
  const summaries = await listWorkouts();
  const completed = summaries.filter((w) => w.endedAt !== null).slice(0, RECENT_WORKOUT_LIMIT);

  if (completed.length === 0) return 'No workouts logged yet.';

  const lines = await Promise.all(
    completed.map(async (summary) => {
      const workout = await getWorkout(summary.id);
      if (!workout) return null;
      const date = new Date(workout.startedAt).toLocaleDateString();
      const exerciseLines = workout.exercises.map((we) => {
        const name = exercisesById[we.exerciseId]?.name ?? we.exerciseId;
        const sets = we.sets.map((s) => `${s.weight}${s.unit}x${s.reps}`).join(', ');
        return `${name}: ${sets}`;
      });
      return `${date} - ${exerciseLines.join('; ')}`;
    }),
  );

  return lines.filter((l): l is string => l !== null).join('\n');
}
