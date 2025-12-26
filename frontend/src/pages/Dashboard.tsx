import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { SecurityAlerts } from "@/components/dashboard/SecurityAlerts";
import { HiringPipeline } from "@/components/dashboard/HiringPipeline";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { 
  Briefcase, 
  Users, 
  FileCheck, 
  CalendarCheck,
  TrendingUp,
  Clock
} from "lucide-react";

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good morning, Sarah</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your hiring pipeline today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: Just now
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Jobs"
            value={24}
            description="Across 8 departments"
            icon={Briefcase}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Candidates"
            value={1284}
            description="In pipeline"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Reviews"
            value={42}
            description="Requires your attention"
            icon={FileCheck}
          />
          <StatCard
            title="Interviews Today"
            value={7}
            description="3 virtual, 4 on-site"
            icon={CalendarCheck}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hiring Pipeline - Spans 2 columns */}
          <div className="lg:col-span-2 card-elevated p-6">
            <HiringPipeline />
          </div>

          {/* Security Alerts */}
          <div className="card-elevated p-6">
            <SecurityAlerts />
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Spans 2 columns */}
          <div className="lg:col-span-2 card-elevated p-6">
            <RecentActivity />
          </div>

          {/* Quick Stats */}
          <div className="card-elevated p-6 space-y-6">
            <h3 className="font-semibold text-foreground">Performance Metrics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Time to Hire</p>
                    <p className="text-xs text-muted-foreground">Average days</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground">18</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Users className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Offer Acceptance</p>
                    <p className="text-xs text-muted-foreground">Rate</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground">87%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <FileCheck className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Applications</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground">156</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
