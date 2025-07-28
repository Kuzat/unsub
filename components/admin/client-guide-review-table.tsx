"use client"

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GuideReviewTable } from "@/components/admin/guide-review-table";
import { PendingGuideVersion, pendingColumns, rejectedColumns } from "@/app/(dashboard)/admin/guides/columns";

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
  const currentColumns = activeTab === 'pending' ? pendingColumns : rejectedColumns;

  return (
    <>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'pending'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'rejected'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Rejected
        </button>
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
