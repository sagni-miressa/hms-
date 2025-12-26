import { cn } from "@/lib/utils";
import { Eye, EyeOff, Shield, ShieldAlert, Lock } from "lucide-react";

export type ClearanceLevel = "public" | "internal" | "confidential" | "secret" | "top-secret";

interface ClearanceBadgeProps {
  level: ClearanceLevel;
  showIcon?: boolean;
  className?: string;
}

const clearanceConfig: Record<ClearanceLevel, { label: string; icon: typeof Eye; className: string }> = {
  public: {
    label: "Public",
    icon: Eye,
    className: "clearance-public",
  },
  internal: {
    label: "Internal",
    icon: Shield,
    className: "clearance-internal",
  },
  confidential: {
    label: "Confidential",
    icon: EyeOff,
    className: "clearance-confidential",
  },
  secret: {
    label: "Secret",
    icon: ShieldAlert,
    className: "clearance-secret",
  },
  "top-secret": {
    label: "Top Secret",
    icon: Lock,
    className: "clearance-top-secret",
  },
};

export function ClearanceBadge({ level, showIcon = true, className }: ClearanceBadgeProps) {
  const config = clearanceConfig[level];
  const Icon = config.icon;

  return (
    <span className={cn("security-badge", config.className, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{config.label}</span>
    </span>
  );
}
