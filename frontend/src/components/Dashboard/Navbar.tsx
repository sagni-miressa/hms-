import React, { useState } from "react";

interface NavbarProps {
  user: { name: string; avatar: string; role: string };
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 py-[6px] bg-surface-light dark:bg-background-dark">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-text-muted dark:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-text-muted dark:text-gray-400">Home</span>
          <span className="material-symbols-outlined text-[16px] text-text-muted dark:text-gray-400">
            chevron_right
          </span>
          <span className="font-medium dark:text-white">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-4 relative ">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-400 text-[20px]">
            search
          </span>
          <input
            className="h-10 pl-10 pr-4 rounded-lg bg-background-light dark:bg-surface-dark border border-transparent focus:border-primary text-sm dark:text-white focus:ring-2 focus:ring-primary/20 w-64 placeholder:text-text-muted transition-all outline-none"
            placeholder="Search users, logs..."
          />
        </div>

        {/* Icons */}
        <button className="relative p-2 rounded-lg hover:bg-background-light dark:hover:bg-surface-dark text-text-muted dark:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-surface-light dark:border-background-dark"></span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-full hover:bg-background-light dark:hover:bg-surface-dark p-1 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${user.avatar})` }}
            />
            <div className="flex flex-col gap-1 items-start">
              <span className="hidden sm:block text-sm dark:text-white">
                {user.name}
              </span>
              <span className="hidden sm:block text-sm dark:text-white">
                {user.role}
              </span>
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-10">
              <button className="w-full text-left px-4 py-2 hover:bg-primary/10 dark:hover:bg-primary/20">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-red-500/10 dark:hover:bg-red-600/20">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
