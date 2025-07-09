import {pgEnum} from "drizzle-orm/pg-core";
import {currencyCodes} from "@/db/data/currencies";

export const currencyEnum = pgEnum("currency", currencyCodes as [string, ...string[]]);

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
  "food",
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
  "hypothetical_initial",
  "hypothetical_renewal",
]);

export const serviceScopeEnum = pgEnum("service_scope", [
  "global", // Curated services, available to all users
  "user",   // Custom personal services, created and available only to the user that owns them
]);

export const guideVersionStatusEnum = pgEnum("guide_version_status", [
  "pending",
  "approved",
  "rejected"
]);
