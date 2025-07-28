"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import Link from "next/link";
import {guide, guideVersion, service} from "@/db/schema/app";
import {user} from "@/db/schema/auth";
import {formatDate, toIsoDate} from "@/lib/utils";

// Define the type for the guide version data
export type CommonGuideVersion = typeof guideVersion.$inferSelect & {
  guide: typeof guide.$inferSelect & {
    service: typeof service.$inferSelect,
  },
  createdBy: typeof user.$inferSelect | null,
}
export type PendingGuideVersion =  CommonGuideVersion
export type RejectedGuideVersion = CommonGuideVersion & {
  reviewedBy: typeof user.$inferSelect | null,
}
export type GuideVersion = PendingGuideVersion | RejectedGuideVersion;

// Generic function to create common columns for any guide version type
function createCommonColumns<T extends CommonGuideVersion>(): ColumnDef<T>[] {
  return [
    {
      accessorKey: "guide.service.name",
      header: "Service",
      cell: ({row}) => {
        const guideVersion = row.original;
        return (
          <Link
            href={`/services/${guideVersion.guide.serviceId}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {guideVersion.guide.service.name}
          </Link>
        )
      }
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({row}) => {
        const guideVersion = row.original;
        return <span className="text-sm">v{guideVersion.version}</span>
      }
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({row}) => {
        const guideVersion = row.original;
        const creator = guideVersion.createdBy;

        if (!creator) return <span className="text-sm text-muted-foreground">Unknown</span>;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>{creator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              <AvatarImage src={creator.image || ""} alt={creator.name} className="h-6 w-6 rounded-lg"/>
            </Avatar>
            <span className="text-sm">{creator.name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({row}) => {
        const guideVersion = row.original;
        return (
          <span className="text-sm">
            {formatDate(toIsoDate(guideVersion.createdAt))}
          </span>
        )
      }
    },
    {
      accessorKey: "changeNote",
      header: "Change Note",
      cell: ({row}) => {
        const guideVersion = row.original;
        return (
          <span className="text-sm">
            {guideVersion.changeNote || "No change note provided"}
          </span>
        )
      }
    },
  ];
}

// Columns specific to pending guide versions
export const pendingColumns: ColumnDef<PendingGuideVersion>[] = [
  ...createCommonColumns<PendingGuideVersion>(),
  {
    accessorKey: "status",
    header: "Status",
    cell: ({row}) => {
      const guideVersion = row.original;
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          {guideVersion.status}
        </Badge>
      )
    }
  },
];

// Columns specific to rejected guide versions
export const rejectedColumns: ColumnDef<RejectedGuideVersion>[] = [
  ...createCommonColumns<RejectedGuideVersion>(),
  {
    accessorKey: "status",
    header: "Status",
    cell: ({row}) => {
      const guideVersion = row.original;
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          {guideVersion.status}
        </Badge>
      )
    }
  },
  {
    accessorKey: "reviewedBy",
    header: "Rejected By",
    cell: ({row}) => {
      const guideVersion = row.original;
      const reviewer = guideVersion.reviewedBy;

      if (!reviewer) return <span className="text-sm text-muted-foreground">Unknown</span>;

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{reviewer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            <AvatarImage src={reviewer.image || ""} alt={reviewer.name} className="h-6 w-6 rounded-lg"/>
          </Avatar>
          <span className="text-sm">{reviewer.name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "reviewedAt",
    header: "Rejected At",
    cell: ({row}) => {
      const guideVersion = row.original;
      return (
        <span className="text-sm">
          {guideVersion.reviewedAt ? formatDate(toIsoDate(guideVersion.reviewedAt)) : "Unknown"}
        </span>
      )
    }
  },
];

// For backward compatibility
export const columns = pendingColumns;
