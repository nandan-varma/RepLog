import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { exportAll, importAll, listWorkouts } from '@/db';
import type { WorkoutSummary } from '@/db/types';
import { useTheme } from '@/hooks/use-theme';

export default function HistoryScreen() {
  const theme = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      listWorkouts().then(setWorkouts);
    }, []),
  );

  async function handleExport() {
    const data = await exportAll();
    const uri = FileSystem.cacheDirectory + 'replog-export.json';
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/json' });
    }
  }

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
    if (result.canceled) return;
    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    try {
      const data = JSON.parse(content);
      await importAll(data);
      setWorkouts(await listWorkouts());
      Alert.alert('Import complete', `Imported ${data.workouts?.length ?? 0} workouts.`);
    } catch {
      Alert.alert('Import failed', 'That file is not a valid RepLog export.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          History
        </ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleExport}>
            <ThemedText type="small">Export</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImport}>
            <ThemedText type="small">Import</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={workouts}
        keyExtractor={(w) => String(w.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="muted" style={styles.empty}>
            No workouts yet.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { borderColor: theme.border }]}
            onPress={() => router.push(`/workout/${item.id}`)}
          >
            <View>
              <ThemedText type="smallBold">{new Date(item.startedAt).toLocaleDateString()}</ThemedText>
              <ThemedText type="small" themeColor="muted">
                {item.exerciseCount} exercise{item.exerciseCount === 1 ? '' : 's'} · {item.setCount} set
                {item.setCount === 1 ? '' : 's'}
              </ThemedText>
            </View>
            {item.endedAt === null && (
              <ThemedText type="small" themeColor="muted">
                Active
              </ThemedText>
            )}
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
});
