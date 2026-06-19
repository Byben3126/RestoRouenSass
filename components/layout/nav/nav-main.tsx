"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react"

// import NewConferenceDrawer from "@/features/conferences/components/NewConferenceDrawer"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()
  const params = useParams<{ workspaceId?: string }>()
  const { workspaceId } = params

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* BOUTON D'ACTION CRÉATION (Reste inchangé car c'est un Drawer) */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {/* <NewConferenceDrawer>
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconCirclePlusFilled />
                <span>Créer une conference</span>
              </SidebarMenuButton>
            </NewConferenceDrawer> */}
          </SidebarMenuItem>
        </SidebarMenu>

        {/* LISTE DES ITEMS DE NAVIGATION */}
        <SidebarMenu>
          {items.map((item) => {
            const resolvedUrl = workspaceId
              ? item.url.replace("{workspaceId}", workspaceId)
              : item.url

            const isActive = pathname.startsWith(resolvedUrl)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link href={resolvedUrl}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}