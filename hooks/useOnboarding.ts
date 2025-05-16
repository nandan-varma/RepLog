import { useState, useEffect, useCallback } from 'react';
import { useOnboardingStatus } from '@/services/onboardingService';
import { useTransitionContext } from '@/components/TransitionContext';

/**
 * Custom hook for managing onboarding flow and transitions
 * Centralizes all onboarding state management
 */
export function useOnboarding() {
  const { isOnboardingCompleted, isLoading, completeOnboarding, resetOnboarding } = useOnboardingStatus();
  const { isOnboardingAnimating, startOnboardingTransition, completeOnboardingTransition } = useTransitionContext();

  // Determine if we should show the main content
  const showMainContent = isOnboardingCompleted && !isOnboardingAnimating;

  // Function to complete onboarding with animation
  const finishOnboarding = useCallback(async () => {
    // First mark onboarding as completed in storage
    await completeOnboarding();
    // Then trigger the animation transition
    startOnboardingTransition();
  }, [completeOnboarding, startOnboardingTransition]);

  // For development purposes - reset onboarding
  const resetOnboardingFlow = useCallback(async () => {
    await resetOnboarding();
  }, [resetOnboarding]);

  return {
    // Status
    isOnboardingCompleted,
    isLoading,
    isOnboardingAnimating,
    showMainContent,
    
    // Actions
    finishOnboarding,
    resetOnboardingFlow,
    completeOnboardingTransition
  };
}
