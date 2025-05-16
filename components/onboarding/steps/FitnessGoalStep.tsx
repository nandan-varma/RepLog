import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { OnboardingStep } from '../OnboardingStep';
import { FitnessGoalSelector } from '../FitnessGoalSelector';
import { getFitnessGoals, getFitnessGoalById } from '@/services/fitnessGoalService';
import { AnimatedFitnessIcon } from '../AnimatedFitnessIcon';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { FitnessGoalId } from '@/services';

interface FitnessGoalStepProps {
  onComplete: (data: FitnessGoalId) => void;
  initialValue?: string;
}

export function FitnessGoalStep({ onComplete, initialValue = '' }: FitnessGoalStepProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>(initialValue);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Get goals from service and add icons
  const fitnessGoals = getFitnessGoals().map((goal) => ({
    ...goal,
    icon: goal.id === 'lose-weight'
      ? <AnimatedFitnessIcon iconType="scale" size={40} />
      : goal.id === 'build-muscle'
        ? <AnimatedFitnessIcon iconType="dumbbell" size={40} />
        : <AnimatedFitnessIcon iconType="runner" size={40} />
  }));
  
  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setShowRecommendations(true);
  };

  const selectedGoalDetails = selectedGoal ? getFitnessGoalById(selectedGoal) : undefined;
  const isValidGoalId = (id: string): id is FitnessGoalId => {
    return ['lose-weight', 'build-muscle', 'improve-fitness'].includes(id);
  };
  
  return (
    <OnboardingStep<string>
      title="What's your primary goal?"
      onNext={(data) => {
        if (data && isValidGoalId(data)) {
          onComplete(data);
        }
      }}
      isNextDisabled={!selectedGoal}
      data={selectedGoal}
    >
      <FitnessGoalSelector
        goals={fitnessGoals}
        selectedGoalId={selectedGoal}
        onSelect={handleGoalSelect}
        className="mb-6"
      />
      
      {showRecommendations && selectedGoalDetails?.recommendations && (
        <Animated.View 
          className="mb-6 p-3 bg-muted rounded-md"
          entering={FadeIn.duration(300)}
        >
          <Text className="font-medium mb-1">Recommended for you:</Text>
          <Text className="text-sm text-muted-foreground">
            • {selectedGoalDetails.recommendations.workoutsPerWeek} workouts per week
          </Text>
          <Text className="text-sm text-muted-foreground">
            • Focus on: {selectedGoalDetails.recommendations.focusAreas.join(', ')}
          </Text>
        </Animated.View>
      )}
    </OnboardingStep>
  );
}
