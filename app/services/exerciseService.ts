import { MMKV } from "react-native-mmkv"

const storage = new MMKV({ id: "exercise-storage" })

const API_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
export const IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/"

export interface Exercise {
  id: string
  name: string
  force: "pull" | "push" | "static" | null
  level: "beginner" | "intermediate" | "expert"
  mechanic: "compound" | "isolation" | null
  equipment: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string
  images: [string, string]
}

export type MuscleGroup =
  | "abdominals" | "abductors" | "adductors" | "biceps" | "calves"
  | "chest" | "forearms" | "glutes" | "hamstrings" | "lats"
  | "lower back" | "middle back" | "neck" | "quadriceps"
  | "shoulders" | "traps" | "triceps"

export type Equipment =
  | "body only" | "barbell" | "dumbbell" | "cable" | "machine"
  | "kettlebells" | "bands" | "exercise ball" | "medicine ball"
  | "foam roll" | "e-z curl bar" | "other"

export type Category =
  | "strength" | "cardio" | "stretching" | "powerlifting"
  | "plyometrics" | "olympic weightlifting" | "strongman"

let _exercises: Exercise[] | null = null

export async function getExercises(): Promise<Exercise[]> {
  if (_exercises) return _exercises

  const cached = storage.getString("exercises_cache")
  if (cached) {
    _exercises = JSON.parse(cached)
    return _exercises!
  }

  const res = await fetch(API_URL)
  const data: Exercise[] = await res.json()
  storage.set("exercises_cache", JSON.stringify(data))
  _exercises = data
  return data
}

export function getExerciseById(id: string): Exercise | undefined {
  return _exercises?.find((e) => e.id === id)
}

export function getImageUrl(imagePath: string): string {
  return IMAGE_BASE_URL + imagePath
}

export interface ExerciseFilter {
  search?: string
  muscle?: string
  equipment?: string
  level?: string
  category?: string
}

export function filterExercises(exercises: Exercise[], filter: ExerciseFilter): Exercise[] {
  let result = exercises

  if (filter.search) {
    const q = filter.search.toLowerCase()
    result = result.filter((e) => e.name.toLowerCase().includes(q))
  }
  if (filter.muscle) {
    result = result.filter(
      (e) =>
        e.primaryMuscles.includes(filter.muscle!) ||
        e.secondaryMuscles.includes(filter.muscle!),
    )
  }
  if (filter.equipment) {
    result = result.filter((e) => e.equipment === filter.equipment)
  }
  if (filter.level) {
    result = result.filter((e) => e.level === filter.level)
  }
  if (filter.category) {
    result = result.filter((e) => e.category === filter.category)
  }

  return result
}
