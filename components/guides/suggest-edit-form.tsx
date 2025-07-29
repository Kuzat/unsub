"use client"

import {useRouter} from "next/navigation"
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

interface SuggestEditFormProps {
  serviceId: string
  initialContent?: string
  isAdmin?: boolean
}

export default function SuggestEditForm({ serviceId, initialContent, isAdmin = false }: SuggestEditFormProps) {
  const router = useRouter()

  const form = useForm<CreateGuideFormValues>({
    resolver: zodResolver(createGuideSchema),
    defaultValues: {
      serviceId,
      bodyMd: initialContent || "",
      changeNote: "",
      status: "pending",
    },
  })

  async function onSubmit(data: CreateGuideFormValues) {
    try {
      const result = await suggestGuideEdit(data)

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

  return (
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
            <GuideForm serviceId={serviceId} isAdmin={isAdmin}/>

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
  )
}