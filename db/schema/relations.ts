import {relations} from "drizzle-orm";
import {guide, guideVersion, reminderLog, service, subscription, transaction, userSettings} from "./app";
import {user} from "./auth";

export const serviceRelations = relations(service, ({one, many}) => ({
  owner: one(user, {fields: [service.ownerId], references: [user.id]}),
  subscriptions: many(subscription),
  guide: one(guide, {
    fields: [service.id],
    references: [guide.serviceId]
  }),
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

export const reminderLogRelations = relations(reminderLog, ({one}) => ({
  subscription: one(subscription, {
    fields: [reminderLog.subscriptionId],
    references: [subscription.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
  user: one(user, {fields: [userSettings.userId], references: [user.id]}),
}));

export const guideRelations = relations(guide, ({one, many}) => ({
  service: one(service, {
    fields: [guide.serviceId],
    references: [service.id],
  }),
  versions: many(guideVersion),
  currentVersion: one(guideVersion, {
    fields: [guide.currentVersionId],
    references: [guideVersion.id],
  }),
}));

export const guideVersionRelations = relations(guideVersion, ({one}) => ({
  guide: one(guide, {
    fields: [guideVersion.guideId],
    references: [guide.id],
  }),
  createdBy: one(user, {
    fields: [guideVersion.createdBy],
    references: [user.id],
  }),
  reviewedBy: one(user, {
    fields: [guideVersion.reviewedBy],
    references: [user.id],
  }),
}))

