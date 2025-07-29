"use server"

import {db} from "@/db";
import {rateLimitLog} from "@/db/schema/app";
import {and, count, eq, gte} from "drizzle-orm";
import crypto from "crypto";
import {isAdmin} from "@/lib/auth";

export type RateLimitAction = "guide_edit" | "image_upload";

export interface RateLimitRule {
  action: RateLimitAction;
  windowMinutes: number;
  maxRequests: number;
  maxRequestsAdmin: number;
}

// Configuration for rate limiting rules
const RATE_LIMIT_RULES: Record<RateLimitAction, RateLimitRule> = {
  guide_edit: {
    action: "guide_edit",
    windowMinutes: 60, // 1 hour
    maxRequests: 5, // Regular users can suggest 5 edits per hour
    maxRequestsAdmin: 50, // Admins get higher limits
  },
  image_upload: {
    action: "image_upload", 
    windowMinutes: 60, // 1 hour
    maxRequests: 20, // Regular users can upload 20 images per hour
    maxRequestsAdmin: 100, // Admins get higher limits
  },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: Date;
  message?: string;
}

/**
 * Check if a user can perform an action based on rate limiting rules
 * @param userId - The user ID to check
 * @param action - The action type to check
 * @param resourceId - Optional resource ID for per-resource limits
 * @param userSession - User session to check admin status
 * @returns RateLimitResult indicating if the action is allowed
 */
export async function checkRateLimit(
  userId: string,
  action: RateLimitAction,
  resourceId?: string,
  userSession?: any
): Promise<RateLimitResult> {
  const rule = RATE_LIMIT_RULES[action];
  if (!rule) {
    return { allowed: true };
  }

  // Calculate the time window
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - rule.windowMinutes);

  // Determine max requests based on admin status
  const userIsAdmin = userSession ? isAdmin(userSession) : false;
  const maxRequests = userIsAdmin ? rule.maxRequestsAdmin : rule.maxRequests;

  try {
    // Build the query conditions
    const conditions = [
      eq(rateLimitLog.userId, userId),
      eq(rateLimitLog.actionType, action),
      gte(rateLimitLog.createdAt, windowStart)
    ];

    // Add resource filter if specified
    if (resourceId) {
      conditions.push(eq(rateLimitLog.resourceId, resourceId));
    }

    // Count recent actions
    const result = await db
      .select({ count: count() })
      .from(rateLimitLog)
      .where(and(...conditions));

    const currentCount = result[0]?.count || 0;
    const remaining = Math.max(0, maxRequests - currentCount);
    const resetTime = new Date();
    resetTime.setMinutes(resetTime.getMinutes() + rule.windowMinutes);

    if (currentCount >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        message: `Rate limit exceeded. You can perform ${maxRequests} ${action.replace('_', ' ')} actions per ${rule.windowMinutes} minutes. Try again after ${resetTime.toLocaleTimeString()}.`
      };
    }

    return {
      allowed: true,
      remaining,
      resetTime
    };

  } catch (error) {
    console.error("Error checking rate limit:", error);
    // Fail open - allow the action if we can't check the rate limit
    return { allowed: true };
  }
}

/**
 * Record an action in the rate limit log
 * @param userId - The user ID performing the action
 * @param action - The action type being performed
 * @param resourceId - Optional resource ID
 */
export async function recordRateLimitAction(
  userId: string,
  action: RateLimitAction,
  resourceId?: string
): Promise<void> {
  try {
    await db.insert(rateLimitLog).values({
      id: crypto.randomUUID(),
      userId,
      actionType: action,
      resourceId: resourceId || null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error recording rate limit action:", error);
    // Don't throw here - we don't want rate limiting to break the actual functionality
  }
}


/**
 * Get rate limit status for a user across all actions
 * Useful for displaying current usage in UI
 */
export async function getRateLimitStatus(
  userId: string,
  userSession?: any
): Promise<Record<RateLimitAction, RateLimitResult>> {
  const results: Record<RateLimitAction, RateLimitResult> = {} as any;

  for (const action of Object.keys(RATE_LIMIT_RULES) as RateLimitAction[]) {
    results[action] = await checkRateLimit(userId, action, undefined, userSession);
  }

  return results;
}