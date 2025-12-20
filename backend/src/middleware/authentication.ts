/**
 * Authentication Middleware
 * JWT verification and user loading
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/services/auth.service.js';
import { prisma } from '@/config/database.js';
import { sessionCache } from '@/config/redis.js';
import { logger, logSecurity } from '@/utils/logger.js';
import {
  TokenExpiredError,
  TokenInvalidError,
  AccountInactiveError,
  AuthenticationError,
} from '@/utils/errors.js';
import type { AuthenticatedUser, AuthenticatedRequest } from '@/types/index.js';

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Authenticate request using JWT
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Check session cache first
    let user = await sessionCache.get<AuthenticatedUser>(`session:${payload.sub}`);

    if (!user) {
      // Load user from database
      const dbUser = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
          roles: true,
          clearanceLevel: true,
          department: true,
          isActive: true,
          mfaEnabled: true,
          lastActivityAt: true,
        },
      });

      if (!dbUser) {
        throw new TokenInvalidError('User not found');
      }

      if (!dbUser.isActive) {
        throw new AccountInactiveError();
      }

      user = {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        roles: dbUser.roles,
        clearanceLevel: dbUser.clearanceLevel,
        department: dbUser.department,
        isActive: dbUser.isActive,
        mfaEnabled: dbUser.mfaEnabled,
      };

      // Cache session
      await sessionCache.set(`session:${user.id}`, user, 1800); // 30 minutes
    }

    // Update last activity (async, don't wait)
    prisma.user
      .update({
        where: { id: user.id },
        data: { lastActivityAt: new Date() },
      })
      .catch(err => logger.error('Failed to update last activity', { error: err }));

    // Attach user to request
    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError || error instanceof TokenInvalidError) {
      return next(error);
    }

    if (error instanceof AuthenticationError) {
      logSecurity({
        event: 'AUTHENTICATION_FAILED',
        severity: 'medium',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { error: (error as Error).message },
      });
    }

    next(error);
  }
};

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    // Try to authenticate
    await authenticate(req, res, next);
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Require authentication (throws if not authenticated)
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!(req as AuthenticatedRequest).user) {
    throw new AuthenticationError('Authentication required');
  }
  next();
};
