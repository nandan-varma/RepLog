import { exerciseService } from './exerciseService';
import { onboardingService } from './onboardingService';

export const initializationService = {
  /**
   * Initialize the application data
   * This should be called when the app starts
   */
  initialize: async (): Promise<void> => {
    try {
      // Initialize exercises database
      await exerciseService.initializeDatabase();
      // MMKV storage is initialized automatically
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
};
