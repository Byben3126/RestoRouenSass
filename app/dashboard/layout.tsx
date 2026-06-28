import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { DashboardGuard } from "@/components/guards/dashboard-guard"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <DashboardGuard>
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 62)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="h-screen"

    >
      <AppSidebar variant="inset" />
      {/* <div className="h-screen w-full flex-1"> */}
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col relative h-0">
          {/* <Paywall/> */}
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-auto">
            <div className="flex flex-col gap-4 px-8 md:gap-6 md:py-6">

              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
      {/* </div> */}
    </SidebarProvider>
    </DashboardGuard>
  )
}
