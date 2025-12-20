/**
 * Authorization Middleware
 * Multi-layer access control enforcement
 */

import { Request, Response, NextFunction } from 'express';
import {
  enforceRole,
  enforceClearance,
  enforcePermission,
  enforceRuBACRules,
} from '@/services/authorization.service.js';
import type { AuthenticatedRequest, RequestContext } from '@/types/index.js';
import { Role, ClearanceLevel } from '@prisma/client';

// ============================================================================
// AUTHORIZATION MIDDLEWARE FACTORY
// ============================================================================

/**
 * Create authorization middleware
 */
export const authorize = (options: {
  roles?: Role[];
  clearance?: ClearanceLevel;
  permissions?: string[];
  enforceRubac?: boolean;
}) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;

      if (!user) {
        return next(new Error('User not authenticated'));
      }

      // Build request context
      const context: RequestContext = {
        requestId: authReq.requestId,
        userId: user.id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: req.path,
        timestamp: new Date(),
      };

      // 1. RuBAC - Context rules
      if (options.enforceRubac !== false) {
        enforceRuBACRules(user, context);
      }

      // 2. RBAC - Role check
      if (options.roles && options.roles.length > 0) {
        enforceRole(user, options.roles);
      }

      // 3. MAC - Clearance check
      if (options.clearance) {
        enforceClearance(user, options.clearance);
      }

      // 4. Permission check
      if (options.permissions && options.permissions.length > 0) {
        for (const permission of options.permissions) {
          await enforcePermission(user, permission);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ============================================================================
// CONVENIENCE MIDDLEWARE
// ============================================================================

/**
 * Require specific roles
 */
export const requireRoles = (...roles: Role[]) => {
  return authorize({ roles });
};

/**
 * Require minimum clearance level
 */
export const requireClearance = (clearance: ClearanceLevel) => {
  return authorize({ clearance });
};

/**
 * Require specific permissions
 */
export const requirePermissions = (...permissions: string[]) => {
  return authorize({ permissions });
};

/**
 * Require system admin role
 */
export const requireAdmin = () => {
  return authorize({ roles: [Role.SYSTEM_ADMIN] });
};

/**
 * Require HR manager or higher
 */
export const requireHRManager = () => {
  return authorize({ roles: [Role.HR_MANAGER, Role.SYSTEM_ADMIN] });
};

/**
 * Require recruiter or higher
 */
export const requireRecruiter = () => {
  return authorize({
    roles: [Role.RECRUITER, Role.HR_MANAGER, Role.SYSTEM_ADMIN],
  });
};

/**
 * Require auditor role
 */
export const requireAuditor = () => {
  return authorize({
    roles: [Role.AUDITOR, Role.SYSTEM_ADMIN],
    clearance: ClearanceLevel.CONFIDENTIAL,
  });
};
