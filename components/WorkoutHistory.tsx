"use client"

import { useState, useEffect } from "react"
import { View } from "react-native"
import { Text } from "@/components/ui/text"
import { ScrollArea } from "@/components/ScrollArea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react-native"
import { workoutService, type Workout } from "@/services/workoutService"
import { exerciseService, type Exercise } from "@/services/exerciseService"

export function WorkoutHistory() {
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load workout history
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
      } catch (error) {
        console.error("Failed to load workout history:", error)
        setRecentWorkouts([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorkoutData()
  }, [])

  // Group workouts by date
  const workoutsByDate = recentWorkouts.reduce<Record<string, Workout[]>>((acc, workout) => {
    const date = workout.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(workout)
    return acc
  }, {})

  if (isLoading) {
    return (
      <View className="flex items-center justify-center py-8">
        <Text>Loading workout history...</Text>
      </View>
    )
  }

  if (Object.keys(workoutsByDate).length === 0) {
    return (
      <View className="flex items-center justify-center py-8">
        <Text className="text-muted-foreground">No workout history</Text>
      </View>
    )
  }

  return (
    <ScrollArea height={400} className="h-[calc(100vh-400px)]">
      <View className="space-y-4">
        {Object.entries(workoutsByDate).map(([date, workouts]) => (
          <Card key={date} className="w-full">
            <CardHeader className="p-4 pb-2">
              <View className="flex flex-row justify-between items-center">
                <Text className="font-medium">{formatDate(date)}</Text>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </View>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <View className="space-y-2">
                {workouts.map((workout) => (
                  <WorkoutItem key={workout.id} workout={workout} />
                ))}
              </View>
            </CardContent>
          </Card>
        ))}
      </View>
    </ScrollArea>
  )
}

// Helper component to display workout items
function WorkoutItem({ workout }: { workout: Workout }) {
  const [exercise, setExercise] = useState<Exercise | undefined>()
  
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

// Format date for display
function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric' 
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
