"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { createGuideSchema, CreateGuideFormValues } from "@/lib/validation/guide"
import { useRouter } from "next/navigation"
import { createGuide } from "@/app/actions/guides"
import { toast } from "sonner"
import GuideForm from "@/components/guides/guide-form"
import { Button } from "@/components/ui/button"

export type NewGuideFormProps = {
  serviceId: string
}

export default function NewGuideForm({ serviceId }: NewGuideFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Create form
  const form = useForm<CreateGuideFormValues>({
    resolver: zodResolver(createGuideSchema),
    defaultValues: {
      serviceId: serviceId,
      bodyMd: "",
      changeNote: "",
      status: "pending",
    },
  })

  // Handle form submission
  const onSubmit = async (values: CreateGuideFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await createGuide(values)

      if ("error" in result) {
        toast.error(result.error)
        return
      }

      toast.success("Guide created successfully")
      router.push(`/services/${serviceId}`)
    } catch (error) {
      console.error("Failed to create guide:", error)
      toast.error("Failed to create guide")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <GuideForm serviceId={serviceId} />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Guide"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}