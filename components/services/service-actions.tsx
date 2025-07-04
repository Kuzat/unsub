"use client";

import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {deleteService} from "@/app/actions/services";
import {MoreVertical, Edit, Trash2} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {toast} from "sonner";
import {Service} from "@/app/actions/services";

interface ServiceActionsProps {
  service: Service;
}

export function ServiceActions({service}: ServiceActionsProps) {
  const router = useRouter();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    router.push(`/services/edit/${service.id}`);
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const result = await deleteService(service.id);
      if (result === undefined) {
        toast.error("Failed to remove service");
        return;
      } else if ("success" in result) {
        toast.success(result.success);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to remove service");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowRemoveDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4"/>
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowRemoveDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4"/>
            <span>Remove</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Service</DialogTitle>
            <DialogDescription>
              This will permanently remove this service. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isLoading}
            >
              {isLoading ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}