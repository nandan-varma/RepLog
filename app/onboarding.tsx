import React, { useState } from 'react';
import { usePreferences } from '@/services/preferencesService';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { NameStep } from '@/components/onboarding/steps/NameStep';
import { AgeStep } from '@/components/onboarding/steps/AgeStep';
import { WeightStep } from '@/components/onboarding/steps/WeightStep';
import { HeightStep } from '@/components/onboarding/steps/HeightStep';
import { FitnessGoalStep } from '@/components/onboarding/steps/FitnessGoalStep';
import { SuccessStep } from '@/components/onboarding/steps/SuccessStep';
import type { FitnessGoalId } from '@/services';

export default function OnboardingScreen() {
  const {
    name, setName,
    age, setAge,
    weight, setWeight,
    height, setHeight,
    fitnessGoal, setFitnessGoal
  } = usePreferences();
  
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: name || '',
    age: age || 0,
    weight: weight || 0,
    height: height || 0,
    fitnessGoal: fitnessGoal || ''
  });

  // Total steps (excluding welcome and success)
  const totalSteps = 5;
  
  // Handle completion of each step
  const handleStepComplete = (data: any) => {
    if (step === 0) {
      // Welcome step completed
      setStep(1);
    } else if (step === 1) {
      // Name step completed
      setUserData(prev => ({ ...prev, name: data }));
      setStep(2);
    } else if (step === 2) {
      // Age step completed
      setUserData(prev => ({ ...prev, age: data }));
      setStep(3);
    } else if (step === 3) {
      // Weight step completed
      setUserData(prev => ({ ...prev, weight: data }));
      setStep(4);
    } else if (step === 4) {
      // Height step completed
      setUserData(prev => ({ ...prev, height: data }));
      setStep(5);
    } else if (step === 5) {
      // Fitness goal step completed
      setUserData(prev => ({ ...prev, fitnessGoal: data }));
      setStep(6);
    } else {
      // Success step completed - save data and navigate
      saveUserData();
    }
  };
  
  const { finishOnboarding } = useOnboarding();
  
  const saveUserData = async () => {
    // Save all preferences using the service
    await setName(userData.name);
    await setAge(userData.age);
    await setWeight(userData.weight);
    await setHeight(userData.height);
    // Ensure fitness goal is correctly typed before saving
    if (userData.fitnessGoal && ['lose-weight', 'build-muscle', 'improve-fitness'].includes(userData.fitnessGoal)) {
      await setFitnessGoal(userData.fitnessGoal as FitnessGoalId);
    }

    // Finish onboarding
    await finishOnboarding();
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Calculate current progress step (for indicator)
  const currentProgressStep = step === 0 || step === 6 ? 0 : step - 1;
  
  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep onComplete={handleStepComplete} />;
      case 1:
        return <NameStep onComplete={handleStepComplete} initialValue={userData.name} />;
      case 2:
        return <AgeStep onComplete={handleStepComplete} initialValue={userData.age} />;
      case 3:
        return <WeightStep onComplete={handleStepComplete} initialValue={userData.weight} />;
      case 4:
        return <HeightStep onComplete={handleStepComplete} initialValue={userData.height} />;
      case 5:
        return <FitnessGoalStep onComplete={handleStepComplete} initialValue={userData.fitnessGoal} />;
      case 6:
        return <SuccessStep onComplete={handleStepComplete} />;
      default:
        return null;
    }
  };

  // Show back button for all steps except welcome and success
  const showBackButton = step > 0 && step < 6;

  return (
    <OnboardingLayout
      currentStep={currentProgressStep}
      totalSteps={totalSteps}
      showBackButton={showBackButton}
      onBack={handleBack}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}

