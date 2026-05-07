CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `workflow_run_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`node_id` text NOT NULL,
	`node_type` text NOT NULL,
	`node_name` text NOT NULL,
	`status` text NOT NULL,
	`input` text,
	`output` text,
	`error` text,
	`started_at` integer,
	`finished_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `workflow_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workflow_run_steps_run_id_idx` ON `workflow_run_steps` (`run_id`);--> statement-breakpoint
CREATE INDEX `workflow_run_steps_node_id_idx` ON `workflow_run_steps` (`node_id`);--> statement-breakpoint
CREATE INDEX `workflow_run_steps_created_at_idx` ON `workflow_run_steps` (`created_at`);--> statement-breakpoint
CREATE TABLE `workflow_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workflow_id` text NOT NULL,
	`workflow_version_id` text NOT NULL,
	`cloudflare_workflow_instance_id` text,
	`trigger_node_id` text,
	`status` text NOT NULL,
	`input` text,
	`output` text,
	`error` text,
	`started_at` integer,
	`finished_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workflow_version_id`) REFERENCES `workflow_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workflow_runs_user_id_idx` ON `workflow_runs` (`user_id`);--> statement-breakpoint
CREATE INDEX `workflow_runs_workflow_id_idx` ON `workflow_runs` (`workflow_id`);--> statement-breakpoint
CREATE INDEX `workflow_runs_workflow_version_id_idx` ON `workflow_runs` (`workflow_version_id`);--> statement-breakpoint
CREATE INDEX `workflow_runs_cloudflare_workflow_instance_id_idx` ON `workflow_runs` (`cloudflare_workflow_instance_id`);--> statement-breakpoint
CREATE INDEX `workflow_runs_created_at_idx` ON `workflow_runs` (`created_at`);--> statement-breakpoint
CREATE TABLE `workflow_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`workflow_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`definition` text NOT NULL,
	`created_at` integer NOT NULL,
	`created_by_user_id` text NOT NULL,
	FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workflow_versions_workflow_id_idx` ON `workflow_versions` (`workflow_id`);--> statement-breakpoint
CREATE INDEX `workflow_versions_created_by_user_id_idx` ON `workflow_versions` (`created_by_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `workflow_versions_workflow_id_version_number_idx` ON `workflow_versions` (`workflow_id`,`version_number`);--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_version_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`published_version_id`) REFERENCES `workflow_versions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `workflows_user_id_idx` ON `workflows` (`user_id`);--> statement-breakpoint
CREATE INDEX `workflows_published_version_id_idx` ON `workflows` (`published_version_id`);