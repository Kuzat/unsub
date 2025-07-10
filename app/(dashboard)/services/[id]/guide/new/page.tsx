import { requireSession } from "@/lib/auth";
import { fetchServiceById } from "@/app/actions/services";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ServiceLogo from "@/components/ui/service-logo";
import NewGuideForm from "@/components/guides/new-guide-form";
import {redirect} from "next/navigation";

type NewGuidePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function NewGuidePage({ params }: NewGuidePageProps) {
  await requireSession();
  const { id } = await params;

  // Fetch the service to ensure it exists and the user has access to it
  const service = await fetchServiceById({ id, withGuide: true });

  if (!service) {
    return <div>Service not found</div>;
  }

  if (service.guide) {
    // Should just redirect to the edit page if someone tries to create new for an already existing guide
    return redirect(`/services/${id}/guide/${service.guide.id}/edit`)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" asChild>
            <Link href={`/services/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Create Service Guide</h1>
        <p className="text-muted-foreground">
          Create a guide to help users manage or cancel their subscription to this service.
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <ServiceLogo
                image={service.logoCdnUrl}
                placeholder={service.name.charAt(0)}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold">
                  {service.name}
                </h3>
                {service.category && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {service.category}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guide Content</CardTitle>
            <CardDescription>
              Write your guide in Markdown format. Include information about how to cancel or manage subscriptions to this service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewGuideForm serviceId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}