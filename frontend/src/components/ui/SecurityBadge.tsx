import { Shield, ShieldCheck, ShieldAlert, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type SecurityStatus = "secure" | "pending" | "locked" | "warning";

interface SecurityBadgeProps {
  status: SecurityStatus;
  label?: string;
  className?: string;
}

const statusConfig = {
  secure: {
    icon: ShieldCheck,
    className: "security-badge-secure",
    defaultLabel: "Secure",
  },
  pending: {
    icon: Shield,
    className: "security-badge-pending",
    defaultLabel: "Pending",
  },
  locked: {
    icon: Lock,
    className: "security-badge-locked",
    defaultLabel: "Locked",
  },
  warning: {
    icon: ShieldAlert,
    className: "security-badge-pending",
    defaultLabel: "Warning",
  },
};

export function SecurityBadge({ status, label, className }: SecurityBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn("security-badge", config.className, className)}>
      <Icon className="h-3 w-3" />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
}
