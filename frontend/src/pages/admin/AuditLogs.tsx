import React from "react";

export const AuditLogsPage: React.FC = () => {
  const logs = [
    {
      id: 1,
      timestamp: "Oct 24, 10:42:15 AM",
      severity: "ERROR",
      user: "system_svc",
      module: "Email Service",
      action: (
        <>
          SMTP Connection Timeout: Failed to send onboarding packet to{" "}
          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
            candidate_982
          </span>
        </>
      ),
      ip: "192.168.1.5",
    },
    {
      id: 2,
      timestamp: "Oct 24, 10:40:02 AM",
      severity: "WARN",
      user: "recruiter_05",
      module: "Auth",
      action: "Failed login attempt (3rd try). Account temporarily locked.",
      ip: "203.0.113.45",
    },
    {
      id: 3,
      timestamp: "Oct 24, 10:35:18 AM",
      severity: "INFO",
      user: "admin_mj",
      module: "Candidates",
      action: (
        <>
          Moved candidate <span className="font-bold">Sarah Jenkins</span> to
          "Technical Interview" stage.
        </>
      ),
      ip: "10.0.0.12",
    },
    {
      id: 4,
      timestamp: "Oct 24, 10:15:45 AM",
      severity: "INFO",
      user: "hiring_mgr_02",
      module: "Jobs",
      action:
        'Created new job requisition: "Senior Frontend Developer (React)"',
      ip: "172.16.254.1",
    },
    {
      id: 5,
      timestamp: "Oct 24, 09:55:10 AM",
      severity: "INFO",
      user: "system_job",
      module: "Data Export",
      action: "Weekly analytics export completed successfully. (2.4MB)",
      ip: "127.0.0.1",
    },
    {
      id: 6,
      timestamp: "Oct 24, 09:30:22 AM",
      severity: "WARN",
      user: "recruiter_01",
      module: "Candidates",
      action:
        "Attempted to access restricted candidate profile without clearance.",
      ip: "192.168.1.10",
    },
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "ERROR":
        return {
          badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          dot: "bg-red-600 dark:bg-red-400",
        };
      case "WARN":
        return {
          badge: "bg-primary/10 text-primary dark:bg-primary/20",
          dot: "bg-primary",
        };
      case "INFO":
        return {
          badge:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          dot: "bg-blue-600 dark:bg-blue-400",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-700",
          dot: "bg-gray-600",
        };
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Page Heading & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black tracking-[-0.033em]">
            System Logs
          </h1>
          <p className="text-text-secondary text-base font-normal max-w-2xl">
            Detailed audit trail of all system activities, errors, and user
            actions for troubleshooting and compliance.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-[#3a2d20] border border-border-color dark:border-[#3a2d20] text-text-main dark:text-white text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#4a3d30] transition-colors whitespace-nowrap">
          <span className="material-symbols-outlined text-[20px]">
            download
          </span>
          <span className="truncate">Export CSV</span>
        </button>
      </div>

      {/* Filters & Search Section */}
      <div className="bg-white dark:bg-[#1c140d] rounded-xl p-4 shadow-sm border border-border-color dark:border-[#3a2d20] flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="flex-1 w-full lg:w-auto">
          <label className="flex w-full items-center h-10 rounded-lg bg-background-light dark:bg-[#2a2016] border border-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all overflow-hidden">
            <div className="pl-3 pr-2 text-text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                search
              </span>
            </div>
            <input
              className="w-full bg-transparent border-none text-text-main dark:text-white text-sm placeholder:text-text-secondary/70 focus:ring-0 focus:outline-none h-full"
              placeholder="Search by User ID, IP, or Event ID..."
            />
          </label>
        </div>
        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Date Range */}
          <div className="relative group">
            <button className="h-10 px-3 min-w-[140px] flex items-center justify-between gap-2 bg-background-light dark:bg-[#2a2016] rounded-lg text-sm text-text-main dark:text-white border border-transparent hover:border-primary/50 transition-colors">
              <span className="truncate">Last 24 Hours</span>
              <span className="material-symbols-outlined text-[20px] text-text-secondary">
                calendar_today
              </span>
            </button>
          </div>
          {/* Severity */}
          <div className="relative group">
            <button className="h-10 px-3 min-w-[120px] flex items-center justify-between gap-2 bg-background-light dark:bg-[#2a2016] rounded-lg text-sm text-text-main dark:text-white border border-transparent hover:border-primary/50 transition-colors">
              <span className="truncate">All Severity</span>
              <span className="material-symbols-outlined text-[20px] text-text-secondary">
                expand_more
              </span>
            </button>
          </div>
          {/* Module */}
          <div className="relative group">
            <button className="h-10 px-3 min-w-[120px] flex items-center justify-between gap-2 bg-background-light dark:bg-[#2a2016] rounded-lg text-sm text-text-main dark:text-white border border-transparent hover:border-primary/50 transition-colors">
              <span className="truncate">All Modules</span>
              <span className="material-symbols-outlined text-[20px] text-text-secondary">
                expand_more
              </span>
            </button>
          </div>
          {/* Apply Button */}
          <button className="h-10 px-6 bg-primary hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-primary/30">
            Apply
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#1c140d] rounded-xl shadow-sm border border-border-color dark:border-[#3a2d20] overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-light dark:bg-[#2a2016] border-b border-border-color dark:border-[#3a2d20]">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Timestamp
                </th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Severity
                </th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                  User
                </th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Module
                </th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap w-1/3">
                  Action
                </th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                  IP Address
                </th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color dark:divide-[#3a2d20]">
              {logs.map((log) => {
                const styles = getSeverityStyles(log.severity);
                return (
                  <tr
                    key={log.id}
                    className="group hover:bg-background-light dark:hover:bg-[#2a2016]/50 transition-colors"
                  >
                    <td className="p-4 text-sm text-text-main dark:text-gray-300 whitespace-nowrap font-medium">
                      {log.timestamp}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${styles.badge}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${styles.dot}`}
                        ></span>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-text-main dark:text-gray-300 whitespace-nowrap">
                      {log.user}
                    </td>
                    <td className="p-4 text-sm text-text-main dark:text-gray-300 whitespace-nowrap">
                      {log.module}
                    </td>
                    <td className="p-4 text-sm text-text-main dark:text-gray-300">
                      {log.action}
                    </td>
                    <td className="p-4 text-sm text-text-secondary whitespace-nowrap font-mono">
                      {log.ip}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">
                          navigate_next
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-4 border-t border-border-color dark:border-[#3a2d20] bg-background-light dark:bg-[#1c140d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-medium text-text-main dark:text-white">
              1
            </span>{" "}
            to{" "}
            <span className="font-medium text-text-main dark:text-white">
              6
            </span>{" "}
            of{" "}
            <span className="font-medium text-text-main dark:text-white">
              1,248
            </span>{" "}
            entries
          </p>
          <div className="flex items-center gap-2">
            <button className="size-8 flex items-center justify-center rounded-lg border border-border-color bg-white dark:bg-[#2a2016] dark:border-[#3a2d20] text-text-secondary hover:bg-gray-50 dark:hover:bg-[#3a2d20] disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-lg">
                chevron_left
              </span>
            </button>
            <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-bold shadow-sm">
              1
            </button>
            <button className="size-8 flex items-center justify-center rounded-lg border border-border-color bg-white dark:bg-[#2a2016] dark:border-[#3a2d20] text-text-main dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3a2d20] text-sm font-medium transition-colors">
              2
            </button>
            <button className="size-8 flex items-center justify-center rounded-lg border border-border-color bg-white dark:bg-[#2a2016] dark:border-[#3a2d20] text-text-main dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3a2d20] text-sm font-medium transition-colors">
              3
            </button>
            <span className="text-text-secondary">...</span>
            <button className="size-8 flex items-center justify-center rounded-lg border border-border-color bg-white dark:bg-[#2a2016] dark:border-[#3a2d20] text-text-main dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3a2d20] text-sm font-medium transition-colors">
              12
            </button>
            <button className="size-8 flex items-center justify-center rounded-lg border border-border-color bg-white dark:bg-[#2a2016] dark:border-[#3a2d20] text-text-secondary hover:bg-gray-50 dark:hover:bg-[#3a2d20] transition-colors">
              <span className="material-symbols-outlined text-lg">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
