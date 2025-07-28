CREATE TABLE "guide_image" (
	"id" text PRIMARY KEY NOT NULL,
	"guide_id" text NOT NULL,
	"original_url" text,
	"cdn_url" text NOT NULL,
	"image_hash" text NOT NULL,
	"alt_text" text,
	"width" integer,
	"height" integer,
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guide_image" ADD CONSTRAINT "guide_image_guide_id_guide_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guide"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guide_image_guide_idx" ON "guide_image" USING btree ("guide_id");--> statement-breakpoint
CREATE INDEX "guide_image_hash_idx" ON "guide_image" USING btree ("image_hash");