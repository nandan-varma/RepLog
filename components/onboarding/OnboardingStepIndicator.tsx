import React from 'react';
import { View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  useDerivedValue,
  interpolateColor 
} from 'react-native-reanimated';
import { cn } from '~/lib/utils';

interface OnboardingStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function OnboardingStepIndicator({ 
  currentStep, 
  totalSteps,
  className 
}: OnboardingStepIndicatorProps) {
  return (
    <View className={cn("flex-row justify-center items-center", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <StepDot 
          key={index} 
          isActive={index === currentStep}
          isCompleted={index < currentStep} 
        />
      ))}
    </View>
  );
}

interface StepDotProps {
  isActive: boolean;
  isCompleted: boolean;
}

function StepDot({ isActive, isCompleted }: StepDotProps) {
  // Animation progress (0 = inactive, 0.5 = completed, 1 = active)
  const progress = useDerivedValue(() => {
    if (isActive) return withTiming(1, { duration: 300 });
    if (isCompleted) return withTiming(0.5, { duration: 300 });
    return withTiming(0, { duration: 300 });
  });
  
  // Width animation
  const dotStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isActive ? 24 : 8, { duration: 300 }),
      backgroundColor: interpolateColor(
        progress.value,
        [0, 0.5, 1],
        ['#d4d4d8', '#0891b2', '#0891b2'] // muted, primary colors
      )
    };
  });
  
  return (
    <Animated.View
      style={dotStyle}
      className="h-2 rounded-full mx-1"
    />
  );
}
