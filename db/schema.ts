import { integer, text, real, sqliteTable, index, uniqueIndex } from "drizzle-orm/sqlite-core";

// Exercise details from Free Exercise DB
export const exercises = sqliteTable("exercises", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    force: text("force"),
    level: text("level", { enum: ["beginner", "intermediate", "expert"] }).notNull(),
    mechanic: text("mechanic", { enum: ["isolation", "compound"] }),
    equipment: text("equipment", { 
        enum: [
            "medicine ball", "dumbbell", "body only", "bands", "kettlebells",
            "foam roll", "cable", "machine", "barbell", "exercise ball",
            "e-z curl bar", "other"
        ]
    }),
    primaryMuscles: text("primary_muscles", { mode: "json" }).notNull().$type<string[]>(),
    secondaryMuscles: text("secondary_muscles", { mode: "json" }).notNull().$type<string[]>(),
    instructions: text("instructions", { mode: "json" }).notNull().$type<string[]>(),
    category: text("category", { 
        enum: ["powerlifting", "strength", "stretching", "cardio", 
                     "olympic weightlifting", "strongman", "plyometrics"] 
    }).notNull(),
    images: text("images", { mode: "json" }).notNull().$type<string[]>()
});

// User workout logs
export const workouts = sqliteTable(
    "workouts", 
    {
        id: integer("id").primaryKey({ autoIncrement: true }),
        exerciseId: text("exercise_id").references(() => exercises.id, { onDelete: "cascade" }),
        date: text("date").notNull(),
        sets: integer("sets").notNull(),
        reps: integer("reps").notNull(),
        weight: real("weight"),
        duration: integer("duration"), // in seconds
        notes: text("notes"),
        createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP")
    },
    (table) => [
        index("idx_workouts_date").on(table.date),
        index("idx_workouts_exercise_id").on(table.exerciseId)
    ]
);
