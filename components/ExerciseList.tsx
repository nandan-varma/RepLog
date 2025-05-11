import React, { useMemo } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Text } from "@/components/ui/text";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { type Exercise, type ExerciseCategory } from "@/services/exerciseService";

interface ExerciseListProps {
  exercises: Exercise[];
  searchQuery: string;
  category: ExerciseCategory | 'all';
}

export function ExerciseList({ exercises, searchQuery, category }: ExerciseListProps) {
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === 'all' || exercise.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [exercises, searchQuery, category]);

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
      className="flex-row items-center p-3 bg-card rounded-lg mb-2 border border-border"
    >
      <Image 
        source={{ uri: item.images[0] || "/placeholder.svg" }}
        className="w-16 h-16 rounded mr-3 bg-muted"
      />
      <View className="flex-1">
        <Text className="font-medium">{item.name}</Text>
        <Text className="text-muted-foreground text-sm capitalize">{item.equipment}</Text>
        <Text className="text-muted-foreground text-xs">{item.primaryMuscles.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => (
    <View className="py-8 items-center">
      <Text className="text-muted-foreground">No exercises found</Text>
    </View>
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
