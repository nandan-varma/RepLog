import { db, exercises } from '@/db';
import { eq, like } from 'drizzle-orm';
import { type InferSelectModel } from 'drizzle-orm';

export type Exercise = InferSelectModel<typeof exercises>;
export type ExerciseCategory = Exercise['category'];

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
  }
};
