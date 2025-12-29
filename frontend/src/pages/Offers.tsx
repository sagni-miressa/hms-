import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { ClearanceBadge, ClearanceLevel } from "@/components/ui/ClearanceBadge";
import { SecureActionButton } from "@/components/ui/SecureActionButton";
import {
  Search,
  Filter,
  Plus,
  Send,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  Eye,
  Edit,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  candidate: { name: string; email: string };
  position: string;
  department: string;
  salary: number;
  bonus?: number;
  startDate: string;
  expiryDate: string;
  status:
    | "draft"
    | "pending"
    | "sent"
    | "accepted"
    | "declined"
    | "expired"
    | "negotiating";
  clearance: ClearanceLevel;
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
}

const offers: Offer[] = [
  {
    id: "OFF-001",
    candidate: { name: "David Kim", email: "d.kim@email.com" },
    position: "Security Analyst",
    department: "Security",
    salary: 145000,
    bonus: 15000,
    startDate: "2024-02-15",
    expiryDate: "2024-02-01",
    status: "sent",
    clearance: "top-secret",
    createdAt: "2024-01-20",
    sentAt: "2024-01-21",
  },
  {
    id: "OFF-002",
    candidate: { name: "James Wilson", email: "j.wilson@email.com" },
    position: "DevOps Engineer",
    department: "Infrastructure",
    salary: 160000,
    bonus: 20000,
    startDate: "2024-02-01",
    expiryDate: "2024-01-28",
    status: "accepted",
    clearance: "top-secret",
    createdAt: "2024-01-15",
    sentAt: "2024-01-16",
    respondedAt: "2024-01-18",
  },
  {
    id: "OFF-003",
    candidate: { name: "Sarah Johnson", email: "sarah.j@email.com" },
    position: "Senior Software Engineer",
    department: "Engineering",
    salary: 175000,
    startDate: "2024-03-01",
    expiryDate: "2024-02-15",
    status: "negotiating",
    clearance: "secret",
    createdAt: "2024-01-22",
    sentAt: "2024-01-22",
  },
  {
    id: "OFF-004",
    candidate: { name: "Emily Rodriguez", email: "emily.r@email.com" },
    position: "Product Manager",
    department: "Product",
    salary: 155000,
    bonus: 12000,
    startDate: "2024-02-20",
    expiryDate: "2024-02-05",
    status: "draft",
    clearance: "confidential",
    createdAt: "2024-01-22",
  },
  {
    id: "OFF-005",
    candidate: { name: "Anna Martinez", email: "anna.m@email.com" },
    position: "HR Coordinator",
    department: "Human Resources",
    salary: 72000,
    startDate: "2024-01-15",
    expiryDate: "2024-01-05",
    status: "declined",
    clearance: "internal",
    createdAt: "2024-01-01",
    sentAt: "2024-01-02",
    respondedAt: "2024-01-04",
  },
];

const statusStyles: Record<Offer["status"], { label: string; color: string }> =
  {
    draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
    pending: {
      label: "Pending Approval",
      color: "bg-warning/10 text-warning border-warning/20",
    },
    sent: { label: "Sent", color: "bg-info/10 text-info border-info/20" },
    accepted: {
      label: "Accepted",
      color: "bg-success/10 text-success border-success/20",
    },
    declined: {
      label: "Declined",
      color: "bg-destructive/10 text-destructive border-destructive/20",
    },
    expired: { label: "Expired", color: "bg-muted text-muted-foreground" },
    negotiating: {
      label: "Negotiating",
      color: "bg-accent/10 text-accent border-accent/20",
    },
  };

export default function Offers() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredOffers = offers.filter(
    (offer) =>
      offer.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendOffer = (offerId: string) => {
    toast({
      title: "Offer sent",
      description: "The offer letter has been sent to the candidate.",
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <AppLayout title="Offers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Offer Management
            </h1>
            <p className="text-muted-foreground">
              Create, send, and track job offers
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Offer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Send className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {offers.filter((o) => o.status === "sent").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
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
                  {offers.filter((o) => o.status === "accepted").length}
                </p>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <RefreshCw className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {offers.filter((o) => o.status === "negotiating").length}
                </p>
                <p className="text-sm text-muted-foreground">Negotiating</p>
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
                  {offers.filter((o) => o.status === "declined").length}
                </p>
                <p className="text-sm text-muted-foreground">Declined</p>
              </div>
            </div>
          </div>
          <div className="card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {offers.filter((o) => o.status === "draft").length}
                </p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by candidate name, position, or offer ID..."
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

        {/* Offers Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Position</th>
                  <th>Compensation</th>
                  <th>Start Date</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer, index) => {
                  const status = statusStyles[offer.status];
                  return (
                    <tr
                      key={offer.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                            {offer.candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {offer.candidate.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {offer.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">
                            {offer.position}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {offer.department}
                            </span>
                            <ClearanceBadge level={offer.clearance} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">
                            {formatCurrency(offer.salary)}
                          </p>
                          {offer.bonus && (
                            <p className="text-sm text-success">
                              +{formatCurrency(offer.bonus)} bonus
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(offer.startDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <Badge className={cn("border", status.color)}>
                          {status.label}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(offer.expiryDate).toLocaleDateString()}
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
                              View Offer
                            </DropdownMenuItem>
                            {offer.status === "draft" && (
                              <>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Offer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSendOffer(offer.id)}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Offer
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
