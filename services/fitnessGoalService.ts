import { 
  usePreferences, 
  getFitnessGoals as getGoals, 
  getFitnessGoalById as getGoalById,
  FitnessGoalId, 
  FitnessGoalData 
} from './preferencesService';
import type { FitnessGoal } from '@/components/onboarding/FitnessGoalSelector';

// Re-export types for backwards compatibility
export type { FitnessGoalId, FitnessGoalData };

/**
 * Get available fitness goals with their metadata
 * @returns Array of fitness goals
 */
export const getFitnessGoals = getGoals;

/**
 * Get a fitness goal by its ID
 * @returns The fitness goal if found, undefined otherwise
 */
export const getFitnessGoalById = getGoalById;

/**
 * Hook to get and set the user's fitness goal preference
 */
export const useFitnessGoal = usePreferences;
