import {pgEnum} from "drizzle-orm/pg-core";


// TODO: Expand this with more currencies
export const currencyEnum = pgEnum("currency", [
  "EUR",
  "USD",
  "GBP",
]);

export const billingCycleEnum = pgEnum("billing_cycle", [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "one_time",
]);

export const categoryEnum = pgEnum("service_category", [
  "streaming",
  "software",
  "news",
  "gaming",
  "utilities",
  "hosting",
  "productivity",
  "entertainment",
  "education",
  "finance",
  "health",
  "music",
  "shopping",
  "social",
  "utility",
  "other",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "initial",
  "renewal",
  "refund",
  "adjustment",
]);
