// Exercise data service
import { exercises } from '@/db/schema';
import { db } from '@/db/db';
import { eq, like } from 'drizzle-orm';
import { relations, type InferSelectModel } from "drizzle-orm"

export type Exercise = InferSelectModel<typeof exercises>;

const API_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

// Fetch all exercises from the API
export const fetchExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch exercises');
    }
    const data: Exercise[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
};

// Get image URL for an exercise
export const getExerciseImageUrl = (exerciseId: string, imageIndex: number = 0): string => {
  return `${IMAGE_BASE_URL}${exerciseId}/${imageIndex}.jpg`;
};

// Save exercises to the local database
export const saveExercisesToDb = async (exercisesList: Exercise[]) => {
  try {
    // Convert the exercises to the format expected by the database
    const dbExercises = exercisesList;

    // Insert the exercises into the database, ignore if they already exist
    for (const exercise of dbExercises) {
      try {
        await db.insert(exercises).values(exercise).onConflictDoNothing();
      } catch (error) {
        console.error(`Error inserting exercise ${exercise.id}:`, error);
      }
    }
    
    console.log(`Saved ${dbExercises.length} exercises to database`);
  } catch (error) {
    console.error('Error saving exercises to database:', error);
  }
};

// Get exercise by ID from local database
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  try {
    const results = await db.select().from(exercises).where(eq(exercises.id, id));
    return results.length > 0 ? results[0] as unknown as Exercise : null;
  } catch (error) {
    console.error(`Error getting exercise ${id}:`, error);
    return null;
  }
};

// Interface for search filters
export interface ExerciseFilters {
  query?: string;
  level?: Exercise['level'];
  equipment?: Exercise['equipment'];
  category?: Exercise['category'];
  muscle?: string; // muscle remains string as it's a single value from primaryMuscles array
}

// Search exercises by name or muscle group with additional filters
export const searchExercises = async (filters: ExerciseFilters | string): Promise<Exercise[]> => {
  try {
    // Get all exercises and filter in JavaScript for better compatibility
    const allExercises = await db.select().from(exercises);
    
    let results = allExercises as unknown as Exercise[];
    
    // Handle legacy string parameter for backward compatibility
    if (typeof filters === 'string') {
      if (filters) {
        results = results.filter(exercise => 
          exercise.name.toLowerCase().includes(filters.toLowerCase())
        );
      }
    } else {
      // Apply name filter
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
      if (filters.muscle) {
        results = results.filter(exercise => {
          // Handle case when primaryMuscles is a string or an array
          const muscles = Array.isArray(exercise.primaryMuscles) 
            ? exercise.primaryMuscles 
            : typeof exercise.primaryMuscles === 'string'
              ? JSON.parse(exercise.primaryMuscles) 
              : [];
          
          return muscles.includes(filters.muscle);
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error searching exercises:`, error);
    return [];
  }
};
