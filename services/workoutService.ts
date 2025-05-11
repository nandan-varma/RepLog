import { db, workouts } from '@/db';
import { eq } from 'drizzle-orm';
import { type InferSelectModel } from 'drizzle-orm';

export type Workout = InferSelectModel<typeof workouts>;

export const workoutService = {
  /**
   * Get all workout logs
   */
  getAllLogs: async (): Promise<Workout[]> => {
    try {
      return await db.select().from(workouts);
    } catch (error) {
      console.error('Failed to fetch workout logs:', error);
      return [];
    }
  },

  /**
   * Get workout logs for a specific exercise
   */
  getLogsByExercise: async (exerciseId: string): Promise<Workout[]> => {
    try {
      return await db
        .select()
        .from(workouts)
        .where(eq(workouts.exerciseId, exerciseId))
        .orderBy(workouts.date);
    } catch (error) {
      console.error('Failed to fetch exercise logs:', error);
      return [];
    }
  },

  /**
   * Add a new workout log
   */
  addWorkoutLog: async (workoutData: Omit<Workout, 'id'>): Promise<Workout | null> => {
    try {
      const result = await db
        .insert(workouts)
        .values(workoutData)
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Failed to add workout log:', error);
      throw error;
    }
  },

  /**
   * Update a workout log
   */
  updateWorkoutLog: async (id: string, workoutData: Partial<Omit<Workout, 'id'>>): Promise<Workout | null> => {
    try {
      const result = await db
        .update(workouts)
        .set(workoutData)
        .where(eq(workouts.id, parseInt(id, 10)))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Failed to update workout log:', error);
      throw error;
    }
  },

  /**
   * Delete a workout log
   */
  deleteWorkoutLog: async (id: string): Promise<boolean> => {
    try {
      await db
        .delete(workouts)
        .where(eq(workouts.id, parseInt(id, 10)));
      return true;
    } catch (error) {
      console.error('Failed to delete workout log:', error);
      return false;
    }
  }
};
