import { useState, useEffect } from "react"
import { Image, View, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Text } from "@/components/ui/text"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react-native"
import { type Exercise, bookmarkService, bookmarkEvents } from "@/services"
import { BookmarkButton } from "@/components/BookmarkButton"
import { useTransitionContext } from "@/components/TransitionContext"
import Animated, { FadeIn } from "react-native-reanimated"

interface ExerciseCardProps {
  exercise: Exercise
  showBookmarkButton?: boolean
}

export function ExerciseCard({ exercise, showBookmarkButton = true }: ExerciseCardProps) {
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { setSelectedExercise } = useTransitionContext()
  
  // Check bookmark status when component mounts or when exercise changes
  useEffect(() => {
    let isMounted = true
    
    const checkBookmarkStatus = async () => {
      if (exercise?.id) {
        try {
          const status = await bookmarkService.isBookmarked(exercise.id)
          if (isMounted) {
            setIsBookmarked(status)
          }
        } catch (error) {
          console.error("Failed to check bookmark status:", error)
        }
      }
    }
    
    checkBookmarkStatus()
    
    // Subscribe to bookmark events
    const unsubscribe = bookmarkEvents.subscribe((id, bookmarked) => {
      if (id === exercise?.id && isMounted) {
        setIsBookmarked(bookmarked)
      }
    })
    
    return () => { 
      isMounted = false 
      unsubscribe()
    }
  }, [exercise?.id])
  
  const handleBookmarkChange = (status: boolean) => {
    setIsBookmarked(status)
  };
  
  const handleExercisePress = (): void => {
    setSelectedExercise(exercise)
    router.push({
      pathname: "/exercise",
      params: { id: exercise.id }
    })
  };
  
  return (
    <Animated.View entering={FadeIn.duration(500)} className="w-full">
      <Pressable onPress={handleExercisePress}>
        <Card className="overflow-hidden">
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: exercise.images[0] || "https://via.placeholder.com/300x150" }}
              accessibilityLabel={exercise.name}
              style={{ width: '100%', height: 128, resizeMode: 'cover' }}
            />
            {showBookmarkButton && (
              <View style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}>
                <BookmarkButton 
                  exerciseId={exercise.id}
                  variant="icon"
                  size="sm"
                  onBookmarkChange={handleBookmarkChange}
                />
              </View>
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onPress={(e) => {
                  e.stopPropagation();
                  handleExercisePress();
                }}
              >
                <Info className="h-4 w-4" />
                <Text className="sr-only">Details</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </Pressable>
    </Animated.View>
  )
}
