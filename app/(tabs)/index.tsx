import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TextInput, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useFocusEffect } from '@react-navigation/native';
import { fetchExercises, saveExercisesToDb, searchExercises, type ExerciseFilters } from '@/services/exerciseService';
import type { Exercise } from '@/services/exerciseService';
import ExerciseCard from '@/components/ExerciseCard';
import { Ionicons } from '@expo/vector-icons';
import theme from '@/constants/theme';

export default function ExercisesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = theme[colorScheme];
  
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<ExerciseFilters>({
    query: '',
    level: undefined,
    equipment: undefined,
    category: undefined,
    muscle: undefined
  });

  // Filter options using typed arrays based on database schema
  const levels: Exercise['level'][] = ['beginner', 'intermediate', 'expert'];
  const equipment: NonNullable<Exercise['equipment']>[] = [
    'medicine ball', 'dumbbell', 'body only', 'bands', 'kettlebells',
    'foam roll', 'cable', 'machine', 'barbell', 'exercise ball',
    'e-z curl bar', 'other'
  ];
  const categories: Exercise['category'][] = [
    'powerlifting', 'strength', 'stretching', 'cardio', 
    'olympic weightlifting', 'strongman', 'plyometrics'
  ];
  const muscles = [
    'abdominals', 'abductors', 'adductors', 'biceps', 'calves',
    'chest', 'forearms', 'glutes', 'hamstrings', 'lats', 
    'lower back', 'middle back', 'neck', 'quadriceps',
    'shoulders', 'traps', 'triceps'
  ];

  // Load exercises on initial render
  useEffect(() => {
    loadExercises();
  }, []);

  // Refresh exercises when tab is focused or filters change
  useFocusEffect(
    useCallback(() => {
      applyFilters();
    }, [searchQuery, filters])
  );

  // Load exercises from API and save to local DB
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

  // Load exercises from local DB
  const loadLocalExercises = async () => {
    try {
      const localExercises = await searchExercises({});
      setExercises(localExercises);
    } catch (error) {
      console.error('Error loading local exercises:', error);
    }
  };

  // Apply filters and search
  const applyFilters = async () => {
    try {
      // Update the filters object with the current search query
      const currentFilters: ExerciseFilters = {
        ...filters,
        query: searchQuery
      };
      
      const results = await searchExercises(currentFilters);
      setExercises(results);
    } catch (error) {
      console.error('Error searching exercises:', error);
    }
  };
  
  // Update a single filter and apply all filters
  const updateFilter = (key: keyof ExerciseFilters, value: string) => {
    setFilters(prev => {
      // If the same value is selected, clear it (toggle behavior)
      // Need to handle proper types for each filter key
      if (key === 'level' && prev.level === value) {
        return { ...prev, [key]: undefined };
      } else if (key === 'equipment' && prev.equipment === value) {
        return { ...prev, [key]: undefined };
      } else if (key === 'category' && prev.category === value) {
        return { ...prev, [key]: undefined };
      } else if (key === 'muscle' && prev.muscle === value) {
        return { ...prev, [key]: undefined };
      } else {
        // For all other cases, set the value as is
        return { ...prev, [key]: value };
      }
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      query: '',
      level: undefined,
      equipment: undefined,
      category: undefined,
      muscle: undefined
    });
    setSearchQuery('');
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.foreground }]}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: themeColors.muted }]}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: themeColors.background }]}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: themeColors.background }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons 
              name={showFilters ? "options" : "options-outline"} 
              size={24} 
              color={filters.level || filters.equipment || filters.category || filters.muscle ? 
                themeColors.primary : themeColors.foreground} 
            />
          </TouchableOpacity>
        </View>
        
        {showFilters && (
          <View style={[styles.filtersContainer, { backgroundColor: themeColors.background }]}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.clearFiltersText, { color: themeColors.primary }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.filterGroupTitle}>Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsContainer}>
              {levels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterChip,
                    { backgroundColor: themeColors.muted, borderColor: themeColors.border },
                    filters.level === level && [styles.filterChipActive, { backgroundColor: themeColors.primary }]
                  ]}
                  onPress={() => updateFilter('level', level)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.level === level && styles.filterChipTextActive
                  ]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.filterGroupTitle}>Equipment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsContainer}>
              {equipment.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterChip,
                    { backgroundColor: themeColors.muted, borderColor: themeColors.border },
                    filters.equipment === item && [styles.filterChipActive, { backgroundColor: themeColors.primary }]
                  ]}
                  onPress={() => updateFilter('equipment', item)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.equipment === item && styles.filterChipTextActive
                  ]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.filterGroupTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    { backgroundColor: themeColors.muted, borderColor: themeColors.border },
                    filters.category === category && [styles.filterChipActive, { backgroundColor: themeColors.primary }]
                  ]}
                  onPress={() => updateFilter('category', category)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.category === category && styles.filterChipTextActive
                  ]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.filterGroupTitle}>Muscle Group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsContainer}>
              {muscles.map(muscle => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.filterChip,
                    { backgroundColor: themeColors.muted, borderColor: themeColors.border },
                    filters.muscle === muscle && [styles.filterChipActive, { backgroundColor: themeColors.primary }]
                  ]}
                  onPress={() => updateFilter('muscle', muscle)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.muscle === muscle && styles.filterChipTextActive
                  ]}>
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      <FlatList
        data={exercises}
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          (filters.level || filters.equipment || filters.category || filters.muscle) ? (
            <View style={[styles.activeFiltersContainer, { backgroundColor: themeColors.background }]}>
              <Text style={[styles.activeFiltersTitle, { color: themeColors.foreground }]}>Active filters:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
                {filters.level && (
                  <TouchableOpacity 
                    style={[styles.activeFilterChip, { backgroundColor: themeColors.primary }]}
                    onPress={() => updateFilter('level', filters.level as string)}
                  >
                    <Text style={[styles.activeFilterChipText, { color: themeColors.primaryForeground }]}>
                      Level: {filters.level.charAt(0).toUpperCase() + filters.level.slice(1)}
                    </Text>
                    <Ionicons name="close-circle" size={16} color={themeColors.primaryForeground} />
                  </TouchableOpacity>
                )}
                {filters.equipment && (
                  <TouchableOpacity 
                    style={[styles.activeFilterChip, { backgroundColor: themeColors.primary }]}
                    onPress={() => updateFilter('equipment', filters.equipment as string)}
                  >
                    <Text style={[styles.activeFilterChipText, { color: themeColors.primaryForeground }]}>
                      Equipment: {filters.equipment.charAt(0).toUpperCase() + filters.equipment.slice(1)}
                    </Text>
                    <Ionicons name="close-circle" size={16} color={themeColors.primaryForeground} />
                  </TouchableOpacity>
                )}
                {filters.category && (
                  <TouchableOpacity 
                    style={[styles.activeFilterChip, { backgroundColor: themeColors.primary }]}
                    onPress={() => updateFilter('category', filters.category as string)}
                  >
                    <Text style={[styles.activeFilterChipText, { color: themeColors.primaryForeground }]}>
                      Category: {filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}
                    </Text>
                    <Ionicons name="close-circle" size={16} color={themeColors.primaryForeground} />
                  </TouchableOpacity>
                )}
                {filters.muscle && (
                  <TouchableOpacity 
                    style={[styles.activeFilterChip, { backgroundColor: themeColors.primary }]}
                    onPress={() => updateFilter('muscle', filters.muscle as string)}
                  >
                    <Text style={[styles.activeFilterChipText, { color: themeColors.primaryForeground }]}>
                      Muscle: {filters.muscle.charAt(0).toUpperCase() + filters.muscle.slice(1)}
                    </Text>
                    <Ionicons name="close-circle" size={16} color={themeColors.primaryForeground} />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: themeColors.foreground }]}>
              {searchQuery || filters.level || filters.equipment || filters.category || filters.muscle ? 
                'No exercises found matching your search and filters.' : 
                'No exercises found. Pull to refresh.'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  searchContainer: {
    padding: 10,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearFiltersText: {
    fontSize: 14,
  },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipActive: {
    // Background color is applied dynamically
  },
  filterChipText: {
    fontSize: 14,
  },
  filterChipTextActive: {
    color: 'white',
  },
  activeFiltersContainer: {
    padding: 10,
  },
  activeFiltersTitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  activeFiltersScroll: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  activeFilterChip: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    marginRight: 8,
  },
  activeFilterChipText: {
    fontSize: 14,
    marginRight: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
