import { router, useLocalSearchParams } from 'expo-router';

import { ExerciseList } from '@/components/exercise-list';
import { ThemedView } from '@/components/themed-view';
import { addExerciseToWorkout } from '@/db';

export default function AddExerciseScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();

  async function handleSelect(exerciseId: string) {
    await addExerciseToWorkout(Number(workoutId), exerciseId);
    router.back();
  }

  return (
    <ThemedView style={{ flex: 1, paddingTop: 12 }}>
      <ExerciseList onSelect={(exercise) => handleSelect(exercise.id)} />
    </ThemedView>
  );
}
