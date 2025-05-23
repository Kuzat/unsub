"use server"

import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {createSubscriptionSchema} from "@/lib/validation/subscription";
import {db} from "@/db";
import {subscription} from "@/db/schema/app";

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