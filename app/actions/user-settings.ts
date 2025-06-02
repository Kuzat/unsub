"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { authClient } from "@/lib/client";

// Schema for validating display name input
const displayNameSchema = z.object({
  name: z.string().min(1, "Display name is required").max(100, "Display name must be less than 100 characters"),
});

// Type for the display name input
type UpdateDisplayNameInput = z.infer<typeof displayNameSchema>;

/**
 * Updates the display name of the authenticated user
 * @param input Object containing the new display name
 * @returns Object with success status and message
 */
export async function updateDisplayName(input: UpdateDisplayNameInput) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session) {
      return {
        success: false,
        message: "You must be logged in to update your display name",
      };
    }

    // Validate the input
    const validatedInput = displayNameSchema.safeParse(input);
    if (!validatedInput.success) {
      return {
        success: false,
        message: validatedInput.error.errors[0]?.message || "Invalid display name",
      };
    }

    // Update the user's display name using the better-auth API
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validatedInput.data.name
      }
    });

    return {
      success: true,
      message: "Display name updated successfully",
    };
  } catch (error) {
    console.error("Error updating display name:", error);
    return {
      success: false,
      message: "An error occurred while updating your display name",
    };
  }
}
