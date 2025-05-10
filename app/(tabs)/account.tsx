import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, useColorScheme, View as RNView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View } from '@/components/Themed';
import { getAllWorkoutLogs, deleteWorkoutLog } from '@/services/workoutService';
import { getExerciseById } from '@/services/exerciseService';
import type { WorkoutLog } from '@/services/workoutService';
import theme from '@/constants/theme';

type WorkoutLogWithExercise = WorkoutLog & { exerciseName?: string };

export default function WorkoutHistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = theme[colorScheme];

  const [workouts, setWorkouts] = useState<WorkoutLogWithExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const logs = await getAllWorkoutLogs();
      
      // Fetch exercise names for each workout
      const enhancedLogs = await Promise.all(
        logs.map(async (log) => {
          const exercise = log.exerciseId ? await getExerciseById(log.exerciseId) : null;
          return {
            ...log,
            exerciseName: exercise?.name || 'Unknown Exercise'
          };
        })
      );
      
      setWorkouts(enhancedLogs);
    } catch (error) {
      console.error('Error loading workout logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load workouts when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  // Group workouts by date
  const groupWorkoutsByDate = (logs: WorkoutLogWithExercise[]) => {
    const groupedLogs: Record<string, WorkoutLogWithExercise[]> = {};
    
    logs.forEach(log => {
      if (!groupedLogs[log.date]) {
        groupedLogs[log.date] = [];
      }
      groupedLogs[log.date].push(log);
    });
    
    return Object.entries(groupedLogs)
      .map(([date, logs]) => ({
        date,
        logs,
        formattedDate: formatDate(date)
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Handle deleting a workout log
  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout log?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteWorkoutLog(id);
              if (success) {
                // Remove from state
                setWorkouts(workouts.filter(workout => workout.id !== id));
              } else {
                Alert.alert('Error', 'Failed to delete workout log');
              }
            } catch (error) {
              console.error('Error deleting workout log:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  // Create dynamic styles based on the current theme
  const styles = createStyles(themeColors);

  // Render a workout log item
  const renderWorkoutItem = ({ item }: { item: WorkoutLogWithExercise }) => {
    return (
      <View style={styles.workoutCard}>
        <RNView style={styles.workoutHeader}>
          <Text style={styles.exerciseName}>{item.exerciseName}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </RNView>
        
        <RNView style={styles.workoutDetails}>
          <Text style={styles.detailText}>Sets: {item.sets}</Text>
          <Text style={styles.detailText}>Reps: {item.reps}</Text>
          {item.weight ? <Text style={styles.detailText}>Weight: {item.weight} kg</Text> : null}
        </RNView>
        
        {item.notes ? (
          <Text style={styles.notes}>{item.notes}</Text>
        ) : null}
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id!)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout History</Text>
      
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <RNView style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading workout history...' : 'No workouts logged yet. Go to the Exercises tab to log one!'}
            </Text>
          </RNView>
        }
      />
    </View>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: themeColors.foreground,
  },
  listContent: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: themeColors.card,
    borderRadius: theme.radius,
    padding: 16,
    marginBottom: 16,
    shadowColor: themeColors.foreground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: themeColors.cardForeground,
  },
  date: {
    fontSize: 14,
    color: themeColors.mutedForeground,
  },
  workoutDetails: {
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  detailText: {
    fontSize: 16,
    marginRight: 16,
    color: themeColors.cardForeground,
  },
  notes: {
    fontSize: 14,
    color: themeColors.mutedForeground,
    fontStyle: 'italic',
    marginTop: 8,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: themeColors.destructive,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: themeColors.mutedForeground,
    textAlign: 'center',
  },
});
