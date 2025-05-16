import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { cn } from '~/lib/utils';
import { useFitnessGoal } from '@/services';
import { Badge } from '@/components/ui/badge';

interface FitnessGoalRecommendationsProps {
  className?: string;
}

/**
 * Component that shows workout recommendations based on selected fitness goal
 */
export function FitnessGoalRecommendations({ className }: FitnessGoalRecommendationsProps) {
  const { fitnessGoal, fitnessGoalDetails, recommendations } = useFitnessGoal();
  
  if (!fitnessGoal || !fitnessGoalDetails || !recommendations) {
    return null;
  }
  
  return (
    <Card className={cn("p-4", className)}>
      <Text className="text-lg font-bold mb-2">
        Recommendations for {fitnessGoalDetails.title}
      </Text>
      
      <View className="mb-3">
        <Text className="text-muted-foreground mb-1">
          Recommended workouts per week
        </Text>
        <Text className="text-xl font-medium">
          {recommendations.workoutsPerWeek} workouts
        </Text>
      </View>
      
      <View>
        <Text className="text-muted-foreground mb-2">
          Recommended focus areas
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {recommendations.focusAreas.map((area) => (
            <Badge key={area} variant="outline">
              {area}
            </Badge>
          ))}
        </View>
      </View>
    </Card>
  );
}
