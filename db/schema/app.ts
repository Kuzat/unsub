import {boolean, date, index, integer, numeric, pgTable, primaryKey, text, timestamp} from "drizzle-orm/pg-core";
import {billingCycleEnum, categoryEnum, currencyEnum, serviceScopeEnum, transactionTypeEnum} from "@/db/schema/_common";
import {user} from "@/db/schema/auth";
import {relations} from "drizzle-orm";

/* ---------- service ---------- */
export const service = pgTable("service", {
  id: text("id").primaryKey(), // UUID string
  name: text("name").notNull(),
  category: categoryEnum("category").notNull(),
  url: text("url"),
  description: text("description"),

  /* logo pipeline */
  logoOriginalUrl: text("logo_original_url"),
  logoCdnUrl: text("logo_cdn_url"),
  logoHash: text("logo_hash"),

  // Scopes who owns the services and who can see them
  scope: serviceScopeEnum("scope").notNull().default("user"),
  ownerId: text("owner_id")
    .references(() => user.id, {onDelete: "cascade"}),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({

  // fast look-ups picker:
  // WHERE scope = 'global' OR owner_id = $currentUser
  scopeOwnerIdx: index().on(t.scope, t.ownerId)
}));

/* ---------- subscription ---------- */
export const subscription = pgTable(
  "subscription",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {onDelete: "cascade"}),
    serviceId: text("service_id").references(() => service.id, {
      onDelete: "set null",
    }),
    alias: text("alias"),
    startDate: date("start_date").notNull(),
    price: numeric("price", {precision: 12, scale: 2}).notNull(),
    currency: currencyEnum("currency").notNull(),
    billingCycle: billingCycleEnum("billing_cycle").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    /* reminder offset in days before next renewal */
    remindDaysBefore: numeric("remind_days_before", {
      precision: 4,
      scale: 0,
    }).notNull().default("3"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // handy composite index for quick "active subs for user" look-ups
    index("subscription_user_active_idx").on(
      table.userId,
      table.isActive
    ),
  ]
);

/* ---------- transaction ---------- */
export const transaction = pgTable(
  "transaction",
  {
    id: text("id").primaryKey(),
    subscriptionId: text("subscription_id")
      .references(() => subscription.id, {onDelete: "set null"}),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {onDelete: "cascade"}),
    serviceId: text("service_id").references(() => service.id), // denormalized for easier analytics
    type: transactionTypeEnum("type").notNull(),
    amount: numeric("amount", {precision: 12, scale: 2}).notNull(),
    currency: currencyEnum("currency").notNull(),
    occurredAt: date("occurred_at").notNull(),
    /** raw row id from Plaid/bank file for reconciliation */
    externalRowId: text("external_row_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("transaction_subscription_date_idx").on(
      table.subscriptionId,
      table.occurredAt
    ),
  ]
);

/* ---------- relations ---------- */
export const serviceRelations = relations(service, ({one, many}) => ({
  owner: one(user, {fields: [service.ownerId], references: [user.id]}),
  subscriptions: many(subscription),
}));

export const subscriptionRelations = relations(subscription, ({many, one}) => ({
  user: one(user, {fields: [subscription.userId], references: [user.id]}),
  service: one(service, {fields: [subscription.serviceId], references: [service.id]}),
  transactions: many(transaction),
}));

export const transactionRelations = relations(transaction, ({one}) => ({
  subscription: one(subscription, {
    fields: [transaction.subscriptionId],
    references: [subscription.id]
  }),
  user: one(user, {fields: [transaction.userId], references: [user.id]}),
}));

/* ---------- reminder-log ---------- */
export const reminderLog = pgTable("reminder_log", {
  id: text("id").primaryKey(),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscription.id, {onDelete: "cascade"}),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {onDelete: "cascade"}),
  reminderDate: date("reminder_date").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
}, (t) => ({
  subscriptionRenewalIdx: index().on(t.subscriptionId, t.reminderDate)
}));

export const reminderLogRelations = relations(reminderLog, ({one}) => ({
  subscription: one(subscription, {
    fields: [reminderLog.subscriptionId],
    references: [subscription.id],
  }),
}));


/* ---------- cancellation guide (markdown) ---------- */
export const cancellationGuide = pgTable("cancellation_guide", {
  id: text("id").primaryKey(),
  serviceId: text("service_id")
    .notNull()
    .references(() => service.id, {onDelete: "cascade"}),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, {onDelete: "cascade"}),
  markdown: text("markdown").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* ---------- guide vote ---------- */
export const guideVote = pgTable("guide_vote", {
  id: text("id").primaryKey(),
  guideId: text("guide_id")
    .notNull()
    .references(() => cancellationGuide.id, {onDelete: "cascade"}),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {onDelete: "cascade"}),
  isHelpful: boolean("is_helpful").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* ---------- user settings ---------- */
export const userSettings = pgTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, {onDelete: "cascade"}),
  receiveEmails: boolean("receive_emails").notNull().default(true),
  sendRenewalReminderEmails: boolean("send_renewal_reminder_emails").notNull().default(true),
  preferredCurrency: currencyEnum("preferred_currency").notNull().default("USD"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userSettingsRelations = relations(userSettings, ({one}) => ({
  user: one(user, {fields: [userSettings.userId], references: [user.id]}),
}));

/* ---------- fx rates ---------- */
export const fxRates = pgTable("fx_rates", {
  base: currencyEnum("base").notNull(),
  quote: currencyEnum("quote").notNull(),
  rate: numeric("rate", {precision: 18, scale: 8}).notNull(),
  fetchedAt: timestamp("fetched_at").notNull(),
}, (t) => [
  primaryKey({columns: [t.base, t.quote]}),
])
