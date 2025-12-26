import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ClearanceBadge, ClearanceLevel } from "@/components/ui/ClearanceBadge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  MapPin,
  Clock,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/Badge";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  clearance: ClearanceLevel;
  applicants: number;
  status: "active" | "pending" | "inactive";
  postedDate: string;
}

const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Washington, DC",
    type: "Full-time",
    clearance: "secret",
    applicants: 45,
    status: "active",
    postedDate: "2024-01-15",
  },
  {
    id: "2",
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    clearance: "confidential",
    applicants: 28,
    status: "active",
    postedDate: "2024-01-18",
  },
  {
    id: "3",
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Arlington, VA",
    type: "Full-time",
    clearance: "top-secret",
    applicants: 12,
    status: "active",
    postedDate: "2024-01-20",
  },
  {
    id: "4",
    title: "HR Coordinator",
    department: "Human Resources",
    location: "New York, NY",
    type: "Full-time",
    clearance: "internal",
    applicants: 67,
    status: "active",
    postedDate: "2024-01-10",
  },
  {
    id: "5",
    title: "Marketing Intern",
    department: "Marketing",
    location: "Remote",
    type: "Internship",
    clearance: "public",
    applicants: 156,
    status: "pending",
    postedDate: "2024-01-22",
  },
  {
    id: "6",
    title: "Security Analyst",
    department: "Security",
    location: "McLean, VA",
    type: "Full-time",
    clearance: "top-secret",
    applicants: 8,
    status: "active",
    postedDate: "2024-01-12",
  },
];

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Job Postings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Postings</h1>
            <p className="text-muted-foreground">
              Manage your open positions and track applicant flow
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Job Posting
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title or department..."
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-bold text-foreground">316</p>
            <p className="text-sm text-muted-foreground">Total Applicants</p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-sm text-muted-foreground">Departments</p>
          </div>
          <div className="card-elevated p-4 text-center">
            <p className="text-2xl font-bold text-foreground">5</p>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job, index) => (
            <div
              key={job.id}
              className="card-elevated p-6 space-y-4 animate-slide-up hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{job.department}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Posting
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Close Posting
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-2">
                <ClearanceBadge level={job.clearance} />
                <Badge variant="secondary">{job.type}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{job.applicants} applicants</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <StatusIndicator status={job.status} />
                <Button variant="outline" size="sm">
                  View Pipeline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
