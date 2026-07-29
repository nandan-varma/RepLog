import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { EXERCISE_CATEGORIES, type Exercise, type ExerciseCategory } from 'replog-shared';

import { ExerciseRow } from '@/components/exercise-row';
import { ThemedText } from '@/components/themed-text';
import { searchExercises, type ExerciseFilters } from '@/data/search';
import { aiSearch } from '@/lib/api';
import { useTheme } from '@/hooks/use-theme';

export function ExerciseList({ onSelect }: { onSelect: (exercise: Exercise) => void }) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [aiFilters, setAiFilters] = useState<ExerciseFilters | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const results = useMemo(
    () => (aiFilters ? searchExercises('', aiFilters) : searchExercises(query, category ? { category } : undefined)),
    [query, category, aiFilters],
  );

  async function handleAskAI() {
    if (!query.trim()) return;
    setAiLoading(true);
    try {
      const filters = await aiSearch(query);
      setAiFilters({
        category: filters.category as ExerciseCategory | undefined,
        equipment: filters.equipment ?? undefined,
        muscle: filters.muscle ?? undefined,
        level: filters.level as ExerciseFilters['level'],
      });
      setCategory(null);
    } catch {
      // AI search is an enhancement - local text search below still works.
    } finally {
      setAiLoading(false);
    }
  }

  function handleChangeQuery(text: string) {
    setQuery(text);
    setAiFilters(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={handleChangeQuery}
          placeholder="Search exercises, or ask AI"
          placeholderTextColor={theme.muted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          selectionColor={theme.text}
          cursorColor={theme.text}
          autoCorrect={false}
          onSubmitEditing={handleAskAI}
        />
        <TouchableOpacity
          onPress={handleAskAI}
          disabled={aiLoading || !query.trim()}
          style={[styles.askButton, { borderColor: theme.border, opacity: query.trim() ? 1 : 0.4 }]}
        >
          {aiLoading ? <ActivityIndicator color={theme.text} /> : <ThemedText type="small">Ask AI</ThemedText>}
        </TouchableOpacity>
      </View>
      {aiFilters && (
        <TouchableOpacity onPress={() => setAiFilters(null)} style={styles.aiBanner}>
          <ThemedText type="small" themeColor="muted">
            AI filters applied · tap to clear
          </ThemedText>
        </TouchableOpacity>
      )}
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
              onPress={() => {
                setCategory(active ? null : item);
                setAiFilters(null);
              }}
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
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  askButton: {
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBanner: {
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
