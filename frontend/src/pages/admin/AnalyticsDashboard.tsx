import React from "react";
import { AnalyticsCard } from "../../components/Analytics/AnalyticsCard";
import { RecruitmentFunnel } from "../../components/Analytics/RecruitmentFunnel";
import { HiringVelocity } from "../../components/Analytics/HiringVelocity";
import { CandidateSources } from "../../components/Analytics/CandidateSources";
import { DepartmentBreakdown } from "../../components/Analytics/DepartmentBreakdown";
import { RecentActivity } from "../../components/Analytics/RecentActivity";
import { RecruiterLeaderboard } from "../../components/Analytics/RecruiterLeaderboard";

export const AnalyticsDashboard: React.FC = () => {
  const stats = [
    {
      title: "Total Applications",
      value: "1,240",
      change: "12%",
      changeDirection: "up" as const,
      trend: "positive" as const,
      footerText: "vs. previous 30 days",
      icon: "description",
    },
    {
      title: "Positions Filled",
      value: "85",
      change: "5%",
      changeDirection: "up" as const,
      trend: "positive" as const,
      footerText: "vs. previous 30 days",
      icon: "check_circle",
    },
    {
      title: "Avg. Time-to-Hire",
      value: "18 days",
      change: "2 days",
      changeDirection: "down" as const,
      trend: "positive" as const,
      footerText: "Target: 21 days",
      icon: "timer",
    },
    {
      title: "Active Users",
      value: "342",
      change: "8%",
      changeDirection: "up" as const,
      trend: "positive" as const,
      footerText: "Last 24 hours",
      icon: "group",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-text-muted dark:text-gray-400 text-base">
            Overview of recruitment performance and system metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-light dark:bg-surface-dark rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-text-main dark:text-white shadow-sm">
              7D
            </button>
            <button className="px-3 py-1.5 rounded text-sm font-medium text-text-muted dark:text-gray-400 hover:text-primary">
              30D
            </button>
            <button className="px-3 py-1.5 rounded text-sm font-medium text-text-muted dark:text-gray-400 hover:text-primary">
              3M
            </button>
            <button className="px-3 py-1.5 rounded text-sm font-medium text-text-muted dark:text-gray-400 hover:text-primary">
              YTD
            </button>
          </div>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-text-muted dark:text-gray-400 hover:text-primary hover:border-primary transition-all">
            <span className="material-symbols-outlined">calendar_today</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <AnalyticsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RecruitmentFunnel />
        <HiringVelocity />
      </div>

      {/* Row 3: Sources, Dept, Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CandidateSources />
        <DepartmentBreakdown />
        <RecentActivity />
      </div>

      {/* Recruiter Leaderboard Table */}
      <RecruiterLeaderboard />
    </div>
  );
};
