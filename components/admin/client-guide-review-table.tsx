"use client"

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GuideReviewTable } from "@/components/admin/guide-review-table";
import { PendingGuideVersion } from "@/app/(dashboard)/admin/guides/columns";

interface ClientGuideReviewTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  initialData: TData[];
}

export function ClientGuideReviewTable<TData extends PendingGuideVersion>({
  columns,
  initialData,
}: ClientGuideReviewTableProps<TData>) {
  // Maintain client-side state of the data
  const [data, setData] = useState<TData[]>(initialData);

  // Function to remove an item from the list after approval/rejection
  const handleItemRemoved = (id: string) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
  };

  return (
    <>
      {data.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          There are no pending guide versions to review.
        </p>
      ) : (
        <GuideReviewTable 
          columns={columns} 
          data={data} 
          onItemRemoved={handleItemRemoved}
        />
      )}
    </>
  );
}