import {DataTable} from "@/components/ui/data-table"
import {desc} from "drizzle-orm"
import {db} from "@/db";
import {subscription} from "@/db/schema/app";
import {columns} from "./columns"

export default async function SubscriptionPage() {
  const allSubscriptions = await db.query.subscription.findMany({
    orderBy: [desc(subscription.startDate)],
    with: {
      service: true,
    }
  })

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Your Subscriptions</h1>
      {allSubscriptions.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          You don&apos;t have any subscriptions yet.
        </p>
      ) : (
        <DataTable columns={columns} data={allSubscriptions}/>
      )}
    </div>
  )
}
