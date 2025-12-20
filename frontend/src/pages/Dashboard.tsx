/**
 * Dashboard Page
 * Role-based dashboard with statistics and quick actions
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { getJobs } from "@/services/jobs.service";
import { getApplications } from "@/services/applications.service";
import { Role } from "@/types";

export const DashboardPage = () => {
  const { user, hasRole } = useAuthStore();

  // Fetch recent jobs (for recruiters)
  const { data: recentJobs } = useQuery({
    queryKey: ["jobs", { limit: 5, sortBy: "createdAt", sortOrder: "desc" }],
    queryFn: () =>
      getJobs({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: hasRole(Role.RECRUITER),
  });

  // Fetch applications (for applicants)
  const { data: myApplications } = useQuery({
    queryKey: [
      "applications",
      { limit: 5, sortBy: "createdAt", sortOrder: "desc" },
    ],
    queryFn: () =>
      getApplications({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: hasRole(Role.APPLICANT) && !hasRole(Role.RECRUITER),
  });

  // Fetch all applications (for recruiters)
  const { data: allApplications } = useQuery({
    queryKey: [
      "applications",
      { limit: 10, sortBy: "createdAt", sortOrder: "desc" },
    ],
    queryFn: () =>
      getApplications({ limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
    enabled: hasRole(Role.RECRUITER),
  });

  const isRecruiter = hasRole(Role.RECRUITER) || hasRole(Role.HR_MANAGER);
  const isApplicant = hasRole(Role.APPLICANT) && !isRecruiter;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.email}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Roles</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {user?.roles.map((role) => (
                <span key={role} className="badge badge-info">
                  {role.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Clearance Level</p>
            <p className="font-medium mt-1">
              <span className="badge badge-warning">
                {user?.clearanceLevel}
              </span>
            </p>
          </div>
          {user?.department && (
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium mt-1">{user.department}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isRecruiter && (
          <>
            <Link
              to="/dashboard/jobs/create"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Post New Job
                  </p>
                  <p className="text-sm text-gray-500">Create a job posting</p>
                </div>
              </div>
            </Link>
            <Link
              to="/jobs"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Manage Jobs
                  </p>
                  <p className="text-sm text-gray-500">View all job postings</p>
                </div>
              </div>
            </Link>
          </>
        )}
        <Link
          to="/applications"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">
                {isRecruiter ? "All Applications" : "My Applications"}
              </p>
              <p className="text-sm text-gray-500">View applications</p>
            </div>
          </div>
        </Link>
        {isApplicant && (
          <Link
            to="/jobs"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Browse Jobs</p>
                <p className="text-sm text-gray-500">Find opportunities</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs (Recruiters) */}
        {isRecruiter && recentJobs && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Job Postings</h2>
              <Link
                to="/jobs"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </Link>
            </div>
            {recentJobs.jobs.length === 0 ? (
              <p className="text-gray-500">No jobs posted yet.</p>
            ) : (
              <div className="space-y-4">
                {recentJobs.jobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.location} • {job.employmentType.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Applications (Applicants) */}
        {isApplicant && myApplications && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Recent Applications</h2>
              <Link
                to="/applications"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </Link>
            </div>
            {myApplications.applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You haven't applied to any jobs yet.
                </p>
                <Link to="/jobs" className="btn-primary">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.applications.map((application) => (
                  <Link
                    key={application.id}
                    to={`/applications/${application.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {application.job?.title || "Job Application"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied{" "}
                          {new Date(
                            application.submittedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          application.status === "ACCEPTED"
                            ? "badge-success"
                            : application.status === "REJECTED"
                              ? "badge-error"
                              : "badge-info"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Applications (Recruiters) */}
        {isRecruiter && allApplications && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Applications</h2>
              <Link
                to="/applications"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View All
              </Link>
            </div>
            {allApplications.applications.length === 0 ? (
              <p className="text-gray-500">No applications yet.</p>
            ) : (
              <div className="space-y-4">
                {allApplications.applications.slice(0, 5).map((application) => (
                  <Link
                    key={application.id}
                    to={`/applications/${application.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {application.job?.title || "Application"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {application.applicant?.profile?.fullName ||
                            application.applicant?.email ||
                            "Unknown Applicant"}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          application.status === "ACCEPTED"
                            ? "badge-success"
                            : application.status === "REJECTED"
                              ? "badge-error"
                              : "badge-info"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
