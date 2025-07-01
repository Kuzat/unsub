import {DataTable} from "@/components/ui/data-table"
import {columns} from "./columns"
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {PlusIcon} from "lucide-react";
import {fetchSubscriptions} from "@/app/actions/subscriptions";
import {requireSession} from "@/lib/auth";
import {PaginationControl} from "@/components/services/pagination-control";
import {Suspense} from "react";

// Define the props for the page component
interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function SubscriptionPage(props: ServicesPageProps) {
  const session = await requireSession();

  const searchParams = await props.searchParams;
  // Parse page and pageSize from query parameters, defaulting to 1 and 10
  const page = Math.max(1, searchParams.page ? parseInt(searchParams.page) : 1);
  const pageSize = Math.min(
    100,
    Math.max(1, searchParams.pageSize ? parseInt(searchParams.pageSize) : 10)
  );

  const {subscriptions, totalPages, currentPage} = await fetchSubscriptions({
    userId: session.user.id,
    page,
    pageSize,
    query: ""
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
      {subscriptions.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          You don&apos;t have any subscriptions yet.
        </p>
      ) : (
        <>
          <DataTable columns={columns} data={subscriptions}/>
          <Suspense fallback={<div>Loading pagination...</div>}>
            <div className="flex justify-center gap-2 mt-4">
              <PaginationControl currentPage={currentPage} totalPages={totalPages}/>
            </div>
          </Suspense>
        </>
      )}
    </div>
  )
}
