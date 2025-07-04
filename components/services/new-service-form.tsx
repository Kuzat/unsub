"use client"

import * as React from "react"
import {zodResolver} from "@hookform/resolvers/zod"
import {FormProvider, useForm} from "react-hook-form"
import {createServiceSchema, CreateServiceFormValues} from "@/lib/validation/service"
import {useRouter} from "next/navigation"
import {createService, Service} from "@/app/actions/services"
import {toast} from "sonner"
import ServiceForm from "@/components/services/service-form";

export type NewServiceFormProps = {
  isAdmin?: boolean;
  onNewService?: (service: Service) => void;
}

export default function NewServiceForm({isAdmin = false, onNewService}: NewServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Create form
  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      category: "other",
      url: "",
      description: "",
      logoOriginalUrl: "",
      logoHash: undefined,
      logoCdnUrl: undefined,
      scope: "user",
    },
  })

  // Handle form submission
  const onSubmit = async (values: CreateServiceFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await createService(values)

      if ("error" in result) {
        toast.error(result.error)
        return
      }

      toast.success("Service created successfully")

      if (onNewService) {
        return onNewService(result)
      }

      router.push("/services")
    } catch (error) {
      console.error("Failed to create service:", error)
      toast.error("Failed to create service")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ServiceForm isSubmitting={isSubmitting} isAdmin={isAdmin}/>
        </form>
      </FormProvider>
    </div>
  )
}