"use server"

import {db} from "@/db";
import {guide, guideVersion} from "@/db/schema/app";
import {eq, desc} from "drizzle-orm";
import crypto from "crypto";
import {CreateGuideFormValues, createGuideSchema} from "@/lib/validation/guide";
import {isAdmin, requireAdmin, requireSession} from "@/lib/auth";
import {fetchServiceById} from "@/app/actions/services";
import {checkRateLimit, recordRateLimitAction} from "@/lib/rate-limiting";

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

  // Check rate limit for guide creation (non-admin users only)
  if (!userIsAdmin) {
    const rateLimitResult = await checkRateLimit(session.user.id, "guide_edit", input.serviceId, session);
    if (!rateLimitResult.allowed) {
      return { error: rateLimitResult.message || "Rate limit exceeded" };
    }
  }

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

      // Record the rate limit action for non-admin users
      if (!userIsAdmin) {
        await recordRateLimitAction(session.user.id, "guide_edit", data.serviceId);
      }

      return {success: "Guide created successfully"};
    });
  } catch (error) {
    console.error("Error creating guide:", error);
    return {error: "Failed to create guide"};
  }
}

/**
 * Fetches all guide versions with status "pending" for admin review
 * @returns An array of pending guide versions with related service and creator information
 */
export async function fetchPendingGuideVersions() {
  await requireAdmin()

  try {
    // Fetch all guide versions with status "pending" and include related guide, service, and creator information
    return await db.query.guideVersion.findMany({
      where: eq(guideVersion.status, "pending"),
      with: {
        guide: {
          with: {
            service: true
          }
        },
        createdBy: true,
      },
      orderBy: (gv) => [gv.createdAt]
    });
  } catch (error) {
    console.error("Error fetching pending guide versions:", error);
    throw new Error("Failed to fetch pending guide versions");
  }
}

/**
 * Fetches all guide versions with status "rejected" for admin review
 * @returns An array of rejected guide versions with related service and creator information
 */
export async function fetchRejectedGuideVersions() {
  await requireAdmin()

  try {
    // Fetch all guide versions with status "rejected" and include related guide, service, and creator information
    return await db.query.guideVersion.findMany({
      where: eq(guideVersion.status, "rejected"),
      with: {
        guide: {
          with: {
            service: true
          }
        },
        createdBy: true,
        reviewedBy: true,
      },
      orderBy: (gv) => [gv.reviewedAt, gv.createdAt]
    });
  } catch (error) {
    console.error("Error fetching rejected guide versions:", error);
    throw new Error("Failed to fetch rejected guide versions");
  }
}

/**
 * Creates a suggested edit to an existing guide by creating a new pending version
 * @param input The guide edit data
 * @returns Success or error message
 */
export async function suggestGuideEdit(input: Omit<CreateGuideFormValues, 'status'>): Promise<{ success: string } | { error: string }> {
  const session = await requireSession();

  // Check rate limit for guide edits
  const rateLimitResult = await checkRateLimit(session.user.id, "guide_edit", input.serviceId, session);
  if (!rateLimitResult.allowed) {
    return { error: rateLimitResult.message || "Rate limit exceeded" };
  }

  try {
    // Validate the input data (force status to pending for suggestions)
    const data = createGuideSchema.parse({...input, status: "pending"});

    const service = await fetchServiceById({id: data.serviceId, withGuide: true});
    if (!service) {
      return {error: "Service not found or you don't have permission to suggest edits for it"};
    }
    if (!service.guide) {
      return {error: "No guide exists for this service yet. Create a new guide instead."};
    }

    return await db.transaction(async (tx) => {
      // Get the next version number
      const latestVersion = await tx.query.guideVersion.findFirst({
        where: eq(guideVersion.guideId, service.guide!.id),
        orderBy: desc(guideVersion.version)
      });

      const nextVersion = (latestVersion?.version || 0) + 1;

      // Create a new pending guide version
      const versionId = crypto.randomUUID();
      await tx.insert(guideVersion).values({
        id: versionId,
        guideId: service.guide!.id,
        version: nextVersion,
        bodyMd: data.bodyMd,
        changeNote: data.changeNote || null,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id,
      });

      // Record the rate limit action
      await recordRateLimitAction(session.user.id, "guide_edit", data.serviceId);

      return {success: "Guide edit suggestion submitted successfully and is awaiting review"};
    });
  } catch (error) {
    console.error("Error suggesting guide edit:", error);
    return {error: "Failed to submit guide edit suggestion"};
  }
}

/**
 * Updates the status of a guide version (approve or reject)
 * @param id The ID of the guide version to update
 * @param status The new status ("approved" or "rejected")
 * @returns Success or error message
 */
export async function updateGuideVersionStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<{ success: string } | { error: string }> {
  const session = await requireAdmin()

  try {
    return await db.transaction(async (tx) => {
      // Find the guide version
      const versionToUpdate = await tx.query.guideVersion.findFirst({
        where: eq(guideVersion.id, id),
        with: {
          guide: true
        }
      });

      if (!versionToUpdate) {
        return {error: "Guide version not found"};
      }

      // Update the guide version status
      await tx
        .update(guideVersion)
        .set({
          status,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(guideVersion.id, id));

      // If approved, update the guide's current version
      if (status === "approved") {
        await tx
          .update(guide)
          .set({
            currentVersionId: id,
            updatedAt: new Date(),
          })
          .where(eq(guide.id, versionToUpdate.guideId));
      }

      return {success: `Guide version ${status === "approved" ? "approved" : "rejected"} successfully`};
    });
  } catch (error) {
    console.error(`Error ${status === "approved" ? "approving" : "rejecting"} guide version:`, error);
    return {error: `Failed to ${status === "approved" ? "approve" : "reject"} guide version`};
  }
}
