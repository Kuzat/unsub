import { z } from "zod";
import {categoryEnum, serviceScopeEnum} from "@/db/schema/_common";

type Category = typeof categoryEnum.enumValues[number];
type Scope = typeof serviceScopeEnum.enumValues[number];

export const createServiceSchema = z.object({
  name: z.string({
    required_error: "Service name is required",
  }).min(1, "Service name is required"),
  category: z.enum(
    categoryEnum.enumValues as [Category, ...Category[]],
    {
      required_error: "Category is required",
    }
  ),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  logoOriginalUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  logoHash: z.string().optional(),
  logoCdnUrl: z.string().optional(),
  scope: z.enum(serviceScopeEnum.enumValues as [Scope, ...Scope[]],
    ).optional(),
});

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;