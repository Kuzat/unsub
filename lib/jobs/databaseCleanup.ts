import {db} from '@/db';
import {rateLimitLog, service} from '@/db/schema/app';
import {lt, isNotNull} from 'drizzle-orm';
import {listObjects, deleteObject} from '@/lib/storage';

export interface CleanupTask {
  name: string;
  description: string;
  execute: () => Promise<CleanupTaskResult>;
}

export interface CleanupTaskResult {
  success: boolean;
  message: string;
  recordsDeleted?: number;
  error?: string;
}

export interface DatabaseCleanupResult {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  tasks: Array<{
    name: string;
    result: CleanupTaskResult;
  }>;
}

/**
 * Clean up old rate limit logs
 * @param retentionDays - Number of days to keep logs (default: 7)
 */
async function cleanupRateLimitLogs(retentionDays: number = 7): Promise<CleanupTaskResult> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await db
      .delete(rateLimitLog)
      .where(lt(rateLimitLog.createdAt, cutoffDate));

    const recordsDeleted = result.rowCount || 0;

    return {
      success: true,
      message: `Cleaned up ${recordsDeleted} old rate limit logs older than ${retentionDays} days`,
      recordsDeleted,
    };
  } catch (error) {
    console.error('Error cleaning up rate limit logs:', error);
    return {
      success: false,
      message: 'Failed to clean up rate limit logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clean up orphaned logo images from storage that are not connected to any service
 * This function enumerates logo files in storage and removes those not referenced by any service
 */
async function cleanupOrphanedLogoImages(): Promise<CleanupTaskResult> {
  try {
    // List all logo files in storage
    const logoFiles = await listObjects("logo/");

    if (logoFiles.length === 0) {
      return {
        success: true,
        message: 'No logo files found in storage',
        recordsDeleted: 0,
      };
    }

    // Get all logoCdnUrl values from services
    const servicesWithLogos = await db
      .select({logoCdnUrl: service.logoCdnUrl})
      .from(service)
      .where(isNotNull(service.logoCdnUrl));

    // Extract the storage keys from CDN URLs
    // CDN URLs are in format: https://cdn.example.com/logo/hash.webp
    // We need to extract the "logo/hash.webp" part
    const referencedKeys = new Set<string>();
    for (const svc of servicesWithLogos) {
      if (svc.logoCdnUrl) {
        try {
          const url = new URL(svc.logoCdnUrl);
          // Remove leading slash and extract the key
          const key = url.pathname.substring(1);
          const match = key.match(/^logo\/(.+)$/);
          if (match) {
            referencedKeys.add(match[1]);
          } else {
            console.warn(`Invalid CDN URL: ${svc.logoCdnUrl}`)
          }
        } catch {
          console.warn(`Invalid CDN URL: ${svc.logoCdnUrl}`);
        }
      }
    }

    // Find orphaned files (files in storage that are not referenced by any service)
    const orphanedFiles = logoFiles.filter(file => !referencedKeys.has(file));

    let deletedCount = 0;
    const deletionErrors: string[] = [];

    // Delete orphaned files from storage
    for (const orphanedFile of orphanedFiles) {
      console.log(`Deleting orphaned logo file: ${orphanedFile}`);
      const deleted = await deleteObject("logo/" + orphanedFile);
      if (deleted) {
        deletedCount++;
      } else {
        deletionErrors.push(orphanedFile);
      }
    }

    let message = `Logo cleanup completed. Found ${logoFiles.length} files in storage, ${referencedKeys.size} referenced by services, deleted ${deletedCount} orphaned files.`;

    if (deletionErrors.length > 0) {
      message += ` Failed to delete ${deletionErrors.length} files.`;
    }

    return {
      success: deletionErrors.length === 0,
      message,
      recordsDeleted: deletedCount,
    };
  } catch (error) {
    console.error('Error cleaning up orphaned logo images:', error);
    return {
      success: false,
      message: 'Failed to clean up orphaned logo images',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clean up orphaned guide images (example of extensible cleanup)
 * This is a placeholder for future cleanup tasks
 */
async function cleanupOrphanedGuideImages(): Promise<CleanupTaskResult> {
  try {
    // TODO: Implement cleanup of guide images that are no longer referenced
    // This could involve checking for images in the CDN that aren't in the database
    // or database records that point to non-existent CDN files

    return {
      success: true,
      message: 'Orphaned guide images cleanup completed (placeholder)',
      recordsDeleted: 0,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to clean up orphaned guide images',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


/**
 * Registry of all available cleanup tasks
 * Add new cleanup tasks here to make them available to the cleanup job
 */
export const CLEANUP_TASKS: CleanupTask[] = [
  {
    name: 'rate-limit-logs',
    description: 'Clean up old rate limiting logs',
    execute: () => cleanupRateLimitLogs(7), // Keep 7 days of logs
  },
  {
    name: 'orphaned-logo-images',
    description: 'Clean up orphaned logo images from storage',
    execute: cleanupOrphanedLogoImages,
  },
  {
    name: 'orphaned-guide-images',
    description: 'Clean up orphaned guide images (placeholder)',
    execute: cleanupOrphanedGuideImages,
  },
];

/**
 * Run all database cleanup tasks
 * @param taskNames - Optional array of specific task names to run. If not provided, runs all tasks.
 */
export async function runDatabaseCleanup(taskNames?: string[]): Promise<DatabaseCleanupResult> {
  const tasksToRun = taskNames
    ? CLEANUP_TASKS.filter(task => taskNames.includes(task.name))
    : CLEANUP_TASKS;

  const results: DatabaseCleanupResult = {
    totalTasks: tasksToRun.length,
    successfulTasks: 0,
    failedTasks: 0,
    tasks: [],
  };

  console.log(`Starting database cleanup with ${tasksToRun.length} tasks...`);

  for (const task of tasksToRun) {
    console.log(`Running cleanup task: ${task.name} (${task.description})`);

    try {
      const result = await task.execute();

      results.tasks.push({
        name: task.name,
        result,
      });

      if (result.success) {
        results.successfulTasks++;
        console.log(`✓ ${task.name}: ${result.message}`);
      } else {
        results.failedTasks++;
        console.error(`✗ ${task.name}: ${result.message}`);
        if (result.error) {
          console.error(`  Error details: ${result.error}`);
        }
      }
    } catch (error) {
      results.failedTasks++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      results.tasks.push({
        name: task.name,
        result: {
          success: false,
          message: 'Task execution failed',
          error: errorMessage,
        },
      });

      console.error(`✗ ${task.name}: Task execution failed`);
      console.error(`  Error details: ${errorMessage}`);
    }
  }

  console.log(`Database cleanup completed. ${results.successfulTasks}/${results.totalTasks} tasks successful.`);

  return results;
}

/**
 * Get information about available cleanup tasks
 */
export function getAvailableCleanupTasks(): Array<{ name: string; description: string }> {
  return CLEANUP_TASKS.map(task => ({
    name: task.name,
    description: task.description,
  }));
}