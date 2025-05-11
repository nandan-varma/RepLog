import { useState, useEffect } from "react";
import { View } from "react-native";
import { Search, Filter } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { exerciseService, type Exercise, type ExerciseCategory } from "@/services/exerciseService";
import { ExerciseList } from "@/components/ExerciseList";

export function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedTab, setSelectedTab] = useState<ExerciseCategory | 'all'>("all");
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        async function loadExercises() {
            setIsLoading(true);
            try {
                const data = await exerciseService.getAll();
                setExercises(data);
            } catch (error) {
                console.error("Failed to load exercises:", error);
                // Fallback to mock data if database fails
                setExercises(mockExercises as unknown as Exercise[]);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadExercises();
    }, []);

    // Mock data for fallback
    const mockExercises = [
        {
            id: "1",
            name: "Barbell Bench Press",
            level: "intermediate",
            equipment: "barbell",
            primaryMuscles: ["chest"],
            category: "strength",
            images: ["/placeholder.svg?height=200&width=300"],
        },
        {
            id: "2",
            name: "Pull-ups",
            level: "intermediate",
            equipment: "body only",
            primaryMuscles: ["lats"],
            category: "strength",
            images: ["/placeholder.svg?height=200&width=300"],
        },
        {
            id: "3",
            name: "Squats",
            level: "beginner",
            equipment: "body only",
            primaryMuscles: ["quadriceps"],
            category: "strength",
            images: ["/placeholder.svg?height=200&width=300"],
        },
        {
            id: "4",
            name: "Deadlift",
            level: "intermediate",
            equipment: "barbell",
            primaryMuscles: ["lower back"],
            category: "powerlifting",
            images: ["/placeholder.svg?height=200&width=300"],
        },
        {
            id: "5",
            name: "Treadmill Running",
            level: "beginner",
            equipment: "machine",
            primaryMuscles: ["quadriceps"],
            category: "cardio",
            images: ["/placeholder.svg?height=200&width=300"],
        },
    ]
    
    return (
        <View className="p-4 space-y-6">
            <View className="relative py-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search exercises..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.nativeEvent.text)}
                />
            </View>

            <Tabs
                value={selectedTab}
                onValueChange={(value) => setSelectedTab(value as ExerciseCategory | 'all')}
                className="w-full"
            >
                <TabsList className="flex-row w-full">
                    <TabsTrigger value="all" className="flex-1">
                        <Text>All</Text>
                    </TabsTrigger>
                    <TabsTrigger value="strength" className="flex-1">
                        <Text>Strength</Text>
                    </TabsTrigger>
                    <TabsTrigger value="cardio" className="flex-1">
                        <Text>Cardio</Text>
                    </TabsTrigger>
                    <TabsTrigger value="stretching" className="flex-1">
                        <Text>Stretching</Text>
                    </TabsTrigger>
                </TabsList>
                
                {isLoading ? (
                    <View className="mt-4 flex items-center justify-center py-8">
                        <Text>Loading exercises...</Text>
                    </View>
                ) : (
                    <>
                        <TabsContent value="all" className="mt-4">
                            <ExerciseList 
                                exercises={exercises} 
                                searchQuery={searchQuery}
                                category="all"
                            />
                        </TabsContent>
                        <TabsContent value="strength" className="mt-4">
                            <ExerciseList 
                                exercises={exercises} 
                                searchQuery={searchQuery}
                                category="strength"
                            />
                        </TabsContent>
                        <TabsContent value="cardio" className="mt-4">
                            <ExerciseList 
                                exercises={exercises} 
                                searchQuery={searchQuery}
                                category="cardio"
                            />
                        </TabsContent>
                        <TabsContent value="stretching" className="mt-4">
                            <ExerciseList 
                                exercises={exercises} 
                                searchQuery={searchQuery}
                                category="stretching"
                            />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </View>
    )
}

export default Home;