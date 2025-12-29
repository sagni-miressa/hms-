/**
 * Jobs Page
 * List all available jobs with filters and pagination
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getJobs } from "@/services/jobs.service";
import type { JobFilters } from "@/types";
import { Role } from "@/types";
import { useAuthStore } from "@/stores/authStore";

export const JobsPagePublic = () => {
  const { hasRole } = useAuthStore();
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => getJobs(filters),
  });

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Available Positions
        </h1>
        {hasRole(Role.RECRUITER) && (
          <Link to="/dashboard/jobs/create" className="btn-primary">
            Post New Job
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              placeholder="Category"
              value={filters.category || ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="Location"
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Type
            </label>
            <select
              value={filters.employmentType || ""}
              onChange={(e) =>
                handleFilterChange(
                  "employmentType",
                  e.target.value || undefined
                )
              }
              className="input w-full"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          {/* Department (for recruiters) */}
          {hasRole(Role.RECRUITER) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                placeholder="Department"
                value={filters.department || ""}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
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
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(filters.search ||
          filters.category ||
          filters.location ||
          filters.employmentType ||
          filters.department) && (
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading jobs...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Failed to load jobs. Please try again.</p>
          <button onClick={() => refetch()} className="btn-primary mt-2">
            Retry
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      {data && (
        <>
          {data.jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No jobs found</p>
              <p className="text-gray-500 mt-2">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <Pagination
                  pagination={data.pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// JOB CARD COMPONENT
// ============================================================================

interface JobCardProps {
  job: any;
}

const JobCard = ({ job }: JobCardProps) => {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          {job.title}
        </h3>
        {job.isRemote && (
          <span className="badge badge-success ml-2">Remote</span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {job.location}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {job.employmentType.replace("_", " ")}
        </div>

        {job.category && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="badge badge-info">{job.category}</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
        {job.description}
      </p>

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-sm text-gray-500">
          {job._count?.applications || 0} applications
        </span>
        <span className="text-primary-600 font-medium text-sm">
          View Details →
        </span>
      </div>
    </Link>
  );
};

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

interface PaginationProps {
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
  let end = Math.min(pagination.totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={!pagination.hasPrevious}
        className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="btn-ghost">
            1
          </button>
          {start > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn-ghost ${
            page === pagination.page ? "bg-primary-600 text-white" : ""
          }`}
        >
          {page}
        </button>
      ))}

      {end < pagination.totalPages && (
        <>
          {end < pagination.totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(pagination.totalPages)}
            className="btn-ghost"
          >
            {pagination.totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={!pagination.hasNext}
        className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};
