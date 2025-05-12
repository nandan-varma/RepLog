"use client"

import { useState, useEffect } from "react"
import { View } from "react-native"
import { Text } from "@/components/ui/text"
import { ScrollArea } from "@/components/ScrollArea"
import { bookmarkService } from "@/services/bookmarkService"
import { exerciseService, type Exercise } from "@/services/exerciseService"
import { ExerciseCard } from "@/components/ExerciseCard"
import { BookmarkButton } from "@/components/BookmarkButton"
import { bookmarkEvents } from "@/services/bookmarkEvents"

export function BookmarkedExercises() {
  const [bookmarkedExercises, setBookmarkedExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  // Subscribe to bookmark events
  useEffect(() => {
    const unsubscribe = bookmarkEvents.subscribe((exerciseId, isBookmarked) => {
      if (!isBookmarked) {
        // If an exercise was unbookmarked, remove it from the list immediately
        setBookmarkedExercises(prev => prev.filter(ex => ex.id !== exerciseId))
      } else {
        // If a bookmark was added, we should check if we need to add it to the list
        // For simplicity, we'll just trigger a full refresh
        setRefreshTrigger(prev => prev + 1)
      }
    })
    
    return unsubscribe
  }, [])

  // Load bookmarked exercises
  useEffect(() => {
    async function loadBookmarkedExercises() {
      setIsLoading(true)
      try {
        // Get all bookmarks
        const bookmarks = await bookmarkService.getAll()
        
        if (bookmarks.length === 0) {
          setBookmarkedExercises([])
          return
        }
        
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
      } finally {
        setIsLoading(false)
      }
    }
    
    loadBookmarkedExercises()
  }, [refreshTrigger])

  if (isLoading) {
    return (
      <View className="flex items-center justify-center py-8">
        <Text>Loading bookmarks...</Text>
      </View>
    )
  }

  if (bookmarkedExercises.length === 0) {
    return (
      <View className="flex items-center justify-center py-8">
        <Text>No bookmarked exercises</Text>
      </View>
    )
  }

  return (
    <ScrollArea height={400} className="h-[calc(100vh-400px)]">
      <View className="space-y-4">        
        {bookmarkedExercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            showBookmarkButton={true}
          />
        ))}
      </View>
    </ScrollArea>
  )
}
