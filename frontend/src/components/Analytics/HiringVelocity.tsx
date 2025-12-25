import React from "react";

export const HiringVelocity: React.FC = () => {
  return (
    <div className="lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Hiring Velocity
        </h3>
        <p className="text-sm text-text-muted dark:text-gray-400">
          Open vs Filled Positions
        </p>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-end relative min-h-[250px]">
        {/* Simple SVG Line Chart representation */}
        <div className="absolute inset-0 p-6 flex items-end">
          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {/* Grid lines */}
            <line
              stroke="currentColor"
              strokeDasharray="2"
              strokeOpacity="0.1"
              x1="0"
              x2="100"
              y1="0"
              y2="0"
            ></line>
            <line
              stroke="currentColor"
              strokeDasharray="2"
              strokeOpacity="0.1"
              x1="0"
              x2="100"
              y1="50"
              y2="50"
            ></line>
            <line
              stroke="currentColor"
              strokeOpacity="0.1"
              x1="0"
              x2="100"
              y1="100"
              y2="100"
            ></line>
            {/* Line 1: Filled (Primary Orange) */}
            <polyline
              fill="none"
              points="0,80 20,75 40,60 60,65 80,40 100,30"
              stroke="#ec7f13"
              strokeLinecap="round"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            ></polyline>
            {/* Area under line 1 */}
            <polygon
              fill="#ec7f13"
              fillOpacity="0.1"
              points="0,100 0,80 20,75 40,60 60,65 80,40 100,30 100,100"
            ></polygon>
            {/* Line 2: Open (Gray) */}
            <polyline
              fill="none"
              points="0,60 20,55 40,50 60,45 80,55 100,60"
              stroke="#baab9c"
              strokeDasharray="4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            ></polyline>
          </svg>
        </div>
        <div className="flex justify-between text-xs text-text-muted dark:text-gray-400 relative z-10 pt-4 border-t border-transparent">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
        </div>
      </div>
      <div className="px-6 pb-6 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary"></div>
          <span className="text-xs text-text-muted dark:text-gray-400">
            Filled
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-[#baab9c]"></div>
          <span className="text-xs text-text-muted dark:text-gray-400">
            Open
          </span>
        </div>
      </div>
    </div>
  );
};
