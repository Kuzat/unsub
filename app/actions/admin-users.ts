"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { UserWithRole } from "better-auth/plugins";
import { redirect } from "next/navigation";

// Schema for validating user ID input
const userIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Type for the user ID input
type UserIdInput = z.infer<typeof userIdSchema>;

/**
 * Sets the role of a user
 * @param userId The ID of the user to update
 * @param role The new role to assign to the user
 * @returns Object with success status and message or error
 */
export async function switchUserRole(userId: string, role: string) {
  try {
    // Validate the user ID
    const validatedInput = userIdSchema.safeParse({ userId });
    if (!validatedInput.success) {
      return {
        error: validatedInput.error.errors[0]?.message || "Invalid user ID",
      };
    }

    // Call the better-auth admin API to set the user's role
    const result = await auth.api.admin.setRole({
      headers: await headers(),
      body: {
        userId,
        role,
      },
    });

    return {
      success: "User role updated successfully",
      user: result.user,
    };
  } catch (error) {
    console.error("Error switching user role:", error);
    return {
      error: "An error occurred while updating the user's role",
    };
  }
}

/**
 * Impersonates a user
 * @param userId The ID of the user to impersonate
 * @returns Object with success status and message or error
 */
export async function impersonateUser(userId: string) {
  try {
    // Validate the user ID
    const validatedInput = userIdSchema.safeParse({ userId });
    if (!validatedInput.success) {
      return {
        error: validatedInput.error.errors[0]?.message || "Invalid user ID",
      };
    }

    // Call the better-auth admin API to impersonate the user
    await auth.api.admin.impersonateUser({
      headers: await headers(),
      body: {
        userId,
      },
    });

    // Redirect to the dashboard
    redirect("/dashboard");
  } catch (error) {
    console.error("Error impersonating user:", error);
    return {
      error: "An error occurred while impersonating the user",
    };
  }
}

/**
 * Bans a user
 * @param userId The ID of the user to ban
 * @param banReason Optional reason for the ban
 * @returns Object with success status and message or error
 */
export async function banUser(userId: string, banReason?: string) {
  try {
    // Validate the user ID
    const validatedInput = userIdSchema.safeParse({ userId });
    if (!validatedInput.success) {
      return {
        error: validatedInput.error.errors[0]?.message || "Invalid user ID",
      };
    }

    // Call the better-auth admin API to ban the user
    const result = await auth.api.admin.banUser({
      headers: await headers(),
      body: {
        userId,
        banReason,
      },
    });

    return {
      success: "User banned successfully",
      user: result.user,
    };
  } catch (error) {
    console.error("Error banning user:", error);
    return {
      error: "An error occurred while banning the user",
    };
  }
}

/**
 * Unbans a user
 * @param userId The ID of the user to unban
 * @returns Object with success status and message or error
 */
export async function unbanUser(userId: string) {
  try {
    // Validate the user ID
    const validatedInput = userIdSchema.safeParse({ userId });
    if (!validatedInput.success) {
      return {
        error: validatedInput.error.errors[0]?.message || "Invalid user ID",
      };
    }

    // Call the better-auth admin API to unban the user
    const result = await auth.api.admin.unbanUser({
      headers: await headers(),
      body: {
        userId,
      },
    });

    return {
      success: "User unbanned successfully",
      user: result.user,
    };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return {
      error: "An error occurred while unbanning the user",
    };
  }
}

/**
 * Deletes a user
 * @param userId The ID of the user to delete
 * @returns Object with success status and message or error
 */
export async function deleteUser(userId: string) {
  try {
    // Validate the user ID
    const validatedInput = userIdSchema.safeParse({ userId });
    if (!validatedInput.success) {
      return {
        error: validatedInput.error.errors[0]?.message || "Invalid user ID",
      };
    }

    // Call the better-auth admin API to remove the user
    const result = await auth.api.admin.removeUser({
      headers: await headers(),
      body: {
        userId,
      },
    });

    return {
      success: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      error: "An error occurred while deleting the user",
    };
  }
}