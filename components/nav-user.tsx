"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut, Settings,
  Sparkles, UserRoundX,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {authClient} from "@/lib/client";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {toast} from "sonner";

export function NavUser() {
  const {data, refetch} = authClient.useSession()

  const {isMobile} = useSidebar()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      router.push("/login");
    }
  }

  const handleStopImpersonating = async () => {
    try {
      await authClient.admin.stopImpersonating()
      refetch();
      toast.success("Stopped impersonating");
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to stop impersonating");
      router.push("/login");
    }
  }

  const avatarSrc = data?.user?.image || ""

  const isImpersonating = data ? data.session.impersonatedBy !== null : false;

  return (
    <SidebarMenu className={isImpersonating ? "border-destructive border-2 rounded-lg" : ""}>
      {isImpersonating && <div className="px-2 font-bold text-destructive">Impersonating</div>}
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarSrc} alt={data?.user?.name}/>
                <AvatarFallback className="rounded-lg">{data?.user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{data?.user?.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4"/>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarSrc} alt={data?.user?.name}/>
                  <AvatarFallback
                    className="rounded-lg">{data?.user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{data?.user?.name}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles/>
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator/>
            <DropdownMenuGroup>
              <Link href="/settings/account">
                <DropdownMenuItem>
                  <BadgeCheck/>
                  Account
                </DropdownMenuItem>
              </Link>
              <Link href="/settings/notifications">
                <DropdownMenuItem>
                  <Bell/>
                  Notifications
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings/>
                  Settings
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator/>
            {isImpersonating &&
                <DropdownMenuItem variant={"destructive"} onClick={handleStopImpersonating}>
                    <UserRoundX/>
                    Stop impersonating
                </DropdownMenuItem>
            }
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut/>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

