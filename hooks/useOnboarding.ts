import { useOnboardingContext } from '@/components/OnboardingContext';

/**
 * Custom hook for managing onboarding flow
 * Uses the global OnboardingContext
 */
export function useOnboarding() {
  const { isOnboardingCompleted, isLoading, completeOnboarding, resetOnboarding } = useOnboardingContext();

  return {
    // Status
    isOnboardingCompleted,
    isLoading,

    // Actions
    finishOnboarding: completeOnboarding,
    resetOnboardingFlow: resetOnboarding
  };
}
