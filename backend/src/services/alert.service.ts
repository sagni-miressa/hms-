/**
 * Alert Service
 * Handles security alerts and notifications for critical events
 */

import { logger, logSecurity } from '@/utils/logger.js';
import { sendAlertEmail } from './email.service.js';
import { prisma } from '@/config/database.js';
import { createAuditLog } from './audit.service.js';
import type { AuthenticatedUser } from '@/types/index.js';

// ============================================================================
// ALERT CONFIGURATION
// ============================================================================

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AlertConfig {
  enabled: boolean;
  emailRecipients: string[];
  severity: AlertSeverity;
  threshold?: number; // For rate-based alerts
  cooldownMinutes?: number; // Prevent alert spam
}

const ALERT_CONFIGS: Record<string, AlertConfig> = {
  ACCOUNT_LOCKED: {
    enabled: true,
    emailRecipients: (process.env.ALERT_EMAIL_ADMINS || '').split(',').filter(Boolean),
    severity: 'high',
  },
  MULTIPLE_FAILED_LOGINS: {
    enabled: true,
    emailRecipients: (process.env.ALERT_EMAIL_ADMINS || '').split(',').filter(Boolean),
    severity: 'medium',
    threshold: 3, // Alert after 3 failed attempts
  },
  SUSPICIOUS_ACTIVITY: {
    enabled: true,
    emailRecipients: (process.env.ALERT_EMAIL_SECURITY || process.env.ALERT_EMAIL_ADMINS || '')
      .split(',')
      .filter(Boolean),
    severity: 'high',
  },
  RATE_LIMIT_EXCEEDED: {
    enabled: true,
    emailRecipients: (process.env.ALERT_EMAIL_ADMINS || '').split(',').filter(Boolean),
    severity: 'medium',
    threshold: 10, // Alert after 10 rate limit violations
  },
  UNAUTHORIZED_ACCESS_ATTEMPT: {
    enabled: true,
    emailRecipients: (process.env.ALERT_EMAIL_SECURITY || process.env.ALERT_EMAIL_ADMINS || '')
      .split(',')
      .filter(Boolean),
    severity: 'high',
  },
  SYSTEM_ERROR: {
    enabled: true,
    emailRecipients: (process.env.ALERT_EMAIL_ADMINS || '').split(',').filter(Boolean),
    severity: 'critical',
  },
  DATA_BREACH_ATTEMPT: {
    enabled: true,
    emailRecipients: (process.env.ALERT_EMAIL_SECURITY || process.env.ALERT_EMAIL_ADMINS || '')
      .split(',')
      .filter(Boolean),
    severity: 'critical',
  },
};

// ============================================================================
// ALERT STORAGE (for rate limiting and cooldown)
// ============================================================================

const alertHistory = new Map<string, { count: number; lastAlert: Date }>();

// ============================================================================
// ALERT FUNCTIONS
// ============================================================================

/**
 * Send security alert
 */
export const sendAlert = async (
  type: string,
  message: string,
  details: Record<string, any> = {},
  userId?: string,
  severity?: AlertSeverity
): Promise<void> => {
  try {
    const config = ALERT_CONFIGS[type] || {
      enabled: true,
      emailRecipients: (process.env.ALERT_EMAIL_ADMINS || '').split(',').filter(Boolean),
      severity: severity || 'medium',
    };

    if (!config.enabled || config.emailRecipients.length === 0) {
      return;
    }

    // Check cooldown
    const alertKey = `${type}:${userId || 'global'}`;
    const history = alertHistory.get(alertKey);
    const cooldownMs = (config.cooldownMinutes || 15) * 60 * 1000;

    if (history && Date.now() - history.lastAlert.getTime() < cooldownMs) {
      logger.debug('Alert suppressed (cooldown)', { type, alertKey });
      return;
    }

    // Check threshold
    if (config.threshold) {
      const count = (history?.count || 0) + 1;
      alertHistory.set(alertKey, { count, lastAlert: new Date() });

      if (count < config.threshold) {
        logger.debug('Alert threshold not reached', { type, count, threshold: config.threshold });
        return;
      }
    } else {
      alertHistory.set(alertKey, { count: 1, lastAlert: new Date() });
    }

    // Determine severity
    const alertSeverity = severity || config.severity;

    // Log security event
    logSecurity({
      userId,
      event: 'ALERT_TRIGGERED',
      severity: alertSeverity,
      details: { type, message, ...details },
    });

    // Create audit log
    await createAuditLog(userId, {
      action: 'ALERT_TRIGGERED',
      resourceType: 'System',
      details: { type, message, severity: alertSeverity, ...details },
    });

    // Send email alert
    await sendAlertEmail(
      config.emailRecipients,
      `Security Alert: ${type}`,
      `${message}\n\nDetails: ${JSON.stringify(details, null, 2)}`,
      alertSeverity
    );

    logger.warn('Security alert sent', { type, message, severity: alertSeverity, userId });
  } catch (error) {
    logger.error('Failed to send alert', { error, type, message });
  }
};

/**
 * Alert on account lockout
 */
export const alertAccountLocked = async (
  userId: string,
  email: string,
  reason: string,
  ipAddress?: string
): Promise<void> => {
  await sendAlert(
    'ACCOUNT_LOCKED',
    `Account locked for user: ${email}`,
    { userId, email, reason, ipAddress },
    userId,
    'high'
  );
};

/**
 * Alert on multiple failed logins
 */
export const alertFailedLogins = async (
  userId: string,
  email: string,
  attemptCount: number,
  ipAddress?: string
): Promise<void> => {
  await sendAlert(
    'MULTIPLE_FAILED_LOGINS',
    `Multiple failed login attempts for: ${email}`,
    { userId, email, attemptCount, ipAddress },
    userId,
    'medium'
  );
};

/**
 * Alert on suspicious activity
 */
export const alertSuspiciousActivity = async (
  userId: string | undefined,
  activity: string,
  details: Record<string, any> = {},
  ipAddress?: string
): Promise<void> => {
  await sendAlert(
    'SUSPICIOUS_ACTIVITY',
    `Suspicious activity detected: ${activity}`,
    { ...details, ipAddress },
    userId,
    'high'
  );
};

/**
 * Alert on rate limit exceeded
 */
export const alertRateLimitExceeded = async (
  identifier: string,
  endpoint: string,
  count: number,
  ipAddress?: string
): Promise<void> => {
  await sendAlert(
    'RATE_LIMIT_EXCEEDED',
    `Rate limit exceeded for: ${identifier}`,
    { identifier, endpoint, count, ipAddress },
    undefined,
    'medium'
  );
};

/**
 * Alert on unauthorized access attempt
 */
export const alertUnauthorizedAccess = async (
  resource: string,
  userId: string | undefined,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  await sendAlert(
    'UNAUTHORIZED_ACCESS_ATTEMPT',
    `Unauthorized access attempt to: ${resource}`,
    { resource, userId, ipAddress, userAgent },
    userId,
    'high'
  );
};

/**
 * Alert on system error
 */
export const alertSystemError = async (
  error: string,
  details: Record<string, any> = {}
): Promise<void> => {
  await sendAlert('SYSTEM_ERROR', `System error: ${error}`, details, undefined, 'critical');
};

export default {
  sendAlert,
  alertAccountLocked,
  alertFailedLogins,
  alertSuspiciousActivity,
  alertRateLimitExceeded,
  alertUnauthorizedAccess,
  alertSystemError,
};
