"use client"

import { useState, useEffect } from "react"
import { View } from "react-native"
import { Text } from "@/components/ui/text"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { workoutService } from "@/services/workoutService"
import { exerciseService } from "@/services/exerciseService"

export function WorkoutStats() {
  const [stats, setStats] = useState({
    thisMonth: 0,
    totalExercises: 0,
    progress: {
      strength: 0,
      cardio: 0,
      flexibility: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadWorkoutStats() {
      setIsLoading(true)
      try {
        // Get all workouts
        const workouts = await workoutService.getAllLogs()
        
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
        
        // Calculate progress percentages based on workout categories
        const allExercises = await Promise.all(
          workouts.map(async (w) => {
            if (w.exerciseId) {
              return await exerciseService.getById(w.exerciseId)
            }
            return undefined
          })
        )

        const categories = allExercises
          .filter(Boolean)
          .map(exercise => exercise?.category || 'unknown')

        const strengthCount = categories.filter(c => c === 'strength').length
        const cardioCount = categories.filter(c => c === 'cardio').length
        const flexibilityCount = categories.filter(c => c === 'stretching').length
        
        const total = Math.max(1, categories.length) // Avoid division by zero
        
        setStats({
          thisMonth: workoutsThisMonth.length,
          totalExercises: uniqueExercises.size,
          progress: {
            strength: Math.round((strengthCount / total) * 100),
            cardio: Math.round((cardioCount / total) * 100),
            flexibility: Math.round((flexibilityCount / total) * 100)
          }
        })
      } catch (error) {
        console.error("Failed to calculate workout stats:", error)
        // Set fallback data if there's an error
        setStats({
          thisMonth: 0,
          totalExercises: 0,
          progress: {
            strength: 0,
            cardio: 0,
            flexibility: 0
          }
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorkoutStats()
  }, [])

  return (
    <View className="space-y-6">
      <View className="grid grid-cols-2 gap-4">
        <Card className="w-full">
          <CardHeader className="px-3 py-2">
            <CardTitle>
              <Text>Workouts</Text>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-0">
            <Text className="text-2xl font-bold">{stats.thisMonth}</Text>
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
            <Text className="text-2xl font-bold">{stats.totalExercises}</Text>
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
              <Text className="text-xs">{stats.progress.strength}%</Text>
            </View>
            <Progress value={stats.progress.strength} className="h-2" />

            <View className="flex flex-row justify-between p-2">
              <Text className="text-xs">Cardio</Text>
              <Text className="text-xs">{stats.progress.cardio}%</Text>
            </View>
            <Progress value={stats.progress.cardio} className="h-2" />

            <View className="flex flex-row justify-between p-2">
              <Text className="text-xs">Flexibility</Text>
              <Text className="text-xs">{stats.progress.flexibility}%</Text>
            </View>
            <Progress value={stats.progress.flexibility} className="h-2" />
          </View>
        </CardContent>
      </Card>
    </View>
  )
}
