ALTER TABLE `workout_details` RENAME TO `exercises`;--> statement-breakpoint
DROP TABLE `workout_types`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exercise_id` text,
	`date` text NOT NULL,
	`sets` integer NOT NULL,
	`reps` integer NOT NULL,
	`weight` real,
	`duration` integer,
	`notes` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "exercise_id", "date", "sets", "reps", "weight", "duration", "notes", "created_at") SELECT "id", "exercise_id", "date", "sets", "reps", "weight", "duration", "notes", "created_at" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_workouts_date` ON `workouts` (`date`);--> statement-breakpoint
CREATE INDEX `idx_workouts_exercise_id` ON `workouts` (`exercise_id`);