/**
 * System Constants & Configuration
 * Zero-Trust Security Configuration
 */

import { Role, ClearanceLevel } from '@prisma/client';

// ============================================================================
// CLEARANCE LEVELS
// ============================================================================

export const CLEARANCE_ORDER: Record<ClearanceLevel, number> = {
  PUBLIC: 0,
  INTERNAL: 1,
  CONFIDENTIAL: 2,
  RESTRICTED: 3,
};

export const CLEARANCE_HIERARCHY: Record<ClearanceLevel, ClearanceLevel[]> = {
  RESTRICTED: ['RESTRICTED', 'CONFIDENTIAL', 'INTERNAL', 'PUBLIC'],
  CONFIDENTIAL: ['CONFIDENTIAL', 'INTERNAL', 'PUBLIC'],
  INTERNAL: ['INTERNAL', 'PUBLIC'],
  PUBLIC: ['PUBLIC'],
};

// ============================================================================
// ROLE PERMISSIONS
// ============================================================================

export const ROLE_CLEARANCE_MAP: Record<Role, ClearanceLevel> = {
  APPLICANT: ClearanceLevel.PUBLIC,
  RECRUITER: ClearanceLevel.INTERNAL,
  INTERVIEWER: ClearanceLevel.INTERNAL,
  HR_MANAGER: ClearanceLevel.CONFIDENTIAL,
  AUDITOR: ClearanceLevel.CONFIDENTIAL,
  SYSTEM_ADMIN: ClearanceLevel.RESTRICTED,
};

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  SYSTEM_ADMIN: ['SYSTEM_ADMIN', 'AUDITOR', 'HR_MANAGER', 'RECRUITER', 'INTERVIEWER', 'APPLICANT'],
  HR_MANAGER: ['HR_MANAGER', 'RECRUITER', 'INTERVIEWER', 'APPLICANT'],
  AUDITOR: ['AUDITOR'], // Read-only, no inheritance
  RECRUITER: ['RECRUITER', 'APPLICANT'],
  INTERVIEWER: ['INTERVIEWER', 'APPLICANT'],
  APPLICANT: ['APPLICANT'],
};

// ============================================================================
// SECURITY POLICIES
// ============================================================================

export const SECURITY = {
  // Password Policy
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    MAX_AGE_DAYS: 90,
    HISTORY_SIZE: 5, // Prevent reuse of last N passwords
  },
  
  // JWT Configuration
  JWT: {
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    ALGORITHM: 'RS256' as const, // Use asymmetric encryption
    ISSUER: 'hiring-management-system',
    AUDIENCE: 'hiring-api',
  },
  
  // Account Lockout
  LOCKOUT: {
    MAX_FAILED_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 30,
    RESET_AFTER_MINUTES: 15,
  },
  
  // Session Management
  SESSION: {
    MAX_CONCURRENT_SESSIONS: 3,
    IDLE_TIMEOUT_MINUTES: 30,
    ABSOLUTE_TIMEOUT_HOURS: 12,
  },
  
  // MFA
  MFA: {
    WINDOW: 1, // Allow 1 step before/after current time
    REQUIRED_FOR_ROLES: ['SYSTEM_ADMIN', 'HR_MANAGER', 'AUDITOR'] as Role[],
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    AUTH_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10'),
    SKIP_SUCCESSFUL_REQUESTS: false,
  },
  
  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE_BYTES: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024,
    ALLOWED_MIME_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    VIRUS_SCAN_ENABLED: process.env.NODE_ENV === 'production',
    PRESIGNED_URL_EXPIRES_SECONDS: 3600, // 1 hour
  },
} as const;

// ============================================================================
// RULE-BASED ACCESS CONTROL (RuBAC)
// ============================================================================

export const RUBAC_RULES = {
  WORKING_HOURS: {
    enabled: process.env.NODE_ENV === 'production',
    appliesTo: ['RECRUITER', 'HR_MANAGER'] as Role[],
    allowedHours: { start: 9, end: 18 },
    allowedDays: [1, 2, 3, 4, 5], // Monday-Friday
    timezone: 'America/New_York',
  },
  
  IP_WHITELIST: {
    enabled: process.env.NODE_ENV === 'production',
    appliesTo: ['SYSTEM_ADMIN'] as Role[],
    allowedIPs: (process.env.ADMIN_IP_WHITELIST || '').split(',').filter(Boolean),
  },
  
  DEVICE_TRUST: {
    enabled: false, // Future feature
    requireRegisteredDevice: ['SYSTEM_ADMIN'] as Role[],
  },
} as const;

// ============================================================================
// PERMISSIONS
// ============================================================================

export const PERMISSIONS = {
  // Job Permissions
  JOB_CREATE: 'job:create',
  JOB_READ: 'job:read',
  JOB_UPDATE: 'job:update',
  JOB_DELETE: 'job:delete',
  JOB_PUBLISH: 'job:publish',
  JOB_VIEW_SALARY: 'job:view_salary',
  
  // Application Permissions
  APPLICATION_CREATE: 'application:create',
  APPLICATION_READ: 'application:read',
  APPLICATION_UPDATE: 'application:update',
  APPLICATION_DELETE: 'application:delete',
  APPLICATION_CHANGE_STATUS: 'application:change_status',
  APPLICATION_VIEW_INTERNAL_NOTES: 'application:view_internal_notes',
  APPLICATION_SUBMIT_FEEDBACK: 'application:submit_feedback',
  APPLICATION_MAKE_OFFER: 'application:make_offer',
  
  // User Permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_ASSIGN_ROLE: 'user:assign_role',
  USER_CHANGE_CLEARANCE: 'user:change_clearance',
  
  // Audit Permissions
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',
  
  // System Permissions
  SYSTEM_CONFIGURE: 'system:configure',
  SYSTEM_BACKUP: 'system:backup',
} as const;

// Permission Matrix: Role -> Permissions
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  APPLICANT: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.APPLICATION_CREATE,
    PERMISSIONS.APPLICATION_READ, // Own only
  ],
  
  RECRUITER: [
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_READ,
    PERMISSIONS.JOB_UPDATE,
    PERMISSIONS.JOB_PUBLISH,
    PERMISSIONS.APPLICATION_READ,
    PERMISSIONS.APPLICATION_UPDATE,
    PERMISSIONS.APPLICATION_CHANGE_STATUS,
    PERMISSIONS.APPLICATION_VIEW_INTERNAL_NOTES,
  ],
  
  INTERVIEWER: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.APPLICATION_READ, // Assigned only
    PERMISSIONS.APPLICATION_SUBMIT_FEEDBACK,
  ],
  
  HR_MANAGER: [
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_READ,
    PERMISSIONS.JOB_UPDATE,
    PERMISSIONS.JOB_DELETE,
    PERMISSIONS.JOB_PUBLISH,
    PERMISSIONS.JOB_VIEW_SALARY,
    PERMISSIONS.APPLICATION_READ,
    PERMISSIONS.APPLICATION_UPDATE,
    PERMISSIONS.APPLICATION_CHANGE_STATUS,
    PERMISSIONS.APPLICATION_VIEW_INTERNAL_NOTES,
    PERMISSIONS.APPLICATION_MAKE_OFFER,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
  ],
  
  AUDITOR: [
    PERMISSIONS.JOB_READ,
    PERMISSIONS.APPLICATION_READ,
    PERMISSIONS.USER_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.AUDIT_EXPORT,
  ],
  
  SYSTEM_ADMIN: Object.values(PERMISSIONS),
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API = {
  VERSION: 'v1',
  PREFIX: '/api/v1',
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  CORS: {
    ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
    METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Request-ID'],
    CREDENTIALS: true,
    MAX_AGE: 86400, // 24 hours
  },
} as const;

// ============================================================================
// LOGGING
// ============================================================================

export const LOGGING = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Never log these fields
  SENSITIVE_FIELDS: [
    'password',
    'passwordHash',
    'token',
    'refreshToken',
    'mfaSecret',
    'authorization',
    'cookie',
  ],
  
  // Mask these fields in logs
  MASK_FIELDS: [
    'email',
    'phone',
    'ipAddress',
    'ssn',
    'creditCard',
  ],
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]{3,30}$/,
  URL_REGEX: /^https?:\/\/.+/,
  
  JOB_TITLE_MIN_LENGTH: 5,
  JOB_TITLE_MAX_LENGTH: 100,
  JOB_DESCRIPTION_MIN_LENGTH: 50,
  JOB_DESCRIPTION_MAX_LENGTH: 10000,
  
  APPLICATION_COVER_LETTER_MAX_LENGTH: 5000,
  FEEDBACK_MAX_LENGTH: 2000,
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  MFA_REQUIRED: 'MFA_REQUIRED',
  INVALID_MFA_CODE: 'INVALID_MFA_CODE',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INSUFFICIENT_CLEARANCE: 'INSUFFICIENT_CLEARANCE',
  INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',
  NO_DAC_ACCESS: 'NO_DAC_ACCESS',
  ABAC_DENIED: 'ABAC_DENIED',
  RULE_VIOLATION: 'RULE_VIOLATION',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Resource
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  VIRUS_DETECTED: 'VIRUS_DETECTED',
  
  // Server
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

