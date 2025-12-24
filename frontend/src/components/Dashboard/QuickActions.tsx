import React from "react";

interface Action {
  icon: string;
  label: string;
  onClick?: () => void;
}

export const QuickActions: React.FC<{ actions: Action[] }> = ({ actions }) => {
  return (
    <div className="p-6 rounded-xl bg-surface-light dark:bg-[#221a10] border border-border-light dark:border-border-dark shadow-sm">
      <h3 className="text-lg font-bold dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className="p-3 rounded-lg bg-surface-light dark:bg-[#2d2418] border border-border-light dark:border-border-dark hover:border-primary/50 dark:hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 group"
            onClick={action.onClick}
          >
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span className="text-xs font-medium dark:text-[#b9ad9d]">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
