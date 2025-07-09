CREATE TYPE "public"."guide_version_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "guide" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"current_version_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guide_version" (
	"id" text PRIMARY KEY NOT NULL,
	"guide_id" text NOT NULL,
	"version" integer NOT NULL,
	"body_md" text NOT NULL,
	"change_note" text,
	"status" "guide_version_status" DEFAULT 'pending' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	"reviewed_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" text,
	CONSTRAINT "guide_version_guide_id_version_unique" UNIQUE("guide_id","version")
);
--> statement-breakpoint
ALTER TABLE "guide_vote" DROP CONSTRAINT "guide_vote_guide_id_cancellation_guide_id_fk";
ALTER TABLE "cancellation_guide" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "cancellation_guide" CASCADE;--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "guide" ADD CONSTRAINT "guide_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_version" ADD CONSTRAINT "guide_version_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_version" ADD CONSTRAINT "guide_version_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_version" ADD CONSTRAINT "guide_version_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guide_id_version_idx" ON "guide_version" USING btree ("guide_id","version" desc);--> statement-breakpoint
ALTER TABLE "guide_vote" ADD CONSTRAINT "guide_vote_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guide"("id") ON DELETE cascade ON UPDATE no action;