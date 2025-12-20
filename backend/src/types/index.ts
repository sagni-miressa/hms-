/**
 * TypeScript Type Definitions
 * Strict typing for security-critical operations
 */

import { Request } from 'express';
import { Role, ClearanceLevel } from '@prisma/client';

// ============================================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  username?: string | null;
  roles: Role[];
  clearanceLevel: ClearanceLevel;
  department?: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  permissions?: string[];
  sessionId?: string;
}

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  roles: Role[];
  clearanceLevel: ClearanceLevel;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  deviceId?: string;
}

// ============================================================================
// EXPRESS REQUEST EXTENSIONS
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  requestId: string;
  startTime: number;
}

export interface RequestContext {
  requestId: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  method: string;
  path: string;
  timestamp: Date;
}

// ============================================================================
// AUTHORIZATION POLICIES
// ============================================================================

export interface AuthorizationPolicy {
  requiredRoles?: Role[];
  requiredClearance?: ClearanceLevel;
  requiredPermissions?: string[];
  abacRules?: (user: AuthenticatedUser, resource?: any) => boolean;
  dacRequired?: boolean;
  rubacRules?: (context: RequestContext, user: AuthenticatedUser) => Promise<boolean>;
}

export interface ACLCheck {
  resourceType: string;
  resourceId: string;
  permission: 'read' | 'write' | 'delete' | 'feedback';
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  meta?: ResponseMeta;
  error?: ApiError;
}

export interface ResponseMeta {
  pagination?: PaginationMeta;
  timestamp: string;
  requestId: string;
  version?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  requestId?: string;
  stack?: string; // Only in development
}

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  department?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export interface AuditLogData {
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

export interface FileUploadResult {
  url: string;
  key: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  expiresIn?: number;
}

// ============================================================================
// PERMISSION CACHE
// ============================================================================

export interface CachedPermissions {
  userId: string;
  roles: Role[];
  clearance: ClearanceLevel;
  department?: string | null;
  permissions: string[];
  acls: Array<{
    resourceType: string;
    resourceId: string;
    permission: string;
  }>;
  cachedAt: Date;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

// ============================================================================
// JOB & APPLICATION
// ============================================================================

export interface JobFilters extends FilterParams {
  status?: string;
  department?: string;
  category?: string;
  location?: string;
  employmentType?: string;
}

export interface ApplicationFilters extends FilterParams {
  status?: string;
  jobId?: string;
  applicantId?: string;
}

// ============================================================================
// SECURITY
// ============================================================================

export interface SecurityContext {
  ipAddress: string;
  userAgent?: string;
  deviceId?: string;
  timestamp: Date;
  riskScore?: number; // 0-100
}

export interface MFASetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: {
    database: boolean;
    redis: boolean;
    storage?: boolean;
  };
  uptime: number;
  version: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isAuthenticatedRequest = (req: Request): req is AuthenticatedRequest => {
  return 'user' in req && req.user !== undefined;
};

export const hasRole = (user: AuthenticatedUser, role: Role): boolean => {
  return user.roles.includes(role);
};

export const hasAnyRole = (user: AuthenticatedUser, roles: Role[]): boolean => {
  return roles.some(role => user.roles.includes(role));
};

export const hasPermission = (user: AuthenticatedUser, permission: string): boolean => {
  return user.permissions?.includes(permission) || false;
};
