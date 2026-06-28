"use client"

import * as React from "react"

import {
  IconHelp,
  IconInnerShadowTop,
  IconToolsKitchen2,
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
  navMain: [
    {
      title: "Accueil",
      url: "/dashboard/home",
      icon: IconLayoutDashboard,
    },
    {
      title: "Clients",
      url: "/dashboard/customers",
      icon: IconUserHeart,
    },
{
      title: "Restaurant",
      url: "/dashboard/restaurant",
      icon: IconToolsKitchen2,
    },
    {
      title: "Récompenses",
      url: "/dashboard/rewards",
      icon: IconGift,
    },
    {
      title: "Promotions",
      url: "/dashboard/promotions",
      icon: IconTag,
    },
  ],

  navSecondary: [
    {
      title: "Aide",
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
