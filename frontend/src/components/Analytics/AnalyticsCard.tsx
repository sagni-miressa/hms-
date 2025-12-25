import React from "react";

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: string;
  changeDirection: "up" | "down";
  trend: "positive" | "negative";
  footerText: string;
  icon: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  changeDirection,
  trend,
  footerText,
  icon,
}) => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="material-symbols-outlined text-6xl text-primary">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-text-muted dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl font-bold text-text-main dark:text-white">
            {value}
          </h3>
          <span
            className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
              trend === "positive"
                ? "text-emerald-500 bg-emerald-500/10"
                : "text-red-500 bg-red-500/10"
            }`}
          >
            <span className="material-symbols-outlined text-[14px] mr-0.5">
              {changeDirection === "up" ? "trending_up" : "trending_down"}
            </span>
            {change}
          </span>
        </div>
      </div>
      <p className="text-gray-400 dark:text-gray-500 text-xs">{footerText}</p>
    </div>
  );
};
