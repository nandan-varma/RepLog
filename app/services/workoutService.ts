import { MMKV } from "react-native-mmkv"
import { format } from "date-fns"

const storage = new MMKV({ id: "workout-storage" })

export interface WorkoutSet {
  reps: number
  weight: number
  completed: boolean
}

export interface WorkoutExercise {
  exerciseId: string
  sets: WorkoutSet[]
}

export interface Workout {
  id: string
  date: string // YYYY-MM-DD
  startedAt: number
  completedAt?: number
  exercises: WorkoutExercise[]
}

function load(): Workout[] {
  const raw = storage.getString("workouts")
  return raw ? JSON.parse(raw) : []
}

function save(workouts: Workout[]) {
  storage.set("workouts", JSON.stringify(workouts))
}

export function getWorkouts(): Workout[] {
  return load().sort((a, b) => b.startedAt - a.startedAt)
}

export function getTodayWorkout(): Workout | undefined {
  const today = format(new Date(), "yyyy-MM-dd")
  return load().find((w) => w.date === today)
}

export function saveWorkout(workout: Workout) {
  const workouts = load()
  const idx = workouts.findIndex((w) => w.id === workout.id)
  if (idx >= 0) {
    workouts[idx] = workout
  } else {
    workouts.push(workout)
  }
  save(workouts)
}

export function deleteWorkout(id: string) {
  save(load().filter((w) => w.id !== id))
}

export function getWorkoutDates(): Set<string> {
  return new Set(load().map((w) => w.date))
}

export function startTodayWorkout(): Workout {
  const existing = getTodayWorkout()
  if (existing) return existing
  const workout: Workout = {
    id: Date.now().toString(),
    date: format(new Date(), "yyyy-MM-dd"),
    startedAt: Date.now(),
    exercises: [],
  }
  saveWorkout(workout)
  return workout
}
