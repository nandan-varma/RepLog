import { useState, useEffect, useCallback } from 'react';
import { useSecureStoreBoolean, saveToSecureStore, getFromSecureStore } from './secureStorage';

// Key for storing onboarding completion status
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

/**
 * Custom hook for accessing onboarding status
 * @returns An object containing the onboarding status and functions to update it
 */
export const useOnboardingStatus = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useSecureStoreBoolean(ONBOARDING_COMPLETED_KEY, false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Once we have a value from storage (could be undefined initially), we're no longer loading
    if (isOnboardingCompleted !== undefined) {
      setIsLoading(false);
    }
  }, [isOnboardingCompleted]);

  const completeOnboarding = useCallback(async () => {
    await setIsOnboardingCompleted(true);
  }, [setIsOnboardingCompleted]);

  const resetOnboarding = useCallback(async () => {
    await setIsOnboardingCompleted(false);
  }, [setIsOnboardingCompleted]);

  return {
    isOnboardingCompleted: isOnboardingCompleted === true,
    isLoading,
    completeOnboarding,
    resetOnboarding
  };
};

/**
 * Service for checking and managing onboarding status
 */
export const onboardingService = {
  /**
   * Check if onboarding has been completed
   * @returns A promise that resolves to a boolean indicating if onboarding is completed
   */
  isOnboardingCompleted: async (): Promise<boolean> => {
    const value = await getFromSecureStore(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  },

  /**
   * Mark onboarding as completed
   */
  completeOnboarding: async (): Promise<void> => {
    await saveToSecureStore(ONBOARDING_COMPLETED_KEY, 'true');
  },

  /**
   * Reset onboarding status (for testing or user reset)
   */
  resetOnboarding: async (): Promise<void> => {
    await saveToSecureStore(ONBOARDING_COMPLETED_KEY, 'false');
  }
};
