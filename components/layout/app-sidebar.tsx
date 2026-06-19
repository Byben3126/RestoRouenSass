"use client"

import * as React from "react"

import {
  IconHelp,
  IconInnerShadowTop,
  IconToolsKitchen2,
  IconSettings,
  IconUserHeart,
  IconGift,
  IconTag,
  IconLayoutDashboard,
} from "@tabler/icons-react"

import { NavMain } from "@/components/layout/nav/nav-main"
import { NavSecondary } from "@/components/layout/nav/nav-secondary"
import { NavUser } from "@/components/layout/nav/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Accueil",
      url: "/dashboard/{workspaceId}/home",
      icon: IconLayoutDashboard,
    },
    {
      title: "Clients",
      url: "/dashboard/{workspaceId}/customers",
      icon: IconUserHeart,
    },
{
      title: "Restaurant",
      url: "/dashboard/{workspaceId}/restaurant",
      icon: IconToolsKitchen2,
    },
    {
      title: "Récompenses",
      url: "/dashboard/{workspaceId}/rewards",
      icon: IconGift,
    },
    {
      title: "Promotions",
      url: "/dashboard/{workspaceId}/promotions",
      icon: IconTag,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
