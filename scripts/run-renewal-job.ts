import { processSubscriptionRenewals } from '../lib/jobs/processRenewals';
import { db } from '@/db';

/**
 * Main function to run the subscription renewal process
 * This script is designed to be executed by a cron job
 */
async function main() {
  console.log('Starting subscription renewal process...');
  
  try {
    // Process all subscription renewals
    const result = await processSubscriptionRenewals();
    
    console.log('Subscription renewal process completed successfully.');
    console.log(`Summary: Processed ${result.processed} subscriptions, Created ${result.renewed} renewal transactions, Encountered ${result.errors} errors`);
    
    // If your DB client needs explicit closing and the script is standalone:
    // await db.end(); // or similar method depending on your Drizzle adapter
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to process subscription renewals:', error);
    
    // Ensure the connection is closed even on error
    // await db.end(); // or similar method depending on your Drizzle adapter
    
    process.exit(1);
  }
}

// Execute the main function
main();