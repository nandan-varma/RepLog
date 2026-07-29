import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/button';
import { QuickLogInput } from '@/components/quick-log-input';
import { RestTimer } from '@/components/rest-timer';
import { SetInput } from '@/components/set-input';
import { SetRow } from '@/components/set-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { exercisesById } from '@/data/exercises';
import { addSet, DEFAULT_UNIT, endWorkout, getWorkout, removeExerciseFromWorkout } from '@/db';
import type { WorkoutDetail } from '@/db/types';
import { aiSummary } from '@/lib/api';
import { useTheme } from '@/hooks/use-theme';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workoutId = Number(id);
  const theme = useTheme();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const load = useCallback(async () => {
    setWorkout(await getWorkout(workoutId));
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!workout) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading…</ThemedText>
      </ThemedView>
    );
  }

  const isActive = workout.endedAt === null;

  async function handleAddSet(workoutExerciseId: number, set: { weight: number; reps: number }) {
    await addSet(workoutExerciseId, { ...set, unit: DEFAULT_UNIT });
    setRestStartedAt(Date.now());
    await load();
  }

  async function handleQuickLog(workoutExerciseId: number, sets: { weight: number; reps: number }[]) {
    for (const set of sets) {
      await addSet(workoutExerciseId, { ...set, unit: DEFAULT_UNIT });
    }
    setRestStartedAt(Date.now());
    await load();
  }

  async function handleRemoveExercise(workoutExerciseId: number) {
    await removeExerciseFromWorkout(workoutExerciseId);
    await load();
  }

  async function handleFinish() {
    await endWorkout(workoutId);
    const finished = await getWorkout(workoutId);
    await load();
    if (finished) {
      const exerciseNames = finished.exercises.map((we) => exercisesById[we.exerciseId]?.name ?? we.exerciseId);
      const totalSets = finished.exercises.reduce((sum, we) => sum + we.sets.length, 0);
      if (totalSets > 0) {
        aiSummary(exerciseNames, totalSets)
          .then((result) => setSummary(result.text))
          .catch(() => {});
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isActive ? 'Active Workout' : new Date(workout.startedAt).toLocaleDateString(),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {workout.exercises.length === 0 && (
          <ThemedText type="small" themeColor="muted">
            No exercises yet.
          </ThemedText>
        )}
        {workout.exercises.map((we) => {
          const exercise = exercisesById[we.exerciseId];
          const lastSet = we.sets[we.sets.length - 1];
          return (
            <View key={we.id} style={[styles.card, { borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <ThemedText type="smallBold">{exercise?.name ?? we.exerciseId}</ThemedText>
                {isActive && (
                  <TouchableOpacity onPress={() => handleRemoveExercise(we.id)} hitSlop={8}>
                    <ThemedText type="small" themeColor="muted">
                      Remove
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              {we.sets.map((set, i) => (
                <SetRow key={set.id} set={set} index={i} />
              ))}
              {isActive && (
                <>
                  <SetInput
                    unit={DEFAULT_UNIT}
                    defaultWeight={lastSet?.weight}
                    defaultReps={lastSet?.reps}
                    onAdd={(set) => handleAddSet(we.id, set)}
                  />
                  <QuickLogInput onParsed={(sets) => handleQuickLog(we.id, sets)} />
                </>
              )}
            </View>
          );
        })}

        {!isActive && summary && (
          <View style={[styles.card, { borderColor: theme.border }]}>
            <ThemedText type="small">{summary}</ThemedText>
          </View>
        )}

        {restStartedAt && (
          <RestTimer key={restStartedAt} startedAt={restStartedAt} onDismiss={() => setRestStartedAt(null)} />
        )}

        {isActive && (
          <View style={styles.addExercise}>
            <Button
              title="Add Exercise"
              variant="secondary"
              onPress={() => router.push(`/workout/add-exercise?workoutId=${workoutId}`)}
            />
          </View>
        )}
      </ScrollView>

      {isActive && (
        <View style={[styles.footer, { borderColor: theme.border }]}>
          <Button title="Finish Workout" onPress={handleFinish} />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addExercise: {
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
