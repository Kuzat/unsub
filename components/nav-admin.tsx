"use client"

import React from "react"
import {ChevronRight, type LucideIcon} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { usePathname } from "next/navigation"
import {authClient} from "@/lib/client";

export function NavAdmin({
                          items,
                        }: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    collapsible?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const currentPath = usePathname()
  const {
    data: session,
  } = authClient.useSession()

  if (session?.user.role !== "admin") {
    return null
  }

  return (
    <SidebarGroup className="border-2 border-primary rounded-lg">
      <div className="px-2 py-1 font-bold text-primary">Admin</div>

      <SidebarMenu>
        {items.map((item) => {
          const isCollapsible = item.items?.length && item.collapsible !== false;

          const menuItem = (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title} isActive={item.url === currentPath}>
                <Link href={item.url}>
                  <item.icon/>
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.items?.length ? (
                isCollapsible ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight/>
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )
              ) : null}
            </SidebarMenuItem>
          );

          return isCollapsible ? (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              {menuItem}
            </Collapsible>
          ) : (
            <React.Fragment key={item.title}>
              {menuItem}
            </React.Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
