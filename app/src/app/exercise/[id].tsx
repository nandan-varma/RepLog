import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addExerciseToWorkout, getActiveWorkoutId, startWorkout } from '@/db';
import { exercisesById, imageUrl } from '@/data/exercises';
import { aiTip } from '@/lib/api';
import { useTheme } from '@/hooks/use-theme';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = exercisesById[id];
  const theme = useTheme();
  const [tip, setTip] = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState<'form' | 'substitute' | null>(null);

  if (!exercise) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Exercise not found.</ThemedText>
      </ThemedView>
    );
  }

  async function handleAddToWorkout() {
    let workoutId = await getActiveWorkoutId();
    if (workoutId === null) workoutId = await startWorkout();
    await addExerciseToWorkout(workoutId, exercise.id);
    router.push(`/workout/${workoutId}`);
  }

  async function handleAskTip(kind: 'form' | 'substitute') {
    setTipLoading(kind);
    setTip(null);
    try {
      const result = await aiTip(exercise.name, kind);
      setTip(result.text);
    } catch {
      setTip("Couldn't reach AI right now.");
    } finally {
      setTipLoading(null);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: exercise.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        {exercise.images[0] && (
          <Image source={{ uri: imageUrl(exercise.images[0]) }} style={[styles.image, { borderColor: theme.border }]} contentFit="cover" />
        )}
        <ThemedText type="title" style={styles.name}>
          {exercise.name}
        </ThemedText>
        <ThemedText type="small" themeColor="muted">
          {[exercise.category, exercise.level, exercise.equipment].filter(Boolean).join(' · ')}
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="smallBold">Primary muscles</ThemedText>
          <ThemedText type="small">{exercise.primaryMuscles.join(', ') || 'None listed'}</ThemedText>
        </View>

        {exercise.secondaryMuscles.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="smallBold">Secondary muscles</ThemedText>
            <ThemedText type="small">{exercise.secondaryMuscles.join(', ')}</ThemedText>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText type="smallBold">Ask AI</ThemedText>
          <View style={styles.tipRow}>
            <TouchableOpacity
              onPress={() => handleAskTip('form')}
              disabled={tipLoading !== null}
              style={[styles.tipButton, { borderColor: theme.border }]}
            >
              {tipLoading === 'form' ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <ThemedText type="small">Explain form</ThemedText>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAskTip('substitute')}
              disabled={tipLoading !== null}
              style={[styles.tipButton, { borderColor: theme.border }]}
            >
              {tipLoading === 'substitute' ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <ThemedText type="small">Suggest substitute</ThemedText>
              )}
            </TouchableOpacity>
          </View>
          {tip && (
            <ThemedText type="small" style={styles.tipText}>
              {tip}
            </ThemedText>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Instructions</ThemedText>
          {exercise.instructions.map((step, i) => (
            <ThemedText key={i} type="small" style={styles.step}>
              {i + 1}. {step}
            </ThemedText>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.footer, { borderColor: theme.border }]}>
        <Button title="Add to Workout" onPress={handleAddToWorkout} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 4,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    marginBottom: 12,
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
  },
  section: {
    marginTop: 16,
    gap: 4,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tipButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tipText: {
    marginTop: 8,
  },
  step: {
    marginTop: 6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
