"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EditSubscriptionPage() {
  const params = useParams()
  const subscriptionId = params.id as string

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Subscription</h1>
        <p className="text-muted-foreground">
          This is a placeholder page for editing subscription with ID: {subscriptionId}
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/subscriptions">Back to Subscriptions</Link>
        </Button>
      </div>
    </div>
  )
}