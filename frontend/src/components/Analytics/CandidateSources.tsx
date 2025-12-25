import React from "react";

export const CandidateSources: React.FC = () => {
  const sources = [
    { label: "LinkedIn", value: "40%", color: "bg-[#f27f0d]" },
    { label: "Indeed", value: "25%", color: "bg-[#10b981]" },
    { label: "Referrals", value: "20%", color: "bg-[#3b82f6]" },
    { label: "Career Site", value: "15%", color: "bg-[#6366f1]" },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col">
      <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">
        Candidate Sources
      </h3>
      <div className="flex-1 flex items-center justify-center relative">
        {/* CSS Conic Gradient for Donut Chart */}
        <div
          className="size-48 rounded-full relative"
          style={{
            background:
              "conic-gradient(#f27f0d 0% 40%, #10b981 40% 65%, #3b82f6 65% 85%, #6366f1 85% 100%)",
          }}
        >
          <div className="absolute inset-4 bg-surface-light dark:bg-surface-dark rounded-full flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-text-main dark:text-white">
              100%
            </span>
            <span className="text-xs text-text-muted dark:text-gray-400">
              Total Volume
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {sources.map((source) => (
          <div
            key={source.label}
            className="flex justify-between items-center text-sm"
          >
            <div className="flex items-center gap-2">
              <div className={`size-3 rounded-full ${source.color}`}></div>
              <span className="text-text-muted dark:text-gray-300">
                {source.label}
              </span>
            </div>
            <span className="font-bold text-text-main dark:text-white">
              {source.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
