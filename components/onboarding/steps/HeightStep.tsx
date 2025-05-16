import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { OnboardingStep } from '../OnboardingStep';

interface HeightStepProps {
  onComplete: (data: number) => void;
  initialValue?: number;
}

export function HeightStep({ onComplete, initialValue }: HeightStepProps) {
  const [height, setHeight] = useState(initialValue?.toString() || '');
  const [unitSystem, setUnitSystem] = useState('metric'); // Could come from preferences

  const handleChange = (text: string) => {
    // Allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      setHeight(text);
    }
  };

  const parsedHeight = height ? parseFloat(height) : 0;
  const isHeightValid = parsedHeight > 0;

  return (
    <OnboardingStep<number>
      title="What's your height?"
      iconType="ruler"
      onNext={(data) => {
        if (typeof data === 'number' && data > 0) {
          onComplete(data);
        }
      }}
      isNextDisabled={!isHeightValid}
      data={parsedHeight}
    >
      <View className="flex-row items-center">
        <Input
          value={height}
          onChangeText={handleChange}
          placeholder={`Enter height in ${unitSystem === 'metric' ? 'cm' : 'in'}`}
          className="flex-1 mr-2"
          keyboardType="numeric"
          autoFocus={Platform.OS !== 'web'}
        />
        <Text className="text-lg">{unitSystem === 'metric' ? 'cm' : 'in'}</Text>
      </View>
    </OnboardingStep>
  );
}
