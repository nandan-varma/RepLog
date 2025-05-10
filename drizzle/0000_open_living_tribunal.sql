CREATE TABLE `workout_details` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`force` text,
	`level` text NOT NULL,
	`mechanic` text,
	`equipment` text,
	`primary_muscles` text NOT NULL,
	`secondary_muscles` text NOT NULL,
	`instructions` text NOT NULL,
	`category` text NOT NULL,
	`images` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_types_name_unique` ON `workout_types` (`name`);--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_type_id` integer,
	`workout_detail_id` text,
	`date` text NOT NULL,
	`duration` text NOT NULL,
	`sets` integer,
	`reps` integer,
	`weight_lifted` real,
	`distance_run` real,
	`notes` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`workout_type_id`) REFERENCES `workout_types`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workout_detail_id`) REFERENCES `workout_details`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_workouts_date` ON `workouts` (`date`);--> statement-breakpoint
CREATE INDEX `idx_workouts_workout_detail_id` ON `workouts` (`workout_detail_id`);