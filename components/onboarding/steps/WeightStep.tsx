import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { OnboardingStep } from '../OnboardingStep';

interface WeightStepProps {
  onComplete: (data: number) => void;
  initialValue?: number;
}

export function WeightStep({ onComplete, initialValue }: WeightStepProps) {
  const [weight, setWeight] = useState(initialValue?.toString() || '');
  const [unitSystem, setUnitSystem] = useState('metric'); // Could come from preferences

  const handleChange = (text: string) => {
    // Allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      setWeight(text);
    }
  };

  const parsedWeight = weight ? parseFloat(weight) : 0;
  const isWeightValid = parsedWeight > 0;

  return (
    <OnboardingStep<number>
      title="What's your weight?"
      iconType="scale"
      onNext={(data) => {
        if (typeof data === 'number' && data > 0) {
          onComplete(data);
        }
      }}
      isNextDisabled={!isWeightValid}
      data={parsedWeight}
    >
      <View className="flex-row items-center">
        <Input
          value={weight}
          onChangeText={handleChange}
          placeholder={`Enter weight in ${unitSystem === 'metric' ? 'kg' : 'lbs'}`}
          className="flex-1 mr-2"
          keyboardType="numeric"
          autoFocus={true}
          returnKeyType="done"
          selectTextOnFocus={true}
        />
        <Text className="text-lg">{unitSystem === 'metric' ? 'kg' : 'lbs'}</Text>
      </View>
    </OnboardingStep>
  );
}
