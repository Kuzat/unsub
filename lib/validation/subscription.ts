import { z } from "zod";

export const createSubscriptionSchema = z.object({
  serviceId: z
    .string({ required_error: "Select a service" })
    .uuid("Invalid service id"),
  alias: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  billingCycle: z.enum(
    ["daily", "weekly", "monthly", "quarterly", "yearly", "one_time"],
    { required_error: "Choose billing cycle" }
  ),
  price: z.preprocess(
    (v) => (typeof v === "string" ? parseFloat(v) : v),
    z.number().positive("Price must be > 0")
  ),
  currency: z.enum(["EUR", "USD", "GBP", "NOK"]),
  isActive: z.boolean().default(true),
  remindDaysBefore: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v, 10) : v),
    z.number().int().min(0).max(365).default(3)
  ),
  notes: z.string().optional(),
});
