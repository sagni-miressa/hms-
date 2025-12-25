import React from "react";

export const RecruitmentFunnel: React.FC = () => {
  const steps = [
    { label: "Applied", count: 1240, height: "100%" },
    { label: "Screened", count: 806, height: "65%" },
    { label: "Interview", count: 434, height: "35%" },
    { label: "Offer", count: 186, height: "15%" },
    { label: "Hired", count: 85, height: "8%" },
  ];

  return (
    <div className="lg:col-span-8 bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Recruitment Funnel
        </h3>
        <button className="text-gray-400 hover:text-primary">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="flex flex-col gap-1 mb-8">
          <div className="text-3xl font-bold text-text-main dark:text-white">
            1,240{" "}
            <span className="text-sm font-medium text-text-muted dark:text-gray-400">
              Candidates Processed
            </span>
          </div>
          <div className="text-sm text-emerald-500 font-medium">
            +5% efficiency increase
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 h-48 items-end w-full">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
            >
              <div
                className="w-full bg-primary/20 dark:bg-gray-800 border-t-4 border-primary rounded-t-sm relative transition-all group-hover:bg-primary/30"
                style={{
                  height: step.height,
                  borderColor: `rgba(var(--primary-rgb), ${1 - index * 0.2})`, // Simulated opacity for border
                }}
              >
                <div className="absolute -top-8 w-full text-center font-bold text-text-main dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {step.count}
                </div>
              </div>
              <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wide">
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
