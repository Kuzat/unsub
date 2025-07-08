"use server"

import {auth, requireSession} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {createSubscriptionSchema} from "@/lib/validation/subscription";
import {db} from "@/db";
import {service, subscription, transaction} from "@/db/schema/app";
import {and, count, desc, eq, ilike, or} from "drizzle-orm";
import {calculatePastRenewals, toIsoDate} from "@/lib/utils";

type ActionResult =
  | { success: string }
  | { error: string }
  | undefined;

export async function createSubscription(
  raw: unknown
): Promise<ActionResult> {
  const session = await requireSession()

  try {
    const data = createSubscriptionSchema.parse(raw);
    const startDate = data.startDate;

    // Use a database transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Create the subscription
      const subscriptionId = crypto.randomUUID();

      const result = await tx.insert(subscription).values({
        id: subscriptionId,
        userId: session.user.id,
        serviceId: data.serviceId,
        alias: data.alias || null,
        startDate: startDate,
        billingCycle: data.billingCycle,
        price: data.price.toString(),
        currency: data.currency,
        isActive: data.isActive,
        remindDaysBefore: data.remindDaysBefore.toString(),
        notes: data.notes ?? null,
      }).returning({
        id: subscription.id,
        userId: subscription.userId,
        serviceId: subscription.serviceId,
        price: subscription.price,
        currency: subscription.currency,
        startDate: subscription.startDate,
        billingCycle: subscription.billingCycle
      });

      if (result.length === 0) {
        return {error: "Failed to create subscription"};
      }

      const newSubscription = result[0];

      // 1. Create an initial transaction
      await tx.insert(transaction).values({
        id: crypto.randomUUID(),
        subscriptionId: newSubscription.id,
        userId: newSubscription.userId,
        serviceId: newSubscription.serviceId,
        type: 'hypothetical_initial',
        amount: newSubscription.price,
        currency: newSubscription.currency,
        occurredAt: newSubscription.startDate,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 2. Handle past start dates (backfill renewals)
      const currentDate = new Date();

      // Calculate past renewal dates
      const pastRenewalDates = calculatePastRenewals(
        new Date(startDate),
        newSubscription.billingCycle,
        currentDate
      );

      // Create hypothetical renewal transactions for each past renewal date
      for (const renewalDate of pastRenewalDates) {
        await tx.insert(transaction).values({
          id: crypto.randomUUID(),
          subscriptionId: newSubscription.id,
          userId: newSubscription.userId,
          serviceId: newSubscription.serviceId,
          type: 'hypothetical_renewal',
          amount: newSubscription.price,
          currency: newSubscription.currency,
          occurredAt: toIsoDate(renewalDate),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return {success: "Subscription created 🎉"};
    });
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
      .where(
        and(
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
    // Use a database transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Update the subscription to set isActive to true and update the start date
      const result = await tx.update(subscription)
        .set({
          isActive: true,
          startDate: newStartDate,
          updatedAt: new Date()
        })
        .where(and(
            eq(subscription.id, subscriptionId),
            eq(subscription.userId, session.user.id)
          )
        )
        .returning({
          id: subscription.id,
          userId: subscription.userId,
          serviceId: subscription.serviceId,
          price: subscription.price,
          currency: subscription.currency,
          billingCycle: subscription.billingCycle,
          remindDaysBefore: subscription.remindDaysBefore,
        });

      if (result.length === 0) {
        return {error: "Subscription not found"}
      }

      const activatedSubscription = result[0];

      // Create a new transaction record
      await tx.insert(transaction).values({
        id: crypto.randomUUID(),
        subscriptionId: activatedSubscription.id,
        userId: activatedSubscription.userId,
        serviceId: activatedSubscription.serviceId,
        type: 'hypothetical_initial',
        amount: activatedSubscription.price,
        currency: activatedSubscription.currency,
        occurredAt:newStartDate,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {success: "Subscription activated successfully"}
    });
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
  serviceScope: string;
  serviceOwnerId: string | null;
  alias: string | null;
  startDate: string;
  billingCycle: typeof subscription.billingCycle.enumValues[number];
  price: string;
  currency: typeof subscription.currency.enumValues[number];
  isActive: boolean;
  remindDaysBefore: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FetchSubscriptionsOptions = {
  userId: string;
  page: number;
  pageSize: number;
  query: string;
}

export async function fetchSubscriptions({
                                           userId,
                                           page,
                                           pageSize,
                                           query = ""
                                         }: FetchSubscriptionsOptions) {
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, pageSize);
  const offset = (validPage - 1) * validPageSize;

  // Add a text-search coniditon if `query` is present
  const searchCond = query ?
    or(
      ilike(service.name, `%${query}%`),
      ilike(subscription.alias, `%${query}%`),
      ilike(subscription.notes, `%${query}%`)
    ) : undefined

  const [{count: totalSubscriptions}] = await db
    .select({count: count()})
    .from(subscription)
    .innerJoin(service, eq(subscription.serviceId, service.id))
    .where(and(
      searchCond,
      eq(subscription.userId, userId)
    ));

  const rows = await db
    .select()
    .from(subscription)
    .where(and(searchCond, eq(subscription.userId, userId)))
    .innerJoin(service, eq(subscription.serviceId, service.id))
    .limit(validPageSize)
    .offset(offset)
    .orderBy(desc(subscription.startDate)); // TODO: could have this be a optio for the user

  return {
    subscriptions: rows,
    totalPages: Math.ceil(totalSubscriptions / validPageSize),
    currentPage: validPage,
  }
}

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
        serviceLogoUrl: service.logoCdnUrl,
        serviceScope: service.scope,
        serviceOwnerId: service.ownerId,
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
      return {error: "Subscription not found"};
    }

    return result[0];
  } catch (err) {
    console.error("Error fetching subscription:", err);
    return {error: "Failed to fetch subscription"};
  }
}

export async function updateSubscription(
  subscriptionId: string,
  data: unknown
): Promise<ActionResult> {
  const session = await requireSession()

  try {
    const validatedData = createSubscriptionSchema.parse(data);
    const startDate = validatedData.startDate;

    const result = await db.update(subscription)
      .set({
        serviceId: validatedData.serviceId,
        alias: validatedData.alias || null,
        startDate: startDate,
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

export type TransactionWithService = {
  id: string;
  subscriptionId: string | null;
  userId: string;
  serviceId: string | null;
  serviceName: string | null;
  type: string;
  amount: string;
  currency: string;
  occurredAt: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getTransactionsBySubscriptionId(
  subscriptionId: string
): Promise<TransactionWithService[] | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  try {
    // Join transaction with service to get service details
    return await db
      .select({
        id: transaction.id,
        subscriptionId: transaction.subscriptionId,
        userId: transaction.userId,
        serviceId: transaction.serviceId,
        serviceName: service.name,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        occurredAt: transaction.occurredAt,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })
      .from(transaction)
      .leftJoin(service, eq(transaction.serviceId, service.id))
      .where(
        and(
          eq(transaction.subscriptionId, subscriptionId),
          eq(transaction.userId, session.user.id)
        )
      )
      .orderBy(desc(transaction.occurredAt));
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return {error: "Failed to fetch transactions"};
  }
}

export async function deleteTransaction(
  transactionId: string
): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  try {
    // Delete the transaction
    const result = await db.delete(transaction)
      .where(and(
          eq(transaction.id, transactionId),
          eq(transaction.userId, session.user.id)
        )
      );

    if (result.rowCount === 0) {
      return {error: "Transaction not found"}
    }

    return {success: "Transaction deleted successfully"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}

export type TransactionData = {
  amount: string;
  currency: typeof transaction.currency.enumValues[number];
  occurredAt: string;
  type: typeof transaction.type.enumValues[number];
};

export async function updateTransaction(
  transactionId: string,
  data: TransactionData
): Promise<ActionResult> {
  const session = await requireSession()

  try {
    // Update the transaction
    const result = await db.update(transaction)
      .set({
        amount: data.amount,
        currency: data.currency,
        occurredAt: data.occurredAt,
        type: data.type,
        updatedAt: new Date()
      })
      .where(and(
          eq(transaction.id, transactionId),
          eq(transaction.userId, session.user.id)
        )
      );

    if (result.rowCount === 0) {
      return {error: "Transaction not found"}
    }

    return {success: "Transaction updated successfully"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}

export async function createTransaction(
  subscriptionId: string,
  data: TransactionData
): Promise<ActionResult> {
  const session = await requireSession()

  try {
    // Get the subscription to ensure it exists and belongs to the user
    const sub = await db
      .select({
        id: subscription.id,
        userId: subscription.userId,
        serviceId: subscription.serviceId,
      })
      .from(subscription)
      .where(
        and(
          eq(subscription.id, subscriptionId),
          eq(subscription.userId, session.user.id)
        )
      )
      .limit(1);

    if (sub.length === 0) {
      return {error: "Subscription not found"}
    }

    // Create a new transaction
    await db.insert(transaction).values({
      id: crypto.randomUUID(),
      subscriptionId: subscriptionId,
      userId: session.user.id,
      serviceId: sub[0].serviceId,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      occurredAt: data.occurredAt,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {success: "Transaction created successfully"}
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}
