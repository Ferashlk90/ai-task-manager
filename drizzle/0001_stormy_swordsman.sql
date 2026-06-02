ALTER TABLE "tasks" ADD COLUMN "title_en" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "description_en" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "english_tasks_enabled" boolean DEFAULT true NOT NULL;