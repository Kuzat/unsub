"use client"

import * as React from "react"
import {Calendar, Cog, LifeBuoy, Send, SquareTerminal, UserRound, UserRoundCog,} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavSecondary} from "@/components/nav-secondary"
import {NavUser} from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import Image from "next/image";
import {NavAdmin} from "@/components/nav-admin";

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
  navAdmin: [
    {
      title: "Users",
      url: "/admin/users",
      icon: UserRoundCog,
      collapsible: false,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`,
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "https://github.com/Kuzat/unsub/issues/new",
      target: "_blank",
      icon: Send,
    },
  ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div
                  className="text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden">
                  <Image
                    src="/unsub.svg"
                    alt="Unsub Logo"
                    width={32}
                    height={32}
                    priority
                    className="size-10 rounded-md object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-md leading-tight">
                  <span className="truncate font-medium">Unsub</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
        <NavAdmin items={data.navAdmin}/>
        <NavSecondary items={data.navSecondary} className="mt-auto"/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  )
}
