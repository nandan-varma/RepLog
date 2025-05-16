import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { OnboardingCard } from './OnboardingCard';
import { AnimatedFitnessIcon } from './AnimatedFitnessIcon';

export type IconType = 'dumbbell' | 'runner' | 'scale' | 'heart' | 'ruler';

type OnboardingStepCallbackType<T> = T extends undefined | void 
  ? (data?: T) => void  // Optional parameter if T is undefined or void
  : (data: T) => void;  // Required parameter for all other types

interface OnboardingStepProps<T = any> {
  title: string;
  description?: string;
  iconType?: IconType;
  children?: ReactNode;
  onNext: OnboardingStepCallbackType<T>;
  nextLabel?: string;
  isNextDisabled?: boolean;
  animate?: 'scale' | 'slide' | 'fade' | 'none';
  data?: T;
}

export function OnboardingStep<T>({
  title,
  description,
  iconType,
  children,
  onNext,
  nextLabel = 'Continue',
  isNextDisabled = false,
  animate = 'slide',
  data,
}: OnboardingStepProps<T>) {
  
  const handleNext = () => {
    // TypeScript can't infer that we're doing the right thing here, 
    // so we have to use a type assertion
    (onNext as any)(data);
  };
  
  return (
    <OnboardingCard animate={animate} className="w-full self-center">
      {iconType && (
        <View className="items-center mb-6">
          <AnimatedFitnessIcon iconType={iconType} size={80} />
        </View>
      )}
      
      <Text className="text-2xl font-bold mb-2">{title}</Text>
      
      {description && (
        <Text className="text-muted-foreground mb-6">{description}</Text>
      )}
      
      <View className="mb-6">
        {children}
      </View>
      
      <Button 
        onPress={handleNext} 
        className="w-full"
        disabled={isNextDisabled}
      >
        <Text>{nextLabel}</Text>
      </Button>
    </OnboardingCard>
  );
}
