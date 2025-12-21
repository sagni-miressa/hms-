/**
 * System Routes
 * Health checks, backup status, system information
 */

import express from 'express';
import { authenticate, requireAuth } from '@/middleware/authentication.js';
import { requireRoles } from '@/middleware/authorization.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { getBackupStatus, backupDatabase, backupRedis } from '@/services/backup.service.js';
import { getSchedulerStatus, triggerTask } from '@/services/scheduler.service.js';
import { checkDatabaseHealth } from '@/config/database.js';
import { checkRedisHealth } from '@/config/redis.js';
import type { AuthenticatedRequest, ApiResponse } from '@/types/index.js';
import { Role } from '@prisma/client';

const router = express.Router();

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /system/health
 * System health check
 */
router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const [dbHealthy, redisHealthy] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    const status = dbHealthy && redisHealthy ? 'healthy' : 'degraded';
    const statusCode = status === 'healthy' ? 200 : 503;

    const response: ApiResponse = {
      data: {
        status,
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealthy,
          redis: redisHealthy,
        },
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'system-health-check',
      },
    };

    res.status(statusCode).json(response);
  })
);

// ============================================================================
// BACKUP STATUS (Admin Only)
// ============================================================================

/**
 * GET /system/backup/status
 * Get backup status and statistics
 */
router.get(
  '/backup/status',
  authenticate,
  requireAuth,
  requireRoles(Role.SYSTEM_ADMIN, Role.HR_MANAGER),
  asyncHandler(async (_req, res) => {
    const status = await getBackupStatus();
    const schedulerStatus = getSchedulerStatus();

    const response: ApiResponse = {
      data: {
        ...status,
        scheduler: schedulerStatus,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (_req as AuthenticatedRequest).requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /system/backup/database
 * Manually trigger database backup
 */
router.post(
  '/backup/database',
  authenticate,
  requireAuth,
  requireRoles(Role.SYSTEM_ADMIN),
  asyncHandler(async (_req, res) => {
    const result = await backupDatabase();

    const response: ApiResponse = {
      data: {
        success: result.success,
        filePath: result.filePath,
        error: result.error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (_req as AuthenticatedRequest).requestId,
      },
    };

    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(response);
  })
);

/**
 * POST /system/backup/redis
 * Manually trigger Redis backup
 */
router.post(
  '/backup/redis',
  authenticate,
  requireAuth,
  requireRoles(Role.SYSTEM_ADMIN),
  asyncHandler(async (_req, res) => {
    const result = await backupRedis();

    const response: ApiResponse = {
      data: {
        success: result.success,
        filePath: result.filePath,
        error: result.error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (_req as AuthenticatedRequest).requestId,
      },
    };

    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(response);
  })
);

/**
 * POST /system/scheduler/trigger/:taskName
 * Manually trigger a scheduled task
 */
router.post(
  '/scheduler/trigger/:taskName',
  authenticate,
  requireAuth,
  requireRoles(Role.SYSTEM_ADMIN),
  asyncHandler(async (req, res) => {
    const { taskName } = req.params;
    const result = await triggerTask(taskName);

    const response: ApiResponse = {
      data: {
        success: result.success,
        error: result.error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as AuthenticatedRequest).requestId,
      },
    };

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(response);
  })
);

export default router;
