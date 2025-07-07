import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"
import {format} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGravatarUrl(email: string, size: number = 200): string {
  const trimmedEmail = email.trim().toLowerCase()
  const hash = crypto.createHash('md5').update(trimmedEmail).digest('hex')
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function calculateNextRenewal(
  startDate: Date,
  billingCycle: string,
  fromDate: Date = new Date(),
): Date {
  const currentDate = new Date(fromDate)

  // Set time too midnight to avoid time comparison issues
  startDate.setHours(0, 0, 0, 0)
  currentDate.setHours(0, 0, 0, 0)

  const nextRenewal = new Date(startDate)

  // If the start date is in the future, that's the next renewal
  if (startDate > currentDate) {
    return startDate
  }

  // Calculate the next renewal date based on the billing cycle
  switch (billingCycle) {
    case "daily":
      // Find the next daily occurrence after the current date
      while (nextRenewal <= currentDate) {
        nextRenewal.setDate(nextRenewal.getDate() + 1)
      }
      break

    case "weekly":
      // Find the next weekly occurrence after the current date
      while (nextRenewal <= currentDate) {
        nextRenewal.setDate(nextRenewal.getDate() + 7)
      }
      break

    case "monthly":
      // Find the next monthly occurrence after the current date
      while (nextRenewal <= currentDate) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1)
      }
      break

    case "quarterly":
      // Find the next quarterly occurrence after the current date
      while (nextRenewal <= currentDate) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 3)
      }
      break

    case "yearly":
      // Find the next yearly occurrence after the current date
      while (nextRenewal <= currentDate) {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1)
      }
      break

    case "one_time":
      // One-time subscriptions don't renew; return the start date
      return nextRenewal

    default:
      // Default to monthly if the billing cycle is not recognized
      while (nextRenewal <= currentDate) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1)
      }
  }

  return nextRenewal
}

/**
 * Calculates all past renewal dates between a start date and the current date
 * @param startDate The start date of the subscription
 * @param billingCycle The billing cycle of the subscription
 * @param currentDate The current date (defaults to now)
 * @returns An array of dates representing past renewals (excluding the initial date)
 */
export function calculatePastRenewals(
  startDate: Date,
  billingCycle: string,
  currentDate: Date = new Date()
): Date[] {
  // Create copies of dates to avoid modifying the originals
  const start = new Date(startDate);
  const current = new Date(currentDate);

  // Set the time to midnight to avoid time comparison issues
  start.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  // If start date is in the future or today, there are no past renewals
  if (start >= current) {
    return [];
  }

  const renewalDates: Date[] = [];
  const nextRenewal = new Date(start);

  // Calculate all renewal dates until we reach or exceed the current date
  switch (billingCycle) {
    case "daily":
      while (nextRenewal < current) {
        nextRenewal.setDate(nextRenewal.getDate() + 1);
        if (nextRenewal < current) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "weekly":
      while (nextRenewal < current) {
        nextRenewal.setDate(nextRenewal.getDate() + 7);
        if (nextRenewal < current) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "monthly":
      while (nextRenewal < current) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        if (nextRenewal < current) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "quarterly":
      while (nextRenewal < current) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 3);
        if (nextRenewal < current) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "yearly":
      while (nextRenewal < current) {
        nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
        if (nextRenewal < current) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
      break;

    case "one_time":
      // No renewals for one-time subscriptions
      break;

    default:
      // Default to monthly if the billing cycle is not recognized
      while (nextRenewal < current) {
        nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        if (nextRenewal < current) {
          renewalDates.push(new Date(nextRenewal));
        }
      }
  }

  return renewalDates;
}

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}