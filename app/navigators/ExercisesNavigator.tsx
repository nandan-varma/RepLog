import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { ExerciseDetailScreen } from "@/screens/ExerciseDetailScreen"
import { ExerciseListScreen } from "@/screens/ExerciseListScreen"
import { useAppTheme } from "@/theme/context"
import type { ExercisesStackParamList } from "./navigationTypes"

const Stack = createNativeStackNavigator<ExercisesStackParamList>()

export function ExercisesNavigator() {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="ExerciseList" component={ExerciseListScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
    </Stack.Navigator>
  )
}
