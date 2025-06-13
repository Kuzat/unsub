import { db } from "@/db";
import { reminder, subscription, service, userSettings } from "@/db/schema/app";
import { user } from "@/db/schema/auth";
import { and, eq, lte } from "drizzle-orm";
import { sendRenewalReminderEmail } from "@/lib/email";

export async function processReminders(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  // TODO: Future scaling, this now could end up running twice at the same time if the cron job is run more frequently
  // or run on multiple servers
  const now = new Date();
  const dueReminders = await db
    .select({
      id: reminder.id,
      sendAt: reminder.sendAt,
      remindDaysBefore: subscription.remindDaysBefore,
      serviceName: service.name,
      userEmail: user.email,
      subscriptionId: reminder.subscriptionId,
      billingCycle: subscription.billingCycle,
      startDate: subscription.startDate,
      userId: subscription.userId,
      sendRenewalReminderEmails: userSettings.sendRenewalReminderEmails,
    })
    .from(reminder)
    .innerJoin(subscription, eq(reminder.subscriptionId, subscription.id))
    .innerJoin(service, eq(subscription.serviceId, service.id))
    .innerJoin(user, eq(subscription.userId, user.id))
    .leftJoin(userSettings, eq(subscription.userId, userSettings.userId))
    .where(
      and(
        eq(reminder.sent, false),
        lte(reminder.sendAt, now),
        eq(subscription.isActive, true)
      )
    );

  let processed = 0;
  let sentCount = 0;
  let errorCount = 0;

  for (const r of dueReminders) {
    processed++;
    try {
      const renewalDate = new Date(r.sendAt);
      renewalDate.setDate(renewalDate.getDate() + parseInt(r.remindDaysBefore));

      // Pass user settings to the email function to check if emails are enabled
      const emailSent = await sendRenewalReminderEmail(
        r.userEmail, 
        r.serviceName, 
        renewalDate,
        {
          checkUserSettings: true,
          userSettings: {
            sendRenewalReminderEmails: r.sendRenewalReminderEmails || undefined
          }
        }
      );

      if (emailSent) {
        sentCount++;
        console.log(`Sent reminder ${r.id} to ${r.userEmail}`);
      } else {
        console.log(`Skipped sending reminder ${r.id} to ${r.userEmail} (user disabled reminder emails)`);
      }

      // Mark as sent regardless of whether email was actually sent
      // This prevents repeated processing of the same reminder
      await db
        .update(reminder)
        .set({ sent: true, updatedAt: new Date() })
        .where(eq(reminder.id, r.id));
    } catch (err) {
      errorCount++;
      console.error(`Failed to send reminder ${r.id}:`, err);
    }
  }

  return { processed, sent: sentCount, errors: errorCount };
}
