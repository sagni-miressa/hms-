import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/progress";
import { ClearanceBadge, ClearanceLevel } from "@/components/ui/ClearanceBadge";
import {
  Search,
  Filter,
  Plus,
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  User,
  FileText,
  Shield,
  Laptop,
  Key,
  Building2,
  MoreVertical,
  Mail,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface NewHire {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  startDate: string;
  clearance: ClearanceLevel;
  manager: string;
  progress: number;
  tasks: OnboardingTask[];
}

interface OnboardingTask {
  id: string;
  title: string;
  category: "documentation" | "security" | "equipment" | "access" | "training";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  assignee: string;
}

const newHires: NewHire[] = [
  {
    id: "NH-001",
    name: "James Wilson",
    email: "j.wilson@company.com",
    position: "DevOps Engineer",
    department: "Infrastructure",
    startDate: "2024-02-01",
    clearance: "top-secret",
    manager: "Robert Wilson",
    progress: 65,
    tasks: [
      {
        id: "T1",
        title: "Complete I-9 verification",
        category: "documentation",
        status: "completed",
        dueDate: "2024-01-25",
        assignee: "HR Team",
      },
      {
        id: "T2",
        title: "Security clearance verification",
        category: "security",
        status: "in-progress",
        dueDate: "2024-01-28",
        assignee: "Security Team",
      },
      {
        id: "T3",
        title: "Laptop provisioning",
        category: "equipment",
        status: "pending",
        dueDate: "2024-01-30",
        assignee: "IT Team",
      },
      {
        id: "T4",
        title: "System access setup",
        category: "access",
        status: "pending",
        dueDate: "2024-01-31",
        assignee: "IT Team",
      },
    ],
  },
  {
    id: "NH-002",
    name: "David Kim",
    email: "d.kim@company.com",
    position: "Security Analyst",
    department: "Security",
    startDate: "2024-02-15",
    clearance: "top-secret",
    manager: "Robert Wilson",
    progress: 25,
    tasks: [
      {
        id: "T1",
        title: "Background check",
        category: "security",
        status: "in-progress",
        dueDate: "2024-02-01",
        assignee: "Security Team",
      },
      {
        id: "T2",
        title: "Complete W-4 form",
        category: "documentation",
        status: "completed",
        dueDate: "2024-01-28",
        assignee: "New Hire",
      },
      {
        id: "T3",
        title: "Security badge request",
        category: "access",
        status: "pending",
        dueDate: "2024-02-10",
        assignee: "Facilities",
      },
    ],
  },
  {
    id: "NH-003",
    name: "Michael Chen",
    email: "m.chen@company.com",
    position: "Senior Software Engineer",
    department: "Engineering",
    startDate: "2024-02-20",
    clearance: "secret",
    manager: "Amanda Chen",
    progress: 10,
    tasks: [
      {
        id: "T1",
        title: "Offer letter signed",
        category: "documentation",
        status: "completed",
        dueDate: "2024-01-20",
        assignee: "New Hire",
      },
      {
        id: "T2",
        title: "Background check initiated",
        category: "security",
        status: "pending",
        dueDate: "2024-02-01",
        assignee: "Security Team",
      },
    ],
  },
];

const categoryIcons = {
  documentation: FileText,
  security: Shield,
  equipment: Laptop,
  access: Key,
  training: Building2,
};

const categoryColors = {
  documentation: "bg-info/10 text-info",
  security: "bg-warning/10 text-warning",
  equipment: "bg-accent/10 text-accent",
  access: "bg-success/10 text-success",
  training: "bg-primary/10 text-primary",
};

export default function Onboarding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHire, setSelectedHire] = useState<NewHire | null>(null);
  const { toast } = useToast();

  const filteredHires = newHires.filter(
    (hire) =>
      hire.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hire.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReminder = (hireId: string) => {
    toast({
      title: "Reminder sent",
      description: "Onboarding reminder has been sent to the new hire.",
    });
  };

  const upcomingStarts = newHires.filter(
    (h) => new Date(h.startDate) > new Date()
  ).length;
  const pendingTasks = newHires.reduce(
    (acc, h) => acc + h.tasks.filter((t) => t.status === "pending").length,
    0
  );

  return (
    <AppLayout title="Onboarding">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Onboarding</h1>
            <p className="text-muted-foreground">
              Manage new hire onboarding tasks and progress
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Hire
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <User className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {newHires.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active Onboardings
                </p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Calendar className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {upcomingStarts}
                </p>
                <p className="text-sm text-muted-foreground">Starting Soon</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pendingTasks}
                </p>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    newHires.reduce((acc, h) => acc + h.progress, 0) /
                      newHires.length
                  )}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search new hires..."
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

        {/* New Hires List */}
        <div className="space-y-4">
          {filteredHires.map((hire, index) => (
            <div
              key={hire.id}
              className="card-elevated p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                    {hire.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {hire.name}
                      </h3>
                      <ClearanceBadge level={hire.clearance} />
                    </div>
                    <p className="text-muted-foreground">
                      {hire.position} • {hire.department}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Starts {new Date(hire.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Manager: {hire.manager}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">
                        {hire.progress}%
                      </span>
                    </div>
                    <Progress value={hire.progress} className="h-2" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedHire(hire)}>
                        <ChevronRight className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSendReminder(hire.id)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reminder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tasks Preview */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">
                  Onboarding Tasks
                </p>
                <div className="flex flex-wrap gap-2">
                  {hire.tasks.map((task) => {
                    const Icon = categoryIcons[task.category];
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                          task.status === "completed"
                            ? "bg-success/10 text-success"
                            : task.status === "in-progress"
                              ? "bg-warning/10 text-warning"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {task.status === "completed" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : task.status === "in-progress" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                        <span>{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
