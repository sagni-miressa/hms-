import { User, FileText, CheckCircle, XCircle, Clock, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "application" | "interview" | "offer" | "rejection" | "review" | "submission";
  title: string;
  subtitle: string;
  timestamp: string;
  user?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "application",
    title: "New Application Received",
    subtitle: "Michael Chen applied for Senior Engineer",
    timestamp: "5 min ago",
    user: "System",
  },
  {
    id: "2",
    type: "interview",
    title: "Interview Scheduled",
    subtitle: "Emily Rodriguez - Product Manager",
    timestamp: "32 min ago",
    user: "Sarah M.",
  },
  {
    id: "3",
    type: "offer",
    title: "Offer Extended",
    subtitle: "James Wilson - DevOps Engineer",
    timestamp: "1 hour ago",
    user: "HR Team",
  },
  {
    id: "4",
    type: "review",
    title: "Candidate Review Completed",
    subtitle: "5 candidates reviewed for Marketing Lead",
    timestamp: "2 hours ago",
    user: "Mark J.",
  },
  {
    id: "5",
    type: "submission",
    title: "Assessment Submitted",
    subtitle: "Lisa Park completed technical assessment",
    timestamp: "3 hours ago",
    user: "System",
  },
];

const activityIcons = {
  application: { icon: FileText, color: "text-info bg-info/10" },
  interview: { icon: Clock, color: "text-warning bg-warning/10" },
  offer: { icon: Send, color: "text-success bg-success/10" },
  rejection: { icon: XCircle, color: "text-destructive bg-destructive/10" },
  review: { icon: CheckCircle, color: "text-accent bg-accent/10" },
  submission: { icon: User, color: "text-muted-foreground bg-muted" },
};

export function RecentActivity() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-accent hover:underline">View All</button>
      </div>
      
      <div className="space-y-1">
        {activities.map((activity, index) => {
          const config = activityIcons[activity.type];
          const Icon = config.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn("p-2 rounded-lg", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.subtitle}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                {activity.user && (
                  <p className="text-xs text-muted-foreground mt-1">{activity.user}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
