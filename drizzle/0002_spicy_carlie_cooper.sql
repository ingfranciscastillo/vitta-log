CREATE TYPE "public"."activity_intensity" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."body_measurement_type" AS ENUM('waist', 'hip', 'chest', 'arm', 'thigh', 'neck', 'body_fat');--> statement-breakpoint
CREATE TYPE "public"."fast_status" AS ENUM('active', 'completed');--> statement-breakpoint
CREATE TYPE "public"."habit_type" AS ENUM('water', 'steps', 'sleep');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TABLE "activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_id" text NOT NULL,
	"date" date NOT NULL,
	"time" time,
	"type" text NOT NULL,
	"duration_minutes" numeric(5, 2) NOT NULL,
	"intensity" "activity_intensity",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "body_measurement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_id" text NOT NULL,
	"type" "body_measurement_type" NOT NULL,
	"value" numeric(6, 2) NOT NULL,
	"date" date NOT NULL,
	"time" time,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fast" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_id" text NOT NULL,
	"status" "fast_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_minutes" numeric(8, 2),
	"type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_id" text NOT NULL,
	"type" "habit_type" NOT NULL,
	"value" numeric(8, 2) NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_id" text NOT NULL,
	"date" date NOT NULL,
	"time" time,
	"name" text NOT NULL,
	"calories" numeric(7, 2) NOT NULL,
	"protein" numeric(6, 2),
	"carbs" numeric(6, 2),
	"fat" numeric(6, 2),
	"meal_type" "meal_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_measurement" ADD CONSTRAINT "body_measurement_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fast" ADD CONSTRAINT "fast_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_log" ADD CONSTRAINT "habit_log_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal" ADD CONSTRAINT "meal_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_created_by_id_idx" ON "activity" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "activity_date_idx" ON "activity" USING btree ("date");--> statement-breakpoint
CREATE INDEX "body_measurement_created_by_id_idx" ON "body_measurement" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "body_measurement_date_idx" ON "body_measurement" USING btree ("date");--> statement-breakpoint
CREATE INDEX "fast_created_by_id_idx" ON "fast" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "fast_started_at_idx" ON "fast" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "habit_log_created_by_id_idx" ON "habit_log" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "habit_log_date_idx" ON "habit_log" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "habit_log_user_type_date_unique" ON "habit_log" USING btree ("created_by_id","type","date");--> statement-breakpoint
CREATE INDEX "meal_created_by_id_idx" ON "meal" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "meal_date_idx" ON "meal" USING btree ("date");