import React from "react";

interface ChartProps {
  data: number[];
  labels: string[];
}

export const Chart: React.FC<ChartProps> = ({ data, labels }) => {
  return (
    <div className="lg:col-span-2 p-6 rounded-xl bg-surface-light dark:bg-[#221a10] border border-border-light dark:border-border-dark shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold dark:text-white">API Usage & System Health</h3>
        <select className="bg-transparent border border-border-light dark:border-border-dark rounded-lg text-sm px-3 py-1.5 dark:text-[#b9ad9d] focus:border-primary focus:ring-0">
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>
      <div className="h-96 w-full flex items-end justify-between gap-2 px-2 relative">
        {data.map((value, idx) => (
          <div
            key={idx}
            className={`w-full bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-all relative group cursor-pointer`}
            style={{ height: `${value}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {value}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-xs text-[#637588] dark:text-[#b9ad9d]">
        {labels.map((label, idx) => (
          <span key={idx}>{label}</span>
        ))}
      </div>
    </div>
  );
};
