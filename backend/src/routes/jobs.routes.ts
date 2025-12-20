/**
 * Job Routes
 * CRUD operations for job postings with authorization
 */

import express from 'express';
import { z } from 'zod';
import { prisma } from '@/config/database.js';
import { authenticate, requireAuth } from '@/middleware/authentication.js';
import { authorize } from '@/middleware/authorization.js';
import { validate, paginationSchema, idParamSchema } from '@/middleware/validation.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { createAuditLog } from '@/services/audit.service.js';
import { ResourceNotFoundError } from '@/utils/errors.js';
import { PERMISSIONS } from '@/config/constants.js';
import type { AuthenticatedRequest, ApiResponse } from '@/types/index.js';
import { Role, ClearanceLevel, JobStatus } from '@prisma/client';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createJobSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(10000),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  category: z.string().min(1),
  location: z.string().min(1),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  department: z.string().optional(),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD']).optional(),
  salaryRange: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('USD'),
  isRemote: z.boolean().default(false),
  applicationDeadline: z.coerce.date().optional(),
  openings: z.number().int().min(1).default(1),
});

const updateJobSchema = createJobSchema.partial();

const jobQuerySchema = paginationSchema.extend({
  status: z.nativeEnum(JobStatus).optional(),
  department: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  search: z.string().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /jobs
 * List all jobs (public, with clearance-based filtering)
 */
router.get(
  '/',
  validate({ query: jobQuerySchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      department,
      category,
      location,
      employmentType,
      search,
    } = req.query;

    // Parse pagination parameters to numbers
    const pageNum = typeof page === 'number' ? page : parseInt(String(page), 10) || 1;
    const limitNum = typeof limit === 'number' ? limit : parseInt(String(limit), 10) || 20;
    const sortByStr = typeof sortBy === 'string' ? sortBy : String(sortBy || 'createdAt');

    const where: any = {};

    // Public users only see OPEN jobs
    if (!authReq.user || !authReq.user.roles.includes(Role.RECRUITER)) {
      where.status = JobStatus.OPEN;
      where.publishedAt = { not: null };
    } else if (status) {
      where.status = status;
    }

    if (department) where.department = department;
    if (category) where.category = category;
    if (location) where.location = location;
    if (employmentType) where.employmentType = employmentType;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { [sortByStr]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    // Filter salary info based on clearance
    const filteredJobs = jobs.map(job => {
      if (authReq.user) {
        // Only include salary fields if user has CONFIDENTIAL clearance
        const hasConfidentialClearance =
          authReq.user.clearanceLevel === ClearanceLevel.CONFIDENTIAL ||
          authReq.user.clearanceLevel === ClearanceLevel.RESTRICTED;

        if (!hasConfidentialClearance) {
          const { salaryRange, salaryMin, salaryMax, ...rest } = job;
          return rest;
        }

        return job;
      }
      // Remove salary for unauthenticated users
      const { salaryRange, salaryMin, salaryMax, ...rest } = job;
      return rest;
    });

    const response: ApiResponse = {
      data: filteredJobs,
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
 * GET /jobs/:id
 * Get single job by ID
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new ResourceNotFoundError('Job', id);
    }

    // Public can only see open jobs
    if (!authReq.user && job.status !== JobStatus.OPEN) {
      throw new ResourceNotFoundError('Job', id);
    }

    // Filter based on clearance
    let filteredJob: any = job;
    if (authReq.user) {
      // Only include salary fields if user has CONFIDENTIAL clearance
      const hasConfidentialClearance =
        authReq.user.clearanceLevel === ClearanceLevel.CONFIDENTIAL ||
        authReq.user.clearanceLevel === ClearanceLevel.RESTRICTED;

      if (!hasConfidentialClearance) {
        const { salaryRange, salaryMin, salaryMax, ...rest } = job;
        filteredJob = rest;
      } else {
        filteredJob = job;
      }
    } else {
      const { salaryRange, salaryMin, salaryMax, ...rest } = job;
      filteredJob = rest;
    }

    // Audit log for authenticated views
    if (authReq.user) {
      await createAuditLog(authReq.user.id, {
        action: 'RESOURCE_VIEWED',
        resourceType: 'Job',
        resourceId: id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    const response: ApiResponse = {
      data: filteredJob,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /jobs
 * Create new job posting
 */
router.post(
  '/',
  authenticate,
  requireAuth,
  authorize({
    roles: [Role.RECRUITER, Role.HR_MANAGER, Role.SYSTEM_ADMIN],
    permissions: [PERMISSIONS.JOB_CREATE],
  }),
  validate({ body: createJobSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;

    const job = await prisma.job.create({
      data: {
        ...req.body,
        ownerId: authReq.user.id,
        status: JobStatus.DRAFT,
      },
    });

    await createAuditLog(authReq.user.id, {
      action: 'RESOURCE_CREATED',
      resourceType: 'Job',
      resourceId: job.id,
      details: { title: job.title },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: job,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.status(201).json(response);
  })
);

/**
 * PATCH /jobs/:id
 * Update job posting
 */
router.patch(
  '/:id',
  authenticate,
  requireAuth,
  authorize({
    roles: [Role.RECRUITER, Role.HR_MANAGER, Role.SYSTEM_ADMIN],
    permissions: [PERMISSIONS.JOB_UPDATE],
  }),
  validate({ params: idParamSchema, body: updateJobSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const existingJob = await prisma.job.findUnique({ where: { id } });

    if (!existingJob) {
      throw new ResourceNotFoundError('Job', id);
    }

    // Check ownership or admin
    const isOwner = existingJob.ownerId === authReq.user.id;
    const isAdmin = authReq.user.roles.includes(Role.SYSTEM_ADMIN);

    if (!isOwner && !isAdmin) {
      throw new ResourceNotFoundError('Job', id);
    }

    const job = await prisma.job.update({
      where: { id },
      data: req.body,
    });

    await createAuditLog(authReq.user.id, {
      action: 'RESOURCE_UPDATED',
      resourceType: 'Job',
      resourceId: id,
      changes: {
        before: existingJob,
        after: job,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: job,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /jobs/:id/publish
 * Publish job (change status to OPEN)
 */
router.post(
  '/:id/publish',
  authenticate,
  requireAuth,
  authorize({
    roles: [Role.RECRUITER, Role.HR_MANAGER, Role.SYSTEM_ADMIN],
    permissions: [PERMISSIONS.JOB_PUBLISH],
  }),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    const job = await prisma.job.update({
      where: { id },
      data: {
        status: JobStatus.OPEN,
        publishedAt: new Date(),
      },
    });

    await createAuditLog(authReq.user.id, {
      action: 'RESOURCE_UPDATED',
      resourceType: 'Job',
      resourceId: id,
      details: { action: 'published' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: job,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * DELETE /jobs/:id
 * Delete job posting
 */
router.delete(
  '/:id',
  authenticate,
  requireAuth,
  authorize({
    roles: [Role.HR_MANAGER, Role.SYSTEM_ADMIN],
    permissions: [PERMISSIONS.JOB_DELETE],
  }),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;

    await prisma.job.delete({ where: { id } });

    await createAuditLog(authReq.user.id, {
      action: 'RESOURCE_DELETED',
      resourceType: 'Job',
      resourceId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: { message: 'Job deleted successfully' },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

export default router;
