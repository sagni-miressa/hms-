import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ThemeToggle } from "@/components/ThemeToggle";

export const PublicLayout = () => {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-gray-100 overflow-x-hidden antialiased min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-[#f4f2f0] dark:border-white/10 bg-surface-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl">
                  work_history
                </span>
              </div>
              <span className="text-xl font-bold tracking-tight text-text-main dark:text-white">
                RecruitHub
              </span>
            </Link>
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/jobs"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Jobs
              </Link>
              <a
                className="text-sm font-medium hover:text-primary transition-colors"
                href="#"
              >
                Features
              </a>
              <a
                className="text-sm font-medium hover:text-primary transition-colors"
                href="#"
              >
                For Companies
              </a>
              <a
                className="text-sm font-medium hover:text-primary transition-colors"
                href="#"
              >
                Pricing
              </a>
            </div>
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle/>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-lg shadow-primary/20"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-5 py-2.5 text-sm font-bold text-text-main dark:text-white bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-bold text-text-main dark:text-white bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-lg shadow-primary/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
            {/* Mobile Menu Icon */}
            <div className="md:hidden flex items-center">
              <span className="material-symbols-outlined cursor-pointer text-3xl">
                menu
              </span>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};
