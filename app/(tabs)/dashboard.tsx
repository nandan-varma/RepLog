import { useState, useEffect } from "react"
import { Bookmark, Activity, CalendarIcon } from "lucide-react-native"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ExerciseCard } from "@/components/ExerciseCard"
import { ScrollArea } from "@/components/ScrollArea"
import { View } from "react-native"
import { Text } from "@/components/ui/text"
import { bookmarkService } from "@/services/bookmarkService"
import { workoutService } from "@/services/workoutService"
import { exerciseService, type Exercise } from "@/services/exerciseService"
import { type Workout } from "@/services/workoutService"

export function Dashboard() {
    const [tab, setTab] = useState("bookmarks")
    const [bookmarkedExercises, setBookmarkedExercises] = useState<Exercise[]>([])
    const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
    const [workoutStats, setWorkoutStats] = useState({
        thisMonth: 0,
        totalExercises: 0,
        progress: {
            strength: 0,
            cardio: 0,
            flexibility: 0
        }
    })
    const [isLoading, setIsLoading] = useState(true)

    // Load bookmarked exercises
    useEffect(() => {
        async function loadBookmarkedExercises() {
            try {
                // Get all bookmarks
                const bookmarks = await bookmarkService.getAll()
                
                // Get complete exercise data for each bookmark
                const exercises = await Promise.all(
                    bookmarks.map(async (bookmark) => {
                        const exercise = await exerciseService.getById(bookmark.exerciseId)
                        return exercise
                    })
                )
                
                // Filter out any undefined/failed results
                setBookmarkedExercises(exercises.filter(Boolean) as Exercise[])
            } catch (error) {
                console.error("Failed to load bookmarks:", error)
                setBookmarkedExercises([])
            }
        }
        
        loadBookmarkedExercises()
    }, [])

    // Load workout history and stats
    useEffect(() => {
        async function loadWorkoutData() {
            setIsLoading(true)
            try {
                // Get all workouts
                const workouts = await workoutService.getAllLogs()
                
                // Sort by date (newest first)
                const sortedWorkouts = workouts.sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                
                setRecentWorkouts(sortedWorkouts)
                
                // Calculate stats
                const now = new Date()
                const thisMonth = now.getMonth()
                const thisYear = now.getFullYear()
                
                const workoutsThisMonth = workouts.filter(workout => {
                    const workoutDate = new Date(workout.date)
                    return workoutDate.getMonth() === thisMonth && 
                           workoutDate.getFullYear() === thisYear
                })
                
                // Count unique exercises
                const uniqueExercises = new Set(workouts.map(w => w.exerciseId))
                
                // Calculate progress percentages
                // Here we're simplifying by just getting ratios of workout categories
                // In a real app, you might use more complex calculations based on goals
                const allExercises = await Promise.all(
                    workouts.map(async (w) => {
                        if (w.exerciseId) {
                            return await exerciseService.getById(w.exerciseId);
                        }
                        return null;
                    })
                );

                const categories = allExercises
                    .filter(Boolean)
                    .map(exercise => exercise?.category || 'unknown');

                const strengthCount = categories.filter(c => c === 'strength').length
                const cardioCount = categories.filter(c => c === 'cardio').length
                const flexibilityCount = categories.filter(c => c === 'stretching').length
                
                const total = Math.max(1, categories.length) // Avoid division by zero
                
                setWorkoutStats({
                    thisMonth: workoutsThisMonth.length,
                    totalExercises: uniqueExercises.size,
                    progress: {
                        strength: Math.round((strengthCount / total) * 100),
                        cardio: Math.round((cardioCount / total) * 100),
                        flexibility: Math.round((flexibilityCount / total) * 100)
                    }
                })
            } catch (error) {
                console.error("Failed to load workout history:", error)
                setRecentWorkouts([])
                setWorkoutStats({
                    thisMonth: 12,
                    totalExercises: 48,
                    progress: {
                        strength: 70,
                        cardio: 45,
                        flexibility: 30
                    }
                })
            } finally {
                setIsLoading(false)
            }
        }
        
        loadWorkoutData()
    }, [])

    
    // Group workouts by date
    const workoutsByDate = recentWorkouts.reduce<{ [key: string]: Workout[] }>((acc, workout) => {
        const date = workout.date
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(workout)
        return acc
    }, {})

    return (
        <View className="p-4 space-y-6 gap-4 mt-16">
            {/* <Text className="text-2xl font-bold">Dashboard</Text> */}

            <View className="grid grid-cols-2 gap-4">
                <Card className="w-full">
                    <CardHeader className="px-3 py-2">
                        <CardTitle>
                            <Text>Workouts</Text>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pt-0">
                        <Text className="text-2xl font-bold">{workoutStats.thisMonth}</Text>
                        <Text className="text-xs text-muted-foreground">This month</Text>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader className="px-3 py-2">
                        <CardTitle>
                            <Text>Exercises</Text>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pt-0">
                        <Text className="text-2xl font-bold">{workoutStats.totalExercises}</Text>
                        <Text className="text-xs text-muted-foreground">Total completed</Text>
                    </CardContent>
                </Card>
            </View>

            <Card className="w-full">
                <CardHeader className="pb-2">
                    <CardTitle>
                        <Text>Weekly Progress</Text>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <View className="space-y-2">
                        <View className="flex flex-row justify-between p-2">
                            <Text className="text-xs">Strength</Text>
                            <Text className="text-xs">{workoutStats.progress.strength}%</Text>
                        </View>
                        <Progress value={workoutStats.progress.strength} className="h-2" />

                        <View className="flex flex-row justify-between p-2">
                            <Text className="text-xs">Cardio</Text>
                            <Text className="text-xs">{workoutStats.progress.cardio}%</Text>
                        </View>
                        <Progress value={workoutStats.progress.cardio} className="h-2" />

                        <View className="flex flex-row justify-between p-2">
                            <Text className="text-xs">Flexibility</Text>
                            <Text className="text-xs">{workoutStats.progress.flexibility}%</Text>
                        </View>
                        <Progress value={workoutStats.progress.flexibility} className="h-2" />
                    </View>
                </CardContent>
            </Card>

            <Tabs
                value={tab}
                onValueChange={(value) => setTab(value)}
            >
                <TabsList className="flex-row w-full">
                    <TabsTrigger value="bookmarks" className="flex-1">
                        {/* <Bookmark className="h-4 w-4 mr-2" /> */}
                        <Text>Bookmarks</Text>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1">
                        {/* <Activity className="h-4 w-4 mr-2" /> */}
                        <Text>History</Text>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="bookmarks" className="mt-4">
                    {isLoading ? (
                        <View className="flex items-center justify-center py-8">
                            <Text>Loading bookmarks...</Text>
                        </View>
                    ) : bookmarkedExercises.length === 0 ? (
                        <View className="flex items-center justify-center py-8">
                            <Text className="text-muted-foreground">No bookmarked exercises</Text>
                        </View>
                    ) : (
                        <ScrollArea height={400} className="h-[calc(100vh-400px)]">
                            <View className="space-y-4">
                                {bookmarkedExercises.map((exercise) => (
                                    <ExerciseCard key={exercise.id} exercise={exercise} showBookmarkButton={false} />
                                ))}
                            </View>
                        </ScrollArea>
                    )}
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                    {isLoading ? (
                        <View className="flex items-center justify-center py-8">
                            <Text>Loading workout history...</Text>
                        </View>
                    ) : Object.keys(workoutsByDate).length === 0 ? (
                        <View className="flex items-center justify-center py-8">
                            <Text className="text-muted-foreground">No workout history</Text>
                        </View>
                    ) : (
                        <ScrollArea height={400} className="h-[calc(100vh-400px)]">
                            <View className="space-y-4">
                                {Object.entries(workoutsByDate).map(([date, workouts]) => (
                                    <Card key={date} className="w-full">
                                        <CardHeader className="p-4 pb-2">
                                            <View className="flex flex-row justify-between items-center">
                                                <CardTitle>
                                                    <Text>
                                                        {new Date(date).toLocaleDateString("en-US", {
                                                            weekday: "short",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </Text>
                                                </CardTitle>
                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            </View>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <View className="space-y-2">
                                                {workouts.map((workout) => (
                                                    <WorkoutItem 
                                                        key={workout.id} 
                                                        workout={workout} 
                                                    />
                                                ))}
                                            </View>
                                        </CardContent>
                                    </Card>
                                ))}
                            </View>
                        </ScrollArea>
                    )}
                </TabsContent>
            </Tabs>
        </View>
    )
}

// Helper component to display workout items
function WorkoutItem({ workout }: { workout: Workout }) {
    const [exercise, setExercise] = useState<Exercise>()
    
    useEffect(() => {
        async function loadExercise() {
            try {
                if (workout.exerciseId) {
                    const data = await exerciseService.getById(workout.exerciseId)
                    setExercise(data)
                }
            } catch (error) {
                console.error("Failed to load exercise:", error)
            }
        }
        
        loadExercise()
    }, [workout.exerciseId])
    
    if (!exercise) {
        return (
            <View className="text-sm">
                <Text className="text-xs text-muted-foreground">Loading exercise...</Text>
            </View>
        )
    }
    
    return (
        <View className="text-sm">
            <Text className="font-medium">{exercise.name}</Text>
            <Text className="text-xs text-muted-foreground">
                {workout.sets} sets × {workout.reps} reps
                {workout.weight && workout.weight > 0 && ` × ${workout.weight} lbs`}
            </Text>
            {workout.notes && (
                <Text className="text-xs italic mt-1">{workout.notes}</Text>
            )}
        </View>
    )
}

export default Dashboard