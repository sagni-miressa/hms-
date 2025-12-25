import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  change: string;
  changeType: "increase" | "decrease";
  changeColor: string;
  changeBg: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  iconBg,
  change,
  changeType,
  changeColor,
  changeBg,
}) => {
  return (
    <div className="flex flex-col gap-1 rounded-xl p-5 border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-text-muted dark:text-gray-400 text-sm font-medium">
          {title}
        </p>
        <span
          className={`material-symbols-outlined ${iconColor} ${iconBg} p-1 rounded-md text-[20px]`}
        >
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-text-main dark:text-white text-2xl font-bold">
          {value}
        </p>
        <span
          className={`${changeColor} text-xs font-medium flex items-center ${changeBg} px-1.5 py-0.5 rounded`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {changeType === "increase" ? "arrow_upward" : "arrow_downward"}
          </span>{" "}
          {change}
        </span>
      </div>
    </div>
  );
};
