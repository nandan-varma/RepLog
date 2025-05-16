import { 
  useSecureStoreString, 
  useSecureStoreNumber, 
  useSecureStoreBoolean,
  saveToSecureStore,
  getFromSecureStore
} from './secureStorage';

// Define fitness goal types for TypeScript safety
export type FitnessGoalId = 'lose-weight' | 'build-muscle' | 'improve-fitness';

export interface FitnessGoalData {
  id: FitnessGoalId;
  title: string;
  description: string;
  recommendations?: {
    workoutsPerWeek: number;
    focusAreas: string[];
  };
}

// Fitness goals data
const fitnessGoals: FitnessGoalData[] = [
  {
    id: 'lose-weight',
    title: 'Lose Weight',
    description: 'Burn fat and improve overall health',
    recommendations: {
      workoutsPerWeek: 4,
      focusAreas: ['Cardio', 'HIIT', 'Full body']
    }
  },
  {
    id: 'build-muscle',
    title: 'Build Muscle',
    description: 'Increase strength and muscle mass',
    recommendations: {
      workoutsPerWeek: 5,
      focusAreas: ['Strength Training', 'Resistance', 'Progressive Overload']
    }
  },
  {
    id: 'improve-fitness',
    title: 'Improve Fitness',
    description: 'Enhance endurance and athletic performance',
    recommendations: {
      workoutsPerWeek: 3,
      focusAreas: ['Cardio', 'Functional Training', 'Flexibility']
    }
  }
];

// User preferences hook for fitness app
export const usePreferences = () => {
    const [theme, setTheme] = useSecureStoreString('theme');
    const [language, setLanguage] = useSecureStoreString('language');
    const [unitSystem, setUnitSystem] = useSecureStoreString('unitSystem');
    const [name, setName] = useSecureStoreString('name');
    const [age, setAge] = useSecureStoreNumber('age');
    const [weight, setWeight] = useSecureStoreNumber('weight'); // in kg
    const [height, setHeight] = useSecureStoreNumber('height'); // in cm
    const [fitnessGoal, setFitnessGoal] = useSecureStoreString('fitnessGoal');

    // Get fitness goal details
    const fitnessGoalDetails = fitnessGoal 
      ? fitnessGoals.find(goal => goal.id === fitnessGoal) 
      : undefined;

    // Get recommendations based on fitness goal
    const recommendations = fitnessGoalDetails?.recommendations || {
      workoutsPerWeek: 3,
      focusAreas: ['Full body']
    };

    return {
        // Basic preferences
        theme,
        setTheme,
        language,
        setLanguage,
        unitSystem,
        setUnitSystem,
        name,
        setName,
        age,
        setAge,
        weight,
        setWeight,
        height,
        setHeight,
        
        // Fitness goal preferences
        fitnessGoal: fitnessGoal as FitnessGoalId | undefined,
        setFitnessGoal: async (goalId: FitnessGoalId) => await setFitnessGoal(goalId),
        fitnessGoalDetails,
        recommendations
    };
};

/**
 * Get all available fitness goals
 * @returns Array of fitness goals
 */
export const getFitnessGoals = (): FitnessGoalData[] => {
  return fitnessGoals;
};

/**
 * Get a fitness goal by its ID
 * @param goalId The ID of the goal to find
 * @returns The fitness goal if found, undefined otherwise
 */
export const getFitnessGoalById = (goalId: string): FitnessGoalData | undefined => {
  return fitnessGoals.find(goal => goal.id === goalId);
};

