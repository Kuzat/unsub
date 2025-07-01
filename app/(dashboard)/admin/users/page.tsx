"use server"

import {auth, requireAdmin} from "@/lib/auth";
import {headers} from "next/headers";
import {DataTable} from "@/components/ui/data-table";
import {columns} from "@/app/(dashboard)/admin/users/columns";
import {PaginationControl} from "@/components/services/pagination-control";
import {Suspense} from "react";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
}

export default async function AdminUsersPage(props: PageProps) {
  await requireAdmin();

  const searchParams = await props.searchParams;

  // Parse page and pageSize from query parameters, defaulting to 1 and 100
  const page = Math.max(1, searchParams.page ? parseInt(searchParams.page) : 1);
  const pageSize = Math.min(
    100,
    Math.max(1, searchParams.pageSize ? parseInt(searchParams.pageSize) : 10)
  );

  const {users, total} = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      sortBy: "createdAt",
      sortDirection: "desc",
    }
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      {users.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          There are no users yet.
        </p>
      ) : (
        <>
          <DataTable columns={columns} data={users}/>
          <Suspense fallback={<div>Loading pagination...</div>}>
            <div className="flex justify-center gap-2 mt-4">
              <PaginationControl currentPage={page} totalPages={totalPages}/>
            </div>
          </Suspense>
        </>
      )}
    </div>
  )
}