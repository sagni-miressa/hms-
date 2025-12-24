import React, { useState } from "react";
import { LogoIcon } from "../icons/LogoIcon";
import { Link } from "react-router-dom";

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navLinks = [
    { label: "Dashboard", icon: "dashboard", active: true },
    { label: "User Management", icon: "group" },
    { label: "Roles & Permissions", icon: "shield" },
    { label: "Analytics", icon: "monitoring" },
    { label: "System Logs", icon: "receipt_long" },
    { label: "Settings", icon: "settings" },
    { label: "Billing", icon: "credit_card" },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-surface-light dark:bg-[#181511] border-r border-border-light dark:border-border-dark flex-col hidden lg:flex transition-all duration-300 ease-in-out relative`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 bg-surface-light dark:bg-[#181511] border border-gray-200 dark:border-gray-800 rounded-full p-1 text-text-muted hover:text-primary hover:border-primary transition-colors z-10"
      >
        <span className="material-symbols-outlined text-sm pr-1">
          {isCollapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>

      <Link
        to="/"
        className={`px-6 py-4 flex items-center gap-3 border-b border-border-light dark:border-border-dark mb-4 ${
          isCollapsed ? "justify-center px-2" : ""
        }`}
      >
        <div className="flex items-center justify-center size-8 rounded text-primary-500 shrink-0">
          <LogoIcon />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
            <h1 className="text-base font-bold leading-none dark:text-white">
              RecruitHub
            </h1>
          </div>
        )}
      </Link>

      <nav className="flex-1 px-4 flex flex-col gap-2">
        {navLinks.map((link) => (
          <a
            key={link.label}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              link.active
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-[#f3f4f6] dark:hover:bg-[#2d2418] text-[#637588] dark:text-[#b9ad9d] font-medium"
            } ${isCollapsed ? "justify-center" : ""}`}
            href="#"
            title={isCollapsed ? link.label : ""}
          >
            <span
              className={`material-symbols-outlined shrink-0 ${link.active ? "font-semibold" : ""}`}
            >
              {link.icon}
            </span>
            {!isCollapsed && (
              <span className="text-sm overflow-hidden whitespace-nowrap">
                {link.label}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Profile + Logout */}
      <div className="p-4 border-t border-border-light dark:border-border-dark flex flex-col gap-3">
        <button
          onClick={onLogout}
          className={`flex items-center justify-center gap-2 px-3 py-2 mt-2 w-full text-sm text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors ${
            isCollapsed ? "px-0" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
