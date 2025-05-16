import React, { ReactNode, useCallback } from 'react';
import { View, Keyboard, TouchableWithoutFeedback, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { OnboardingStepIndicator } from './OnboardingStepIndicator';
import { useKeyboardState } from '@/hooks/useKeyboardState';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  showBackButton?: boolean;
  onBack?: () => void;
  keyboardOffset?: number;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  showBackButton = true,
  onBack,
  keyboardOffset = 0.25,
}: OnboardingLayoutProps) {
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);
  const animatedKeyboardOffset = useSharedValue(0);
  
  // Use the keyboard state hook to get keyboard events and dimensions
  const { keyboardHeight, isKeyboardVisible } = useKeyboardState();
  
  // Effect to handle keyboard visibility changes
  React.useEffect(() => {
    if (isKeyboardVisible && keyboardHeight > 0) {
      setKeyboardVisible(true);
      animatedKeyboardOffset.value = withTiming(
        -keyboardHeight * keyboardOffset, 
        { duration: 250 }
      );
    } else {
      animatedKeyboardOffset.value = withTiming(
        0, 
        { duration: 250 },
        // Callback is now the third parameter of withTiming instead of a property of the config object
        () => runOnJS(setKeyboardVisible)(false)
      );
    }
  }, [isKeyboardVisible, keyboardHeight, keyboardOffset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animatedKeyboardOffset.value }]
  }));

  // Memoized keyboard dismiss handler to avoid recreating on every render
  const handleDismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const shouldShowIndicator = !keyboardVisible && currentStep > 0 && currentStep <= totalSteps;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />
      
      {/* Fixed header with back button - this stays in place */}
      {showBackButton && onBack && (
        <View className="px-4 pt-2">
          <Pressable onPress={onBack} className="mb-4">
            <Text className="text-primary text-lg">← Back</Text>
          </Pressable>
        </View>
      )}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <TouchableWithoutFeedback onPress={handleDismissKeyboard} accessible={false}>
          <Animated.View 
            className="flex-1 px-4 pb-4" 
            style={animatedStyle}
          >
            <View className="flex-1 justify-center">
              {children}
            </View>
            
            {shouldShowIndicator && (
              <OnboardingStepIndicator 
                currentStep={currentStep}
                totalSteps={totalSteps}
                className="mt-8 mb-4"
              />
            )}
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
