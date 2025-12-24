import React from "react";

interface KPIStatProps {
  iconColor?: any;
  icon: string;
  title: string;
  value: string | number;
  change?: string;
  changeColor?: string;
  bgColor?: string;
  iconBg?: string;
}

export const KPIStats: React.FC<{ stats: KPIStatProps[] }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="p-5 rounded-xl bg-surface-light dark:bg-[#221a10] border border-border-light dark:border-border-dark shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${stat.iconBg} text-${stat.iconColor}`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            {stat.change && (
              <span
                className={`text-xs font-medium ${stat.changeColor} flex items-center gap-1 bg-${stat.changeColor}/10 px-2 py-1 rounded-full`}
              >
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                {stat.change}
              </span>
            )}
          </div>
          <p className="text-[#637588] dark:text-[#9ca3af] text-sm font-medium">{stat.title}</p>
          <h3 className="text-2xl font-bold dark:text-white mt-1">{stat.value}</h3>
        </div>
      ))}
    </div>
  );
};
