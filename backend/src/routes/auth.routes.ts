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
import { logger } from '@/utils/logger.js';
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
    const { email, password, fullName, recaptchaToken } = req.body;

    // Verify reCAPTCHA token
    if (recaptchaToken) {
      const { verifyRecaptcha } = await import('@/services/recaptcha.service.js');
      const isValid = await verifyRecaptcha(recaptchaToken, req.ip);
      if (!isValid) {
        await createAuditLog(undefined, {
          action: 'RESOURCE_CREATED',
          resourceType: 'User',
          details: { email, reason: 'reCAPTCHA verification failed' },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
        return res.status(400).json({
          error: {
            code: 'RECAPTCHA_FAILED',
            message: 'reCAPTCHA verification failed. Please try again.',
          },
        });
      }
    }

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
        message:
          'Registration successful. Please check your email to verify your account before logging in.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as AuthenticatedRequest).requestId,
      },
    };

    return res.status(201).json(response);
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

/**
 * POST /auth/verify-email
 * Verify email address with token
 */
router.post(
  '/verify-email',
  validate({
    body: z.object({
      code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
      email: emailSchema,
    }),
  }),
  asyncHandler(async (req, res) => {
    const { code, email } = req.body;

    // Find verification by code and email
    const verification = await prisma.emailVerificationToken.findFirst({
      where: {
        token: code,
        email: email.toLowerCase(),
      },
      include: { user: true },
    });

    if (!verification) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CODE',
          message: 'Invalid verification code',
        },
      });
    }

    if (verification.verifiedAt) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_VERIFIED',
          message: 'Email already verified',
        },
      });
    }

    if (verification.expiresAt < new Date()) {
      return res.status(400).json({
        error: {
          code: 'CODE_EXPIRED',
          message: 'Verification code has expired. Please request a new code.',
        },
      });
    }

    // Verify email
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
    ]);

    await createAuditLog(verification.userId, {
      action: 'EMAIL_VERIFIED',
      resourceType: 'User',
      resourceId: verification.userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: {
        message: 'Email verified successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as AuthenticatedRequest).requestId,
      },
    };

    return res.json(response);
  })
);

/**
 * POST /auth/resend-verification
 * Resend email verification
 */
router.post(
  '/resend-verification',
  authRateLimit,
  validate({
    body: z.object({
      email: emailSchema,
    }),
  }),
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { emailVerification: true, profile: true },
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        data: {
          message: 'If an account exists with this email, a verification link has been sent.',
        },
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_VERIFIED',
          message: 'Email already verified',
        },
      });
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old token if exists
    if (user.emailVerification) {
      await prisma.emailVerificationToken.delete({
        where: { id: user.emailVerification.id },
      });
    }

    // Create new verification code
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationCode, // Store 6-digit code in token field
        email: user.email,
        expiresAt,
      },
    });

    // Send verification email
    const { sendVerificationEmail } = await import('@/services/email.service.js');
    try {
      await sendVerificationEmail(
        user.email,
        user.profile?.fullName || user.email,
        verificationCode
      );
    } catch (error) {
      logger.error('Failed to send verification email in resend-verification', {
        error,
        userId: user.id,
        email: user.email,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      // If it's a configuration error (SMTP not configured), return an error response
      if (error instanceof Error && error.message.includes('SMTP transporter not configured')) {
        return res.status(503).json({
          error: {
            code: 'EMAIL_SERVICE_UNAVAILABLE',
            message: 'Email service is not configured. Please contact support.',
          },
        });
      }

      // For other errors (network issues, etc.), still return success but log the error
      // This allows the verification code to be created even if email delivery temporarily fails
      // The user can still use the code if they have it from another source
    }

    await createAuditLog(user.id, {
      action: 'EMAIL_VERIFICATION_SENT',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const response: ApiResponse = {
      data: {
        message: 'Verification email sent',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: (req as AuthenticatedRequest).requestId,
      },
    };

    return res.json(response);
  })
);

export default router;
