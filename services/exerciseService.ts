import { db, exercises } from '@/db';
import { eq, like, sql } from 'drizzle-orm';
import { type InferSelectModel } from 'drizzle-orm';

export type Exercise = InferSelectModel<typeof exercises>;
export type ExerciseCategory = Exercise['category'];
export type ExerciseFilters = {
  query?: string;
  level?: Exercise['level'];
  equipment?: Exercise['equipment'];
  category?: ExerciseCategory;
  muscle?: string;
};

// API endpoint for free exercise database
const API_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export const exerciseService = {
  /**
   * Get all exercises from the database
   */
  getAll: async (): Promise<Exercise[]> => {
    try {
      return await db.select().from(exercises);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      return [];
    }
  },

  /**
   * Get all available categories from exercises
   */
  getCategories: async (): Promise<ExerciseCategory[]> => {
    try {
      // Get distinct categories from the database
      const result = await db
        .selectDistinct({ category: exercises.category })
        .from(exercises)
        .where(sql`${exercises.category} IS NOT NULL`);
      
      // Extract and sort categories
      return result
        .map(row => row.category)
        .filter(Boolean)
        .sort();
    } catch (error) {
      console.error('Failed to fetch exercise categories:', error);
      return [];
    }
  },

  /**
   * Get all available levels from exercises
   */
  getLevels: async (): Promise<Exercise["level"][]> => {
    try {
      // Get distinct levels from the database
      const result = await db
        .selectDistinct({ level: exercises.level })
        .from(exercises)
        .where(sql`${exercises.level} IS NOT NULL`);
      
      // Extract and sort levels
      return result
        .map(row => row.level)
        .filter(Boolean)
        .sort();
    } catch (error) {
      console.error('Failed to fetch exercise levels:', error);
      return [];
    }
  },

  /**
   * Get all available equipment types from exercises
   */
  getEquipment: async (): Promise<Exercise["equipment"][]> => {
    try {
      // Get distinct equipment types from the database
      const result = await db
        .selectDistinct({ equipment: exercises.equipment })
        .from(exercises)
        .where(sql`${exercises.equipment} IS NOT NULL`);
      
      // Extract and sort equipment types
      return result
        .map(row => row.equipment)
        .filter(Boolean)
        .sort();
    } catch (error) {
      console.error('Failed to fetch exercise equipment types:', error);
      return [];
    }
  },

  /**
   * Get exercise by ID
   */
  getById: async (id: string): Promise<Exercise | undefined> => {
    try {
      const result = await db.select().from(exercises).where(eq(exercises.id, id));
      return result[0];
    } catch (error) {
      console.error(`Failed to fetch exercise with ID ${id}:`, error);
      return undefined;
    }
  },

  /**
   * Alias for getById to maintain backwards compatibility
   */
  getExerciseById: async (id: string): Promise<Exercise | undefined> => {
    return exerciseService.getById(id);
  },

  /**
   * Appends cdn url to the image filename
   * @param filename - The filename of the image
   */
  getImageUrl: (filename: string): string => {
    return `${IMAGE_BASE_URL}${filename}`;
  },


  /**
   * Search exercises by name
   */
  searchByName: async (query: string): Promise<Exercise[]> => {
    try {
      return await db.select().from(exercises).where(like(exercises.name, `%${query}%`));
    } catch (error) {
      console.error('Failed to search exercises:', error);
      return [];
    }
  },

  /**
   * Get exercises by category
   */
  getByCategory: async (category: ExerciseCategory): Promise<Exercise[]> => {
    try {
      return await db.select().from(exercises).where(eq(exercises.category, category));
    } catch (error) {
      console.error('Failed to fetch exercises by category:', error);
      return [];
    }
  },

  /**
   * Filter exercises by search query and category
   */
  filterExercises: (exercises: Exercise[], searchQuery: string, category?: ExerciseCategory | 'all'): Exercise[] => {
    let filtered = exercises;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(exercise => 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === category);
    }
    
    return filtered;
  },

  /**
   * Search exercises with multiple filter criteria
   */
  searchExercises: async (filters: ExerciseFilters): Promise<Exercise[]> => {
    try {
      // Get all exercises and filter in JavaScript for more flexibility
      const allExercises = await db.select().from(exercises);
      let results = allExercises;
      

        if (filters.query) {
          results = results.filter(exercise => 
            exercise.name.toLowerCase().includes(filters.query!.toLowerCase())
          );
        }
        
        // Apply level filter
        if (filters.level) {
          results = results.filter(exercise => 
            exercise.level === filters.level
          );
        }
        
        // Apply equipment filter
        if (filters.equipment) {
          results = results.filter(exercise => 
            exercise.equipment === filters.equipment
          );
        }
        
        // Apply category filter
        if (filters.category) {
          results = results.filter(exercise => 
            exercise.category === filters.category
          );
        }
        
        // Apply primary muscle filter
        if (filters.muscle && filters.muscle.length > 0) {
          results = results.filter(exercise => {
            const muscles = exercise.primaryMuscles;
            return muscles.includes(filters.muscle as string);
          });
        }
      
      
      return results;
    } catch (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
  },

  /**
   * Fetch exercises from the remote API
   */
  fetchExercisesFromApi: async (): Promise<Exercise[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch exercises from API');
      }
      
      const data = await response.json();
      
      // Process the data to ensure it matches our Exercise type
      const processedData = data.map((exercise: any) => ({
        ...exercise,
        images: Array.isArray(exercise.images) ? exercise.images : 
               [exercise.images ? exercise.images : `${IMAGE_BASE_URL}${exercise.id}/0.jpg`],
        primaryMuscles: Array.isArray(exercise.primaryMuscles) ? exercise.primaryMuscles :
                       (typeof exercise.primaryMuscles === 'string' ? 
                        JSON.parse(exercise.primaryMuscles) : []),
        secondaryMuscles: Array.isArray(exercise.secondaryMuscles) ? exercise.secondaryMuscles :
                         (typeof exercise.secondaryMuscles === 'string' ? 
                          JSON.parse(exercise.secondaryMuscles) : []),
        instructions: Array.isArray(exercise.instructions) ? exercise.instructions :
                     (typeof exercise.instructions === 'string' ? 
                      JSON.parse(exercise.instructions) : [])
      }));
      
      return processedData;
    } catch (error) {
      console.error('Error fetching exercises from API:', error);
      return [];
    }
  },

  /**
   * Initialize the database with exercises from the API
   * Returns true if successful, false otherwise
   */
  initializeDatabase: async (): Promise<boolean> => {
    try {      // Check if database is already populated
      const existingExercises = await db.select().from(exercises);
      const count = existingExercises.length;
      
      if (count > 0) {
        console.log(`Database already contains ${count} exercises, skipping initialization`);
        return true;
      }
      
      // Fetch exercises from API
      const apiExercises = await exerciseService.fetchExercisesFromApi();
      if (!apiExercises.length) {
        console.error('No exercises fetched from API');
        return false;
      }
      
      // Insert exercises into database
      const batches = [];
      const batchSize = 50;
      
      // Split into batches to avoid SQLite limitations
      for (let i = 0; i < apiExercises.length; i += batchSize) {
        const batch = apiExercises.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      for (const batch of batches) {
        await db.insert(exercises).values(batch).onConflictDoNothing();
      }
      
      console.log(`Successfully initialized database with ${apiExercises.length} exercises`);
      return true;
    } catch (error) {
      console.error('Failed to initialize exercise database:', error);
      return false;
    }
  }
};
