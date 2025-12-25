import React from "react";

export const RecentActivity: React.FC = () => {
  const activities = [
    {
      icon: "person_add",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      content: (
        <>
          <span className="font-semibold">Sarah Jenkins</span> applied for{" "}
          <span className="text-primary">Sr. UX Designer</span>
        </>
      ),
      time: "2 minutes ago",
    },
    {
      icon: "check_circle",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      content: (
        <>
          <span className="font-semibold">Michael Chen</span> was moved to{" "}
          <span className="font-semibold text-emerald-500">Offer Stage</span>
        </>
      ),
      time: "15 minutes ago",
    },
    {
      icon: "work",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      content: (
        <>
          New Job Posted:{" "}
          <span className="font-semibold">Backend Engineer</span>
        </>
      ),
      time: "1 hour ago",
    },
    {
      icon: "calendar_month",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      content: (
        <>
          Interview scheduled with{" "}
          <span className="font-semibold">Alex Rivera</span>
        </>
      ),
      time: "2 hours ago",
    },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Live Activity
        </h3>
        <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="flex gap-3">
            <div className="relative mt-1">
              <div
                className={`size-8 rounded-full ${activity.iconBg} ${activity.iconColor} flex items-center justify-center border ${activity.borderColor}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {activity.icon}
                </span>
              </div>
              {index !== activities.length - 1 && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-gray-200 dark:bg-gray-700 -z-10"></div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-sm text-text-main dark:text-white">
                {activity.content}
              </p>
              <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
