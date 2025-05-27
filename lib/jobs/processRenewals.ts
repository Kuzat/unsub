import {db} from "@/db";
import {subscription, transaction } from "@/db/schema/app";
import {eq, and, desc, or} from "drizzle-orm";

/**
 * Calculates all renewal dates between a start date and the current date
 * @param lastRenewalDate The last renewal date
 * @param billingCycle The billing cycle (daily, weekly, monthly, quarterly, yearly)
 * @param currentDate The current date (defaults to now)
 * @returns Array of dates when renewals should have occurred
 */
function calculateMissedRenewals(
  lastRenewalDate: Date,
  billingCycle: string,
  currentDate: Date = new Date()
): Date[] {
  // Set time to midnight to avoid time comparison issues
  const startDate = new Date(lastRenewalDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(currentDate);
  endDate.setHours(0, 0, 0, 0);

  // If the start date is in the future, no renewals are due
  if (startDate > endDate) {
    return [];
  }

  const renewalDates: Date[] = [];
  const nextRenewal = new Date(startDate);

  // Calculate all renewal dates based on the billing cycle
  switch (billingCycle) {
    case "daily":
      while (nextRenewal <= endDate) {
        // Move to the next day
        nextRenewal.setDate(nextRenewal.getDate() + 1);
        if (nextRenewal <= endDate) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "weekly":
      while (nextRenewal <= endDate) {
        // Move to the next week
        nextRenewal.setDate(nextRenewal.getDate() + 7);
        if (nextRenewal <= endDate) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "monthly":
      while (nextRenewal <= endDate) {
        // Move to the next month
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        if (nextRenewal <= endDate) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "quarterly":
      while (nextRenewal <= endDate) {
        // Move to the next quarter (3 months)
        nextRenewal.setMonth(nextRenewal.getMonth() + 3);
        if (nextRenewal <= endDate) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "yearly":
      while (nextRenewal <= endDate) {
        // Move to the next year
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
        if (nextRenewal <= endDate) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "one_time":
      // One-time subscriptions don't have renewals
      break;

    default:
      console.warn(`Unknown billing cycle: ${billingCycle}, defaulting to monthly`);
      while (nextRenewal <= endDate) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        if (nextRenewal <= endDate) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
  }

  return renewalDates;
}

/**
 * Processes subscription renewals for all active subscriptions
 * This function is designed to be run daily by a cron job
 */
export async function processSubscriptionRenewals(): Promise<{
  processed: number;
  renewed: number;
  errors: number;
}> {
  console.log("Starting subscription renewal process...");

  let processedCount = 0;
  let renewedCount = 0;
  let errorCount = 0;

  try {
    // Fetch all active subscriptions
    const activeSubscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.isActive, true));

    console.log(`Found ${activeSubscriptions.length} active subscriptions to process`);

    // Process each subscription
    for (const sub of activeSubscriptions) {
      try {
        processedCount++;

        // Get the most recent renewal transaction for this subscription
        const lastTransaction = await db
          .select()
          .from(transaction)
          .where(
            and(
              eq(transaction.subscriptionId, sub.id),
              or(
                eq(transaction.type, "hypothetical_renewal"),
                eq(transaction.type, "hypothetical_initial")
              )
            )
          )
          .orderBy(desc(transaction.occurredAt))
          .limit(1);

        // Determine the last renewal date
        let lastRenewalDate: Date;
        if (lastTransaction.length > 0) {
          lastRenewalDate = new Date(lastTransaction[0].occurredAt);
        } else {
          // If no renewal transaction exists, use the subscription start date
          lastRenewalDate = new Date(sub.startDate);
        }

        // Calculate all missed renewal dates
        const renewalDates = calculateMissedRenewals(
          lastRenewalDate,
          sub.billingCycle,
          new Date()
        );

        if (renewalDates.length > 0) {
          console.log(`Subscription ${sub.id} has ${renewalDates.length} renewal(s) due`);

          // Process each renewal date
          for (const renewalDate of renewalDates) {
            // Check if a transaction already exists for this date (idempotency)
            const existingTransaction = await db
              .select()
              .from(transaction)
              .where(
                and(
                  eq(transaction.subscriptionId, sub.id),
                  eq(transaction.type, "hypothetical_renewal"),
                  eq(transaction.occurredAt, renewalDate)
                )
              )
              .limit(1);

            if (existingTransaction.length === 0) {
              // Create a new renewal transaction
              await db.insert(transaction).values({
                id: crypto.randomUUID(),
                subscriptionId: sub.id,
                userId: sub.userId,
                serviceId: sub.serviceId,
                type: "hypothetical_renewal",
                amount: sub.price,
                currency: sub.currency,
                occurredAt: renewalDate,
                createdAt: new Date(),
                updatedAt: new Date()
              });

              renewedCount++;
              console.log(`Created renewal transaction for subscription ${sub.id} on ${renewalDate.toISOString()}`);
            } else {
              console.log(`Skipping duplicate renewal for subscription ${sub.id} on ${renewalDate.toISOString()}`);
            }
          }
        } else {
          console.log(`No renewals due for subscription ${sub.id}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing subscription ${sub.id}:`, error);
      }
    }

    console.log(`Subscription renewal process completed.`);
    console.log(`Processed: ${processedCount}, Renewed: ${renewedCount}, Errors: ${errorCount}`);

    return {
      processed: processedCount,
      renewed: renewedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error("Failed to process subscription renewals:", error);
    throw error;
  }
}