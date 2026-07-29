import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { exercises } from '@/data/exercises';

export default function LibraryScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Library</ThemedText>
      <ThemedText type="small">{exercises.length} exercises</ThemedText>
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
