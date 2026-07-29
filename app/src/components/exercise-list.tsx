import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { EXERCISE_CATEGORIES, type Exercise, type ExerciseCategory } from 'replog-shared';

import { ExerciseRow } from '@/components/exercise-row';
import { ThemedText } from '@/components/themed-text';
import { searchExercises } from '@/data/search';
import { useTheme } from '@/hooks/use-theme';

export function ExerciseList({ onSelect }: { onSelect: (exercise: Exercise) => void }) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | null>(null);

  const results = useMemo(
    () => searchExercises(query, category ? { category } : undefined),
    [query, category],
  );

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search exercises"
        placeholderTextColor={theme.muted}
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        selectionColor={theme.text}
        cursorColor={theme.text}
        autoCorrect={false}
      />
      <FlatList
        horizontal
        data={EXERCISE_CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => {
          const active = category === item;
          return (
            <TouchableOpacity
              onPress={() => setCategory(active ? null : item)}
              style={[
                styles.chip,
                { borderColor: theme.border, backgroundColor: active ? theme.text : theme.background },
              ]}
            >
              <ThemedText type="small" style={{ color: active ? theme.background : theme.text }}>
                {item}
              </ThemedText>
            </TouchableOpacity>
          );
        }}
      />
      <FlatList
        data={results}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <ExerciseRow exercise={item} onPress={() => onSelect(item)} />}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="muted" style={styles.empty}>
            No exercises match.
          </ThemedText>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 8,
  },
  chipRow: {
    flexGrow: 0,
    marginVertical: 12,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
});
