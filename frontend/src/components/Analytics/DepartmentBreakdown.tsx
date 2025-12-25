import React from "react";

export const DepartmentBreakdown: React.FC = () => {
  const departments = [
    { name: "Engineering", count: 24, width: "75%", color: "bg-primary" },
    {
      name: "Product & Design",
      count: 12,
      width: "45%",
      color: "bg-primary/80",
    },
    {
      name: "Sales & Marketing",
      count: 18,
      width: "60%",
      color: "bg-primary/60",
    },
    {
      name: "Human Resources",
      count: 4,
      width: "15%",
      color: "bg-primary/40",
    },
    { name: "Operations", count: 8, width: "25%", color: "bg-primary/30" },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col">
      <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">
        Open Roles by Dept
      </h3>
      <div className="flex-1 flex flex-col justify-center gap-5">
        {departments.map((dept) => (
          <div key={dept.name} className="group">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-text-muted dark:text-gray-300">
                {dept.name}
              </span>
              <span className="font-bold text-text-main dark:text-white">
                {dept.count}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${dept.color} rounded-full group-hover:bg-primary transition-colors`}
                style={{ width: dept.width }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
