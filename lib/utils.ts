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

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}