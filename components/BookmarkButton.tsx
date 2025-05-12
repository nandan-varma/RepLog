"use client"

import { useState, useEffect } from "react"
import { TouchableOpacity, Text } from "react-native"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react-native"
import { bookmarkService } from "@/services/bookmarkService"
import { bookmarkEvents } from "@/services/bookmarkEvents"

interface BookmarkButtonProps {
  exerciseId: string
  variant?: "icon" | "button"
  size?: "sm" | "md" | "lg"
  onBookmarkChange?: (isBookmarked: boolean) => void
  className?: string
}

export function BookmarkButton({ 
  exerciseId, 
  variant = "icon", 
  size = "md", 
  onBookmarkChange, 
  className = ""
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Check if the exercise is bookmarked when the component mounts
  useEffect(() => {
    let isMounted = true
    
    const checkBookmarkStatus = async () => {
      try {
        setIsLoading(true)
        const bookmarked = await bookmarkService.isBookmarked(exerciseId)
        if (isMounted) {
          setIsBookmarked(bookmarked)
        }
      } catch (error) {
        console.error("Failed to check bookmark status:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    // Check initial status
    checkBookmarkStatus()
    
    // Subscribe to bookmark events
    const unsubscribe = bookmarkEvents.subscribe((id, bookmarked) => {
      // Only update if this event is for our exerciseId
      if (id === exerciseId && isMounted) {
        setIsBookmarked(bookmarked)
      }
    })
    
    // Cleanup
    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [exerciseId])
  const toggleBookmark = async (e: any) => {
    e.stopPropagation()
    try {
      const newStatus = await bookmarkService.toggleBookmark(exerciseId)
      setIsBookmarked(newStatus)
      
      // Emit the bookmark change event for other components
      bookmarkEvents.emit(exerciseId, newStatus)
      
      // Call the callback if provided
      if (onBookmarkChange) {
        onBookmarkChange(newStatus)
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
    }
  }

  // Size mappings
  const sizeMap = {
    sm: { iconSize: 14, buttonClass: "h-7 w-7", touchablePadding: 6 },
    md: { iconSize: 18, buttonClass: "h-9 w-9", touchablePadding: 8 },
    lg: { iconSize: 22, buttonClass: "h-11 w-11", touchablePadding: 10 }
  }

  const { iconSize, buttonClass, touchablePadding } = sizeMap[size]

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        className={className}
        onPress={toggleBookmark}
        disabled={isLoading}
      >
        <Bookmark 
          size={iconSize} 
          className={`mr-2 ${isBookmarked ? "fill-current" : ""}`}
        />
        <Text>{isBookmarked ? "Bookmarked" : "Bookmark"}</Text>
      </Button>
    )
  }

  return (
    <TouchableOpacity
      style={{
        borderRadius: 20,
        padding: touchablePadding,
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }}
      onPress={toggleBookmark}
      className={className}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Bookmark 
        size={iconSize} 
        color={isBookmarked ? "#0891b2" : "#64748b"} 
        fill={isBookmarked ? "#0891b2" : "none"} 
      />
      <Text style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        {isBookmarked ? "Remove bookmark" : "Add bookmark"}
      </Text>
    </TouchableOpacity>
  )
}
