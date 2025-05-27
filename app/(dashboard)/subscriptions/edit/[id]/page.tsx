import EditSubscriptionForm from "@/components/subscriptions/edit-subscription-form"
import {getSubscriptionById} from "@/app/actions/subscriptions"
import {notFound, redirect} from "next/navigation"

interface EditSubscriptionPageProps {
  params: Promise<{
    id: string
  }>,
  searchParams: Promise<{
    from?: string
  }>
}

export default async function EditSubscriptionPage(props: EditSubscriptionPageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const from = searchParams.from || "list" // Default to "list" if not specified

  // this checks the auth session and checks if the user has access to the subscription
  const result = await getSubscriptionById(params.id)

  // Handle errors or subscription not found
  if ("error" in result) {
    if (result.error === "Subscription not found") {
      notFound()
    } else {
      // Redirect to the subscriptions page with error
      redirect("/subscriptions")
    }
  }

  return (
    <div className="mx-auto max-w-3xl w-full p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Subscription</h1>
      <EditSubscriptionForm subscription={result} from={from}/>
    </div>
  )
}
