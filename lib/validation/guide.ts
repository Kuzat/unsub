import { z } from "zod";
import { guideVersionStatusEnum } from "@/db/schema/_common";

type Status = typeof guideVersionStatusEnum.enumValues[number];

export const createGuideSchema = z.object({
  serviceId: z.string({
    required_error: "Service ID is required",
  }),
  bodyMd: z.string({
    required_error: "Guide content is required",
  }).min(1, "Guide content is required"),
  changeNote: z.string().optional(),
  status: z.enum(
    guideVersionStatusEnum.enumValues as [Status, ...Status[]],
    {
      required_error: "Status is required",
    }
  ),
});

export type CreateGuideFormValues = z.infer<typeof createGuideSchema>;