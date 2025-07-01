import {DataTable} from "@/components/ui/data-table"
import {getServicesForUser, Service} from "@/app/actions/services";
import {columns} from "./columns"
import {Suspense} from "react";
import {PaginationControl} from "@/components/services/pagination-control";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {PlusIcon} from "lucide-react";
import {requireSession} from "@/lib/auth";

// Define the props for the page component
interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function ServicesPage(props: ServicesPageProps) {
  const session = await requireSession();

  const searchParams = await props.searchParams;
  // Parse page and pageSize from query parameters, defaulting to 1 and 10
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize) : 10;

  // Fetch services with pagination
  const { services, totalPages, currentPage } = await getServicesForUser(session, page, pageSize);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button asChild>
          <Link href="/services/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Service
          </Link>
        </Button>
      </div>
      {services.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          No services found.
        </p>
      ) : (
        <>
          <div className="rounded-md border">
            <DataTable columns={columns} data={services as Service[]}/>
          </div>
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
