"use server"

import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {DataTable} from "@/components/ui/data-table";
import {columns} from "@/app/(dashboard)/admin/users/columns";

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  if (session.user.role !== "admin") {
    return redirect('/dashboard')
  }

  const userListResponse = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: 10
    }
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      {userListResponse.users.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          There are no users yet.
        </p>
      ) : (
        <DataTable columns={columns} data={userListResponse.users}/>
      )}
    </div>
  )
}