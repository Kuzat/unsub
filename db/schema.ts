import {integer, pgTable, varchar} from "drizzle-orm/pg-core";


export const subscriptionsTable = pgTable("subscriptions", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({length: 255}).notNull(),
})