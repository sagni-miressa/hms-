import { AlertTriangle, ShieldCheck, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityAlert {
  id: string;
  type: "warning" | "success" | "info" | "error";
  title: string;
  description: string;
  timestamp: string;
}

const mockAlerts: SecurityAlert[] = [
  {
    id: "1",
    type: "warning",
    title: "Unusual Login Detected",
    description: "New device login from Chicago, IL. Verify if this was you.",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "success",
    title: "MFA Verification Complete",
    description: "Your multi-factor authentication is active and secure.",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    type: "info",
    title: "Session Expiring Soon",
    description: "Your session will expire in 30 minutes. Save your work.",
    timestamp: "Just now",
  },
];

const alertStyles = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-l-warning",
    iconColor: "text-warning",
  },
  success: {
    icon: ShieldCheck,
    bg: "bg-success/10",
    border: "border-l-success",
    iconColor: "text-success",
  },
  info: {
    icon: Info,
    bg: "bg-info/10",
    border: "border-l-info",
    iconColor: "text-info",
  },
  error: {
    icon: AlertTriangle,
    bg: "bg-destructive/10",
    border: "border-l-destructive",
    iconColor: "text-destructive",
  },
};

export function SecurityAlerts() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Security Alerts</h3>
        <button className="text-sm text-accent hover:underline">View All</button>
      </div>
      <div className="space-y-2">
        {mockAlerts.map((alert, index) => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;
          return (
            <div
              key={alert.id}
              className={cn(
                "flex gap-3 p-4 rounded-lg border-l-4 animate-slide-up",
                style.bg,
                style.border
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", style.iconColor)} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{alert.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
