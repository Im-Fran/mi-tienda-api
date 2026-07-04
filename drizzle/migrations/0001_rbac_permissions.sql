-- Drop old role_permissions first (it conflicts with the new table below)
DROP TABLE `role_permissions`;
--> statement-breakpoint

-- New RBAC tables
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_name_unique` ON `permissions` (`name`);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`permission` text NOT NULL,
	`priority` integer NOT NULL DEFAULT 0,
	`expires_at` integer,
	`granted_at` integer NOT NULL DEFAULT (strftime('%s','now')),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_permissions_role_id_permission_unique` ON `role_permissions` (`role_id`, `permission`);
--> statement-breakpoint
CREATE INDEX `role_permissions_role_idx` ON `role_permissions` (`role_id`);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`expires_at` integer,
	`granted_at` integer NOT NULL DEFAULT (strftime('%s','now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_roles_user_id_role_id_unique` ON `user_roles` (`user_id`, `role_id`);
--> statement-breakpoint
CREATE INDEX `user_roles_user_idx` ON `user_roles` (`user_id`);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`permission` text NOT NULL,
	`priority` integer NOT NULL DEFAULT 0,
	`expires_at` integer,
	`granted_at` integer NOT NULL DEFAULT (strftime('%s','now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_permissions_user_id_permission_unique` ON `user_permissions` (`user_id`, `permission`);
--> statement-breakpoint
CREATE INDEX `user_permissions_user_idx` ON `user_permissions` (`user_id`);
--> statement-breakpoint

-- Migrate existing roles
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`)
SELECT `id`, `name`, NULL, (strftime('%s','now')) FROM `system_roles`;
--> statement-breakpoint

-- Migrate existing user-role assignments
INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `expires_at`, `granted_at`)
SELECT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
       `user_id`, `role_id`, NULL, (strftime('%s','now'))
FROM `user_system_roles`;
--> statement-breakpoint

-- Drop remaining old tables
DROP TABLE `user_system_roles`;
--> statement-breakpoint
DROP TABLE `system_permissions`;
--> statement-breakpoint
DROP TABLE `system_roles`;
