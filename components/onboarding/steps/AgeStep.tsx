import React, { useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { Input } from '@/components/ui/input';
import { OnboardingStep } from '../OnboardingStep';

interface AgeStepProps {
  onComplete: (data: number) => void;
  initialValue?: number;
}

export function AgeStep({ onComplete, initialValue }: AgeStepProps) {
  const [age, setAge] = useState(initialValue?.toString() || '');

  const handleChange = (text: string) => {
    // Only allow numbers
    if (/^\d*$/.test(text)) {
      setAge(text);
    }
  };

  const handleSubmit = () => {
    const parsedAge = parseInt(age, 10);
    if (age && parsedAge > 0) {
      Keyboard.dismiss();
      onComplete(parsedAge);
    }
  };

  const parsedAge = age ? parseInt(age, 10) : 0;
  const isAgeValid = parsedAge > 0;

  return (
    <OnboardingStep<number>
      title="How old are you?"
      onNext={(data) => {
        if (typeof data === 'number' && data > 0) {
          onComplete(data);
        }
      }}
      isNextDisabled={!isAgeValid}
      data={parsedAge}
    >
      <Input
        value={age}
        onChangeText={handleChange}
        placeholder="Enter your age"
        autoFocus={Platform.OS !== 'web'}
        keyboardType="number-pad"
        returnKeyType="done"
        blurOnSubmit={true}
        onSubmitEditing={handleSubmit}
      />
    </OnboardingStep>
  );
}
