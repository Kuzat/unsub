import { runDatabaseCleanup, getAvailableCleanupTasks } from '@/lib/jobs/databaseCleanup';

async function main() {
  console.log('Starting database cleanup job...');
  console.log('Available cleanup tasks:');
  
  const availableTasks = getAvailableCleanupTasks();
  availableTasks.forEach(task => {
    console.log(`  - ${task.name}: ${task.description}`);
  });
  
  console.log('');

  try {
    // Get task names from command line arguments
    const taskNames = process.argv.slice(2);
    
    if (taskNames.length > 0) {
      console.log(`Running specific tasks: ${taskNames.join(', ')}`);
    } else {
      console.log('Running all cleanup tasks...');
    }

    const result = await runDatabaseCleanup(taskNames.length > 0 ? taskNames : undefined);
    
    console.log('');
    console.log('Cleanup Summary:');
    console.log(`  Total tasks: ${result.totalTasks}`);
    console.log(`  Successful: ${result.successfulTasks}`);
    console.log(`  Failed: ${result.failedTasks}`);
    
    if (result.failedTasks > 0) {
      console.log('');
      console.log('Failed tasks:');
      result.tasks
        .filter(task => !task.result.success)
        .forEach(task => {
          console.log(`  - ${task.name}: ${task.result.message}`);
          if (task.result.error) {
            console.log(`    Error: ${task.result.error}`);
          }
        });
    }

    // Calculate total records deleted
    const totalRecordsDeleted = result.tasks
      .filter(task => task.result.success && task.result.recordsDeleted)
      .reduce((total, task) => total + (task.result.recordsDeleted || 0), 0);
    
    if (totalRecordsDeleted > 0) {
      console.log('');
      console.log(`Total records deleted: ${totalRecordsDeleted}`);
    }

    console.log('');
    console.log('Database cleanup job completed successfully.');
    process.exit(result.failedTasks > 0 ? 1 : 0);
  } catch (error) {
    console.error('');
    console.error('Database cleanup job failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('Database cleanup job interrupted.');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('');
  console.log('Database cleanup job terminated.');
  process.exit(1);
});

main();