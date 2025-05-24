import React, { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/text";
import { ExerciseInfo } from "@/components/excercise/ExerciseInfo";
import { LogWorkoutForm } from "@/components/LogWorkoutForm";
import { exerciseService, type Exercise } from "@/services/exerciseService";
import { useTransitionContext } from "@/components/TransitionContext";
import Animated, { FadeIn } from "react-native-reanimated";

export default function ExercisePage() {
  const { id } = useLocalSearchParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedExercise } = useTransitionContext();

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        // If we already have the exercise from the transition context, use that
        if (selectedExercise && selectedExercise.id === id) {
          setExercise(selectedExercise);
          setLoading(false);
          return;
        }        // Otherwise fetch the exercise by ID
        if (id) {
          const exerciseId = Array.isArray(id) ? id[0] : id;
          const fetchedExercise = await exerciseService.getById(exerciseId);
          if (fetchedExercise) {
            setExercise(fetchedExercise);
          } else {
            setExercise(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch exercise:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id, selectedExercise]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text>Exercise not found</Text>
      </View>
    );
  }
  return (
    <ScrollView className="flex-1 bg-background">
      <Animated.View entering={FadeIn.duration(500)} className="flex-1 px-4 py-6">
        <View className="mb-4">
          <Text className="text-2xl font-bold">{exercise.name}</Text>
        </View>
        <ExerciseInfo exercise={exercise}/>
      </Animated.View>
    </ScrollView>
  );
}