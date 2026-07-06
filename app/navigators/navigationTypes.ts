import { ComponentProps } from "react"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

export type AppStackParamList = {
  Onboarding: undefined
  Main: NavigatorScreenParams<MainTabParamList>
}

export type MainTabParamList = {
  Exercises: NavigatorScreenParams<ExercisesStackParamList>
  Log: undefined
  History: undefined
  AI: undefined
  Profile: undefined
}

export type ExercisesStackParamList = {
  ExerciseList: { selectMode?: boolean } | undefined
  ExerciseDetail: { exerciseId: string }
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

export type ExercisesStackScreenProps<T extends keyof ExercisesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ExercisesStackParamList, T>,
    MainTabScreenProps<keyof MainTabParamList>
  >

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}
