import { processReminders } from '@/lib/jobs/processReminders';

async function main() {
  console.log('Starting reminder process...');

  try {
    const result = await processReminders();
    console.log('Reminder process completed successfully.');
    console.log(`Summary: Checked ${result.processed} reminders, sent ${result.sent}, errors ${result.errors}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to process reminders:', error);
    process.exit(1);
  }
}

main();
