"use client"

import { useState, useEffect } from "react"
import { View } from "react-native"
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { exerciseService, type Exercise } from "@/services/exerciseService"
import { workoutService } from "@/services/workoutService"

interface LogWorkoutFormProps {
  date?: string;
  onClose: () => void;
}

export function LogWorkoutForm({ date, onClose }: LogWorkoutFormProps) {
  const insets = useSafeAreaInsets()
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  }
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Updated to handle Option type correctly
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("")

  const [sets, setSets] = useState("3")
  const [reps, setReps] = useState("10")
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")
  
  // Format date or use today
  const formattedDate = date || new Date().toISOString().split('T')[0]
  
  useEffect(() => {
    async function loadExercises() {
      setIsLoading(true)
      try {
        const data = await exerciseService.getAll()
        setExercises(data)
        if (data.length > 0) {
          setSelectedExerciseId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to load exercises:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadExercises()
  }, [])
  
  const handleSubmit = async () => {
    if (!selectedExerciseId) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const selectedExercise = exercises.find(e => e.id === selectedExerciseId)
      
      if (!selectedExercise) {
        throw new Error("Selected exercise not found")
      }
      
      const now = new Date().toISOString()
      
      await workoutService.addWorkoutLog({
        exerciseId: selectedExerciseId,
        date: formattedDate,
        sets: parseInt(sets, 10) || 0,
        reps: parseInt(reps, 10) || 0,
        weight: parseFloat(weight) || 0,
        notes: notes || "",
        duration: 0,
        createdAt: now
      })
      
      onClose()
    } catch (error) {
      console.error("Failed to log workout:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <View className="flex items-center justify-center py-4">
        <Text>Loading exercises...</Text>
      </View>
    )
  }
  
  return (
    <View className="space-y-4 py-2">
      <View className="space-y-2">
        <Label htmlFor="exercise">Exercise</Label>
        <Select
          defaultValue={{value: selectedExerciseId, label: ""}}
          onValueChange={(selection) => setSelectedExerciseId(selection?.value || "")} 
        >
          <SelectTrigger id="exercise">
            <SelectValue placeholder="Select an exercise" />
          </SelectTrigger>
          <SelectContent insets={contentInsets}>
            {exercises.map(exercise => (
              <SelectItem 
                key={exercise.id} 
                value={exercise.id}
                label={exercise.name}
              >
                <Text>{exercise.name}</Text>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </View>
      
      <View className="grid grid-cols-3 gap-4">
        <View className="space-y-2">
          <Label htmlFor="sets">Sets</Label>
          <Input
            id="sets"
            value={sets}
            onChange={(e) => setSets(e.nativeEvent.text)}
            keyboardType="number-pad"
          />
        </View>
        
        <View className="space-y-2">
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            value={reps}
            onChange={(e) => setReps(e.nativeEvent.text)}
            keyboardType="number-pad"
          />
        </View>
        
        <View className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.nativeEvent.text)}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>
      </View>
      
      <View className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.nativeEvent.text)}
          placeholder="How did it feel?"
        />
      </View>
      
      <View className="flex flex-row space-x-2 justify-end pt-4">
        <Button variant="outline" onPress={onClose}>
          <Text>Cancel</Text>
        </Button>
        <Button disabled={isSubmitting} onPress={handleSubmit}>
          <Text>{isSubmitting ? "Saving..." : "Save Workout"}</Text>
        </Button>
      </View>
    </View>
  )
}