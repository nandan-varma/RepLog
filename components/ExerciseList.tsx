import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TextInput, View as RNView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import ExerciseCard from '@/components/ExerciseCard';
import { fetchExercises, Exercise, saveExercisesToDb, searchExercises } from '@/services/exerciseService';
import { useNavigation } from '@react-navigation/native';
import theme from '@/constants/theme';

export default function ExerciseList() {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const fetchedExercises = await fetchExercises();
      if (fetchedExercises.length > 0) {
        await saveExercisesToDb(fetchedExercises);
        setExercises(fetchedExercises);
      } else {
        await loadLocalExercises();
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      await loadLocalExercises();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalExercises = async () => {
    try {
      const localExercises = await searchExercises('');
      setExercises(localExercises);
    } catch (error) {
      console.error('Error loading local exercises:', error);
    }
  };

  const searchForExercises = useCallback(async (query: string) => {
    try {
      const results = await searchExercises(query);
      setExercises(results);
    } catch (error) {
      console.error('Error searching exercises:', error);
    }
  }, []);

  // Load exercises on initial render
  useEffect(() => {
    loadExercises();
  }, []);

  // Handle search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        searchForExercises(searchQuery);
      } else {
        loadLocalExercises();
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchForExercises]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  };  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.light.primary} />
        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <RNView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
      </RNView>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No exercises found matching your search.' : 'No exercises found. Pull to refresh.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.light.border,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.light.background,
  },
  listContent: {
    padding: 16,
  },  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.light.mutedForeground,
  },
});
