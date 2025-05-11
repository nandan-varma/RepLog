"use client"

import { useState } from "react"
import { Image, TouchableOpacity, View, Text } from "react-native"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bookmark, Info } from "lucide-react-native"
import { type Exercise } from "@/services/exerciseService"
import { bookmarkService } from "@/services/bookmarkService"

interface ExerciseCardProps {
  exercise: Exercise
  showBookmarkButton?: boolean
}

export function ExerciseCard({ exercise, showBookmarkButton = true }: ExerciseCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  
  // Check if the exercise is bookmarked when the component mounts
  useState(() => {
    const checkBookmarkStatus = async () => {
      try {
        const bookmarked = await bookmarkService.isBookmarked(exercise.id);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error("Failed to check bookmark status:", error);
      }
    };
    
    checkBookmarkStatus();
  });

  const toggleBookmark = async () => {
    try {
      const newStatus = await bookmarkService.toggleBookmark(exercise.id);
      setIsBookmarked(newStatus);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden">
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: exercise.images[0] || "https://via.placeholder.com/300x150" }}
              accessibilityLabel={exercise.name}
              style={{ width: '100%', height: 128, resizeMode: 'cover' }}
            />
            {showBookmarkButton && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  borderRadius: 20,
                  padding: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleBookmark();
                }}
              >
                <Bookmark 
                  size={16} 
                  color={isBookmarked ? "#0891b2" : "#64748b"} 
                  fill={isBookmarked ? "#0891b2" : "none"} 
                />
                <Text style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Bookmark</Text>
              </TouchableOpacity>
            )}
          </View>
          <CardContent className="p-4">
            <View className="flex justify-between items-start">
              <View>
                <Text className="font-medium">{exercise.name}</Text>
                <View className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">
                    <Text>{exercise.level}</Text>
                  </Badge>
                  {exercise.equipment && (
                    <Badge variant="outline" className="text-xs capitalize">
                      <Text>{exercise.equipment}</Text>
                    </Badge>
                  )}
                </View>
              </View>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
                <Text className="sr-only">Details</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
        </DialogHeader>
        <View className="space-y-4">
          <Image
            source={{ uri: exercise.images[0] || "https://via.placeholder.com/300x150" }}
            accessibilityLabel={exercise.name}
            style={{ width: '100%', height: 192, resizeMode: 'cover' }}
            className="rounded-md"
          />

          <View className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              <Text>{exercise.level}</Text>
            </Badge>
            {exercise.equipment && (
              <Badge variant="outline" className="capitalize">
                <Text>{exercise.equipment}</Text>
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              <Text>{exercise.category}</Text>
            </Badge>
          </View>

          <View>
            <Text className="text-sm font-medium mb-1">Primary Muscles</Text>
            <View className="flex flex-wrap gap-1">
              {exercise.primaryMuscles.map((muscle) => (
                <Badge key={muscle} variant="secondary" className="capitalize">
                  <Text>{muscle}</Text>
                </Badge>
              ))}
            </View>
          </View>

          <View className="flex justify-between pt-2">
            <Button variant="outline">
              <Text>View Details</Text>
            </Button>
            <Button
              onPress={(e) => {
                e.stopPropagation();
                toggleBookmark();
              }}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
              <Text>{isBookmarked ? "Bookmarked" : "Bookmark"}</Text>
            </Button>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  )
}
