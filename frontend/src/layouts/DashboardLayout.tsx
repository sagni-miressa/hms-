import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

export const DashboardLayout = () => {
  return (
    <SidebarProvider className="h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <main className="flex-1 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
