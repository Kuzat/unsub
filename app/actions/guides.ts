"use server"

import {db} from "@/db";
import {guide, guideVersion} from "@/db/schema/app";
import {eq} from "drizzle-orm";
import crypto from "crypto";
import {CreateGuideFormValues, createGuideSchema} from "@/lib/validation/guide";
import {isAdmin, requireSession} from "@/lib/auth";
import {fetchServiceById} from "@/app/actions/services";

export type Guide = typeof guide.$inferInsert;
export type GuideVersion = typeof guideVersion.$inferInsert;

/**
 * Creates a new guide for a service or updates an existing one
 * @param input The guide data
 * @returns The created guide or an error
 */
export async function createGuide(input: CreateGuideFormValues): Promise<{ success: string } | { error: string }> {
  const session = await requireSession();
  const userIsAdmin = isAdmin(session);

  try {
    // Validate the input data
    const data = createGuideSchema.parse(input);

    if (!userIsAdmin && data.status !== "pending") {
      return {error: "guides need to be created as pending, and will be reviewed by an admin before being published"};
    }

    const service = await fetchServiceById({id: data.serviceId, withGuide: true});
    if (!service) {
      return {error: "Service not found or you don't have permission to create a guide for it"};
    }
    if (service.guide) {
      return {error: "A guide for this service already exists"};
    }

    return await db.transaction(async (tx) => {
      // Create a new guide
      const guideId = crypto.randomUUID();
      await tx.insert(guide).values({
        id: guideId,
        serviceId: data.serviceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create a new guide version
      const versionId = crypto.randomUUID();
      await tx.insert(guideVersion).values({
        id: versionId,
        guideId,
        version: 1,
        bodyMd: data.bodyMd,
        changeNote: data.changeNote || null,
        status: data.status,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id,
        reviewedAt: userIsAdmin && data.status === "approved" ? new Date() : null,
        reviewedBy: userIsAdmin && data.status === "approved" ? session.user.id : null,
      });

      // Update the guide's current version only if the guideVersion has status "approved"
      if (data.status === "approved") {
        await tx
          .update(guide)
          .set({
            currentVersionId: versionId,
            updatedAt: new Date(),
          })
          .where(eq(guide.id, guideId));
      }

      return {success: "Guide created successfully"};
    });
  } catch (error) {
    console.error("Error creating guide:", error);
    return {error: "Failed to create guide"};
  }
}