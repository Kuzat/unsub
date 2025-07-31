import {isAdmin, requireSession} from "@/lib/auth";
import {fetchServiceById} from "@/app/actions/services";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ArrowLeft, Edit, PlusCircle, FileEdit} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import ServiceLogo from "@/components/ui/service-logo";
import {MarkdownContent} from "@/components/ui/markdown-content";
import GuideVoting from "@/components/guides/guide-voting";
import {cn, formatDate, toIsoDate} from "@/lib/utils";

type ServiceDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ServiceDetailPage({params}: ServiceDetailPageProps) {
  const session = await requireSession()
  const userIsAdmin = isAdmin(session)

  const {id} = await params

  const service = await fetchServiceById({id, withGuide: true})

  if (!service) {
    return <div>Service not found</div>
  }

  const hasGuide = !!service.guide;
  const guideContent = hasGuide && service.guide?.currentVersion?.bodyMd;
  const guideCreatedAt = hasGuide && service.guide?.currentVersion?.createdAt;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" asChild>
            <Link href="/services">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Services
            </Link>
          </Button>
          {(userIsAdmin || service.scope === "user") && (
            <Button variant="outline" asChild>
              <Link href={`/services/edit/${id}`}>
                <Edit className="mr-2 h-4 w-4"/>
                Edit Service
              </Link>
            </Button>
          )}
        </div>
        <h1 className="text-2xl font-bold">Service Details</h1>
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
                <div className="flex items-center gap-2">
                  {service.category && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {service.category}
                    </p>
                  )}
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                    service.scope === "global"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                  )}>
                    {service.scope === "global" ? "Global Service" : "Custom Service"}
                  </span>
                </div>
              </div>
            </div>
            {service.url && (
              <div className="mb-2">
                <span className="font-medium">Website: </span>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {service.url.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              </div>
            )}
            {service.description && (
              <div>
                <span className="font-medium">Description: </span>
                <span>{service.description}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service Guide</CardTitle>
                <CardDescription>
                  Information about cancelling or managing this service
                </CardDescription>
              </div>
              {hasGuide && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/services/${id}/guide/edit`}>
                    <FileEdit className="mr-2 h-4 w-4"/>
                    Suggest Edit
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasGuide && guideContent ? (
              <div>
                <MarkdownContent content={guideContent} />
                
                <div className="mt-6">
                  <GuideVoting guideId={service.guide!.id} />
                </div>
                
                {guideCreatedAt && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Created on {formatDate(toIsoDate(guideCreatedAt))}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <PlusCircle className="h-8 w-8 text-gray-400 mb-2"/>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Create Service Guide</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No guide available for this service yet. Create one to help users manage or cancel their subscription.
                </p>
                <Button asChild>
                  <Link href={`/services/${id}/guide/new`}>
                    Create Guide
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
