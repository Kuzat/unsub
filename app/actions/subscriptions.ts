"use server"

import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {createSubscriptionSchema} from "@/lib/validation/subscription";
import {db} from "@/db";
import {subscription} from "@/db/schema/app";
import {eq} from "drizzle-orm";

type ActionResult =
  | { success: string }
  | { error: string }
  | undefined;

export async function createSubscription(
  raw: unknown
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  try {
    const data = createSubscriptionSchema.parse(raw);

    await db.insert(subscription).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      serviceId: data.serviceId,
      alias: data.alias || null,
      startDate: data.startDate,
      billingCycle: data.billingCycle,
      price: data.price.toString(),
      currency: data.currency,
      isActive: data.isActive,
      remindDaysBefore: data.remindDaysBefore.toString(),
      notes: data.notes ?? null,
    });

    return {success: "Subscription created 🎉"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}

export async function cancelSubscription(
  subscriptionId: string
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  try {
    // Update the subscription to set isActive to false
    await db.update(subscription)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(
        eq(subscription.id, subscriptionId)
      );

    return {success: "Subscription canceled successfully"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}

export async function removeSubscription(
  subscriptionId: string
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  try {
    // Delete the subscription
    await db.delete(subscription)
      .where(
        eq(subscription.id, subscriptionId)
      );

    return {success: "Subscription removed successfully"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}

export async function activateSubscription(
  subscriptionId: string,
  newStartDate: string
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  try {
    // Update the subscription to set isActive to true and update the start date
    await db.update(subscription)
      .set({ 
        isActive: true,
        startDate: new Date(newStartDate),
        updatedAt: new Date()
      })
      .where(
        eq(subscription.id, subscriptionId)
      );

    return {success: "Subscription activated successfully"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}
