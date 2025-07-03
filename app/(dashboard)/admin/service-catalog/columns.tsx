"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Service} from "@/app/actions/services"
import Image from "next/image"
import {ServiceActions} from "@/components/services/service-actions"
import {cn} from "@/lib/utils"
import {User} from "better-auth";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export type ServiceWithUser = {service: Service, user: User | null }

export const columns: ColumnDef<ServiceWithUser>[] = [
  {
    accessorKey: "service.name",
    header: "Service",
    cell: ({row}) => {
      const service = row.original.service;
      return (
        <div className="flex items-center gap-3">
          {service?.logoUrl ? (
            <div className="h-8 w-8 rounded overflow-hidden">
              <Image
                src={service.logoUrl}
                alt={service.name}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
              <span className="text-sm font-bold">{service?.name?.charAt(0) || '?'}</span>
            </div>
          )}
          <div>
            <p className="font-medium">{service?.name || 'Unknown Service'}</p>
            {service?.category && <p className="text-xs text-muted-foreground capitalize">{service.category}</p>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "user.name",
    header: "Owner",
    cell: ({row}) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded overflow-hidden">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user?.image || ""} alt={user?.name}/>
              <AvatarFallback className="rounded-lg"><Image src="/unsub.svg" width={32} height={32} alt="Unsub logo" /></AvatarFallback>
            </Avatar>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.name || "System"}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "service.category",
    header: "Category",
    cell: ({row}) => <span className="capitalize">{row.original.service.category || "Uncategorized"}</span>,
  },
  {
    accessorKey: "service.url",
    header: "Website",
    cell: ({row}) => {
      const url = row.original.service.url;
      if (!url) return <span className="text-muted-foreground">Not available</span>;

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {url.replace(/^https?:\/\//, '').split('/')[0]}
        </a>
      );
    },
  },
  {
    accessorKey: "service.description",
    header: "Description",
    cell: ({row}) => {
      const description = row.original.service.description;
      if (!description) return <span className="text-muted-foreground">No description</span>;

      // Truncate long descriptions
      return <p className="max-w-[120px] sm:max-w-[150px] md:max-w-[210px] lg:max-w-[300px] xl:max-w-[400px] truncate">{description}</p>
    },
  },
  {
    accessorKey: "service.scope",
    header: "Type",
    cell: ({row}) => {
      const scope = row.original.service.scope;
      return (
        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-medium w-fit",
          scope === "global"
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
        )}>
          {scope === "global" ? "Global" : "Custom"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({row}) => {
      const service = row.original.service;
      return <ServiceActions service={service}/>
    },
  },
]