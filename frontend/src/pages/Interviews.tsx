import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ClearanceBadge, ClearanceLevel } from "@/components/ui/ClearanceBadge";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Interview {
  id: string;
  candidate: { name: string; email: string };
  position: string;
  type: "video" | "onsite" | "phone";
  date: string;
  time: string;
  duration: number;
  interviewers: string[];
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  location?: string;
  meetingLink?: string;
  clearance: ClearanceLevel;
}

const interviews: Interview[] = [
  {
    id: "INT-001",
    candidate: { name: "Michael Chen", email: "michael.chen@email.com" },
    position: "Senior Software Engineer",
    type: "video",
    date: "2024-01-23",
    time: "10:00 AM",
    duration: 60,
    interviewers: ["Sarah Mitchell", "John Davis"],
    status: "scheduled",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    clearance: "secret",
  },
  {
    id: "INT-002",
    candidate: { name: "Emily Rodriguez", email: "emily.r@email.com" },
    position: "Product Manager",
    type: "onsite",
    date: "2024-01-23",
    time: "2:00 PM",
    duration: 90,
    interviewers: ["Amanda Chen", "Robert Wilson"],
    status: "scheduled",
    location: "Conference Room A, Floor 5",
    clearance: "confidential",
  },
  {
    id: "INT-003",
    candidate: { name: "James Wilson", email: "j.wilson@email.com" },
    position: "DevOps Engineer",
    type: "video",
    date: "2024-01-23",
    time: "4:30 PM",
    duration: 45,
    interviewers: ["Robert Wilson"],
    status: "scheduled",
    meetingLink: "https://zoom.us/j/123456789",
    clearance: "top-secret",
  },
  {
    id: "INT-004",
    candidate: { name: "Sarah Johnson", email: "sarah.j@email.com" },
    position: "Senior Software Engineer",
    type: "phone",
    date: "2024-01-22",
    time: "11:00 AM",
    duration: 30,
    interviewers: ["Sarah Mitchell"],
    status: "completed",
    clearance: "secret",
  },
  {
    id: "INT-005",
    candidate: { name: "Lisa Park", email: "lisa.park@email.com" },
    position: "Security Analyst",
    type: "video",
    date: "2024-01-22",
    time: "3:00 PM",
    duration: 60,
    interviewers: ["Robert Wilson", "Amanda Chen"],
    status: "cancelled",
    clearance: "top-secret",
  },
];

const typeIcons = {
  video: Video,
  onsite: MapPin,
  phone: User,
};

const statusStyles = {
  scheduled: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "no-show": "bg-warning/10 text-warning border-warning/20",
};

export default function Interviews() {
  const [selectedDate, setSelectedDate] = useState("2024-01-23");
  const { toast } = useToast();

  const todayInterviews = interviews.filter((i) => i.date === selectedDate);
  const upcomingInterviews = interviews.filter((i) => i.status === "scheduled");

  const handleSendReminder = (interviewId: string) => {
    toast({
      title: "Reminder sent",
      description: "Interview reminder has been sent to all participants.",
    });
  };

  return (
    <AppLayout title="Interviews">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Interview Schedule
            </h1>
            <p className="text-muted-foreground">
              Manage and track all candidate interviews
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Interview
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {todayInterviews.length}
                </p>
                <p className="text-sm text-muted-foreground">Today</p>
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
                  {upcomingInterviews.length}
                </p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
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
                  {interviews.filter((i) => i.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {interviews.filter((i) => i.status === "cancelled").length}
                </p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {todayInterviews.length} interviews scheduled
              </p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Interview List */}
        <div className="space-y-4">
          {interviews.map((interview, index) => {
            const TypeIcon = typeIcons[interview.type];
            return (
              <div
                key={interview.id}
                className="card-elevated p-6 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                      {interview.candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {interview.candidate.name}
                        </h3>
                        <ClearanceBadge level={interview.clearance} />
                      </div>
                      <p className="text-muted-foreground">
                        {interview.position}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(interview.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {interview.time} ({interview.duration} min)
                        </div>
                        <div className="flex items-center gap-1">
                          <TypeIcon className="h-4 w-4" />
                          {interview.type.charAt(0).toUpperCase() +
                            interview.type.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-foreground">
                        Interviewers
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {interview.interviewers.join(", ")}
                      </p>
                    </div>
                    <Badge
                      className={cn("border", statusStyles[interview.status])}
                    >
                      {interview.status.charAt(0).toUpperCase() +
                        interview.status.slice(1)}
                    </Badge>
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
                        {interview.status === "scheduled" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleSendReminder(interview.id)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                        {interview.status === "completed" && (
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            View Feedback
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
