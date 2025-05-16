import { createContext, useContext, useState } from 'react';
import { type Exercise } from '@/services/exerciseService';

type TransitionContextType = {
  selectedExercise: Exercise | null;
  setSelectedExercise: (exercise: Exercise | null) => void;
  isOnboardingAnimating: boolean;
  startOnboardingTransition: () => void;
  completeOnboardingTransition: () => void;
};

const TransitionContext = createContext<TransitionContextType>({
  selectedExercise: null,
  setSelectedExercise: () => {},
  isOnboardingAnimating: false,
  startOnboardingTransition: () => {},
  completeOnboardingTransition: () => {},
});

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isOnboardingAnimating, setIsOnboardingAnimating] = useState<boolean>(false);
  
  const startOnboardingTransition = () => {
    setIsOnboardingAnimating(true);
  };
  
  const completeOnboardingTransition = () => {
    setIsOnboardingAnimating(false);
  };
  
  return (
    <TransitionContext.Provider value={{ 
      selectedExercise, 
      setSelectedExercise,
      isOnboardingAnimating,
      startOnboardingTransition,
      completeOnboardingTransition
    }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionContext() {
  return useContext(TransitionContext);
}
