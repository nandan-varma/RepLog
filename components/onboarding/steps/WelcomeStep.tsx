import React from 'react';
import { OnboardingStep } from '../OnboardingStep';

interface WelcomeStepProps {
  onComplete: (data?: any) => void;
}

export function WelcomeStep({ onComplete }: WelcomeStepProps) {
  return (
    <OnboardingStep<void>
      title="Welcome to RepLog"
      description="Let's set up your fitness profile"
      iconType="dumbbell"
      onNext={() => onComplete()}
      nextLabel="Get Started"
      animate="scale"
    />
  );
}
