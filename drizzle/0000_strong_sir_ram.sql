CREATE TABLE `visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`first_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
