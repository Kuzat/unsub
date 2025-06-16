"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, LogOut, Shield, ChevronDown, ChevronUp } from "lucide-react";

type Session = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  userAgent?: string;
  ip?: string;
  isCurrent?: boolean;
};

export function SessionsForm() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const { data: currentSession } = authClient.useSession();

  // Fetch sessions when the component mounts
  useEffect(() => {
    fetchSessions();
  }, []);

  // Function to fetch sessions
  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const sessionsData = await authClient.listSessions();

      if (sessionsData.error) {
        console.error("Error fetching sessions:", sessionsData.error);
        toast.error("Failed to load your active sessions");
        return;
      }

      console.log("Sessions:", sessionsData.data);

      // Mark the current session
      const enhancedSessions = sessionsData.data.map(session => ({
        id: session.id,
        token: session.token,
        userId: session.userId,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        userAgent: session.userAgent ?? undefined,
        ip: session.ipAddress ?? undefined,
        isCurrent: session.token === currentSession?.session.token
      }));

      setSessions(enhancedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load your active sessions");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to revoke a specific session
  const revokeSession = async (session: Session) => {
    setIsRevoking(true);
    try {
      await authClient.revokeSession({
        token: session.token
      });

      toast.success("Session revoked successfully");
      fetchSessions(); // Refresh the sessions list
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Failed to revoke session");
    } finally {
      setIsRevoking(false);
      setConfirmDialogOpen(false);
      setSessionToRevoke(null);
    }
  };

  // Function to revoke all other sessions
  const revokeOtherSessions = async () => {
    setIsRevokingAll(true);
    try {
      await authClient.revokeOtherSessions();

      toast.success("All other sessions revoked successfully");
      fetchSessions(); // Refresh the sessions list
    } catch (error) {
      console.error("Error revoking other sessions:", error);
      toast.error("Failed to revoke other sessions");
    } finally {
      setIsRevokingAll(false);
    }
  };

  // Function to extract device info from user agent
  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return "Unknown device";

    // Simple parsing - in a production app, you might want to use a more robust solution
    const isMobile = /mobile/i.test(userAgent);
    const isTablet = /tablet/i.test(userAgent);
    const isWindows = /windows/i.test(userAgent);
    const isMac = /macintosh/i.test(userAgent);
    const isLinux = /linux/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    let deviceType = "Desktop";
    if (isMobile) deviceType = "Mobile";
    if (isTablet) deviceType = "Tablet";

    let os = "Unknown OS";
    if (isWindows) os = "Windows";
    if (isMac) os = "macOS";
    if (isLinux) os = "Linux";
    if (isIOS) os = "iOS";
    if (isAndroid) os = "Android";

    return `${deviceType} - ${os}`;
  };

  // Show loading indicator while fetching sessions
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Active Sessions</h3>
          <p className="text-sm text-muted-foreground">
            Loading your active sessions...
          </p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Active Sessions</h3>
        <p className="text-sm text-muted-foreground">
          Manage your active sessions across devices.
        </p>
      </div>

      <div className="space-y-4">
        {!showAllSessions ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Active Sessions
              </CardTitle>
              <CardDescription>
                You have {sessions.length} active {sessions.length === 1 ? "session" : "sessions"}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowAllSessions(true)}
                className="flex items-center gap-1"
              >
                <ChevronDown className="h-4 w-4" />
                Show All Sessions
              </Button>

              {sessions.length > 1 && (
                <Button 
                  variant="outline" 
                  onClick={revokeOtherSessions}
                  disabled={isRevokingAll}
                  className="flex items-center gap-1"
                >
                  {isRevokingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-1" />
                      Revoke Other Sessions
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAllSessions(false)}
                className="flex items-center gap-1"
              >
                <ChevronUp className="h-4 w-4" />
                Hide Sessions
              </Button>

              {sessions.length > 1 && (
                <Button 
                  variant="outline" 
                  onClick={revokeOtherSessions}
                  disabled={isRevokingAll}
                  className="flex items-center gap-1"
                >
                  {isRevokingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-1" />
                      Revoke Other Sessions
                    </>
                  )}
                </Button>
              )}
            </div>

            {sessions.map((session) => (
              <Card key={session.id} className={session.isCurrent ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {session.isCurrent && <Shield className="h-4 w-4 text-primary" />}
                    {getDeviceInfo(session.userAgent)}
                    {session.isCurrent && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Current</span>}
                  </CardTitle>
                  <CardDescription>
                    Last active: {session.updatedAt.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 text-sm">
                  <p className="text-muted-foreground">
                    IP: {session.ip || "Unknown"}
                  </p>
                  <p className="text-muted-foreground">
                    Created: {session.createdAt.toLocaleString()}
                  </p>
                </CardContent>
                <CardFooter>
                  {!session.isCurrent ? (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        setSessionToRevoke(session);
                        setConfirmDialogOpen(true);
                      }}
                      disabled={isRevoking}
                      className="flex items-center gap-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Revoke
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Current Session
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Revoke Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this session? The user will be signed out from this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isRevoking}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => sessionToRevoke && revokeSession(sessionToRevoke)}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Session"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
