/**
 * Rate Limiting Middleware
 * Redis-backed rate limiting with different tiers
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '@/config/redis.js';
import { SECURITY } from '@/config/constants.js';
import { RateLimitError } from '@/utils/errors.js';
import { logSecurity } from '@/utils/logger.js';
import type { AuthenticatedRequest } from '@/types/index.js';

// ============================================================================
// RATE LIMIT CONFIGURATIONS
// ============================================================================

/**
 * Create Redis store for rate limiting
 */
const createRedisStore = () => {
  return new RedisStore({
    // @ts-expect-error - Redis client type mismatch
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'ratelimit:',
  });
};

/**
 * General API rate limit
 */
export const apiRateLimit = rateLimit({
  windowMs: SECURITY.RATE_LIMIT.WINDOW_MS,
  max: SECURITY.RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),

  // Key generator (IP + User ID if authenticated)
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user ? `${req.ip}:${authReq.user.id}` : req.ip || 'unknown';
  },

  // Custom handler
  handler: async (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    logSecurity({
      userId: authReq.user?.id,
      event: 'RATE_LIMIT_EXCEEDED',
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        path: req.path,
        method: req.method,
      },
    });

    // Alert on rate limit exceeded
    const { alertRateLimitExceeded } = await import('@/services/alert.service.js');
    const identifier = authReq.user?.id || req.ip || 'unknown';
    await alertRateLimitExceeded(identifier, req.path, SECURITY.RATE_LIMIT.MAX_REQUESTS, req.ip);

    const retryAfter = Math.ceil(SECURITY.RATE_LIMIT.WINDOW_MS / 1000);
    next(new RateLimitError('Rate limit exceeded', retryAfter));
  },

  // Skip successful requests (optional)
  skipSuccessfulRequests: SECURITY.RATE_LIMIT.SKIP_SUCCESSFUL_REQUESTS,

  // Skip failed requests (don't count errors against limit)
  skipFailedRequests: false,
});

/**
 * Strict rate limit for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: SECURITY.RATE_LIMIT.WINDOW_MS,
  max: SECURITY.RATE_LIMIT.AUTH_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),

  keyGenerator: (req: Request): string => {
    // Use email from body if provided, otherwise IP
    const email = req.body?.email;
    return email ? `auth:${email}` : `auth:ip:${req.ip}`;
  },

  handler: (req: Request, _res: Response, next: NextFunction) => {
    logSecurity({
      event: 'AUTH_RATE_LIMIT_EXCEEDED',
      severity: 'high',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        email: req.body?.email,
        path: req.path,
      },
    });

    const retryAfter = Math.ceil(SECURITY.RATE_LIMIT.WINDOW_MS / 1000);
    next(new RateLimitError('Too many authentication attempts', retryAfter));
  },

  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * Lenient rate limit for public endpoints
 */
export const publicRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // More requests allowed
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),

  keyGenerator: (req: Request): string => req.ip || 'unknown',
});

/**
 * Strict rate limit for file uploads
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),

  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user ? `upload:${authReq.user.id}` : `upload:${req.ip}`;
  },

  handler: (req: Request, _res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    logSecurity({
      userId: authReq.user?.id,
      event: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      severity: 'medium',
      ipAddress: req.ip,
    });

    next(new RateLimitError('Upload rate limit exceeded', 3600));
  },
});

/**
 * Custom rate limit for specific operations
 */
export const createCustomRateLimit = (options: {
  windowMs: number;
  max: number;
  prefix: string;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(),

    keyGenerator: (req: Request): string => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id || req.ip;
      return `${options.prefix}:${userId}`;
    },

    handler: (_req: Request, _res: Response, next: NextFunction) => {
      const retryAfter = Math.ceil(options.windowMs / 1000);
      next(new RateLimitError(options.message || 'Rate limit exceeded', retryAfter));
    },
  });
};
