// Workout logging service
import { workouts } from '@/db/schema';
import { db } from '@/db/db';
import { eq, desc } from 'drizzle-orm';
import { relations, type InferSelectModel } from "drizzle-orm"

// Interface for workout log entry
export type WorkoutLog = InferSelectModel<typeof workouts>;

// Add a new workout log
export const addWorkoutLog = async (workout: WorkoutLog): Promise<number | null> => {
  try {
    // Format date as ISO string if it's not already
    // if (workout.date instanceof Date) {
    //   workout.date = workout.date.toISOString();
    // }
    
    const result = await db.insert(workouts).values({
      exerciseId: workout.exerciseId,
      date: workout.date,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight,
      duration: workout.duration,
      notes: workout.notes,
    }).returning({ insertedId: workouts.id });
    
    return result[0]?.insertedId || null;
  } catch (error) {
    console.error('Error adding workout log:', error);
    return null;
  }
};

// Get all workout logs
export const getAllWorkoutLogs = async (): Promise<WorkoutLog[]> => {
  try {
    const results = await db.select().from(workouts).orderBy(desc(workouts.date));
    return results as WorkoutLog[];
  } catch (error) {
    console.error('Error getting workout logs:', error);
    return [];
  }
};

// Get workout logs by date
export const getWorkoutLogsByDate = async (date: string): Promise<WorkoutLog[]> => {
  try {
    const results = await db.select().from(workouts).where(eq(workouts.date, date));
    return results as WorkoutLog[];
  } catch (error) {
    console.error(`Error getting workout logs for date ${date}:`, error);
    return [];
  }
};

// Update a workout log
export const updateWorkoutLog = async (id: number, workout: Partial<WorkoutLog>): Promise<boolean> => {
  try {
    const updateObject: Partial<WorkoutLog> = {
      exerciseId: workout.exerciseId,
      date: workout.date,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight,
      duration: workout.duration,
      notes: workout.notes,
    };

    await db.update(workouts)
      .set(updateObject)
      .where(eq(workouts.id, id));
    return true;
  } catch (error) {
    console.error(`Error updating workout log ${id}:`, error);
    return false;
  }
};

// Delete a workout log
export const deleteWorkoutLog = async (id: number): Promise<boolean> => {
  try {
    await db.delete(workouts).where(eq(workouts.id, id));
    return true;
  } catch (error) {
    console.error(`Error deleting workout log ${id}:`, error);
    return false;
  }
};
