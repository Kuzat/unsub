DROP INDEX "guide_id_version_idx";--> statement-breakpoint
CREATE INDEX "guide_id_status_version_idx" ON "guide_version" USING btree ("guide_id","status","version" desc);--> statement-breakpoint
ALTER TABLE "guide" ADD CONSTRAINT "guide_service_id_unique" UNIQUE("service_id");