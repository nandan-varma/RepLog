import { relations, type InferSelectModel } from "drizzle-orm";
import { exercises, workouts, bookmarks } from "./schema";

// Inferred types from database schema
export type Exercise = InferSelectModel<typeof exercises>;
export type Workout = InferSelectModel<typeof workouts>;
export type Bookmark = InferSelectModel<typeof bookmarks>;

// Define relations between tables
export const exerciseRelations = relations(exercises, ({ many }) => ({
  workouts: many(workouts),
  bookmarks: many(bookmarks),
}));

export const workoutRelations = relations(workouts, ({ one }) => ({
  exercise: one(exercises, {
    fields: [workouts.exerciseId],
    references: [exercises.id],
  }),
}));

export const bookmarkRelations = relations(bookmarks, ({ one }) => ({
  exercise: one(exercises, {
    fields: [bookmarks.exerciseId],
    references: [exercises.id],
  }),
}));
