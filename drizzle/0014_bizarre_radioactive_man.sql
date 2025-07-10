ALTER TABLE "guide_version" ALTER COLUMN "reviewed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "guide_version" ALTER COLUMN "reviewed_at" DROP NOT NULL;