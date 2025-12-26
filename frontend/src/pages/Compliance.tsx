import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  RefreshCw,
  Globe,
  Lock,
  Users,
  Building2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceItem {
  id: string;
  name: string;
  category: string;
  status: "compliant" | "at-risk" | "non-compliant" | "in-progress";
  lastAudit: string;
  nextAudit: string;
  score: number;
  description: string;
}

interface Certification {
  name: string;
  status: "certified" | "in-progress" | "expired";
  validUntil?: string;
  icon: typeof Shield;
}

const complianceItems: ComplianceItem[] = [
  {
    id: "1",
    name: "SOC 2 Type II",
    category: "Security",
    status: "compliant",
    lastAudit: "2024-01-15",
    nextAudit: "2024-07-15",
    score: 98,
    description: "Security, availability, and confidentiality controls",
  },
  {
    id: "2",
    name: "GDPR",
    category: "Privacy",
    status: "compliant",
    lastAudit: "2024-01-01",
    nextAudit: "2024-06-01",
    score: 95,
    description: "EU data protection and privacy requirements",
  },
  {
    id: "3",
    name: "CCPA",
    category: "Privacy",
    status: "compliant",
    lastAudit: "2024-01-10",
    nextAudit: "2024-07-10",
    score: 92,
    description: "California Consumer Privacy Act compliance",
  },
  {
    id: "4",
    name: "EEOC",
    category: "Employment",
    status: "compliant",
    lastAudit: "2023-12-01",
    nextAudit: "2024-06-01",
    score: 100,
    description: "Equal employment opportunity requirements",
  },
  {
    id: "5",
    name: "FedRAMP",
    category: "Government",
    status: "in-progress",
    lastAudit: "2024-01-20",
    nextAudit: "2024-04-20",
    score: 78,
    description: "Federal cloud security authorization",
  },
  {
    id: "6",
    name: "OFCCP",
    category: "Employment",
    status: "at-risk",
    lastAudit: "2023-11-15",
    nextAudit: "2024-02-15",
    score: 85,
    description: "Federal contractor affirmative action",
  },
];

const certifications: Certification[] = [
  {
    name: "ISO 27001",
    status: "certified",
    validUntil: "2025-06-30",
    icon: Shield,
  },
  {
    name: "SOC 2 Type II",
    status: "certified",
    validUntil: "2025-01-15",
    icon: Lock,
  },
  {
    name: "GDPR Ready",
    status: "certified",
    validUntil: "2025-12-31",
    icon: Globe,
  },
  { name: "FedRAMP Moderate", status: "in-progress", icon: Building2 },
  { name: "HIPAA", status: "in-progress", icon: Users },
];

const statusStyles = {
  compliant: {
    label: "Compliant",
    color: "bg-success/10 text-success border-success/20",
    icon: CheckCircle,
  },
  "at-risk": {
    label: "At Risk",
    color: "bg-warning/10 text-warning border-warning/20",
    icon: AlertTriangle,
  },
  "non-compliant": {
    label: "Non-Compliant",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertTriangle,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-info/10 text-info border-info/20",
    icon: Clock,
  },
};

export default function Compliance() {
  const overallScore = Math.round(
    complianceItems.reduce((acc, item) => acc + item.score, 0) /
      complianceItems.length
  );

  return (
    <AppLayout title="Compliance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Compliance Center
            </h1>
            <p className="text-muted-foreground">
              Monitor regulatory compliance and certification status
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Run Audit
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="card-elevated p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${overallScore * 2.51} 251`}
                    className="text-success"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {overallScore}%
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Overall Compliance Score
                </h2>
                <p className="text-muted-foreground">
                  Based on {complianceItems.length} compliance requirements
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {
                    complianceItems.filter((i) => i.status === "compliant")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Compliant</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {complianceItems.filter((i) => i.status === "at-risk").length}
                </p>
                <p className="text-sm text-muted-foreground">At Risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-info">
                  {
                    complianceItems.filter((i) => i.status === "in-progress")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compliance Items */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-foreground">
              Compliance Requirements
            </h3>
            {complianceItems.map((item, index) => {
              const status = statusStyles[item.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={item.id}
                  className="card-elevated p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-foreground">
                          {item.name}
                        </h4>
                        <Badge className={cn("border", status.color)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Last: {new Date(item.lastAudit).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Next: {new Date(item.nextAudit).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {item.score}%
                      </p>
                      <p className="text-sm text-muted-foreground">Score</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress
                      value={item.score}
                      className={cn(
                        "h-2",
                        item.score >= 90
                          ? "[&>div]:bg-success"
                          : item.score >= 70
                            ? "[&>div]:bg-warning"
                            : "[&>div]:bg-destructive"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Certifications</h3>
            {certifications.map((cert, index) => (
              <div
                key={cert.name}
                className="card-elevated p-4 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      cert.status === "certified"
                        ? "bg-success/10"
                        : "bg-warning/10"
                    )}
                  >
                    <cert.icon
                      className={cn(
                        "h-5 w-5",
                        cert.status === "certified"
                          ? "text-success"
                          : "text-warning"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{cert.name}</p>
                    {cert.validUntil ? (
                      <p className="text-sm text-muted-foreground">
                        Valid until{" "}
                        {new Date(cert.validUntil).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-warning">In Progress</p>
                    )}
                  </div>
                  {cert.status === "certified" && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>
              </div>
            ))}

            <div className="card-elevated p-4 border-dashed">
              <div className="flex items-center gap-3 text-muted-foreground">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="font-medium">Compliance Documents</p>
                  <p className="text-sm">Access policies and procedures</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
