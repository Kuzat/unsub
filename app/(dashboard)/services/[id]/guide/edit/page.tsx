"use client"

import {useParams, useRouter} from "next/navigation"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Form} from "@/components/ui/form"
import GuideForm from "@/components/guides/guide-form"
import {CreateGuideFormValues, createGuideSchema} from "@/lib/validation/guide"
import {suggestGuideEdit} from "@/app/actions/guides"
import {toast} from "sonner"
import Link from "next/link"
import {ArrowLeft} from "lucide-react"
import {useEffect, useState} from "react"
import {fetchServiceById} from "@/app/actions/services"

type ServiceWithGuide = {
  id: string
  name: string
  guide: {
    currentVersion: {
      bodyMd: string
    } | null
  } | null
}

export default function SuggestGuideEditPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string
  const [service, setService] = useState<ServiceWithGuide | null>(null)
  const [loading, setLoading] = useState(true)

  const form = useForm<CreateGuideFormValues>({
    resolver: zodResolver(createGuideSchema),
    defaultValues: {
      serviceId,
      bodyMd: "",
      changeNote: "",
      status: "pending",
    },
  })

  useEffect(() => {
    async function loadService() {
      try {
        const serviceData = await fetchServiceById({id: serviceId, withGuide: true})
        if (serviceData) {
          setService(serviceData)
          // Pre-fill with current guide content if it exists
          if (serviceData.guide?.currentVersion?.bodyMd) {
            form.setValue("bodyMd", serviceData.guide.currentVersion.bodyMd)
          }
        }
      } catch (error) {
        console.error("Failed to load service:", error)
        toast.error("Failed to load service data")
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [serviceId, form])

  async function onSubmit(data: CreateGuideFormValues) {
    try {
      const result = await suggestGuideEdit({
        serviceId: data.serviceId,
        bodyMd: data.bodyMd,
        changeNote: data.changeNote,
      })

      if ("success" in result) {
        toast.success(result.success)
        router.push(`/services/${serviceId}`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Failed to submit suggestion:", error)
      toast.error("Failed to submit guide edit suggestion")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!service) {
    return <div>Service not found</div>
  }

  if (!service.guide) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>No Guide Available</CardTitle>
            <CardDescription>
              This service doesn&apos;t have a guide yet. You can create a new one instead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/services/${serviceId}/guide/new`}>
                Create New Guide
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" asChild>
            <Link href={`/services/${serviceId}`}>
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Service
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Suggest Guide Edit</h1>
        <p className="text-muted-foreground">
          Suggest improvements to the cancellation guide for {service.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guide Edit Suggestion</CardTitle>
          <CardDescription>
            Your suggested changes will be reviewed by administrators before being published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <GuideForm serviceId={serviceId} isAdmin={false}/>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/services/${serviceId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}