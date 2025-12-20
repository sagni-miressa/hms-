/**
 * Applications Page
 * View and manage job applications
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getApplications } from "@/services/applications.service";
import { useAuthStore } from "@/stores/authStore";
import type { ApplicationFilters, ApplicationStatus } from "@/types";
import { Role } from "@/types";

const statusLabels: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  OFFERED: "Offered",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: "badge-info",
  REVIEWING: "badge-warning",
  SHORTLISTED: "badge-success",
  INTERVIEWING: "badge-primary",
  OFFERED: "badge-success",
  ACCEPTED: "badge-success",
  REJECTED: "badge-error",
  WITHDRAWN: "badge-ghost",
};

export const ApplicationsPage = () => {
  const { hasRole } = useAuthStore();
  const [filters, setFilters] = useState<ApplicationFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["applications", filters],
    queryFn: () => getApplications(filters),
  });

  const handleFilterChange = (key: keyof ApplicationFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isRecruiter = hasRole(Role.RECRUITER) || hasRole(Role.HR_MANAGER);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isRecruiter ? "All Applications" : "My Applications"}
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange("status", e.target.value || undefined)
              }
              className="input w-full"
            >
              <option value="">All Statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Job Filter (for recruiters) */}
          {isRecruiter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job ID
              </label>
              <input
                type="text"
                placeholder="Filter by job ID"
                value={filters.jobId || ""}
                onChange={(e) =>
                  handleFilterChange("jobId", e.target.value || undefined)
                }
                className="input w-full"
              />
            </div>
          )}

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                handleFilterChange("sortBy", sortBy);
                handleFilterChange("sortOrder", sortOrder as "asc" | "desc");
              }}
              className="input w-full"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="status-asc">Status A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading applications...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Failed to load applications.</p>
        </div>
      )}

      {/* Applications List */}
      {data && (
        <>
          {data.applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No applications found</p>
              <p className="text-gray-500 mt-2">
                {isRecruiter
                  ? "No applications match your filters."
                  : "You haven't applied to any jobs yet."}
              </p>
              {!isRecruiter && (
                <Link to="/jobs" className="btn-primary mt-4">
                  Browse Jobs
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job
                      </th>
                      {isRecruiter && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.applications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {application.job ? (
                            <Link
                              to={`/jobs/${application.job.id}`}
                              className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                              {application.job.title}
                            </Link>
                          ) : (
                            <span className="text-gray-500">
                              Job ID: {application.jobId}
                            </span>
                          )}
                        </td>
                        {isRecruiter && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {application.applicant ? (
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {application.applicant.profile?.fullName ||
                                    application.applicant.email}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {application.applicant.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-500">Unknown</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`badge ${statusColors[application.status]}`}
                          >
                            {statusLabels[application.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            application.submittedAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/applications/${application.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(data.pagination.page - 1)}
                      disabled={!data.pagination.hasPrevious}
                      className="btn-ghost disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="flex items-center px-4">
                      Page {data.pagination.page} of{" "}
                      {data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(data.pagination.page + 1)}
                      disabled={!data.pagination.hasNext}
                      className="btn-ghost disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
