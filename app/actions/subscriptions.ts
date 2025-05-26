"use server"

import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {createSubscriptionSchema} from "@/lib/validation/subscription";
import {db} from "@/db";
import {subscription} from "@/db/schema/app";
import {and, eq} from "drizzle-orm";
import {service} from "@/db/schema/app";

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
    const result = await db.update(subscription)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(and(
          eq(subscription.id, subscriptionId),
          eq(subscription.userId, session.user.id)
        )
      );

    if (result.rowCount === 0) {
      return {error: "Subscription not found"}
    }

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
    const result = await db.delete(subscription)
      .where(and(
          eq(subscription.id, subscriptionId),
          eq(subscription.userId, session.user.id)
        )
      );

    if (result.rowCount === 0) {
      return {error: "Subscription not found"}
    }

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
    const result = await db.update(subscription)
      .set({
        isActive: true,
        startDate: new Date(newStartDate),
        updatedAt: new Date()
      })
      .where(and(
          eq(subscription.id, subscriptionId),
          eq(subscription.userId, session.user.id)
        )
      );

    if (result.rowCount === 0) {
      return {error: "Subscription not found"}
    }

    return {success: "Subscription activated successfully"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}

export type EditSubscription = {
  id: string;
  userId: string;
  serviceId: string | null;
  serviceName: string;
  serviceCategory: string;
  serviceLogoUrl: string | null;
  alias: string | null;
  startDate: Date;
  billingCycle: typeof subscription.billingCycle.enumValues[number];
  price: string;
  currency: typeof subscription.currency.enumValues[number];
  isActive: boolean;
  remindDaysBefore: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getSubscriptionById(
  subscriptionId: string
): Promise<EditSubscription | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  try {
    // Join subscription with service to get service details
    const result = await db
      .select({
        id: subscription.id,
        userId: subscription.userId,
        serviceId: subscription.serviceId,
        serviceName: service.name,
        serviceCategory: service.category,
        serviceLogoUrl: service.logoUrl,
        alias: subscription.alias,
        startDate: subscription.startDate,
        billingCycle: subscription.billingCycle,
        price: subscription.price,
        currency: subscription.currency,
        isActive: subscription.isActive,
        remindDaysBefore: subscription.remindDaysBefore,
        notes: subscription.notes,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      })
      .from(subscription)
      .innerJoin(service, eq(subscription.serviceId, service.id))
      .where(
        and(
          eq(subscription.id, subscriptionId),
          eq(subscription.userId, session.user.id)
        )
      );

    if (result.length === 0) {
      return { error: "Subscription not found" };
    }

    return result[0];
  } catch (err) {
    console.error("Error fetching subscription:", err);
    return { error: "Failed to fetch subscription" };
  }
}

export async function updateSubscription(
  subscriptionId: string,
  data: unknown
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  try {
    const validatedData = createSubscriptionSchema.parse(data);

    const result = await db.update(subscription)
      .set({
        serviceId: validatedData.serviceId,
        alias: validatedData.alias || null,
        startDate: validatedData.startDate,
        billingCycle: validatedData.billingCycle,
        price: validatedData.price.toString(),
        currency: validatedData.currency,
        isActive: validatedData.isActive,
        remindDaysBefore: validatedData.remindDaysBefore.toString(),
        notes: validatedData.notes ?? null,
        updatedAt: new Date()
      })
      .where(and(
          eq(subscription.id, subscriptionId),
          eq(subscription.userId, session.user.id)
        )
      );

    if (result.rowCount === 0) {
      return {error: "Subscription not found"}
    }

    return {success: "Subscription updated successfully"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}
