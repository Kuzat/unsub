"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Service} from "@/app/actions/services"
import {ServiceActions} from "@/components/services/service-actions"
import {cn} from "@/lib/utils"
import ServiceLogo from "@/components/ui/service-logo";

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "name",
    header: "Service",
    cell: ({row}) => {
      const service = row.original;
      return (
        <div className="flex items-center gap-3">
          <ServiceLogo
            image={service.logoCdnUrl}
            placeholder={service?.name?.charAt(0)}
            className="h-8 w-8 rounded-lg"
          />
          <div>
            <p className="font-medium">{service?.name || 'Unknown Service'}</p>
            {service?.category && <p className="text-xs text-muted-foreground capitalize">{service.category}</p>}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({row}) => <span className="capitalize">{row.getValue("category") || "Uncategorized"}</span>,
  },
  {
    accessorKey: "url",
    header: "Website",
    cell: ({row}) => {
      const url = row.getValue("url") as string | null;
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
    accessorKey: "description",
    header: "Description",
    cell: ({row}) => {
      const description = row.getValue("description") as string | null;
      if (!description) return <span className="text-muted-foreground">No description</span>;

      // Truncate long descriptions
      return <p
        className="max-w-[120px] sm:max-w-[150px] md:max-w-[210px] lg:max-w-[300px] xl:max-w-[400px] truncate">{description}</p>
    },
  },
  {
    accessorKey: "scope",
    header: "Type",
    cell: ({row}) => {
      const scope = row.getValue("scope") as string;
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
      const service = row.original;
      return service.scope === "user" ? <ServiceActions service={service}/> : null;
    },
  },
]
