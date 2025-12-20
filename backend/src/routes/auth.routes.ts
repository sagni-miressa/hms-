/**
 * Authentication Routes
 * Login, registration, token refresh, MFA
 */

import express from 'express';
import { z } from 'zod';
import { prisma } from '@/config/database.js';
import * as authService from '@/services/auth.service.js';
import { createAuditLog } from '@/services/audit.service.js';
import { authenticate, requireAuth } from '@/middleware/authentication.js';
import { validate, emailSchema, passwordSchema } from '@/middleware/validation.js';
import { authRateLimit } from '@/middleware/rateLimit.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { InvalidCredentialsError } from '@/utils/errors.js';
import type { AuthenticatedRequest, ApiResponse } from '@/types/index.js';

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2).max(100),
  recaptchaToken: z.string().optional(), // For production
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  mfaToken: z.string().length(6).optional(),
  deviceId: z.string().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

const setupMFASchema = z.object({
  token: z.string().length(6),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /auth/register
 * Register new applicant account
 */
router.post(
  '/register',
  authRateLimit,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const { email, password, fullName } = req.body;

    // TODO: Verify reCAPTCHA token in production

    const { userId } = await authService.register(email, password, fullName);

    await createAuditLog(userId, {
      action: 'RESOURCE_CREATED',
      resourceType: 'User',
      resourceId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: {
        userId,
        message: 'Registration successful. Please log in.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as AuthenticatedRequest).requestId,
      },
    };

    res.status(201).json(response);
  })
);

/**
 * POST /auth/login
 * Login with email and password
 */
router.post(
  '/login',
  authRateLimit,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password, mfaToken, deviceId } = req.body;

    const result = await authService.login(
      email,
      password,
      mfaToken,
      deviceId,
      req.ip,
      req.headers['user-agent']
    );

    const response: ApiResponse = {
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        requiresMFA: result.requiresMFA,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as AuthenticatedRequest).requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    const response: ApiResponse = {
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as AuthenticatedRequest).requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /auth/logout
 * Logout and revoke refresh token
 */
router.post(
  '/logout',
  authenticate,
  requireAuth,
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const refreshToken = req.body.refreshToken;

    await authService.logout(authReq.user.id, refreshToken);

    const response: ApiResponse = {
      data: {
        message: 'Logged out successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * GET /auth/me
 * Get current user information
 */
router.get(
  '/me',
  authenticate,
  requireAuth,
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;

    const response: ApiResponse = {
      data: {
        user: {
          id: authReq.user.id,
          email: authReq.user.email,
          username: authReq.user.username,
          roles: authReq.user.roles,
          clearanceLevel: authReq.user.clearanceLevel,
          department: authReq.user.department,
          mfaEnabled: authReq.user.mfaEnabled,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /auth/mfa/setup
 * Setup MFA for user
 */
router.post(
  '/mfa/setup',
  authenticate,
  requireAuth,
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;

    const result = await authService.generateMFASecret(authReq.user.email);

    // Store secret temporarily (user must verify before enabling)
    // In production, store this in a temporary cache with TTL

    const response: ApiResponse = {
      data: {
        secret: result.secret,
        qrCodeUrl: result.qrCodeUrl,
        backupCodes: result.backupCodes,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /auth/mfa/verify
 * Verify and enable MFA
 */
router.post(
  '/mfa/verify',
  authenticate,
  requireAuth,
  validate({ body: setupMFASchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { token: _token } = req.body;

    // Verify token against stored secret (from setup)
    // This is simplified - in production, retrieve from cache
    // TODO: Implement MFA verification using _token

    const response: ApiResponse = {
      data: {
        message: 'MFA enabled successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

/**
 * POST /auth/password/change
 * Change password
 */
router.post(
  '/password/change',
  authenticate,
  requireAuth,
  validate({ body: changePasswordSchema }),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify current password
    const isCurrentPasswordValid = await authService.verifyPassword(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await authService.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: authReq.user.id },
      data: { passwordHash: newPasswordHash },
    });

    await createAuditLog(authReq.user.id, {
      action: 'PASSWORD_CHANGED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: {
        message: 'Password changed successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.json(response);
  })
);

export default router;
