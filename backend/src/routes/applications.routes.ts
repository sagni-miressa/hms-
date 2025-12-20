/**
 * Application Routes
 * Job application management with complex authorization
 */

import express from 'express';
import { z } from 'zod';
import { prisma } from '@/config/database.js';
import { authenticate, requireAuth } from '@/middleware/authentication.js';
import { authorize } from '@/middleware/authorization.js';
import { validate, paginationSchema, idParamSchema } from '@/middleware/validation.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { checkDepartmentAccess } from '@/services/authorization.service.js';
import { createAuditLog } from '@/services/audit.service.js';
import { ResourceNotFoundError, AuthorizationError } from '@/utils/errors.js';
import { PERMISSIONS } from '@/config/constants.js';
import type { AuthenticatedRequest, ApiResponse } from '@/types/index.js';
import { Role, ClearanceLevel, ApplicationStatus } from '@prisma/client';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createApplicationSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().max(5000).optional(),
  answers: z.record(z.any()).optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  rejectionReason: z.string().optional(),
});

const addFeedbackSchema = z.object({
  feedback: z.string().max(2000),
  rating: z.number().int().min(1).max(5),
  recommend: z.boolean(),
  notes: z.record(z.any()).optional(),
});

const makeOfferSchema = z.object({
  offeredSalary: z.number().positive(),
  offerDetails: z.record(z.any()).optional(),
});

const applicationQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(ApplicationStatus).optional(),
  jobId: z.string().optional(),
  applicantId: z.string().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /applications
 * List applications (filtered by role)
 */
router.get(
  '/',
  authenticate,
  requireAuth,
  validate({ query: applicationQuerySchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      jobId,
      applicantId,
    } = req.query;

    // Parse pagination parameters to numbers
    const pageNum = typeof page === 'number' ? page : parseInt(String(page), 10) || 1;
    const limitNum = typeof limit === 'number' ? limit : parseInt(String(limit), 10) || 20;
    const sortByStr = typeof sortBy === 'string' ? sortBy : String(sortBy || 'createdAt');

    const where: any = {};

    // Applicants see only their own applications
    if (
      authReq.user.roles.includes(Role.APPLICANT) &&
      !authReq.user.roles.includes(Role.RECRUITER)
    ) {
      where.applicantId = authReq.user.id;
    }

    // Filter by department for recruiters
    if (
      authReq.user.roles.includes(Role.RECRUITER) &&
      !authReq.user.roles.includes(Role.SYSTEM_ADMIN)
    ) {
      // Get jobs in user's department
      const jobs = await prisma.job.findMany({
        where: { department: authReq.user.department || undefined },
        select: { id: true },
      });
      where.jobId = { in: jobs.map(j => j.id) };
    }

    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (applicantId && authReq.user.roles.includes(Role.RECRUITER)) {
      where.applicantId = applicantId;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { [sortByStr]: sortOrder },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              category: true,
            },
          },
          applicant: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  phone: true,
                },
              },
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    // Filter sensitive fields based on clearance
    const filteredApps = applications.map(app => {
      const isOwnApplication = app.applicantId === authReq.user.id;
      const hasConfidentialClearance =
        authReq.user.clearanceLevel === ClearanceLevel.CONFIDENTIAL ||
        authReq.user.clearanceLevel === ClearanceLevel.RESTRICTED;

      // Remove offer details if not confidential clearance and not own application
      if (!hasConfidentialClearance && !isOwnApplication) {
        const { offeredSalary, offerDetails, ...rest } = app;
        return rest;
      }

      // Remove internal notes for applicants
      if (isOwnApplication && !authReq.user.roles.includes(Role.RECRUITER)) {
        const { internalNotes, rating, ...rest } = app;
        return rest;
      }

      return app;
    });

    const response: ApiResponse = {
      data: filteredApps,
      meta: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrevious: pageNum > 1,
        },
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * GET /applications/:id
 * Get single application
 */
router.get(
  '/:id',
  authenticate,
  requireAuth,
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        applicant: {
          include: {
            profile: true,
          },
        },
        interviewPanels: {
          include: {
            interviewer: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new ResourceNotFoundError('Application', id);
    }

    // Authorization check
    const isOwnApplication = application.applicantId === authReq.user.id;
    const isRecruiter =
      authReq.user.roles.includes(Role.RECRUITER) ||
      authReq.user.roles.includes(Role.HR_MANAGER) ||
      authReq.user.roles.includes(Role.SYSTEM_ADMIN);

    if (!isOwnApplication && !isRecruiter) {
      throw new ResourceNotFoundError('Application', id);
    }

    // Department check for recruiters
    if (isRecruiter && !checkDepartmentAccess(authReq.user, application.job.department)) {
      throw new AuthorizationError('Access denied to this department');
    }

    // Filter sensitive data
    let filteredApp: any = application;
    const hasConfidentialClearance =
      authReq.user.clearanceLevel === ClearanceLevel.CONFIDENTIAL ||
      authReq.user.clearanceLevel === ClearanceLevel.RESTRICTED;

    if (!hasConfidentialClearance && !isOwnApplication) {
      const { offeredSalary, offerDetails, ...rest } = application;
      filteredApp = rest;
    }

    if (isOwnApplication && !isRecruiter) {
      const { internalNotes, rating, ...rest } = filteredApp;
      filteredApp = rest;
    }

    await createAuditLog(authReq.user.id, {
      action: 'RESOURCE_VIEWED',
      resourceType: 'Application',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: filteredApp,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /applications
 * Create new application (apply to job)
 */
router.post(
  '/',
  authenticate,
  requireAuth,
  validate({ body: createApplicationSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { jobId, coverLetter, answers } = req.body;

    // Check if job exists and is open
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job || job.status !== 'OPEN') {
      throw new ResourceNotFoundError('Job', jobId);
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: authReq.user.id,
      },
    });

    if (existing) {
      throw new AuthorizationError('Already applied to this job');
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: authReq.user.id,
        coverLetter,
        answers,
        status: ApplicationStatus.SUBMITTED,
      },
    });

    await createAuditLog(authReq.user.id, {
      action: 'APPLICATION_SUBMITTED',
      resourceType: 'Application',
      resourceId: application.id,
      details: { jobId, jobTitle: job.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: application,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.status(201).json(response);
  })
);

/**
 * PATCH /applications/:id/status
 * Update application status
 */
router.patch(
  '/:id/status',
  authenticate,
  requireAuth,
  authorize({
    roles: [Role.RECRUITER, Role.HR_MANAGER, Role.SYSTEM_ADMIN],
    permissions: [PERMISSIONS.APPLICATION_CHANGE_STATUS],
  }),
  validate({ params: idParamSchema, body: updateStatusSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new ResourceNotFoundError('Application', id);
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === ApplicationStatus.REJECTED ? rejectionReason : undefined,
      },
    });

    await createAuditLog(authReq.user.id, {
      action: 'APPLICATION_STATUS_CHANGED',
      resourceType: 'Application',
      resourceId: id,
      changes: {
        before: { status: application.status },
        after: { status },
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: updated,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /applications/:id/feedback
 * Submit interview feedback
 */
router.post(
  '/:id/feedback',
  authenticate,
  requireAuth,
  authorize({
    roles: [Role.INTERVIEWER, Role.RECRUITER, Role.HR_MANAGER, Role.SYSTEM_ADMIN],
    permissions: [PERMISSIONS.APPLICATION_SUBMIT_FEEDBACK],
  }),
  validate({ params: idParamSchema, body: addFeedbackSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { feedback, rating, recommend, notes } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new ResourceNotFoundError('Application', id);
    }

    // Create or update interview panel entry
    const panel = await prisma.interviewPanel.upsert({
      where: {
        applicationId_interviewerId: {
          applicationId: id,
          interviewerId: authReq.user.id,
        },
      },
      create: {
        applicationId: id,
        interviewerId: authReq.user.id,
        feedback,
        rating,
        recommend,
        notes,
        completedAt: new Date(),
      },
      update: {
        feedback,
        rating,
        recommend,
        notes,
        completedAt: new Date(),
      },
    });

    await createAuditLog(authReq.user.id, {
      action: 'FEEDBACK_SUBMITTED',
      resourceType: 'Application',
      resourceId: id,
      details: { rating, recommend },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: panel,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /applications/:id/offer
 * Make job offer
 */
router.post(
  '/:id/offer',
  authenticate,
  requireAuth,
  authorize({
    roles: [Role.HR_MANAGER, Role.SYSTEM_ADMIN],
    clearance: ClearanceLevel.CONFIDENTIAL,
    permissions: [PERMISSIONS.APPLICATION_MAKE_OFFER],
  }),
  validate({ params: idParamSchema, body: makeOfferSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const { offeredSalary, offerDetails } = req.body;

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.OFFERED,
        offeredSalary,
        offerDetails,
        offerSentAt: new Date(),
      },
    });

    await createAuditLog(authReq.user.id, {
      action: 'OFFER_MADE',
      resourceType: 'Application',
      resourceId: id,
      details: { offeredSalary },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: application,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

export default router;
