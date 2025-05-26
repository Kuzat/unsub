import {DataTable} from "@/components/ui/data-table"
import {desc, eq} from "drizzle-orm"
import {db} from "@/db";
import {subscription} from "@/db/schema/app";
import {columns} from "./columns"
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {PlusIcon} from "lucide-react";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";
import {headers} from "next/headers";

export default async function SubscriptionPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const allSubscriptions = await db.query.subscription.findMany({
    where: eq(subscription.userId, session.user.id),
    orderBy: [desc(subscription.startDate)],
    with: {
      service: true,
    }
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Subscriptions</h1>
        <Button asChild>
          <Link href="/subscriptions/new">
            <PlusIcon className="mr-2 h-4 w-4"/>
            New Subscription
          </Link>
        </Button>
      </div>
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
