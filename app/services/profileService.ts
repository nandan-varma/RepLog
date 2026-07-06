import { MMKV } from "react-native-mmkv"

const storage = new MMKV({ id: "profile-storage" })

export type FitnessGoal = "lose_weight" | "build_muscle" | "improve_endurance" | "stay_active"
export type WeightUnit = "kg" | "lbs"

export interface UserProfile {
  name: string
  fitnessGoal: FitnessGoal
  bookmarks: string[]
  apiKey: string
  weightUnit: WeightUnit
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  fitnessGoal: "build_muscle",
  bookmarks: [],
  apiKey: "",
  weightUnit: "kg",
}

export function getProfile(): UserProfile {
  const raw = storage.getString("user_profile")
  return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE
}

export function saveProfile(profile: UserProfile) {
  storage.set("user_profile", JSON.stringify(profile))
}

export function isOnboarded(): boolean {
  return !!getProfile().name
}

export function toggleBookmark(exerciseId: string): boolean {
  const profile = getProfile()
  const idx = profile.bookmarks.indexOf(exerciseId)
  if (idx >= 0) {
    profile.bookmarks.splice(idx, 1)
  } else {
    profile.bookmarks.push(exerciseId)
  }
  saveProfile(profile)
  return idx < 0 // true if now bookmarked
}

export function isBookmarked(exerciseId: string): boolean {
  return getProfile().bookmarks.includes(exerciseId)
}
