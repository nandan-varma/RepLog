import React, { useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { Input } from '@/components/ui/input';
import { OnboardingStep } from '../OnboardingStep';

interface NameStepProps {
  onComplete: (data: string) => void;
  initialValue?: string;
}

export function NameStep({ onComplete, initialValue = '' }: NameStepProps) {
  const [name, setName] = useState(initialValue);

  const handleSubmit = () => {
    if (name.trim()) {
      Keyboard.dismiss();
      onComplete(name);
    }
  };

  return (
    <OnboardingStep<string>
      title="What's your name?"
      onNext={(data) => {
        if (data && typeof data === 'string' && data.trim()) {
          onComplete(data);
        }
      }}
      isNextDisabled={!name.trim()}
      data={name}
    >
      <Input
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoFocus={Platform.OS !== 'web'}
        autoCapitalize="words"
        returnKeyType="done"
        blurOnSubmit={true}
        onSubmitEditing={handleSubmit}
      />
    </OnboardingStep>
  );
}
