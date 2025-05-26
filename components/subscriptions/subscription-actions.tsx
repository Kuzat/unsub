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
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {activateSubscription, cancelSubscription, removeSubscription} from "@/app/actions/subscriptions";
import {MoreVertical, Edit, Trash2, X, Play} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {toast} from "sonner";
import {InferSelectModel} from "drizzle-orm";
import {subscription} from "@/db/schema/app";
import {Service} from "@/app/actions/services";

type SubscriptionWithService = InferSelectModel<typeof subscription> & { service: Service | null };

interface SubscriptionActionsProps {
  subscription: SubscriptionWithService;
}

export function SubscriptionActions({subscription}: SubscriptionActionsProps) {
  const router = useRouter();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newStartDate, setNewStartDate] = useState(() => {
    // Default to the current date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleEdit = () => {
    router.push(`/subscriptions/edit/${subscription.id}`);
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const result = await cancelSubscription(subscription.id);
      if (result === undefined) {
        toast.error("Failed to cancel subscription");
        return;
      }
      if ("success" in result) {
        toast.success(result.success);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to cancel subscription");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      const result = await activateSubscription(subscription.id, newStartDate);
      if (result === undefined) {
        toast.error("Failed to activate subscription");
        return;
      } else if ("success" in result) {
        toast.success(result.success);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to activate subscription");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowActivateDialog(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const result = await removeSubscription(subscription.id);
      if (result === undefined) {
        toast.error("Failed to remove subscription");
        return;
      } else if ("success" in result) {
        toast.success(result.success);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to remove subscription");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowRemoveDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
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
          {subscription.isActive ? (
            <DropdownMenuItem onClick={handleCancel}>
              <X className="mr-2 h-4 w-4"/>
              <span>Cancel</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowActivateDialog(true)}>
              <Play className="mr-2 h-4 w-4"/>
              <span>Activate</span>
            </DropdownMenuItem>
          )}
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
            <DialogTitle>Remove Subscription</DialogTitle>
            <DialogDescription>
              This will remove all information about this subscription.
              You might want to cancel it instead, which will keep the history but mark it as inactive.
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

      {/* Activate Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Subscription</DialogTitle>
            <DialogDescription>
              This will reactivate your subscription. Please select a new start date for the subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActivateDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleActivate}
              disabled={isLoading}
            >
              {isLoading ? "Activating..." : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}