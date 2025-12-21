import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Role } from "@/types";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Shield,
  Settings,
  LogOut,
  FileCheck,
  Database,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
  requireAny?: boolean;
}

const navigation: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", path: "/jobs", icon: Briefcase },
  { label: "Applications", path: "/applications", icon: FileText },
  {
    label: "Users",
    path: "/users",
    icon: Users,
    roles: [Role.SYSTEM_ADMIN, Role.HR_MANAGER],
  },
  {
    label: "Permissions",
    path: "/permissions",
    icon: Shield,
    roles: [Role.SYSTEM_ADMIN, Role.HR_MANAGER],
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: FileCheck,
    roles: [Role.SYSTEM_ADMIN, Role.AUDITOR],
  },
  {
    label: "Backups",
    path: "/backups",
    icon: Database,
    roles: [Role.SYSTEM_ADMIN],
  },
  { label: "Settings", path: "/settings", icon: Settings },
];

export const DashboardLayout = () => {
  const { user, logout, hasRole, hasAnyRole } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    if (item.requireAny) {
      return hasAnyRole(item.roles);
    }
    return item.roles.some((role) => hasRole(role));
  });

  const handleLogout = async () => {
    try {
      const { logout: logoutService } = await import("@/services/auth.service");
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await logoutService(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ATS</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user?.roles.slice(0, 1).map((role) => (
                    <Badge key={role} variant="info" size="sm">
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <Badge variant="default">{user?.clearanceLevel}</Badge>
              {user?.mfaEnabled && (
                <Badge variant="success" size="sm">
                  MFA
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
