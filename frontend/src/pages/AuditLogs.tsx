import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  Filter,
  Download,
  Clock,
  User,
  Shield,
  FileText,
  Settings,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceType: "user" | "job" | "candidate" | "system" | "security";
  ipAddress: string;
  status: "success" | "warning" | "error";
  details?: string;
}

const auditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-01-22 14:32:45",
    user: "Sarah Mitchell",
    action: "Updated candidate status",
    resource: "Michael Chen",
    resourceType: "candidate",
    ipAddress: "192.168.1.45",
    status: "success",
    details: "Changed status from 'Screening' to 'Interview'",
  },
  {
    id: "2",
    timestamp: "2024-01-22 14:28:12",
    user: "John Davis",
    action: "Created job posting",
    resource: "Senior Software Engineer",
    resourceType: "job",
    ipAddress: "192.168.1.32",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2024-01-22 14:15:33",
    user: "System",
    action: "Failed login attempt",
    resource: "unknown@email.com",
    resourceType: "security",
    ipAddress: "203.45.67.89",
    status: "error",
    details: "Invalid credentials - 3rd attempt",
  },
  {
    id: "4",
    timestamp: "2024-01-22 14:10:21",
    user: "Robert Wilson",
    action: "Modified user permissions",
    resource: "Amanda Chen",
    resourceType: "user",
    ipAddress: "192.168.1.100",
    status: "warning",
    details: "Elevated clearance from 'Internal' to 'Secret'",
  },
  {
    id: "5",
    timestamp: "2024-01-22 14:05:18",
    user: "Sarah Mitchell",
    action: "Exported candidate data",
    resource: "Engineering Pipeline",
    resourceType: "candidate",
    ipAddress: "192.168.1.45",
    status: "success",
    details: "Downloaded PDF report with 45 candidates",
  },
  {
    id: "6",
    timestamp: "2024-01-22 13:55:42",
    user: "Amanda Chen",
    action: "Accessed restricted resource",
    resource: "Classified Job Posting",
    resourceType: "security",
    ipAddress: "192.168.1.78",
    status: "warning",
    details: "Access granted with elevated privileges",
  },
  {
    id: "7",
    timestamp: "2024-01-22 13:45:00",
    user: "System",
    action: "Scheduled backup completed",
    resource: "Database",
    resourceType: "system",
    ipAddress: "localhost",
    status: "success",
  },
  {
    id: "8",
    timestamp: "2024-01-22 13:30:15",
    user: "Jennifer Lee",
    action: "Password reset requested",
    resource: "Jennifer Lee",
    resourceType: "user",
    ipAddress: "192.168.1.55",
    status: "success",
  },
];

const resourceTypeIcons = {
  user: User,
  job: FileText,
  candidate: User,
  system: Settings,
  security: Shield,
};

const statusStyles = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Audit Logs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground">
              Immutable record of all system activities for compliance and
              security
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12,458</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">11,823</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">542</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">93</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by user, action, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Logs Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => {
                  const Icon = resourceTypeIcons[log.resourceType];
                  return (
                    <tr
                      key={log.id}
                      className="animate-slide-up cursor-pointer hover:bg-muted/50"
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => setSelectedLog(log)}
                    >
                      <td>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{log.timestamp}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium">{log.user}</span>
                      </td>
                      <td>{log.action}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{log.resource}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm text-muted-foreground">
                          {log.ipAddress}
                        </span>
                      </td>
                      <td>
                        <Badge
                          className={cn("border", statusStyles[log.status])}
                        >
                          {log.status.charAt(0).toUpperCase() +
                            log.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-{filteredLogs.length} of 12,458 entries
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
