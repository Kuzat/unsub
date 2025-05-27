"use client"

import { ColumnDef } from "@tanstack/react-table"
import { formatDate, formatCurrency, cn } from "@/lib/utils"
import { TransactionWithService } from "@/app/actions/subscriptions"
import { TransactionActions } from "@/components/transactions/transaction-actions"

export const transactionColumns: ColumnDef<TransactionWithService>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <span className="capitalize">
          {type.replace('hypothetical_', '').replace('_', ' ')}
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.getValue("amount"), row.original.currency),
  },
  {
    accessorKey: "occurredAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.occurredAt;
      return formatDate(date.toISOString());
    },
  },
  {
    accessorKey: "serviceName",
    header: "Service",
    cell: ({ row }) => {
      return row.original.serviceName || "Unknown Service";
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return formatDate(date.toISOString());
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <TransactionActions transaction={row.original} />;
    },
  },
]
