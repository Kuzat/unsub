"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDate, formatCurrency, calculateNextRenewal } from "@/lib/utils"
import { subscription } from "@/db/schema/app"

export const columns: ColumnDef<typeof subscription.$inferSelect>[] = [
  {
    accessorKey: "service.name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({row}) => formatCurrency(row.getValue("price")),
  },
  {
    accessorKey: "billingCycle",
    header: "Billing Cycle",
    cell: ({row}) => <span className="capitalize">{row.getValue("billingCycle")}</span>,
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({row}) => formatDate(row.getValue("startDate")),
  },
  {
    accessorKey: "nextRenewal",
    header: "Next Renewal",
    cell: ({row}) => formatDate(calculateNextRenewal(row.original.startDate, row.original.billingCycle).toISOString()),
  },
]
