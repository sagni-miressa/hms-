import { useState } from "react";
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  Clock,
  ArrowRight,
  Shield,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ClearanceBadge, ClearanceLevel } from "@/components/ui/ClearanceBadge";
import { useNavigate } from "react-router-dom";

interface PublicJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  clearance: ClearanceLevel;
  postedDate: string;
  description: string;
}

const publicJobs: PublicJob[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Washington, DC",
    type: "Full-time",
    clearance: "secret",
    postedDate: "2024-01-15",
    description:
      "Join our engineering team to build secure, scalable enterprise applications.",
  },
  {
    id: "2",
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    clearance: "confidential",
    postedDate: "2024-01-18",
    description:
      "Lead product strategy and roadmap for our flagship hiring platform.",
  },
  {
    id: "3",
    title: "HR Coordinator",
    department: "Human Resources",
    location: "New York, NY",
    type: "Full-time",
    clearance: "internal",
    postedDate: "2024-01-10",
    description: "Support HR operations and employee onboarding processes.",
  },
  {
    id: "4",
    title: "Marketing Intern",
    department: "Marketing",
    location: "Remote",
    type: "Internship",
    clearance: "public",
    postedDate: "2024-01-22",
    description:
      "Gain hands-on experience in enterprise B2B marketing campaigns.",
  },
];

export default function ApplicantPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredJobs = publicJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold text-foreground">RecruitHub</span>
              <span className="text-muted-foreground text-sm ml-2">
                Careers
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/my-applications")}
            >
              My Applications
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground animate-fade-in">
              Build Your Career at RecruitHub
            </h1>
            <p
              className="text-xl text-muted-foreground animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              Join a team dedicated to transforming enterprise hiring with
              security-first innovation.
            </p>

            {/* Search */}
            <div
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, department, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
              <Button size="lg" className="h-12 px-8">
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>FedRAMP Authorized</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>500+ Employees</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Equal Opportunity Employer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Open Positions
            </h2>
            <span className="text-muted-foreground">
              {filteredJobs.length} jobs available
            </span>
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className="card-elevated p-6 hover:shadow-lg transition-all cursor-pointer animate-slide-up group"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {job.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ClearanceBadge level={job.clearance} />
                    <Button
                      variant="outline"
                      className="gap-2 group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No jobs found matching your search.</p>
                <p>Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-semibold text-foreground">
                  RecruitHub
                </span>
                <p className="text-sm text-muted-foreground">
                  Enterprise Hiring Platform
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 RecruitHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
