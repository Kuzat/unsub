"use client"

import * as React from "react"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Form} from "@/components/ui/form"
import {createServiceSchema, CreateServiceFormValues} from "@/lib/validation/service"
import {useRouter} from "next/navigation"
import {updateService, Service} from "@/app/actions/services"
import {toast} from "sonner"
import ServiceForm from "@/components/services/service-form";

interface EditServiceFormProps {
  service: Service;
  isAdmin?: boolean;
}

export default function EditServiceForm({service, isAdmin}: EditServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Create a form with service data as default values
  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: service.name,
      category: service.category,
      url: service.url || "",
      description: service.description || "",
      logoOriginalUrl: service.logoOriginalUrl ?? undefined,
      logoCdnUrl: service.logoCdnUrl ?? undefined,
      logoHash: service.logoHash ?? undefined,
      scope: service.scope
    },
  })

  // Handle form submission
  const onSubmit = async (values: CreateServiceFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await updateService(service.id, values)

      if ("error" in result) {
        toast.error(result.error)
        return
      }

      toast.success("Service updated successfully")
      router.push("/services")
    } catch (error) {
      console.error("Failed to update service:", error)
      toast.error("Failed to update service")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ServiceForm isSubmitting={isSubmitting} isAdmin={isAdmin}/>
        </form>
      </Form>
    </div>
  )
}