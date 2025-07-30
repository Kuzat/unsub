CREATE TYPE "public"."rate_limit_action" AS ENUM('guide_edit', 'image_upload');--> statement-breakpoint
CREATE TABLE "rate_limit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action_type" "rate_limit_action" NOT NULL,
	"resource_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rate_limit_log" ADD CONSTRAINT "rate_limit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rate_limit_user_action_idx" ON "rate_limit_log" USING btree ("user_id","action_type","created_at");--> statement-breakpoint
CREATE INDEX "rate_limit_user_resource_idx" ON "rate_limit_log" USING btree ("user_id","action_type","resource_id","created_at");