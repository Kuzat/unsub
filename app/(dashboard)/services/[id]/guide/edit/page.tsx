import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import Link from "next/link"
import {ArrowLeft} from "lucide-react"
import {fetchServiceById} from "@/app/actions/services"
import {requireSession} from "@/lib/auth"
import SuggestEditForm from "@/components/guides/suggest-edit-form"

type SuggestGuideEditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function SuggestGuideEditPage({params}: SuggestGuideEditPageProps) {
  await requireSession()
  const {id: serviceId} = await params

  const service = await fetchServiceById({id: serviceId, withGuide: true})

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

  const initialContent = service.guide.currentVersion?.bodyMd || ""

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

      <SuggestEditForm 
        serviceId={serviceId}
        initialContent={initialContent}
      />
    </div>
  )
}