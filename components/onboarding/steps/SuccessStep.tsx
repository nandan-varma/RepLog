import React, { useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { OnboardingStep } from '../OnboardingStep';

interface SuccessStepProps {
  onComplete: (data?: any) => void;
}

export function SuccessStep({ onComplete }: SuccessStepProps) {
  useEffect(() => {
    // Auto-navigate after delay
    const timeout = setTimeout(() => {
      onComplete();
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <OnboardingStep<void>
      title="All Set!"
      description="Your profile has been created successfully"
      iconType="heart"
      onNext={() => onComplete()}
      nextLabel="Go to Dashboard"
      animate="scale"
    >
      <Text className="text-center text-sm text-muted-foreground">
        Loading your dashboard...
      </Text>
    </OnboardingStep>
  );
}
