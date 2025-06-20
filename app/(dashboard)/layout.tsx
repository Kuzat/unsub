import {AppSidebar} from "@/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {requireSession} from "@/lib/auth";
import {redirect} from "next/navigation";


export default async function DashboardLayout({children}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  // Check if user is admin and not have 2fa enabled
  if (session.user.role === "admin" && !session.user.twoFactorEnabled) {
    return redirect('/enable-2fa')
  }

  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1"/>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
