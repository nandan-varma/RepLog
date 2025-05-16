import { exerciseService } from './exerciseService';
import { onboardingService } from './onboardingService';

export const initializationService = {
  /**
   * Initialize the application data
   * This should be called when the app starts
   */
  initialize: async (): Promise<void> => {
    try {
      console.log('Starting application initialization...');
      
      // Initialize exercises database
      await exerciseService.initializeDatabase();      // MMKV storage is initialized automatically through the storage export
      // The storage instance is ready to use immediately after import
      console.log('MMKV storage initialized');
      
      // Check if this is the first run (onboarding not completed)
      const isOnboardingCompleted = await onboardingService.isOnboardingCompleted();
      console.log('Onboarding status:', isOnboardingCompleted ? 'completed' : 'not completed');
      
      console.log('Application initialization completed successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
    }
  }
};
