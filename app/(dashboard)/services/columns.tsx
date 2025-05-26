"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Service} from "@/app/actions/services"
import Image from "next/image"

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "name",
    header: "Service",
    cell: ({row}) => {
      const service = row.original;
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
      return description.length > 100 
        ? `${description.substring(0, 100)}...` 
        : description;
    },
  },
]