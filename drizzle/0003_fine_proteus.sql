ALTER TABLE "user" ADD COLUMN "water_goal" numeric(7, 2) DEFAULT '2000' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "steps_goal" numeric(8, 2) DEFAULT '8000' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "sleep_goal" numeric(4, 2) DEFAULT '8' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "calorie_goal" numeric(7, 2) DEFAULT '2000' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "protein_goal" numeric(6, 2) DEFAULT '100' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "carbs_goal" numeric(6, 2) DEFAULT '250' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "fat_goal" numeric(6, 2) DEFAULT '70' NOT NULL;