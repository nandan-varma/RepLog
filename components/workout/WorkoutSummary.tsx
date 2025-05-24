import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text } from '../ui/text';
import { Card, CardContent } from '../ui/card';
import { Workout } from '@/services/workoutService';
import { exerciseService } from '@/services/exerciseService';

type WorkoutSummaryProps = {
  workouts: Workout[];
};

type ExerciseInfo = {
  id: string;
  name: string;
};

type WorkoutWithExercise = Workout & {
  exerciseName: string;
};

export default function WorkoutSummary({ workouts }: WorkoutSummaryProps) {
  const [workoutsWithExercises, setWorkoutsWithExercises] = useState<WorkoutWithExercise[]>([]);

  useEffect(() => {
    const fetchExerciseInfo = async () => {
      // Create a map to hold exercise info so we don't fetch the same exercise multiple times
      const exerciseInfoMap = new Map<string, ExerciseInfo>();
        // Get exercise details for each workout
      for (const workout of workouts) {
        if (!workout.exerciseId) continue;
        
        if (!exerciseInfoMap.has(workout.exerciseId)) {
          try {
            const exercise = await exerciseService.getExerciseById(workout.exerciseId);
            if (exercise) {
              exerciseInfoMap.set(workout.exerciseId, {
                id: exercise.id,
                name: exercise.name
              });
            } else {
              // If exercise not found, add placeholder data
              exerciseInfoMap.set(workout.exerciseId, {
                id: workout.exerciseId,
                name: 'Unknown Exercise'
              });
            }
          } catch (error) {
            console.error('Failed to fetch exercise info:', error);
            // Add placeholder data in case of error
            exerciseInfoMap.set(workout.exerciseId, {
              id: workout.exerciseId,
              name: 'Unknown Exercise'
            });
          }
        }
      }
      
      // Map workouts to include exercise name
      const enhancedWorkouts = workouts.map(workout => ({
        ...workout,
        exerciseName: workout.exerciseId 
          ? exerciseInfoMap.get(workout.exerciseId)?.name || 'Unknown Exercise'
          : 'Unknown Exercise'
      }));
      
      setWorkoutsWithExercises(enhancedWorkouts);
    };
    
    fetchExerciseInfo();
  }, [workouts]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };
    const renderWorkoutItem = ({ item }: { item: WorkoutWithExercise }) => (
    <Card className="mb-3 bg-black border-gray-700">
      <CardContent>
        <Text className="text-lg font-semibold mb-1 text-white">{item.exerciseName}</Text>
        <View className="flex-row flex-wrap mt-2 mb-2">
          <View className="mr-5 mb-2">
            <Text className="text-sm text-gray-400">Sets</Text>
            <Text className="text-base text-white">{item.sets}</Text>
          </View>
          
          <View className="mr-5 mb-2">
            <Text className="text-sm text-gray-400">Reps</Text>
            <Text className="text-base text-white">{item.reps}</Text>
          </View>
          
          {item.weight ? (
            <View className="mr-5 mb-2">
              <Text className="text-sm text-gray-400">Weight</Text>
              <Text className="text-base text-white">{item.weight} kg</Text>
            </View>
          ) : null}
          
          {item.duration ? (
            <View className="mr-5 mb-2">
              <Text className="text-sm text-gray-400">Duration</Text>
              <Text className="text-base text-white">{formatDuration(item.duration)}</Text>
            </View>
          ) : null}
        </View>
        
        {item.notes ? (
          <View className="mt-2 pt-2 border-t border-[#444444]">
            <Text className="text-sm text-gray-400">Notes</Text>
            <Text className="text-base text-white">{item.notes}</Text>
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
  return (
    <View className="flex-1 bg-black">
      <Text className="text-xl font-bold mb-3 text-white">
        Workout Summary
      </Text>
      <FlatList
        data={workoutsWithExercises}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

