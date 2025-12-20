/**
 * Jobs Service
 * API calls for job management
 */

import { api, extractData, extractPagination, ApiResponse } from "@/lib/api";
import type { Job, JobFilters, PaginationMeta } from "@/types";
import { JobStatus } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

export interface JobsListResponse {
  jobs: Job[];
  pagination: PaginationMeta;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  category: string;
  location: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  department?: string;
  experienceLevel?: "ENTRY" | "MID" | "SENIOR" | "LEAD";
  salaryRange?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  isRemote?: boolean;
  applicationDeadline?: string;
  openings?: number;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: JobStatus;
}

// ============================================================================
// API CALLS
// ============================================================================

/**
 * Get list of jobs with filters and pagination
 */
export const getJobs = async (
  filters?: JobFilters
): Promise<JobsListResponse> => {
  const params = new URLSearchParams();

  if (filters?.status) params.append("status", filters.status);
  if (filters?.department) params.append("department", filters.department);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.location) params.append("location", filters.location);
  if (filters?.employmentType)
    params.append("employmentType", filters.employmentType);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await api.get<ApiResponse<Job[]>>(
    `/jobs?${params.toString()}`
  );

  const jobs = extractData(response) || [];
  const pagination = extractPagination(response);

  return {
    jobs,
    pagination: pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  };
};

/**
 * Get single job by ID
 */
export const getJob = async (id: string): Promise<Job> => {
  const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
  return extractData(response);
};

/**
 * Create a new job (recruiter+)
 */
export const createJob = async (data: CreateJobRequest): Promise<Job> => {
  const response = await api.post<ApiResponse<Job>>("/jobs", data);
  return extractData(response);
};

/**
 * Update a job (recruiter+)
 */
export const updateJob = async (
  id: string,
  data: UpdateJobRequest
): Promise<Job> => {
  const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}`, data);
  return extractData(response);
};

/**
 * Delete a job (HR manager+)
 */
export const deleteJob = async (id: string): Promise<void> => {
  await api.delete(`/jobs/${id}`);
};

/**
 * Publish a job (recruiter+)
 */
export const publishJob = async (id: string): Promise<Job> => {
  const response = await api.post<ApiResponse<Job>>(`/jobs/${id}/publish`);
  return extractData(response);
};

/**
 * Close a job (recruiter+)
 * Note: This endpoint may not be implemented in the backend
 */
export const closeJob = async (id: string): Promise<Job> => {
  // Use updateJob to change status to CLOSED instead
  return updateJob(id, { status: JobStatus.CLOSED });
};
