import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getActiveWorkoutId, listWorkouts, startWorkout } from '@/db';
import type { WorkoutSummary } from '@/db/types';

export default function HomeScreen() {
  const [activeWorkoutId, setActiveWorkoutId] = useState<number | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setActiveWorkoutId(await getActiveWorkoutId());
        setRecentWorkouts(await listWorkouts());
      })();
    }, []),
  );

  async function handleStart() {
    const id = await startWorkout();
    router.push(`/workout/${id}`);
  }

  const lastCompleted = recentWorkouts.find((w) => w.endedAt !== null);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">RepLog</ThemedText>

      <View style={styles.cta}>
        {activeWorkoutId !== null ? (
          <Button title="Resume Workout" onPress={() => router.push(`/workout/${activeWorkoutId}`)} />
        ) : (
          <Button title="Start Workout" onPress={handleStart} />
        )}
      </View>

      <View style={styles.stats}>
        <ThemedText type="small" themeColor="muted">
          {recentWorkouts.length} workout{recentWorkouts.length === 1 ? '' : 's'} logged
        </ThemedText>
        {lastCompleted && (
          <ThemedText type="small" themeColor="muted">
            Last: {new Date(lastCompleted.startedAt).toLocaleDateString()}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  cta: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
  stats: {
    marginTop: 16,
    alignItems: 'center',
    gap: 2,
  },
});
