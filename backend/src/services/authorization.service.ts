/**
 * Authorization Service
 * Multi-Layer Access Control: RBAC, MAC, DAC, ABAC, RuBAC
 */

import { prisma } from '@/config/database.js';
import { permissionCache, PERMISSION_CACHE_TTL } from '@/config/redis.js';
import {
  CLEARANCE_ORDER,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  RUBAC_RULES,
} from '@/config/constants.js';
import { logger, logSecurity } from '@/utils/logger.js';
import {
  InsufficientPermissionsError,
  InsufficientClearanceError,
  InsufficientRoleError,
  DACAccessDeniedError,
  ABACDeniedError,
  RuleViolationError,
} from '@/utils/errors.js';
import type {
  AuthenticatedUser,
  ACLCheck,
  RequestContext,
  CachedPermissions,
} from '@/types/index.js';
import { Role, ClearanceLevel } from '@prisma/client';

// ============================================================================
// PERMISSION CACHE
// ============================================================================

/**
 * Get cached permissions for user
 */
export const getCachedPermissions = async (userId: string): Promise<CachedPermissions | null> => {
  const cached = await permissionCache.get<CachedPermissions>(`user:${userId}`);
  return cached;
};

/**
 * Cache user permissions
 */
export const cacheUserPermissions = async (
  userId: string,
  permissions: CachedPermissions
): Promise<void> => {
  await permissionCache.set(`user:${userId}`, permissions, PERMISSION_CACHE_TTL);
};

/**
 * Invalidate user permission cache
 */
export const invalidateUserPermissions = async (userId: string): Promise<void> => {
  await permissionCache.delete(`user:${userId}`);
  logger.info('Permission cache invalidated', { userId });
};

/**
 * Compute and cache user permissions
 */
export const computeUserPermissions = async (userId: string): Promise<CachedPermissions> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      receivedACLs: {
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Compute permissions from roles
  const permissions = new Set<string>();
  for (const role of user.roles) {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    rolePerms.forEach(perm => permissions.add(perm));
  }

  // Build ACL map
  const acls = user.receivedACLs.map(acl => ({
    resourceType: acl.resourceType,
    resourceId: acl.resourceId,
    permission: acl.permission,
  }));

  const cached: CachedPermissions = {
    userId: user.id,
    roles: user.roles,
    clearance: user.clearanceLevel,
    department: user.department,
    permissions: Array.from(permissions),
    acls,
    cachedAt: new Date(),
  };

  await cacheUserPermissions(userId, cached);

  return cached;
};

// ============================================================================
// RBAC - Role-Based Access Control
// ============================================================================

/**
 * Check if user has required role
 */
export const checkRole = (user: AuthenticatedUser, requiredRoles: Role[]): boolean => {
  return requiredRoles.some(role => user.roles.includes(role));
};

/**
 * Check if user has role or inherits it through hierarchy
 */
export const checkRoleHierarchy = (user: AuthenticatedUser, requiredRole: Role): boolean => {
  for (const userRole of user.roles) {
    const allowedRoles = ROLE_HIERARCHY[userRole] || [];
    if (allowedRoles.includes(requiredRole)) {
      return true;
    }
  }
  return false;
};

/**
 * Enforce role requirement (throws on failure)
 */
export const enforceRole = (user: AuthenticatedUser, requiredRoles: Role[]): void => {
  if (!checkRole(user, requiredRoles)) {
    logSecurity({
      userId: user.id,
      event: 'ROLE_CHECK_FAILED',
      severity: 'medium',
      details: { userRoles: user.roles, requiredRoles },
    });
    throw new InsufficientRoleError(
      'Insufficient role',
      requiredRoles.map(r => r.toString())
    );
  }
};

// ============================================================================
// MAC - Mandatory Access Control (Clearance-Based)
// ============================================================================

/**
 * Check if user has required clearance level
 */
export const checkClearance = (
  user: AuthenticatedUser,
  requiredClearance: ClearanceLevel
): boolean => {
  return CLEARANCE_ORDER[user.clearanceLevel] >= CLEARANCE_ORDER[requiredClearance];
};

/**
 * Enforce clearance requirement (throws on failure)
 */
export const enforceClearance = (
  user: AuthenticatedUser,
  requiredClearance: ClearanceLevel
): void => {
  if (!checkClearance(user, requiredClearance)) {
    logSecurity({
      userId: user.id,
      event: 'CLEARANCE_CHECK_FAILED',
      severity: 'high',
      details: {
        userClearance: user.clearanceLevel,
        requiredClearance,
      },
    });
    throw new InsufficientClearanceError(
      'Insufficient clearance level',
      requiredClearance.toString()
    );
  }
};

/**
 * Filter object fields based on clearance level
 */
export const filterByClearance = <T extends Record<string, any>>(
  data: T,
  user: AuthenticatedUser,
  fieldClearanceMap: Record<keyof T, ClearanceLevel>
): Partial<T> => {
  const filtered: Partial<T> = {};

  for (const [field, clearance] of Object.entries(fieldClearanceMap)) {
    if (checkClearance(user, clearance as ClearanceLevel)) {
      filtered[field as keyof T] = data[field as keyof T];
    }
  }

  return filtered;
};

// ============================================================================
// DAC - Discretionary Access Control (Resource-Level)
// ============================================================================

/**
 * Check if user has DAC access to resource
 */
export const checkDACAccess = async (userId: string, check: ACLCheck): Promise<boolean> => {
  const acl = await prisma.aCL.findFirst({
    where: {
      resourceType: check.resourceType,
      resourceId: check.resourceId,
      granteeId: userId,
      permission: check.permission,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  return !!acl;
};

/**
 * Check if user owns resource
 */
export const checkOwnership = async (
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> => {
  switch (resourceType) {
    case 'Job':
      const job = await prisma.job.findFirst({
        where: { id: resourceId, ownerId: userId },
      });
      return !!job;

    case 'Application':
      const application = await prisma.application.findFirst({
        where: { id: resourceId, applicantId: userId },
      });
      return !!application;

    default:
      return false;
  }
};

/**
 * Enforce DAC access (throws on failure)
 */
export const enforceDACAccess = async (
  user: AuthenticatedUser,
  check: ACLCheck,
  allowOwner: boolean = true
): Promise<void> => {
  // Check ownership first
  if (allowOwner) {
    const isOwner = await checkOwnership(user.id, check.resourceType, check.resourceId);
    if (isOwner) return;
  }

  // Check explicit ACL
  const hasAccess = await checkDACAccess(user.id, check);

  if (!hasAccess) {
    logSecurity({
      userId: user.id,
      event: 'DAC_CHECK_FAILED',
      severity: 'medium',
      details: { check },
    });
    throw new DACAccessDeniedError();
  }
};

/**
 * Grant DAC access to user
 */
export const grantDACAccess = async (
  grantedById: string,
  granteeId: string,
  resourceType: string,
  resourceId: string,
  permission: string,
  reason?: string,
  expiresAt?: Date
): Promise<void> => {
  await prisma.aCL.create({
    data: {
      resourceType,
      resourceId,
      granteeId,
      permission,
      grantedById,
      reason,
      expiresAt,
    },
  });

  // Invalidate cache
  await invalidateUserPermissions(granteeId);

  logger.info('DAC access granted', {
    grantedById,
    granteeId,
    resourceType,
    resourceId,
    permission,
  });
};

/**
 * Revoke DAC access
 */
export const revokeDACAccess = async (
  resourceType: string,
  resourceId: string,
  granteeId: string,
  permission: string
): Promise<void> => {
  await prisma.aCL.deleteMany({
    where: {
      resourceType,
      resourceId,
      granteeId,
      permission,
    },
  });

  // Invalidate cache
  await invalidateUserPermissions(granteeId);

  logger.info('DAC access revoked', {
    granteeId,
    resourceType,
    resourceId,
    permission,
  });
};

// ============================================================================
// ABAC - Attribute-Based Access Control
// ============================================================================

/**
 * Check department-based access
 */
export const checkDepartmentAccess = (
  user: AuthenticatedUser,
  resourceDepartment?: string | null
): boolean => {
  // System admins have access to all departments
  if (user.roles.includes(Role.SYSTEM_ADMIN)) return true;

  // No department requirement
  if (!resourceDepartment) return true;

  // Check user's department
  return user.department === resourceDepartment;
};

/**
 * Job-specific ABAC rules
 */
export const checkJobABACRules = (
  user: AuthenticatedUser,
  job: any
): { allowed: boolean; reason?: string } => {
  // System admins bypass ABAC
  if (user.roles.includes(Role.SYSTEM_ADMIN)) {
    return { allowed: true };
  }

  // Department check for recruiters
  if (user.roles.includes(Role.RECRUITER) || user.roles.includes(Role.HR_MANAGER)) {
    if (!checkDepartmentAccess(user, job.department)) {
      return {
        allowed: false,
        reason: 'User not authorized for this department',
      };
    }
  }

  return { allowed: true };
};

/**
 * Application-specific ABAC rules
 */
export const checkApplicationABACRules = (
  user: AuthenticatedUser,
  application: any,
  job?: any
): { allowed: boolean; reason?: string } => {
  // Applicant can only view own applications
  if (user.roles.includes(Role.APPLICANT) && !user.roles.includes(Role.RECRUITER)) {
    if (application.applicantId !== user.id) {
      return {
        allowed: false,
        reason: "Cannot access other applicants' applications",
      };
    }
  }

  // Department check
  if (job && (user.roles.includes(Role.RECRUITER) || user.roles.includes(Role.HR_MANAGER))) {
    if (!checkDepartmentAccess(user, job.department)) {
      return {
        allowed: false,
        reason: 'User not authorized for this department',
      };
    }
  }

  return { allowed: true };
};

/**
 * Enforce ABAC rules (throws on failure)
 */
export const enforceABACRules = (
  user: AuthenticatedUser,
  resource: any,
  resourceType: string
): void => {
  let result: { allowed: boolean; reason?: string };

  switch (resourceType) {
    case 'Job':
      result = checkJobABACRules(user, resource);
      break;

    case 'Application':
      result = checkApplicationABACRules(user, resource);
      break;

    default:
      return; // No ABAC rules for this resource type
  }

  if (!result.allowed) {
    logSecurity({
      userId: user.id,
      event: 'ABAC_CHECK_FAILED',
      severity: 'medium',
      details: { resourceType, reason: result.reason },
    });
    throw new ABACDeniedError(result.reason);
  }
};

// ============================================================================
// RuBAC - Rule-Based Access Control
// ============================================================================

/**
 * Check working hours rule
 */
const checkWorkingHours = (user: AuthenticatedUser): boolean => {
  const rule = RUBAC_RULES.WORKING_HOURS;

  if (!rule.enabled) return true;
  if (!rule.appliesTo.some(role => user.roles.includes(role))) return true;

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  const withinHours = hour >= rule.allowedHours.start && hour <= rule.allowedHours.end;
  const withinDays = rule.allowedDays.includes(day as 1 | 2 | 3 | 4 | 5);

  return withinHours && withinDays;
};

/**
 * Check IP whitelist rule
 */
const checkIPWhitelist = (user: AuthenticatedUser, ipAddress?: string): boolean => {
  const rule = RUBAC_RULES.IP_WHITELIST;

  if (!rule.enabled) return true;
  if (!rule.appliesTo.some(role => user.roles.includes(role))) return true;
  if (!ipAddress) return false;

  // If no whitelist configured, allow all
  if (rule.allowedIPs.length === 0) return true;

  return rule.allowedIPs.includes(ipAddress);
};

/**
 * Check all RuBAC rules
 */
export const checkRuBACRules = (
  user: AuthenticatedUser,
  context: RequestContext
): { allowed: boolean; violatedRule?: string } => {
  // Working hours check
  if (!checkWorkingHours(user)) {
    return {
      allowed: false,
      violatedRule: 'Access outside working hours',
    };
  }

  // IP whitelist check
  if (!checkIPWhitelist(user, context.ipAddress)) {
    return {
      allowed: false,
      violatedRule: 'IP address not whitelisted',
    };
  }

  return { allowed: true };
};

/**
 * Enforce RuBAC rules (throws on failure)
 */
export const enforceRuBACRules = (user: AuthenticatedUser, context: RequestContext): void => {
  const result = checkRuBACRules(user, context);

  if (!result.allowed) {
    logSecurity({
      userId: user.id,
      event: 'RUBAC_VIOLATION',
      severity: 'high',
      ipAddress: context.ipAddress,
      details: { rule: result.violatedRule },
    });
    throw new RuleViolationError(result.violatedRule);
  }
};

// ============================================================================
// PERMISSION CHECKS
// ============================================================================

/**
 * Check if user has specific permission
 */
export const checkPermission = async (
  user: AuthenticatedUser,
  permission: string
): Promise<boolean> => {
  // Check cached permissions
  const cached = await getCachedPermissions(user.id);

  if (cached) {
    return cached.permissions.includes(permission);
  }

  // Compute and cache
  const permissions = await computeUserPermissions(user.id);
  return permissions.permissions.includes(permission);
};

/**
 * Enforce permission requirement (throws on failure)
 */
export const enforcePermission = async (
  user: AuthenticatedUser,
  permission: string
): Promise<void> => {
  const hasPermission = await checkPermission(user, permission);

  if (!hasPermission) {
    logSecurity({
      userId: user.id,
      event: 'PERMISSION_CHECK_FAILED',
      severity: 'medium',
      details: { permission },
    });
    throw new InsufficientPermissionsError('Insufficient permissions', permission);
  }
};

// ============================================================================
// COMBINED AUTHORIZATION CHECK
// ============================================================================

/**
 * Comprehensive authorization check
 */
export const authorize = async (params: {
  user: AuthenticatedUser;
  context: RequestContext;
  requiredRoles?: Role[];
  requiredClearance?: ClearanceLevel;
  requiredPermissions?: string[];
  dacCheck?: ACLCheck;
  abacResource?: { type: string; data: any };
  enforceRubac?: boolean;
}): Promise<void> => {
  const {
    user,
    context,
    requiredRoles,
    requiredClearance,
    requiredPermissions,
    dacCheck,
    abacResource,
    enforceRubac,
  } = params;

  // 1. RuBAC - Context rules (time, location, device)
  if (enforceRubac !== false) {
    enforceRuBACRules(user, context);
  }

  // 2. RBAC - Role check
  if (requiredRoles && requiredRoles.length > 0) {
    enforceRole(user, requiredRoles);
  }

  // 3. MAC - Clearance check
  if (requiredClearance) {
    enforceClearance(user, requiredClearance);
  }

  // 4. Permission check
  if (requiredPermissions && requiredPermissions.length > 0) {
    for (const permission of requiredPermissions) {
      await enforcePermission(user, permission);
    }
  }

  // 5. DAC - Resource-specific access
  if (dacCheck) {
    await enforceDACAccess(user, dacCheck);
  }

  // 6. ABAC - Attribute-based rules
  if (abacResource) {
    enforceABACRules(user, abacResource.data, abacResource.type);
  }
};
