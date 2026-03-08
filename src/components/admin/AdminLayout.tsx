import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminGuard } from "./AdminGuard";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminLayout() {
  return (
    <AdminGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center justify-between border-b border-border px-4 shrink-0">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <span className="font-display text-sm text-muted-foreground">
                  Admin Panel
                </span>
              </div>
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto p-4 sm:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminGuard>
  );
}
