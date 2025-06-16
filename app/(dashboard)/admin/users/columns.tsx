"use client"

import {ColumnDef} from "@tanstack/react-table"
import {UserWithRole} from "better-auth/plugins";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {format} from "date-fns";
import {ShieldUser, UserRound} from "lucide-react";
import {AdminUserActions} from "@/components/admin/admin-user-actions";

export const columns: ColumnDef<UserWithRole>[] = [
  {
    accessorKey: "user.name",
    header: "Name",
    cell: ({row}) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded overflow-hidden">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user?.image || ""} alt={user?.name}/>
              <AvatarFallback className="rounded-lg">{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.name}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({row}) => {
      const user = row.original;
      return <span className="text-sm">{user?.email}</span>
    }
  },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
    cell: ({row}) => {
      const user = row.original;
      return user?.emailVerified ? (
        <Badge variant="outline" className="bg-green-100 text-green-800">Verified</Badge>
      ) : (
        <Badge variant="outline" className="bg-red-100 text-red-800">Not Verified</Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({row}) => {
      const user = row.original;
      return user?.createdAt ? (
        <span className="text-sm">{format(new Date(user.createdAt), "PPP")}</span>
      ) : null
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({row}) => {
      const user = row.original;
      return <Badge className="capitalize font-semibold">
        {user?.role === "admin" ? <ShieldUser className="size-5"/> :
          <UserRound className="size-5"/>} {user?.role || "user"}
      </Badge>
    }
  },
  {
    accessorKey: "banned",
    header: "Status",
    cell: ({row}) => {
      const user = row.original;
      return user?.banned ? (
        <Badge variant="outline" className="bg-red-100 text-red-800">Banned</Badge>
      ) : (
        <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({row}) => {
      const user = row.original;
      return <AdminUserActions user={user} />;
    },
  },
]
