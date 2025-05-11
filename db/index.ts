import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { exercises, workouts, bookmarks } from './schema';

// Create SQLite database connection

// Create a database connection
const expo = openDatabaseSync('db.db', { enableChangeListener: true });
export const db = drizzle(expo);

// Export schema to be used in services
export { exercises, workouts, bookmarks };

// Export types from schema
export type { Exercise, Workout, Bookmark } from './types';
