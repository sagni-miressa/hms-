import { KPIStats } from "@/components/Dashboard/KPIStats";
import { Chart } from "@/components/Dashboard/Chart";
import { SystemStatus } from "@/components/Dashboard/SystemStatus";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { UsersTable } from "@/components/Dashboard/UsersTable";
import { dashboardData } from "@/mockData/admin-dash";

export const Dashboard = () => {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* KPI Stats */}
      <KPIStats stats={dashboardData.kpiStats} />

      {/* Charts + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Chart
            data={dashboardData.chart.data}
            labels={dashboardData.chart.labels}
          />
        </div>

        <div className="flex flex-col gap-6">
          <SystemStatus items={dashboardData.systemStatus as any} />
          <QuickActions actions={dashboardData.quickActions as any} />
        </div>
      </div>

      {/* Users Table */}
      <UsersTable users={dashboardData.users} />
    </div>
  );
};
