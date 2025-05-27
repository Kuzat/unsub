"use client"

import {ColumnDef} from "@tanstack/react-table"
import {formatDate, formatCurrency, calculateNextRenewal, cn} from "@/lib/utils"
import {subscription} from "@/db/schema/app"
import Image from "next/image"
import {InferSelectModel} from "drizzle-orm";
import {Service} from "@/app/actions/services";
import {SubscriptionActions} from "@/components/subscriptions/subscription-actions";
import Link from "next/link";

type SubscriptionWithService = InferSelectModel<typeof subscription> & { service: Service | null }

export const columns: ColumnDef<SubscriptionWithService>[] = [
  {
    accessorKey: "service.name",
    header: "Service",
    cell: ({row}) => {
      const service = row.original.service;
      const subscriptionId = row.original.id;
      return (
        <Link 
          href={`/subscriptions/${subscriptionId}`}
          className="flex items-center gap-3"
        >
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
          <div className="hover:underline">
            <p className="font-medium">{service?.name || row.original.alias || 'Unknown Service'}</p>
            {service?.category && <p className="text-xs text-muted-foreground capitalize">{service.category}</p>}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({row}) => formatCurrency(row.getValue("price"), row.original.currency),
  },
  {
    accessorKey: "billingCycle",
    header: "Billing",
    cell: ({row}) => <span className="capitalize">{row.getValue("billingCycle")}</span>,
  },
  {
    accessorKey: "nextRenewal",
    header: "Next renewal date",
    cell: ({row}) => formatDate(calculateNextRenewal(row.original.startDate, row.original.billingCycle).toISOString()),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({row}) => {
      const isActive = row.original.isActive;
      return (
        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-medium w-fit",
          isActive
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        )}>
          {isActive ? "Active" : "Inactive"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({row}) => {
      const subscription = row.original;
      return <SubscriptionActions subscription={subscription} />;
    },
  },
]
