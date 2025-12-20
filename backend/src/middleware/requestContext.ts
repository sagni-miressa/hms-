/**
 * Request Context Middleware
 * Add request ID, timing, and logging
 */

import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { logRequest } from '@/utils/logger.js';
import type { AuthenticatedRequest } from '@/types/index.js';

// ============================================================================
// REQUEST CONTEXT MIDDLEWARE
// ============================================================================

/**
 * Add request ID and timing
 */
export const requestContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest;
  
  // Generate request ID
  authReq.requestId = req.headers['x-request-id'] as string || nanoid();
  authReq.startTime = Date.now();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', authReq.requestId);
  
  // Log request completion
  res.on('finish', () => {
    const duration = Date.now() - authReq.startTime;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    
    logRequest(level, 'Request completed', {
      requestId: authReq.requestId,
      method: req.method,
      path: req.path,
      userId: authReq.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      statusCode: res.statusCode,
      duration,
    });
  });
  
  next();
};

/**
 * Log incoming request
 */
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest;
  
  logRequest('info', 'Incoming request', {
    requestId: authReq.requestId,
    method: req.method,
    path: req.path,
    userId: authReq.user?.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  next();
};

