import {z} from "zod";
import {currencyEnum} from "@/db/schema/_common";

type Currency = typeof currencyEnum.enumValues[number];

export const createSubscriptionSchema = z.object({
  serviceId: z
    .string({required_error: "Select a service", invalid_type_error: "Select a service"})
    .uuid("Select a service"),
  alias: z.string().optional(),
  startDate: z.date({required_error: "Start date is required"}),
  billingCycle: z.enum(
    ["daily", "weekly", "monthly", "quarterly", "yearly", "one_time"],
    {required_error: "Choose billing cycle"}
  ),
  price: z.number().positive("Price must be > 0"),
  currency: z.enum(
    currencyEnum.enumValues as [Currency, ...Currency[]]   // cast satisfies Zod
  ),
  isActive: z.boolean().default(true),
  remindDaysBefore: z
    .number()
    .int()
    .min(0)
    .max(365)
    .default(3),
  notes: z.string().optional(),
});
