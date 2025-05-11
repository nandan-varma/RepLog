import React from 'react';
import { View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import type { Workout } from '~/services/workoutService';

interface WorkoutCardProps {
  workout: Workout;
  className?: string;
}

export function WorkoutCard({ workout, className }: WorkoutCardProps) {
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
    <Card className={className}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium">
          <Text>{dateFormatted}</Text>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Text className="text-sm">
          {workout.sets} sets × {workout.reps} reps
          {workout.weight ? ` at ${workout.weight}lbs` : ''}
        </Text>
        {workout.notes && (
          <Text className="text-xs text-muted-foreground">{workout.notes}</Text>
        )}
      </CardContent>
    </Card>
  );
}
