/**
 * Shared Type Definitions
 * Types matching backend API responses
 */

export enum Role {
  APPLICANT = "APPLICANT",
  RECRUITER = "RECRUITER",
  INTERVIEWER = "INTERVIEWER",
  HR_MANAGER = "HR_MANAGER",
  AUDITOR = "AUDITOR",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
}

export enum ClearanceLevel {
  PUBLIC = "PUBLIC",
  INTERNAL = "INTERNAL",
  CONFIDENTIAL = "CONFIDENTIAL",
  RESTRICTED = "RESTRICTED",
}

export enum JobStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  REVIEWING = "REVIEWING",
  SHORTLISTED = "SHORTLISTED",
  INTERVIEWING = "INTERVIEWING",
  OFFERED = "OFFERED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
}

export enum ExperienceLevel {
  ENTRY = "ENTRY",
  MID = "MID",
  SENIOR = "SENIOR",
  LEAD = "LEAD",
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username?: string | null;
  roles: Role[];
  clearanceLevel: ClearanceLevel;
  department?: string | null;
  mfaEnabled: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string | null;
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
}

// ============================================================================
// JOB TYPES
// ============================================================================

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string | null;
  responsibilities?: string | null;
  benefits?: string | null;
  category: string;
  location: string;
  employmentType: EmploymentType;
  department?: string | null;
  experienceLevel?: ExperienceLevel | null;
  salaryRange?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  isRemote: boolean;
  status: JobStatus;
  applicationDeadline?: string | null;
  openings: number;
  publishedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    email: string;
    username?: string | null;
  };
  _count?: {
    applications: number;
  };
}

export interface JobFilters {
  status?: JobStatus;
  department?: string;
  category?: string;
  location?: string;
  employmentType?: EmploymentType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// APPLICATION TYPES
// ============================================================================

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  status: ApplicationStatus;
  coverLetter?: string | null;
  answers?: Record<string, any> | null;
  resumeUrl?: string | null;
  rejectionReason?: string | null;

  createdAt: string;
  updatedAt: string;
  job?: Job;
  applicant?: {
    id: string;
    email: string;
    profile?: {
      fullName?: string | null;
      phone?: string | null;
    };
  };
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  applicantId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
