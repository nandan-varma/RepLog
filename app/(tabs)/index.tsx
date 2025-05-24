import { useState, useEffect, useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { Search } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { exerciseService, type Exercise, type ExerciseCategory, type ExerciseFilters } from "@/services/exerciseService";
import { ExerciseList } from "@/components/excercise/ExerciseList";
import { FilterSection } from "@/components/FilterSection";
import Animated, { FadeIn } from 'react-native-reanimated';
import { useOnboarding } from '@/hooks/useOnboarding';

export function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<ExerciseFilters>({
        query: "",
        category: undefined,
        level: undefined,
        equipment: undefined,
        muscle: undefined,
    });

    // Count active filters (excluding search query)
    const activeFilterCount = useMemo(() => {
        return Object.entries(filters)
            .filter(([key, value]) => key !== 'query' && value !== undefined)
            .length;
    }, [filters]);

    useEffect(() => {
        async function loadExercises() {
            setIsLoading(true);
            try {
                const data = await exerciseService.getAll();
                setExercises(data);
            } catch (error) {
                console.error("Failed to load exercises:", error);
                // Fallback to mock data if database fails
                setExercises([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadExercises();
    }, []);
    // Filter exercises based on search query and filters
    const filteredExercises = useMemo(() => {
        if (!exercises.length) return [];

        return exercises.filter(exercise => {
            // Filter by search query
            if (searchQuery && !exercise.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Filter by category
            if (filters.category && exercise.category !== filters.category) {
                return false;
            }

            // Filter by level
            if (filters.level && exercise.level !== filters.level) {
                return false;
            }

            // Filter by equipment
            if (filters.equipment && exercise.equipment !== filters.equipment) {
                return false;
            }

            // Filter by muscle (if implemented)
            if (filters.muscle && filters.muscle.length > 0) {
                const muscleMatches = exercise.primaryMuscles.some(
                    muscle => muscle.toLowerCase().includes(filters.muscle!.toLowerCase())
                );
                if (!muscleMatches) return false;
            }

            return true;
        });
    }, [exercises, searchQuery, filters]);

    return (
        <View className="p-4 space-y-6">
            <View className="py-6">
                <View className="space-y-2">
                    <View className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search exercises..."
                            className="pl-9 pr-3"
                            value={searchQuery}
                            onChange={(e) => {
                                const text = e.nativeEvent.text;
                                setSearchQuery(text);
                                setFilters(prev => ({ ...prev, query: text }));
                            }}
                        />
                    </View>

                    <FilterSection
                        filters={filters}
                        onFiltersChange={setFilters}
                        activeFilterCount={activeFilterCount}
                    />
                </View>
            </View>            {isLoading ? (
                <Animated.View
                    className="mt-4 flex items-center justify-center py-8"
                    entering={FadeIn.duration(400)}
                >
                    <ActivityIndicator size="small" className="mb-2" />
                    <Text>Loading exercises...</Text>
                </Animated.View>
            ) : (
                <ExerciseList
                    exercises={filteredExercises}
                    searchQuery={searchQuery}
                    category={filters.category || 'all'}
                />
            )}
        </View>
    )
}

export default function IndexPage() {
    const { showMainContent } = useOnboarding();
    
    // Render home screen with a nice fade-in animation once onboarding is completed
    return (
        <Animated.View 
            className="flex-1"
            entering={FadeIn.delay(100).duration(500)}
        >
            <Home />
        </Animated.View>
    );
}