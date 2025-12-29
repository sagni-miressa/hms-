import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Clock,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: typeof BarChart3;
}

const metrics: MetricCard[] = [
  {
    title: "Total Applications",
    value: "2,847",
    change: 12.5,
    changeLabel: "vs last month",
    icon: Users,
  },
  {
    title: "Time to Hire",
    value: "18 days",
    change: -8.2,
    changeLabel: "vs last month",
    icon: Clock,
  },
  {
    title: "Open Positions",
    value: 24,
    change: 4,
    changeLabel: "new this week",
    icon: Briefcase,
  },
  {
    title: "Offer Acceptance",
    value: "87%",
    change: 3.1,
    changeLabel: "vs last quarter",
    icon: TrendingUp,
  },
];

const departmentData = [
  { department: "Engineering", applications: 856, hired: 12, avgTime: 22 },
  { department: "Product", applications: 324, hired: 4, avgTime: 18 },
  { department: "Marketing", applications: 412, hired: 6, avgTime: 15 },
  { department: "Sales", applications: 289, hired: 8, avgTime: 12 },
  { department: "HR", applications: 167, hired: 3, avgTime: 14 },
  { department: "Security", applications: 98, hired: 2, avgTime: 35 },
];

const sourceData = [
  { source: "LinkedIn", applications: 1024, percentage: 36 },
  { source: "Career Page", applications: 756, percentage: 27 },
  { source: "Indeed", applications: 423, percentage: 15 },
  { source: "Referrals", applications: 312, percentage: 11 },
  { source: "Other", applications: 332, percentage: 11 },
];

const pipelineData = [
  { stage: "Applied", count: 2847, color: "bg-muted-foreground" },
  { stage: "Screening", count: 1245, color: "bg-info" },
  { stage: "Interview", count: 456, color: "bg-warning" },
  { stage: "Assessment", count: 189, color: "bg-accent" },
  { stage: "Offer", count: 67, color: "bg-success" },
  { stage: "Hired", count: 45, color: "bg-primary" },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState("30");

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Track hiring metrics and pipeline performance
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              className="card-elevated p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.change >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        metric.change >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {metric.changeLabel}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <metric.icon className="h-6 w-6 text-accent" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Funnel */}
          <div className="card-elevated p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Hiring Pipeline</h3>
              <Badge variant="secondary">Conversion: 1.6%</Badge>
            </div>
            <div className="space-y-3">
              {pipelineData.map((stage, index) => {
                const maxCount = pipelineData[0].count;
                const width = (stage.count / maxCount) * 100;
                return (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{stage.stage}</span>
                      <span className="font-medium text-foreground">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-8 bg-muted rounded overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded transition-all duration-500",
                          stage.color
                        )}
                        style={{
                          width: `${width}%`,
                          animationDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source Distribution */}
          <div className="card-elevated p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Application Sources
              </h3>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {sourceData.map((source, index) => (
                <div
                  key={source.source}
                  className="flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {source.source}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {source.applications.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {source.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card-elevated p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Department Performance
            </h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Applications</th>
                  <th>Hired</th>
                  <th>Conversion Rate</th>
                  <th>Avg. Time to Hire</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept, index) => {
                  const conversionRate = (
                    (dept.hired / dept.applications) *
                    100
                  ).toFixed(1);
                  return (
                    <tr
                      key={dept.department}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="font-medium text-foreground">
                        {dept.department}
                      </td>
                      <td>{dept.applications.toLocaleString()}</td>
                      <td>
                        <Badge className="bg-success/10 text-success border-success/20">
                          {dept.hired}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{
                                width: `${Math.min(parseFloat(conversionRate) * 10, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm">{conversionRate}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {dept.avgTime} days
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
