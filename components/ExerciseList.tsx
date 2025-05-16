import React, { useMemo } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { exerciseService, type Exercise, type ExerciseCategory } from "@/services/exerciseService";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useRouter } from "expo-router";
import { useTransitionContext } from "./TransitionContext";
import Animated, { 
  SlideInLeft, 
  FadeIn 
} from 'react-native-reanimated';

interface ExerciseListProps {
  exercises: Exercise[];
  searchQuery: string;
  category: ExerciseCategory | 'all';
}

export function ExerciseList({ exercises, searchQuery, category }: ExerciseListProps) {
  const router = useRouter();
  const { setSelectedExercise } = useTransitionContext();
  // Note: We're now doing filtering in the parent component (Home)
  // and passing already filtered exercises to this component
  const filteredExercises = exercises;
  const handleExercisePress = (exercise: Exercise): void => {
    setSelectedExercise(exercise);
    router.push({
      pathname: "/exercise",
      params: { id: exercise.id }
    })
  };
  const renderExercise = ({ item, index }: { item: Exercise; index: number }) => (
    <Animated.View
      entering={SlideInLeft.delay(index * 50).springify().damping(15)}
    >
      <TouchableOpacity 
        className="flex-row items-center p-3 bg-card rounded-lg mb-2 border border-border"
        onPress={() => handleExercisePress(item)}
      >
        <Image
          source={{ uri: exerciseService.getImageUrl(item.images[0]) }}
          className="w-16 h-16 rounded mr-3 bg-muted"
        />
        <View className="flex-1">
          <Text className="font-medium">{item.name}</Text>
          <Text className="text-muted-foreground text-sm capitalize">{item.equipment}</Text>
          <Text className="text-muted-foreground text-xs">{item.primaryMuscles.join(', ')}</Text>
        </View>
        <BookmarkButton 
          exerciseId={item.id} 
          variant="icon" 
          size="sm" 
        />
      </TouchableOpacity>
    </Animated.View>
  );
  const EmptyListComponent = () => (
    <Animated.View 
      className="py-8 items-center"
      entering={FadeIn.delay(200).duration(400)}
    >
      <Text className="text-muted-foreground">No exercises found</Text>
    </Animated.View>
  );

  // Generate a unique key for each exercise using both id and name
  const generateUniqueKey = (item: Exercise, index: number) => {
    // Use a combination of index and id to ensure uniqueness
    return `exercise-${index}-${item.id}`;
  };

  return (
    <InfiniteScroll
      data={filteredExercises}
      renderItem={renderExercise}
      keyExtractor={generateUniqueKey}
      initialNumToRender={10}
      pageSize={10}
      listEmptyComponent={<EmptyListComponent />}
    />
  );
}
