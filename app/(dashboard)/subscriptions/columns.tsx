"use client"

import {ColumnDef} from "@tanstack/react-table"
import {formatDate, formatCurrency, calculateNextRenewal, cn, toIsoDate} from "@/lib/utils"
import {subscription} from "@/db/schema/app"
import {InferSelectModel} from "drizzle-orm";
import {Service} from "@/app/actions/services";
import {SubscriptionActions} from "@/components/subscriptions/subscription-actions";
import Link from "next/link";
import ServiceLogo from "@/components/ui/service-logo";

type SubscriptionWithService = {
  subscription: InferSelectModel<typeof subscription>,
  service: Service | null
}

export const columns: ColumnDef<SubscriptionWithService>[] = [
  {
    accessorKey: "service.name",
    header: "Service",
    cell: ({row}) => {
      const service = row.original.service;
      const subscription = row.original.subscription;
      return (
        <Link
          href={`/subscriptions/${subscription.id}`}
          className="flex items-center gap-3"
        >
          <ServiceLogo
            image={service?.logoCdnUrl}
            placeholder={service?.name?.charAt(0)}
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg"
          />
          <div className="hover:underline">
            <p className="font-medium">{service?.name || subscription.alias || 'Unknown Service'}</p>
            {service?.category && <p className="text-xs text-muted-foreground capitalize">{service.category}</p>}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({row}) => formatCurrency(parseFloat(row.original.subscription.price), row.original.subscription.currency),
  },
  {
    accessorKey: "billingCycle",
    header: "Billing",
    cell: ({row}) => <span className="capitalize">{row.original.subscription.billingCycle}</span>,
  },
  {
    accessorKey: "nextRenewal",
    header: "Next renewal date",
    cell: ({row}) => formatDate(toIsoDate(calculateNextRenewal(new Date(row.original.subscription.startDate), row.original.subscription.billingCycle))),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({row}) => {
      const isActive = row.original.subscription.isActive;
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
      return <SubscriptionActions data={row.original}/>;
    },
  },
]
