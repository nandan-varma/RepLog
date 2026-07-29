import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import type { ExerciseHistoryEntry, ExportedData, SetRow, WorkoutDetail, WorkoutSummary } from './types';

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL,
    position INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    unit TEXT NOT NULL,
    completed_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
  CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise ON sets(workout_exercise_id);
`;

let dbPromise: Promise<SQLiteDatabase> | null = null;

function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync('replog.db').then(async (db) => {
      await db.execAsync(SCHEMA);
      return db;
    });
  }
  return dbPromise;
}

export const DEFAULT_UNIT = 'kg';

export async function startWorkout(): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync('INSERT INTO workouts (started_at) VALUES (?)', new Date().toISOString());
  return result.lastInsertRowId;
}

export async function endWorkout(workoutId: number, notes?: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE workouts SET ended_at = ?, notes = COALESCE(?, notes) WHERE id = ?',
    new Date().toISOString(),
    notes ?? null,
    workoutId,
  );
}

export async function getActiveWorkoutId(): Promise<number | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM workouts WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
  );
  return row?.id ?? null;
}

export async function addExerciseToWorkout(workoutId: number, exerciseId: string): Promise<number> {
  const db = await getDb();
  const { count } = (await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM workout_exercises WHERE workout_id = ?',
    workoutId,
  ))!;
  const result = await db.runAsync(
    'INSERT INTO workout_exercises (workout_id, exercise_id, position) VALUES (?, ?, ?)',
    workoutId,
    exerciseId,
    count,
  );
  return result.lastInsertRowId;
}

export async function addSet(
  workoutExerciseId: number,
  set: { weight: number; reps: number; unit?: string },
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO sets (workout_exercise_id, weight, reps, unit, completed_at) VALUES (?, ?, ?, ?, ?)',
    workoutExerciseId,
    set.weight,
    set.reps,
    set.unit ?? DEFAULT_UNIT,
    new Date().toISOString(),
  );
  return result.lastInsertRowId;
}

export async function updateSet(setId: number, patch: { weight?: number; reps?: number }): Promise<void> {
  const db = await getDb();
  if (patch.weight !== undefined) await db.runAsync('UPDATE sets SET weight = ? WHERE id = ?', patch.weight, setId);
  if (patch.reps !== undefined) await db.runAsync('UPDATE sets SET reps = ? WHERE id = ?', patch.reps, setId);
}

export async function deleteSet(setId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM sets WHERE id = ?', setId);
}

export async function getWorkout(workoutId: number): Promise<WorkoutDetail | null> {
  const db = await getDb();
  const workout = await db.getFirstAsync<{ id: number; started_at: string; ended_at: string | null; notes: string | null }>(
    'SELECT id, started_at, ended_at, notes FROM workouts WHERE id = ?',
    workoutId,
  );
  if (!workout) return null;

  const exerciseRows = await db.getAllAsync<{ id: number; exercise_id: string; position: number }>(
    'SELECT id, exercise_id, position FROM workout_exercises WHERE workout_id = ? ORDER BY position',
    workoutId,
  );

  const exercises = await Promise.all(
    exerciseRows.map(async (row) => {
      const setRows = await db.getAllAsync<{
        id: number;
        workout_exercise_id: number;
        weight: number;
        reps: number;
        unit: string;
        completed_at: string;
      }>('SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY completed_at', row.id);

      const sets: SetRow[] = setRows.map((s) => ({
        id: s.id,
        workoutExerciseId: s.workout_exercise_id,
        weight: s.weight,
        reps: s.reps,
        unit: s.unit,
        completedAt: s.completed_at,
      }));

      return { id: row.id, exerciseId: row.exercise_id, position: row.position, sets };
    }),
  );

  return {
    id: workout.id,
    startedAt: workout.started_at,
    endedAt: workout.ended_at,
    notes: workout.notes,
    exercises,
  };
}

export async function listWorkouts(): Promise<WorkoutSummary[]> {
  const db = await getDb();
  return db.getAllAsync<WorkoutSummary>(`
    SELECT
      w.id as id,
      w.started_at as startedAt,
      w.ended_at as endedAt,
      COUNT(DISTINCT we.id) as exerciseCount,
      COUNT(s.id) as setCount
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN sets s ON s.workout_exercise_id = we.id
    GROUP BY w.id
    ORDER BY w.started_at DESC
  `);
}

export async function getExerciseHistory(exerciseId: string): Promise<ExerciseHistoryEntry[]> {
  const db = await getDb();
  return db.getAllAsync<ExerciseHistoryEntry>(
    `
    SELECT
      s.id as setId,
      w.id as workoutId,
      w.started_at as startedAt,
      s.weight as weight,
      s.reps as reps,
      s.unit as unit,
      s.completed_at as completedAt
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.exercise_id = ?
    ORDER BY s.completed_at
  `,
    exerciseId,
  );
}

export async function exportAll(): Promise<ExportedData> {
  const summaries = await listWorkouts();
  const workouts = await Promise.all(summaries.map((w) => getWorkout(w.id)));
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    workouts: workouts.filter((w): w is WorkoutDetail => w !== null),
  };
}

export async function importAll(data: ExportedData): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const workout of data.workouts) {
      const workoutResult = await db.runAsync(
        'INSERT INTO workouts (started_at, ended_at, notes) VALUES (?, ?, ?)',
        workout.startedAt,
        workout.endedAt,
        workout.notes,
      );
      const workoutId = workoutResult.lastInsertRowId;

      for (const exercise of workout.exercises) {
        const exerciseResult = await db.runAsync(
          'INSERT INTO workout_exercises (workout_id, exercise_id, position) VALUES (?, ?, ?)',
          workoutId,
          exercise.exerciseId,
          exercise.position,
        );
        const workoutExerciseId = exerciseResult.lastInsertRowId;

        for (const set of exercise.sets) {
          await db.runAsync(
            'INSERT INTO sets (workout_exercise_id, weight, reps, unit, completed_at) VALUES (?, ?, ?, ?, ?)',
            workoutExerciseId,
            set.weight,
            set.reps,
            set.unit,
            set.completedAt,
          );
        }
      }
    }
  });
}
