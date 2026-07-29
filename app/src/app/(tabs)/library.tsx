import { StyleSheet } from 'react-native';
import { EXERCISE_CATEGORIES } from 'replog-shared';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LibraryScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Library</ThemedText>
      <ThemedText type="small">{EXERCISE_CATEGORIES.length} categories</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});
