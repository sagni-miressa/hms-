/**
 * Global Error Handler Middleware
 * Comprehensive error handling with security considerations
 */

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '@/utils/errors.js';
import { logError } from '@/utils/logger.js';
import type { ApiError, ApiResponse, AuthenticatedRequest } from '@/types/index.js';
import { ERROR_CODES } from '@/config/constants.js';

// ============================================================================
// ERROR HANDLER
// ============================================================================

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest;

  // Log error
  logError(error, {
    requestId: authReq.requestId,
    userId: authReq.user?.id,
    path: req.path,
  });

  // Handle AppError (our custom errors)
  if (error instanceof AppError) {
    const apiError: ApiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      requestId: authReq.requestId,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      apiError.stack = error.stack;
    }

    const response: ApiResponse = {
      error: apiError,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: authReq.requestId,
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, req, res);
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    const response: ApiResponse = {
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Database validation error',
        requestId: authReq.requestId,
      },
    };
    res.status(StatusCodes.BAD_REQUEST).json(response);
    return;
  }

  // Handle validation errors from Zod or other libraries
  if ('issues' in error && Array.isArray((error as any).issues)) {
    const response: ApiResponse = {
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: (error as any).issues,
        requestId: authReq.requestId,
      },
    };
    res.status(StatusCodes.BAD_REQUEST).json(response);
    return;
  }

  // Default to 500 for unhandled errors
  const response: ApiResponse = {
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message:
        process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
      requestId: authReq.requestId,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
  };

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
};

// ============================================================================
// PRISMA ERROR HANDLER
// ============================================================================

const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response
): void => {
  const authReq = req as AuthenticatedRequest;
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let code: string = ERROR_CODES.DATABASE_ERROR;
  let message = 'Database error';
  let details: any = undefined;

  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      statusCode = StatusCodes.CONFLICT;
      code = ERROR_CODES.DUPLICATE_ENTRY;
      message = 'Resource already exists';
      details = {
        field: (error.meta?.target as string[])?.join(', '),
      };
      break;

    case 'P2025':
      // Record not found
      statusCode = StatusCodes.NOT_FOUND;
      code = ERROR_CODES.RESOURCE_NOT_FOUND;
      message = 'Resource not found';
      break;

    case 'P2003':
      // Foreign key constraint failed
      statusCode = StatusCodes.BAD_REQUEST;
      code = ERROR_CODES.VALIDATION_ERROR;
      message = 'Invalid reference to related resource';
      break;

    case 'P2014':
      // Required relation violation
      statusCode = StatusCodes.BAD_REQUEST;
      code = ERROR_CODES.VALIDATION_ERROR;
      message = 'Invalid relation';
      break;

    default:
      // Generic database error
      if (process.env.NODE_ENV === 'development') {
        details = { prismaCode: error.code, meta: error.meta };
      }
  }

  const response: ApiResponse = {
    error: {
      code,
      message,
      details,
      requestId: authReq.requestId,
    },
  };

  res.status(statusCode).json(response);
};

// ============================================================================
// NOT FOUND HANDLER
// ============================================================================

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;

  const response: ApiResponse = {
    error: {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `Route not found: ${req.method} ${req.path}`,
      requestId: authReq.requestId,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: authReq.requestId,
    },
  };

  res.status(StatusCodes.NOT_FOUND).json(response);
};

// ============================================================================
// ASYNC ERROR WRAPPER
// ============================================================================

/**
 * Wrap async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
