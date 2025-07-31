"use client"

import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {GuideReviewTable} from "@/components/admin/guide-review-table";
import {PendingGuideVersion, pendingColumns, rejectedColumns} from "@/app/(dashboard)/admin/guides/columns";
import {Button} from "@/components/ui/button";

interface ClientGuideReviewTableProps<TPendingData, TRejectedData, TValue> {
  columns?: ColumnDef<TPendingData, TValue>[]; // Optional for backward compatibility
  pendingData: TPendingData[];
  rejectedData: TRejectedData[];
}

export function ClientGuideReviewTable<TData extends PendingGuideVersion, TValue = unknown>({
                                                                                              pendingData,
                                                                                              rejectedData,
                                                                                            }: ClientGuideReviewTableProps<TData, TData, TValue>) {
  // Maintain client-side state of the data
  const [pendingItems, setPendingItems] = useState<TData[]>(pendingData);
  const [rejectedItems, setRejectedItems] = useState<TData[]>(rejectedData);
  const [activeTab, setActiveTab] = useState<'pending' | 'rejected'>('pending');

  // Function to remove an item from the list after approval/rejection
  const handleItemRemoved = (id: string) => {
    if (activeTab === 'pending') {
      setPendingItems((prevData) => prevData.filter((item) => item.id !== id));
    } else {
      setRejectedItems((prevData) => prevData.filter((item) => item.id !== id));
    }
  };

  // Get the current data and columns based on the active tab
  const currentData = activeTab === 'pending' ? pendingItems : rejectedItems;
  const currentColumns = (activeTab === 'pending' ? pendingColumns : rejectedColumns) as ColumnDef<TData>[];

  return (
    <>
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'secondary'}
          size="default"
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </Button>
        <Button
          variant={activeTab === 'rejected' ? "default" : "secondary"}
          size="default"
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </Button>
      </div>

      {currentData.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          There are no {activeTab} guide versions to review.
        </p>
      ) : (
        <GuideReviewTable
          columns={currentColumns}
          data={currentData}
          onItemRemoved={handleItemRemoved}
        />
      )}
    </>
  );
}
