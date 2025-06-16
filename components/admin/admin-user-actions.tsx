import { Button } from "@/components/ui/button";
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
import { MoreVertical, Edit, Trash2, Shield, UserRound, Ban, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UserWithRole } from "better-auth/plugins";
import {authClient} from "@/lib/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminUserActionsProps {
  user: UserWithRole;
}

type UserRole = "user" | "admin" | ("user" | "admin")[];

export function AdminUserActions({ user }: AdminUserActionsProps) {
  const router = useRouter();
  const {refetch} = authClient.useSession()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newRole, setNewRole] = useState(user.role as UserRole || "user" as UserRole);
  const [banReason, setBanReason] = useState("");
  const [banExpiresIn, setBanExpiresIn] = useState("");

  const handleEdit = () => {
    // For future implementation - could redirect to an edit user page
    toast.info("Edit user functionality not implemented yet");
  };

  const handleSwitchRole = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await authClient.admin.setRole({
        userId: user.id,
        role: newRole
      });

      if (updatedUser) {
        toast.success("User role updated successfully");
        router.refresh();
      } else {
        toast.error("Failed to switch user role");
      }
    } catch (error) {
      toast.error("Failed to switch user role");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowRoleDialog(false);
    }
  };

  const handleImpersonate = async () => {
    setIsLoading(true);
    try {
      await authClient.admin.impersonateUser({
        userId: user.id,
      });
      toast.success("Impersonating user");
      refetch();
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to impersonate user");
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleBanUnban = () => {
    if (user.banned) {
      // If user is already banned, unban them directly
      handleUnban();
    } else {
      // If user is not banned, show the ban dialog
      setShowBanDialog(true);
      setBanReason("");
      setBanExpiresIn("");
    }
  };

  const handleUnban = async () => {
    setIsLoading(true);
    try {
      const unbannedUser = await authClient.admin.unbanUser({
        userId: user.id,
      });

      if (unbannedUser) {
        toast.success("User unbanned successfully");
        router.refresh();
      } else {
        toast.error("Failed to unban user");
      }
    } catch (error) {
      toast.error("Failed to unban user");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async () => {
    setIsLoading(true);
    try {
      // Convert banExpiresIn from days to seconds if provided
      const expiresInSeconds = banExpiresIn ? parseInt(banExpiresIn) * 24 * 60 * 60 : undefined;

      const bannedUser = await authClient.admin.banUser({
        userId: user.id,
        banReason: banReason || undefined, // If empty, it will use the default reason
        banExpiresIn: expiresInSeconds,
      });

      if (bannedUser) {
        toast.success("User banned successfully");
        router.refresh();
      } else {
        toast.error("Failed to ban user");
      }
    } catch (error) {
      toast.error("Failed to ban user");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowBanDialog(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteUser(user.id);
      if (result === undefined) {
        toast.error("Failed to delete user");
        return;
      }
      if ("success" in result) {
        toast.success(result.success);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
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
          <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
            {user.role === "admin" ? (
              <UserRound className="mr-2 h-4 w-4"/>
            ) : (
              <Shield className="mr-2 h-4 w-4"/>
            )}
            <span>Switch Role</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImpersonate}>
            <UserCheck className="mr-2 h-4 w-4"/>
            <span>Impersonate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBanUnban}>
            <Ban className="mr-2 h-4 w-4"/>
            <span>{user.banned ? "Unban" : "Ban"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4"/>
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This will permanently delete the user account and all associated data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch User Role</DialogTitle>
            <DialogDescription>
              Change the role of this user. Admin users have access to administrative features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4 flex items-center space-x-4">
                <Button
                  variant={newRole === "user" ? "default" : "outline"}
                  onClick={() => setNewRole("user")}
                  className="flex-1"
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  User
                </Button>
                <Button
                  variant={newRole === "admin" ? "default" : "outline"}
                  onClick={() => setNewRole("admin")}
                  className="flex-1"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSwitchRole}
              disabled={isLoading || newRole === user.role}
            >
              {isLoading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Banning a user will prevent them from signing in and revoke all of their existing sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="banReason" className="col-span-4">
                Ban Reason
              </Label>
              <Input
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for banning (optional)"
                className="col-span-4"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="banExpiresIn" className="col-span-4">
                Ban Duration (days)
              </Label>
              <Input
                id="banExpiresIn"
                type="number"
                value={banExpiresIn}
                onChange={(e) => setBanExpiresIn(e.target.value)}
                placeholder="Leave empty for permanent ban"
                className="col-span-4"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBanDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={isLoading}
            >
              {isLoading ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
