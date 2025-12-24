import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Dashboard/Navbar";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { useAuthStore } from "@/stores/authStore";

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const { logout: logoutService } = await import("@/services/auth.service");
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) await logoutService(refreshToken);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      window.location.href = "/login";
    }
  };

  // UI-friendly user fallback
  const uiUser = {
    name: user?.email?.split("@")[0] || "Admin User",
    role: user?.roles?.[0] || "Admin",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuADGHdDLf21UbgrHWZREDtodkG20U6xk0WVGrsRGec35gMzLPjSLHdBErFv829jSHSqbFFfzDNfwzz80GCDja6s1CVKXX8OXQlSLtliole55crTpeE41EH-pi-amqUqJ_v_QCBKXsCjdhvoCvWVb4MflM0N2o6VyZT0zSWzUKagn-B3bpcmCX00EoaLHt2obIR-U8IrVHm-LjGZK6trP1yPsoK8cpPNMeyqtMTfGzOh5BMUl0fhH9Fr4GKKLh-FBFM8f-fbuhJ1_g",
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <Navbar user={uiUser} />

        {/* Outlet renders the Dashboard or other pages */}
        <main className="flex-1 p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
