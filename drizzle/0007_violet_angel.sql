ALTER TABLE "service" RENAME COLUMN "logo_url" TO "logo_original_url";--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "logo_cdn_url" text;--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "logo_hash" text;