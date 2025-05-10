import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from 'drizzle-orm/expo-sqlite';

// Create a database connection
const expo = openDatabaseSync('db.db', { enableChangeListener: true });
export const db = drizzle(expo);
