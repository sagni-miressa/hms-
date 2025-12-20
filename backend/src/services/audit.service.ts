/**
 * Audit Logging Service
 * Immutable, non-repudiable audit trail
 */

import { prisma } from '@/config/database.js';
import { logger } from '@/utils/logger.js';
import type { AuditLogData, PaginationParams, FilterParams } from '@/types/index.js';
import { AuditAction } from '@prisma/client';

// ============================================================================
// AUDIT LOG CREATION
// ============================================================================

/**
 * Create audit log entry
 */
export const createAuditLog = async (
  userId: string | undefined,
  data: AuditLogData & {
    method?: string;
    path?: string;
    statusCode?: number;
    requestId?: string;
  }
): Promise<void> => {
  try {
    // Get user info if userId provided
    let username: string | undefined;
    let userRoles: string[] = [];

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, roles: true },
      });

      if (user) {
        username = user.email;
        userRoles = user.roles;
      }
    }

    await prisma.auditLog.create({
      data: {
        userId,
        username,
        userRoles,
        action: data.action as AuditAction,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        details: data.details as any,
        changes: data.changes as any,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        method: data.method,
        path: data.path,
        statusCode: data.statusCode,
        requestId: data.requestId,
      },
    });

    logger.info('Audit log created', {
      userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
    });
  } catch (error) {
    // Never fail the request due to audit logging failure
    // But log the error for investigation
    logger.error('Failed to create audit log', {
      error,
      userId,
      action: data.action,
    });
  }
};

/**
 * Create resource view audit log
 */
export const auditResourceView = async (
  userId: string,
  resourceType: string,
  resourceId: string,
  context: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }
): Promise<void> => {
  await createAuditLog(userId, {
    action: 'RESOURCE_VIEWED',
    resourceType,
    resourceId,
    ...context,
  });
};

/**
 * Create resource modification audit log
 */
export const auditResourceModification = async (
  userId: string,
  action: 'RESOURCE_CREATED' | 'RESOURCE_UPDATED' | 'RESOURCE_DELETED',
  resourceType: string,
  resourceId: string,
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  },
  context?: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }
): Promise<void> => {
  await createAuditLog(userId, {
    action,
    resourceType,
    resourceId,
    ...(changes && changes.before !== undefined && changes.after !== undefined
      ? { changes: { before: changes.before, after: changes.after } }
      : {}),
    ...context,
  });
};

/**
 * Create security event audit log
 */
export const auditSecurityEvent = async (
  userId: string | undefined,
  action: AuditAction,
  details: Record<string, any>,
  context?: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }
): Promise<void> => {
  await createAuditLog(userId, {
    action,
    details,
    ...context,
  });
};

// ============================================================================
// AUDIT LOG QUERIES
// ============================================================================

/**
 * Get audit logs with pagination and filtering
 */
export const getAuditLogs = async (
  filters: FilterParams & {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    resourceId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  },
  pagination: PaginationParams
) => {
  const { userId, action, resourceType, resourceId, dateFrom, dateTo } = filters;

  const { page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc' } = pagination;

  const where: any = {};

  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (resourceType) where.resourceType = resourceType;
  if (resourceId) where.resourceId = resourceId;

  if (dateFrom || dateTo) {
    where.timestamp = {};
    if (dateFrom) where.timestamp.gte = dateFrom;
    if (dateTo) where.timestamp.lte = dateTo;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        userId: true,
        username: true,
        userRoles: true,
        action: true,
        resourceType: true,
        resourceId: true,
        details: true,
        changes: true,
        ipAddress: true,
        userAgent: true,
        method: true,
        path: true,
        statusCode: true,
        requestId: true,
        timestamp: true,
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get audit logs for specific resource
 */
export const getResourceAuditTrail = async (
  resourceType: string,
  resourceId: string,
  limit: number = 50
) => {
  return prisma.auditLog.findMany({
    where: {
      resourceType,
      resourceId,
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: {
      id: true,
      userId: true,
      username: true,
      action: true,
      details: true,
      changes: true,
      timestamp: true,
    },
  });
};

/**
 * Get user activity logs
 */
export const getUserActivityLogs = async (userId: string, limit: number = 100) => {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: {
      id: true,
      action: true,
      resourceType: true,
      resourceId: true,
      details: true,
      ipAddress: true,
      timestamp: true,
    },
  });
};

/**
 * Get security events
 */
export const getSecurityEvents = async (
  filters: {
    userId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    dateFrom?: Date;
    dateTo?: Date;
  },
  pagination: PaginationParams
) => {
  const securityActions: AuditAction[] = [
    'LOGIN_FAILED',
    'ACCESS_DENIED',
    'RATE_LIMIT_EXCEEDED',
    'SUSPICIOUS_ACTIVITY',
    'ACCOUNT_LOCKED',
  ];

  const where: any = {
    action: { in: securityActions },
  };

  if (filters.userId) where.userId = filters.userId;

  if (filters.dateFrom || filters.dateTo) {
    where.timestamp = {};
    if (filters.dateFrom) where.timestamp.gte = filters.dateFrom;
    if (filters.dateTo) where.timestamp.lte = filters.dateTo;
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;

  const [events, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { timestamp: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    events,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Export audit logs (for compliance)
 */
export const exportAuditLogs = async (filters: {
  dateFrom: Date;
  dateTo: Date;
  userId?: string;
  resourceType?: string;
}) => {
  const where: any = {
    timestamp: {
      gte: filters.dateFrom,
      lte: filters.dateTo,
    },
  };

  if (filters.userId) where.userId = filters.userId;
  if (filters.resourceType) where.resourceType = filters.resourceType;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'asc' },
  });

  return logs;
};
