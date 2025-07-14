"use client"

import {useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {updateGuideVersionStatus} from "@/app/actions/guides";
import {PendingGuideVersion} from "@/app/(dashboard)/admin/guides/columns";

interface GuideReviewTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onItemRemoved?: (id: string) => void;
}

export function GuideReviewTable<TData extends PendingGuideVersion, TValue = unknown>({
                                                                      columns,
                                                                      data,
                                                                      onItemRemoved,
                                                                    }: GuideReviewTableProps<TData, TValue>) {
  const [selectedGuide, setSelectedGuide] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRowClick = (guide: TData) => {
    setSelectedGuide(guide);
  };

  const handleApprove = async () => {
    if (!selectedGuide) return;

    setIsLoading(true);
    try {
      const result = await updateGuideVersionStatus(selectedGuide.id, "approved");

      if ("success" in result) {
        toast.success(result.success);
        // Call onItemRemoved to update the list
        if (onItemRemoved) {
          onItemRemoved(selectedGuide.id);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to approve guide version");
      console.error(error);
    } finally {
      setIsLoading(false);
      setSelectedGuide(null);
    }
  };

  const handleReject = async () => {
    if (!selectedGuide) return;

    setIsLoading(true);
    try {
      const result = await updateGuideVersionStatus(selectedGuide.id, "rejected");

      if ("success" in result) {
        toast.success(result.success);
        // Call onItemRemoved to update the list
        if (onItemRemoved) {
          onItemRemoved(selectedGuide.id);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to reject guide version");
      console.error(error);
    } finally {
      setIsLoading(false);
      setSelectedGuide(null);
    }
  };

  // Add row click handler to the DataTable
  const onRowClick = (row: {original: TData}) => {
    handleRowClick(row.original);
  };

  // Check if the selected guide is rejected
  const isRejected = selectedGuide?.status === "rejected";

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onRowClick={onRowClick}
      />

      {/* Preview Dialog with Approve/Reject buttons for pending guides, or just view for rejected guides */}
      <Dialog open={!!selectedGuide} onOpenChange={(open) => !open && setSelectedGuide(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview Guide</DialogTitle>
            <DialogDescription>
              {isRejected
                ? "This guide version has been rejected."
                : "Preview the guide content before approving or rejecting."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-4 prose prose-sm dark:prose-invert">
            <div className="whitespace-pre-wrap">{selectedGuide?.bodyMd}</div>
          </div>
          <DialogFooter className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedGuide(null)}
              disabled={isLoading}
            >
              Close
            </Button>
            <div className="flex gap-2">
              {!isRejected && (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  {isLoading ? "Rejecting..." : "Reject"}
                </Button>
              )}
              <Button
                variant="default"
                onClick={handleApprove}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Approving..." : "Approve"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
