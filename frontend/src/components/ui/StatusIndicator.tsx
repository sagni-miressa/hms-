import { cn } from "@/lib/utils";

type StatusType = "active" | "pending" | "inactive" | "error";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { dotClass: string; label: string }> = {
  active: { dotClass: "status-active", label: "Active" },
  pending: { dotClass: "status-pending", label: "Pending" },
  inactive: { dotClass: "status-inactive", label: "Inactive" },
  error: { dotClass: "bg-destructive", label: "Error" },
};

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("status-dot", config.dotClass)} />
      <span className="text-sm text-foreground">{label || config.label}</span>
    </div>
  );
}
