import EditServiceForm from "@/components/services/edit-service-form"
import {getServiceById} from "@/app/actions/services"
import {notFound, redirect} from "next/navigation"
import Link from "next/link";
import {ArrowLeftIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {isAdmin, requireSession} from "@/lib/auth";

interface EditServicePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditServicePage(props: EditServicePageProps) {
  const session = await requireSession();

  const params = await props.params
  // this checks the auth session and checks if the user has access to the service
  const result = await getServiceById(params.id)

  // Handle errors or service not found
  if ("error" in result) {
    if (result.error === "Service not found") {
      notFound()
    } else {
      // Redirect to the services page with error
      redirect("/services")
    }
  }

  // Only allow editing user services, not global ones
  if (result.scope !== "user") {
    redirect("/services")
  }

  return (
    <div className="mx-auto max-w-3xl w-full p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Service</h1>
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/services">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Services
        </Link>
      </Button>
      <EditServiceForm service={result} isAdmin={isAdmin(session)}/>
    </div>
  )
}