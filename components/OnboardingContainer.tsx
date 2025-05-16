import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  Extrapolation,
  runOnJS
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingScreen from '@/app/onboarding';

const { width, height } = Dimensions.get('window');

export function OnboardingContainer() {
  const router = useRouter();
  const { 
    isOnboardingCompleted, 
    isOnboardingAnimating,
    isLoading,
    completeOnboardingTransition 
  } = useOnboarding();
  
  const [showOnboarding, setShowOnboarding] = useState(true);
  const animationProgress = useSharedValue(1);
  
  // Control the animation when onboarding completes
  useEffect(() => {
    if (isOnboardingAnimating) {
      // Start animation to shrink and slide out onboarding
      animationProgress.value = withTiming(0, 
        { duration: 600 }, 
        (isFinished) => {
          if (isFinished) {
            // When animation completes, hide onboarding and navigate
            runOnJS(handleAnimationComplete)();
          }
        }
      );
    }
  }, [isOnboardingAnimating]);
  
  const handleAnimationComplete = () => {
    setShowOnboarding(false);
    completeOnboardingTransition();
    router.replace('/(tabs)');
  };
  
  const onboardingContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(
            animationProgress.value, 
            [0, 1], 
            [0.8, 1], 
            { extrapolateRight: Extrapolation.CLAMP }
          ) 
        },
        { translateY: interpolate(
            animationProgress.value, 
            [0, 1], 
            [height, 0], 
            { extrapolateRight: Extrapolation.CLAMP }
          ) 
        }
      ],
      opacity: animationProgress.value,
      position: 'absolute',
      width: width,
      height: height,
      zIndex: animationProgress.value > 0 ? 100 : -1
    };
  });  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading...</Text>
      </View>
    );
  }
  
  // If onboarding is completed and we're not in the animation phase, don't render
  if (isOnboardingCompleted && !isOnboardingAnimating && !showOnboarding) {
    return null;
  }
  
  return (
    <Animated.View style={onboardingContainerStyle}>
      {showOnboarding && <OnboardingScreen />}
    </Animated.View>
  );
}
