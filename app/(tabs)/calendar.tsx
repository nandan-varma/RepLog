import { useState, useEffect } from "react"
import { View } from "react-native"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { ScrollArea } from "~/components/ScrollArea"
import { LogWorkoutForm } from "~/components/LogWorkoutForm"
import { WorkoutCard } from "~/components/WorkoutCard"

import type { Workout } from '~/services/workoutService'
import { workoutService } from '~/services/workoutService'

// Calendar data
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch workouts when component mounts
  useEffect(() => {
    const fetchWorkouts = async () => {
      setIsLoading(true)
      try {
        const workoutData = await workoutService.getAllLogs()
        setWorkouts(workoutData)
      } catch (error) {
        console.error("Failed to fetch workouts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  // Refresh workouts list when dialog closes (potentially after adding new workout)
  useEffect(() => {
    if (!isDialogOpen) {
      const refreshWorkouts = async () => {
        try {
          const workoutData = await workoutService.getAllLogs()
          setWorkouts(workoutData)
        } catch (error) {
          console.error("Failed to refresh workouts:", error)
        }
      }

      refreshWorkouts()
    }
  }, [isDialogOpen])

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const calendarDays = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day))
    }

    return calendarDays
  }

  const calendarDays = generateCalendarDays()

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }
  const hasWorkout = (date: Date) => {
    // Format the date to YYYY-MM-DD to match database format
    const formattedDate = date.toISOString().split('T')[0]

    // Check if there's any workout log with this date
    return workouts.some(workout => workout.date === formattedDate)
  }
  return (
    <View className="p-4 space-y-6 pt-16">
      <View className="flex flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold">Calendar</Text>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full">
              <Text>Log Workout</Text>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Text>
                  Log Workout for{" "}
                  {selectedDate?.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </DialogTitle>
            </DialogHeader>
            <LogWorkoutForm
              date={selectedDate?.toISOString().split('T')[0]}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </View>

      <Card className="mb-4">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            <Text>
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </Text>
          </CardTitle>
          <View className="flex flex-row items-center space-x-2">
            <Button variant="outline" size="icon" className="h-7 w-7" onPress={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
              <Text className="sr-only">Previous month</Text>
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onPress={nextMonth}>
              <ChevronRight className="h-4 w-4" />
              <Text className="sr-only">Next month</Text>
            </Button>
          </View>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <View className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((day) => (
              <View key={day} className="py-1">
                <Text className="text-xs font-medium text-muted-foreground">{day}</Text>
              </View>
            ))}
          </View>
          {isLoading ? (
            <View className="flex items-center justify-center p-6">
              <Text>Loading calendar...</Text>
            </View>
          ) : (
            <View className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <View key={index} className="aspect-square">
                  {day ? (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full h-full flex flex-col items-center justify-center rounded-md relative p-0",
                        hasWorkout(day) ? "bg-primary/10" : "",
                        day.toDateString() === new Date().toDateString() ? "border border-primary" : ""
                      )}
                      onPress={() => handleDateClick(day)}
                    >
                      <Text className="text-sm">{day.getDate()}</Text>
                      {hasWorkout(day) && (
                        <View className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"></View>
                      )}
                    </Button>
                  ) : (
                    <View className="w-full h-full"></View>
                  )}
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>
      <View className="space-y-4">
        <Text className="text-lg font-semibold">Recent & Upcoming Workouts</Text>
        {isLoading ? (
          <View className="flex items-center justify-center p-6">
            <Text>Loading workouts...</Text>
          </View>
        ) : (
          <ScrollArea height={300} className="mb-6">
            <View className="space-y-4">
              {workouts.length === 0 ? (
                <View className="flex items-center justify-center py-8">
                  <Text className="text-muted-foreground">No workouts logged yet</Text>
                </View>
              ) : (
                // Show last 10 workouts sorted by date
                [...workouts]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((workout) => {
                    const workoutDate = new Date(workout.date);
                    const isToday = new Date().toDateString() === workoutDate.toDateString();
                    const isFuture = workoutDate > new Date();

                    let dateFormatted;

                    if (isToday) {
                      dateFormatted = "Today";
                    } else if (isFuture) {
                      dateFormatted = workoutDate.toLocaleDateString("en-US", {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      });
                    } else {
                      dateFormatted = workoutDate.toLocaleDateString("en-US", {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                    }
                    return (
                      // <Card key={workout.id} className="mb-2"></Card>
                      <WorkoutCard key={workout.id} workout={workout} className="mb-2" />
                    );
                  })
              )}
            </View>
          </ScrollArea>
        )}
      </View>
    </View>
  )
}

export default Calendar;