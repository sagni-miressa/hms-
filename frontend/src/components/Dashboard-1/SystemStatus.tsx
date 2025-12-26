import React from "react";

interface StatusItem {
  name: string;
  status: "Operational" | "Degraded" | "Down";
  color?: string;
}

export const SystemStatus: React.FC<{ items: StatusItem[] }> = ({ items }) => {
  const statusColors: Record<string, string> = {
    Operational: "green-500",
    Degraded: "primary",
    Down: "red-500",
  };

  return (
    <div className="p-6 rounded-xl bg-surface-light dark:bg-[#221a10] border border-border-light dark:border-border-dark shadow-sm flex-1">
      <h3 className="text-lg font-bold dark:text-white mb-4">System Status</h3>
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`size-2 rounded-full bg-${statusColors[item.status]} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}
              ></div>
              <span className="text-sm font-medium dark:text-gray-200">{item.name}</span>
            </div>
            <span className={`text-xs font-semibold bg-${statusColors[item.status]}/10 text-${statusColors[item.status]} px-2 py-1 rounded`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
