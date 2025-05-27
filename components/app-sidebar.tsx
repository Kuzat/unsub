"use client"

import * as React from "react"
import {
  BadgeDollarSign,
  LifeBuoy,
  Calendar,
  Send,
  UserRound,
  Cog,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {authClient} from "@/lib/client";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      collapsible: false,
    },
    {
      title: "Subscriptions",
      url: "/subscriptions",
      icon: UserRound,
      collapsible: false,
      isActive: false,
      items: [
        // {
        //   title: "All Subscriptions",
        //   url: "",
        // },
        // {
        //   title: "Upcoming",
        //   url: "#",
        // },
        // {
        //   title: "Cancelled/Inactive",
        //   url: "#",
        // },
      ],
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
      collapsible: false,
    },
    {
      title: "Services",
      url: "/services",
      icon: Cog,
      collapsible: false,
    },
    // {
    //   title: "Analytics",
    //   url: "/analytics",
    //   icon: ChartColumnDecreasing,
    //   collapsible: true,
    //   items: [
    //     {
    //       title: "Spending Trends",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    data: session,
  } = authClient.useSession()
  const user = session?.user

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BadgeDollarSign className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Unsub</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}  />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
