DROP INDEX `categories_store_slug_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_store_parent_slug_unique` ON `categories` (`store_id`,`parent_id`,`slug`);