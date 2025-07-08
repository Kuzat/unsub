import {db} from "@/db";
import {subscription, service, userSettings, reminderLog} from "@/db/schema/app";
import {user} from "@/db/schema/auth";
import {and, eq} from "drizzle-orm";
import {sendRenewalReminderEmail} from "@/lib/email";
import {calculateNextRenewal, toIsoDate} from "@/lib/utils";
import crypto from "crypto";
import {subDays} from "date-fns";

export async function processReminders(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const now = new Date();
  const activeSubscriptions = await db
    .select({
      id: subscription.id,
      remindDaysBefore: subscription.remindDaysBefore,
      billingCycle: subscription.billingCycle,
      startDate: subscription.startDate,
      serviceName: service.name,
      userEmail: user.email,
      userId: subscription.userId,
      sendRenewalReminderEmails: userSettings.sendRenewalReminderEmails,
    })
    .from(subscription)
    .innerJoin(service, eq(subscription.serviceId, service.id))
    .innerJoin(user, eq(subscription.userId, user.id))
    .leftJoin(userSettings, eq(subscription.userId, userSettings.userId))
    .where(eq(subscription.isActive, true))

  let processed = 0;
  let sent = 0;
  let errors = 0;

  for (const sub of activeSubscriptions) {
    processed++;
    try {
      const nextRenewalDate = calculateNextRenewal(
        new Date(sub.startDate),
        sub.billingCycle
      );

      const reminderDate = subDays(nextRenewalDate, parseInt(sub.remindDaysBefore))

      if (reminderDate <= now) {
        const logExists = await db
          .select()
          .from(reminderLog)
          .where(
            and(
              eq(reminderLog.subscriptionId, sub.id),
              eq(reminderLog.reminderDate, toIsoDate(reminderDate))
            )
          )
          .limit(1);

        if (logExists.length > 0) {
          console.log(`Reminder already sent for subscription ${sub.id} on ${toIsoDate(reminderDate)}`)
          continue;
        }

        const emailSent = await sendRenewalReminderEmail(
          sub.userEmail,
          sub.serviceName,
          nextRenewalDate,
          {
            checkUserSettings: true,
            userSettings: {
              sendRenewalReminderEmails: sub.sendRenewalReminderEmails || undefined
            }
          }
        );

        if (emailSent) {
          sent++;
          await db.insert(reminderLog).values({
            id: crypto.randomUUID(),
            subscriptionId: sub.id,
            userId: sub.userId,
            reminderDate: toIsoDate(reminderDate),
          });
          console.log(`Sent reminder for subscription ${sub.id} on ${sub.userEmail}`);
        } else {
          console.log(
            `Skipped sending reminder for ${sub.id} to ${sub.userEmail} (user disabled reminder emails)`
          );
        }
      }
    } catch (error) {
      errors++;
      console.error(`Error processing subscription ${sub.id}:`, error);
    }
  }

  return {processed, sent, errors}
}
