/**
 * Custom Error Classes
 * Standardized error handling with proper HTTP status codes
 */

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/config/constants.js';

// ============================================================================
// BASE ERROR CLASS
// ============================================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;
  
  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    code: string = ERROR_CODES.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// AUTHENTICATION ERRORS
// ============================================================================

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code: string = ERROR_CODES.INVALID_CREDENTIALS, details?: any) {
    super(message, StatusCodes.UNAUTHORIZED, code, true, details);
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message: string = 'Invalid email or password') {
    super(message, ERROR_CODES.INVALID_CREDENTIALS);
  }
}

export class AccountLockedError extends AuthenticationError {
  constructor(message: string = 'Account is locked', lockedUntil?: Date) {
    super(message, ERROR_CODES.ACCOUNT_LOCKED, { lockedUntil });
  }
}

export class AccountInactiveError extends AuthenticationError {
  constructor(message: string = 'Account is inactive') {
    super(message, ERROR_CODES.ACCOUNT_INACTIVE);
  }
}

export class MFARequiredError extends AuthenticationError {
  constructor(message: string = 'MFA verification required') {
    super(message, ERROR_CODES.MFA_REQUIRED);
  }
}

export class InvalidMFACodeError extends AuthenticationError {
  constructor(message: string = 'Invalid MFA code') {
    super(message, ERROR_CODES.INVALID_MFA_CODE);
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message: string = 'Token has expired') {
    super(message, ERROR_CODES.TOKEN_EXPIRED);
  }
}

export class TokenInvalidError extends AuthenticationError {
  constructor(message: string = 'Invalid token') {
    super(message, ERROR_CODES.TOKEN_INVALID);
  }
}

// ============================================================================
// AUTHORIZATION ERRORS
// ============================================================================

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', code: string = ERROR_CODES.INSUFFICIENT_PERMISSIONS, details?: any) {
    super(message, StatusCodes.FORBIDDEN, code, true, details);
  }
}

export class InsufficientPermissionsError extends AuthorizationError {
  constructor(message: string = 'Insufficient permissions', requiredPermission?: string) {
    super(message, ERROR_CODES.INSUFFICIENT_PERMISSIONS, { requiredPermission });
  }
}

export class InsufficientClearanceError extends AuthorizationError {
  constructor(message: string = 'Insufficient clearance level', requiredClearance?: string) {
    super(message, ERROR_CODES.INSUFFICIENT_CLEARANCE, { requiredClearance });
  }
}

export class InsufficientRoleError extends AuthorizationError {
  constructor(message: string = 'Insufficient role', requiredRoles?: string[]) {
    super(message, ERROR_CODES.INSUFFICIENT_ROLE, { requiredRoles });
  }
}

export class DACAccessDeniedError extends AuthorizationError {
  constructor(message: string = 'Access to resource denied') {
    super(message, ERROR_CODES.NO_DAC_ACCESS);
  }
}

export class ABACDeniedError extends AuthorizationError {
  constructor(message: string = 'Attribute-based access control denied', reason?: string) {
    super(message, ERROR_CODES.ABAC_DENIED, { reason });
  }
}

export class RuleViolationError extends AuthorizationError {
  constructor(message: string = 'Rule-based access control violation', rule?: string) {
    super(message, ERROR_CODES.RULE_VIOLATION, { rule });
  }
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, StatusCodes.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true, details);
  }
}

export class InvalidInputError extends ValidationError {
  constructor(message: string = 'Invalid input', field?: string) {
    super(message, { field });
  }
}

export class DuplicateEntryError extends ValidationError {
  constructor(message: string = 'Resource already exists', field?: string) {
    super(message, { field, code: ERROR_CODES.DUPLICATE_ENTRY });
  }
}

// ============================================================================
// RESOURCE ERRORS
// ============================================================================

export class ResourceError extends AppError {
  constructor(
    message: string,
    statusCode: number = StatusCodes.NOT_FOUND,
    code: string = ERROR_CODES.RESOURCE_NOT_FOUND,
    details?: any
  ) {
    super(message, statusCode, code, true, details);
  }
}

export class ResourceNotFoundError extends ResourceError {
  constructor(resource: string = 'Resource', id?: string) {
    super(
      `${resource} not found${id ? `: ${id}` : ''}`,
      StatusCodes.NOT_FOUND,
      ERROR_CODES.RESOURCE_NOT_FOUND,
      { resource, id }
    );
  }
}

export class ResourceAlreadyExistsError extends ResourceError {
  constructor(resource: string = 'Resource', details?: any) {
    super(
      `${resource} already exists`,
      StatusCodes.CONFLICT,
      ERROR_CODES.RESOURCE_ALREADY_EXISTS,
      details
    );
  }
}

export class ResourceConflictError extends ResourceError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, StatusCodes.CONFLICT, ERROR_CODES.RESOURCE_CONFLICT, details);
  }
}

// ============================================================================
// RATE LIMITING ERRORS
// ============================================================================

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(
      message,
      StatusCodes.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      true,
      { retryAfter }
    );
  }
}

// ============================================================================
// FILE UPLOAD ERRORS
// ============================================================================

export class FileUploadError extends AppError {
  constructor(message: string, code: string = ERROR_CODES.INVALID_FILE_TYPE, details?: any) {
    super(message, StatusCodes.BAD_REQUEST, code, true, details);
  }
}

export class FileTooLargeError extends FileUploadError {
  constructor(maxSize: number) {
    super(
      `File size exceeds maximum of ${maxSize} bytes`,
      ERROR_CODES.FILE_TOO_LARGE,
      { maxSize }
    );
  }
}

export class InvalidFileTypeError extends FileUploadError {
  constructor(allowedTypes: string[]) {
    super(
      'Invalid file type',
      ERROR_CODES.INVALID_FILE_TYPE,
      { allowedTypes }
    );
  }
}

export class VirusDetectedError extends FileUploadError {
  constructor() {
    super('Virus detected in file', ERROR_CODES.VIRUS_DETECTED);
  }
}

// ============================================================================
// SERVER ERRORS
// ============================================================================

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', code: string = ERROR_CODES.INTERNAL_SERVER_ERROR) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, code, false);
  }
}

export class DatabaseError extends ServerError {
  constructor(message: string = 'Database error', originalError?: Error) {
    super(message, ERROR_CODES.DATABASE_ERROR);
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', service?: string) {
    super(
      message,
      StatusCodes.SERVICE_UNAVAILABLE,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      true,
      { service }
    );
  }
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Check if error is an operational error (expected, handled)
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Convert any error to AppError
 */
export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new ServerError(error.message);
  }
  
  if (typeof error === 'string') {
    return new ServerError(error);
  }
  
  return new ServerError('An unknown error occurred');
};

