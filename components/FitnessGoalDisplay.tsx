import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '~/lib/utils';
import { AnimatedFitnessIcon } from './onboarding/AnimatedFitnessIcon';
import { useFitnessGoal } from '@/services';

interface FitnessGoalDisplayProps {
  className?: string;
  showIcon?: boolean;
  iconSize?: number;
}

/**
 * Displays the user's current fitness goal with an optional icon
 */
export function FitnessGoalDisplay({ 
  className,
  showIcon = true,
  iconSize = 32
}: FitnessGoalDisplayProps) {
  const { fitnessGoal, fitnessGoalDetails } = useFitnessGoal();
  
  if (!fitnessGoal || !fitnessGoalDetails) {
    return null;
  }

  // Map goal ID to icon type
  const getIconType = (goalId: string) => {
    switch (goalId) {
      case 'lose-weight': return 'scale';
      case 'build-muscle': return 'dumbbell';
      case 'improve-fitness': return 'runner';
      default: return 'dumbbell';
    }
  };

  return (
    <View className={cn("flex-row items-center p-2", className)}>
      {showIcon && (
        <View className="mr-3">
          <AnimatedFitnessIcon 
            iconType={getIconType(fitnessGoal)}
            size={iconSize}
          />
        </View>
      )}
      <View>
        <Text className="font-bold text-foreground">
          {fitnessGoalDetails.title}
        </Text>
        <Text className="text-muted-foreground text-sm">
          {fitnessGoalDetails.description}
        </Text>
      </View>
    </View>
  );
}
