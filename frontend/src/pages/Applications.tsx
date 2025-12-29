import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  MoreVertical,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Star,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import {
  getApplications,
  updateApplicationStatus,
} from "@/services/applications.service";
import type { ApplicationStatus } from "@/types";
import toast from "react-hot-toast";

// Map ApplicationStatus enum to display config
const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "New",
    color: "bg-info/10 text-info border-info/20",
    icon: Clock,
  },
  REVIEWING: {
    label: "Reviewing",
    color: "bg-warning/10 text-warning border-warning/20",
    icon: Eye,
  },
  SHORTLISTED: {
    label: "Shortlisted",
    color: "bg-accent/10 text-accent border-accent/20",
    icon: Star,
  },
  INTERVIEWING: {
    label: "Interview",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: Calendar,
  },
  OFFERED: {
    label: "Offered",
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "bg-muted text-muted-foreground",
    icon: XCircle,
  },
};

export default function Applications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch applications from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["applications", { statusFilter, page }],
    queryFn: () =>
      getApplications({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    retry: 1,
  });

  // Mutation for updating application status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update application status");
    },
  });

  const applications = data?.applications || [];
  const pagination = data?.pagination;

  // Client-side filtering (in addition to server-side)
  const filteredApplications = applications.filter((app) => {
    const candidateName =
      app.applicant?.profile?.fullName || app.applicant?.email || "";
    const jobTitle = app.job?.title || "";
    const department = app.job?.department || "";

    const matchesSearch =
      candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleStatusChange = (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    updateStatusMutation.mutate({ id: applicationId, status: newStatus });
  };

  // Get unique departments from all applications
  const departments = [
    ...new Set(applications.map((a) => a.job?.department).filter(Boolean)),
  ];

  if (error) {
    return (
      <AppLayout title="Applications">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error loading applications
            </h3>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Applications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage all job applications
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusConfig)
            .slice(0, 5)
            .map(([key, config]) => {
              const count = applications.filter((a) => a.status === key).length;
              const Icon = config.icon;
              return (
                <div
                  key={key}
                  className="card-elevated p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setStatusFilter(key as ApplicationStatus)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        config.color.split(" ")[0]
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4", config.color.split(" ")[1])}
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {isLoading ? "-" : count}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {config.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, position, or application ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: string) =>
              setStatusFilter(value as ApplicationStatus | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={departmentFilter}
            onValueChange={(value) => setDepartmentFilter(value || "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept as string} value={dept as string}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Applications Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-muted-foreground">
                        Loading applications...
                      </p>
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <p className="text-muted-foreground">
                        No applications found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app, index) => {
                    const status = statusConfig[app.status];
                    const candidateName =
                      app.applicant?.profile?.fullName ||
                      app.applicant?.email ||
                      "Unknown";
                    const candidateInitials = candidateName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <tr
                        key={app.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                              {candidateInitials}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {candidateName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {app.applicant?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-foreground">
                              {app.job?.title || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {app.job?.department || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <Badge className={cn("border", status.color)}>
                            {status.label}
                          </Badge>
                        </td>
                        <td>
                          <div className="text-sm">
                            <p className="text-foreground">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(app.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Application
                              </DropdownMenuItem>
                              {app.resumeUrl && (
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    app.id,
                                    "SHORTLISTED" as ApplicationStatus
                                  )
                                }
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    app.id,
                                    "INTERVIEWING" as ApplicationStatus
                                  )
                                }
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Interview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleStatusChange(
                                    app.id,
                                    "REJECTED" as ApplicationStatus
                                  )
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredApplications.length} of {pagination.total}{" "}
              applications
              {pagination.totalPages > 1 &&
                ` (Page ${pagination.page} of ${pagination.totalPages})`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevious || isLoading}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext || isLoading}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
