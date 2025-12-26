/**
 * Job Detail Page
 * View job details and apply
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getJob } from '@/services/jobs.service';
import { createApplication } from '@/services/applications.service';
import { useAuthStore } from '@/stores/authStore';
import { Role } from '@/types';

const applicationSchema = z.object({
  coverLetter: z.string().max(5000).optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, hasRole } = useAuthStore();
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
  });

  const applyMutation = useMutation({
    mutationFn: (data: ApplicationForm) =>
      createApplication({
        jobId: id!,
        coverLetter: data.coverLetter,
      }),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      reset();
      setShowApplyForm(false);
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error?.message || 'Failed to submit application';
      toast.error(message);
    },
  });

  const onSubmit = (data: ApplicationForm) => {
    if (!isAuthenticated) {
      toast.error('Please login to apply');
      navigate('/login', { state: { returnTo: `/jobs/${id}` } });
      return;
    }
    applyMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Job Not Found
          </h2>
          <p className="text-red-600 mb-4">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/jobs" className="btn-primary">
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const canViewSalary =
    hasRole(Role.HR_MANAGER) ||
    hasRole(Role.SYSTEM_ADMIN) ||
    job.salaryRange === null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/jobs"
        className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center"
      >
        ← Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
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
              </span>
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
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
                {job.employmentType.replace('_', ' ')}
              </span>
              {job.isRemote && (
                <span className="badge badge-success">Remote</span>
              )}
            </div>
          </div>
        </div>

        {/* Job Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{job.category}</p>
          </div>
          {job.department && (
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{job.department}</p>
            </div>
          )}
          {job.experienceLevel && (
            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="font-medium">{job.experienceLevel}</p>
            </div>
          )}
          {canViewSalary && job.salaryMin && job.salaryMax && (
            <div>
              <p className="text-sm text-gray-500">Salary Range</p>
              <p className="font-medium">
                ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Apply Button */}
        {job.status === 'OPEN' && (
          <div className="mt-6 pt-6 border-t">
            {isAuthenticated ? (
              !showApplyForm ? (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="btn-primary"
                >
                  Apply Now
                </button>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      {...register('coverLetter')}
                      rows={6}
                      className="input w-full"
                      placeholder="Tell us why you're interested in this position..."
                    />
                    {errors.coverLetter && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.coverLetter.message}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={applyMutation.isPending}
                      className="btn-primary"
                    >
                      {applyMutation.isPending
                        ? 'Submitting...'
                        : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowApplyForm(false);
                        reset();
                      }}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )
            ) : (
              <Link to="/login" state={{ returnTo: `/jobs/${id}` }} className="btn-primary">
                Login to Apply
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Job Description
        </h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Requirements
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Responsibilities
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {job.responsibilities}
            </p>
          </div>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Benefits
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{job.benefits}</p>
          </div>
        </div>
      )}

      {/* Application Deadline */}
      {job.applicationDeadline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Application Deadline:</strong>{' '}
            {new Date(job.applicationDeadline).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};
