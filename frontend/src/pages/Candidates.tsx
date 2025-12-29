import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ClearanceBadge, ClearanceLevel } from "@/components/ui/ClearanceBadge";
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: string;
  clearance: ClearanceLevel;
  appliedDate: string;
  avatar?: string;
  rating: number;
}

const candidates: Candidate[] = [
  {
    id: "1",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "(555) 123-4567",
    position: "Senior Software Engineer",
    stage: "applied",
    clearance: "secret",
    appliedDate: "2024-01-22",
    rating: 4,
  },
  {
    id: "2",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "(555) 234-5678",
    position: "Product Manager",
    stage: "screening",
    clearance: "confidential",
    appliedDate: "2024-01-20",
    rating: 5,
  },
  {
    id: "3",
    name: "James Wilson",
    email: "j.wilson@email.com",
    phone: "(555) 345-6789",
    position: "DevOps Engineer",
    stage: "interview",
    clearance: "top-secret",
    appliedDate: "2024-01-18",
    rating: 4,
  },
  {
    id: "4",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 456-7890",
    position: "Senior Software Engineer",
    stage: "interview",
    clearance: "secret",
    appliedDate: "2024-01-19",
    rating: 5,
  },
  {
    id: "5",
    name: "Lisa Park",
    email: "lisa.park@email.com",
    phone: "(555) 567-8901",
    position: "Security Analyst",
    stage: "assessment",
    clearance: "top-secret",
    appliedDate: "2024-01-15",
    rating: 4,
  },
  {
    id: "6",
    name: "David Kim",
    email: "d.kim@email.com",
    phone: "(555) 678-9012",
    position: "Senior Software Engineer",
    stage: "offer",
    clearance: "secret",
    appliedDate: "2024-01-10",
    rating: 5,
  },
  {
    id: "7",
    name: "Anna Martinez",
    email: "anna.m@email.com",
    phone: "(555) 789-0123",
    position: "HR Coordinator",
    stage: "screening",
    clearance: "internal",
    appliedDate: "2024-01-21",
    rating: 3,
  },
];

const stages = [
  { id: "applied", label: "Applied", color: "bg-muted-foreground" },
  { id: "screening", label: "Screening", color: "bg-info" },
  { id: "interview", label: "Interview", color: "bg-warning" },
  { id: "assessment", label: "Assessment", color: "bg-accent" },
  { id: "offer", label: "Offer", color: "bg-success" },
];

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="kanban-card group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="font-medium text-foreground">{candidate.name}</p>
            <p className="text-sm text-muted-foreground">
              {candidate.position}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <ClearanceBadge level={candidate.clearance} />
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{candidate.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Applied {new Date(candidate.appliedDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={cn(
                "h-4 w-4",
                star <= candidate.rating ? "text-warning" : "text-muted"
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");

  const getCandidatesByStage = (stageId: string) =>
    candidates.filter(
      (c) =>
        c.stage === stageId &&
        (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.position.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <AppLayout title="Candidate Pipeline">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Candidate Pipeline
            </h1>
            <p className="text-muted-foreground">
              Track and manage candidates through each hiring stage
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
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

        {/* Kanban Board */}
        <div className="flex gap overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.id);
            return (
              <div key={stage.id} className="flex-1 min-w-0">
                <div className="kanban-column">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("w-3 h-3 rounded-full", stage.color)}
                      />
                      <h3 className="font-semibold text-foreground">
                        {stage.label}
                      </h3>
                    </div>
                    <span className="text-sm text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                      {stageCandidates.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {stageCandidates.map((candidate, index) => (
                      <div
                        key={candidate.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CandidateCard candidate={candidate} />
                      </div>
                    ))}
                    {stageCandidates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No candidates in this stage
                      </div>
                    )}
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
