export interface SetRow {
  id: number;
  workoutExerciseId: number;
  weight: number;
  reps: number;
  unit: string;
  completedAt: string;
}

export interface WorkoutExerciseDetail {
  id: number;
  exerciseId: string;
  position: number;
  sets: SetRow[];
}

export interface WorkoutDetail {
  id: number;
  startedAt: string;
  endedAt: string | null;
  notes: string | null;
  exercises: WorkoutExerciseDetail[];
}

export interface WorkoutSummary {
  id: number;
  startedAt: string;
  endedAt: string | null;
  exerciseCount: number;
  setCount: number;
}

export interface ExerciseHistoryEntry {
  setId: number;
  workoutId: number;
  startedAt: string;
  weight: number;
  reps: number;
  unit: string;
  completedAt: string;
}

export interface ExportedData {
  version: 1;
  exportedAt: string;
  workouts: WorkoutDetail[];
}
