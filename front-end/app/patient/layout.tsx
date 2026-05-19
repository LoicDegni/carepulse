import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { PortalSideBar } from "@/components/PortalSideBar"
import PortalHeader from "@/components/PortalHeader"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PortalHeader />
      <main className="flex-1 px-6 py-6">
        {children}
      </main>
    </div>
  );
}