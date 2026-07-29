import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ExerciseList } from '@/components/exercise-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LibraryScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Library
      </ThemedText>
      <ExerciseList onSelect={(exercise) => router.push(`/exercise/${exercise.id}`)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
});
