import React from "react";

export const RecruiterLeaderboard: React.FC = () => {
  const recruiters = [
    {
      name: "Emily Parker",
      avatar: "https://i.pravatar.cc/150?u=emily",
      openReqs: 12,
      candidates: 145,
      hires: 8,
      avgTime: "15 days",
      timeColor: "text-emerald-500",
    },
    {
      name: "David Wong",
      avatar: "https://i.pravatar.cc/150?u=david",
      openReqs: 8,
      candidates: 92,
      hires: 6,
      avgTime: "18 days",
      timeColor: "text-emerald-500",
    },
    {
      name: "Marcus Johnson",
      avatar: "https://i.pravatar.cc/150?u=marcus",
      openReqs: 15,
      candidates: 210,
      hires: 12,
      avgTime: "24 days",
      timeColor: "text-orange-500",
    },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-main dark:text-white">
          Recruiter Performance
        </h3>
        <button className="text-sm font-bold text-primary hover:text-primary-hover">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-text-muted dark:text-gray-400">
              <th className="px-6 py-4 font-semibold">Recruiter</th>
              <th className="px-6 py-4 font-semibold text-center">Open Reqs</th>
              <th className="px-6 py-4 font-semibold text-center">
                Candidates
              </th>
              <th className="px-6 py-4 font-semibold text-center">
                Hires (Q3)
              </th>
              <th className="px-6 py-4 font-semibold text-right">
                Avg Time-to-Hire
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            {recruiters.map((recruiter) => (
              <tr
                key={recruiter.name}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-8 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${recruiter.avatar}")` }}
                    ></div>
                    <span className="font-semibold text-text-main dark:text-white">
                      {recruiter.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-text-muted dark:text-gray-300">
                  {recruiter.openReqs}
                </td>
                <td className="px-6 py-4 text-center text-text-muted dark:text-gray-300">
                  {recruiter.candidates}
                </td>
                <td className="px-6 py-4 text-center font-bold text-text-main dark:text-white">
                  {recruiter.hires}
                </td>
                <td
                  className={`px-6 py-4 text-right font-medium ${recruiter.timeColor}`}
                >
                  {recruiter.avgTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
