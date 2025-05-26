import {DataTable} from "@/components/ui/data-table"
import {getServices} from "@/app/actions/services";
import {columns} from "./columns"
import {Suspense} from "react";
import {PaginationControl} from "@/components/services/pagination-control";

// Define the props for the page component
interface ServicesPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
  };
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  // Parse page and pageSize from query parameters, defaulting to 1 and 10
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize) : 10;

  // Fetch services with pagination
  const { services, totalPages, currentPage } = await getServices(page, pageSize);

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Services</h1>
      {services.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          No services found.
        </p>
      ) : (
        <>
          <div className="rounded-md border">
            <DataTable columns={columns} data={services}/>
          </div>
          <Suspense fallback={<div>Loading pagination...</div>}>
            <PaginationControl currentPage={currentPage} totalPages={totalPages} />
          </Suspense>
        </>
      )}
    </div>
  )
}
