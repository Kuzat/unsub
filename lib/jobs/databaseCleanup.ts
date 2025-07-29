import { db } from '@/db';
import { rateLimitLog } from '@/db/schema/app';
import { lt } from 'drizzle-orm';

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
 * Clean up old user sessions (example of extensible cleanup)
 */
async function cleanupExpiredSessions(): Promise<CleanupTaskResult> {
  try {
    // TODO: Implement cleanup of expired user sessions
    // This would involve deleting sessions that are older than the session expiry time
    
    return {
      success: true,
      message: 'Expired sessions cleanup completed (placeholder)',
      recordsDeleted: 0,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to clean up expired sessions',
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