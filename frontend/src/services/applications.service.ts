/**
 * Applications Service
 * API calls for application management
 */

import { api, extractData, extractPagination, ApiResponse } from "@/lib/api";
import type { Application, ApplicationFilters, PaginationMeta } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

export interface ApplicationsListResponse {
  applications: Application[];
  pagination: PaginationMeta;
}

export interface CreateApplicationRequest {
  jobId: string;
  coverLetter?: string;
  answers?: Record<string, any>;
}

export interface UpdateApplicationStatusRequest {
  status:
    | "PENDING"
    | "REVIEWING"
    | "SHORTLISTED"
    | "INTERVIEWING"
    | "OFFERED"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN";
  rejectionReason?: string;
}

export interface AddFeedbackRequest {
  feedback: string;
  rating: number;
  recommend: boolean;
  notes?: Record<string, any>;
}

export interface MakeOfferRequest {
  offeredSalary: number;
  offerDetails?: Record<string, any>;
}

// ============================================================================
// API CALLS
// ============================================================================

/**
 * Get list of applications with filters and pagination
 */
export const getApplications = async (
  filters?: ApplicationFilters
): Promise<ApplicationsListResponse> => {
  const params = new URLSearchParams();

  if (filters?.status) params.append("status", filters.status);
  if (filters?.jobId) params.append("jobId", filters.jobId);
  if (filters?.applicantId) params.append("applicantId", filters.applicantId);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await api.get<ApiResponse<Application[]>>(
    `/applications?${params.toString()}`
  );

  const applications = extractData(response) || [];
  const pagination = extractPagination(response);

  return {
    applications,
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
 * Get single application by ID
 */
export const getApplication = async (id: string): Promise<Application> => {
  const response = await api.get<ApiResponse<{ application: Application }>>(
    `/applications/${id}`
  );
  return extractData(response).application;
};

/**
 * Create a new application (apply to job)
 */
export const createApplication = async (
  data: CreateApplicationRequest
): Promise<Application> => {
  const response = await api.post<ApiResponse<{ application: Application }>>(
    "/applications",
    data
  );
  return extractData(response).application;
};

/**
 * Update application status (recruiter+)
 */
export const updateApplicationStatus = async (
  id: string,
  data: UpdateApplicationStatusRequest
): Promise<Application> => {
  const response = await api.patch<ApiResponse<{ application: Application }>>(
    `/applications/${id}/status`,
    data
  );
  return extractData(response).application;
};

/**
 * Add feedback to application (interviewer+)
 */
export const addFeedback = async (
  id: string,
  data: AddFeedbackRequest
): Promise<Application> => {
  const response = await api.post<ApiResponse<{ application: Application }>>(
    `/applications/${id}/feedback`,
    data
  );
  return extractData(response).application;
};

/**
 * Make an offer (HR manager+)
 */
export const makeOffer = async (
  id: string,
  data: MakeOfferRequest
): Promise<Application> => {
  const response = await api.post<ApiResponse<{ application: Application }>>(
    `/applications/${id}/offer`,
    data
  );
  return extractData(response).application;
};

/**
 * Withdraw application (applicant)
 */
export const withdrawApplication = async (id: string): Promise<void> => {
  await api.post(`/applications/${id}/withdraw`);
};
