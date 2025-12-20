/**
 * Structured Logging with Winston
 * Security-focused with PII masking and sensitive field filtering
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LOGGING } from '@/config/constants.js';

// ============================================================================
// CUSTOM FORMATS
// ============================================================================

/**
 * Mask sensitive fields in log output
 */
const maskSensitiveData = winston.format((info) => {
  const mask = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const masked = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Remove sensitive fields entirely
      if (LOGGING.SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
        continue;
      }
      
      // Mask PII fields
      if (LOGGING.MASK_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
        (masked as any)[key] = typeof value === 'string' ? '***MASKED***' : value;
      } else if (typeof value === 'object' && value !== null) {
        (masked as any)[key] = mask(value);
      } else {
        (masked as any)[key] = value;
      }
    }
    
    return masked;
  };
  
  return mask(info);
});

/**
 * Add request context
 */
const addContext = winston.format((info) => {
  return {
    ...info,
    timestamp: new Date().toISOString(),
    service: 'hiring-api',
    environment: process.env.NODE_ENV || 'development',
  };
});

// ============================================================================
// TRANSPORTS
// ============================================================================

const transports: winston.transport[] = [
  // Console transport (development)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    ),
  }),
];

// File transports (production)
if (process.env.NODE_ENV === 'production') {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.json(),
    })
  );
  
  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    })
  );
  
  // Audit logs (never rotate, archive separately)
  transports.push(
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'info',
      format: winston.format.json(),
    })
  );
}

// ============================================================================
// LOGGER INSTANCE
// ============================================================================

export const logger = winston.createLogger({
  level: LOGGING.LEVEL,
  format: winston.format.combine(
    addContext(),
    maskSensitiveData(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// ============================================================================
// REQUEST LOGGER
// ============================================================================

export interface RequestLogContext {
  requestId?: string;
  method?: string;
  path?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
}

export const logRequest = (
  level: 'info' | 'warn' | 'error',
  message: string,
  context: RequestLogContext
) => {
  logger.log(level, message, {
    type: 'request',
    ...context,
  });
};

// ============================================================================
// AUDIT LOGGER
// ============================================================================

export interface AuditLogContext {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  success: boolean;
}

export const logAudit = (context: AuditLogContext) => {
  logger.info('AUDIT', {
    type: 'audit',
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// ============================================================================
// SECURITY LOGGER
// ============================================================================

export interface SecurityLogContext {
  userId?: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

export const logSecurity = (context: SecurityLogContext) => {
  logger.warn('SECURITY_EVENT', {
    type: 'security',
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// ============================================================================
// ERROR LOGGER
// ============================================================================

export const logError = (
  error: Error,
  context?: {
    requestId?: string;
    userId?: string;
    path?: string;
  }
) => {
  logger.error('Application Error', {
    type: 'error',
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

// ============================================================================
// PERFORMANCE LOGGER
// ============================================================================

export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) => {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger.log(level, 'Performance', {
    type: 'performance',
    operation,
    duration,
    ...metadata,
  });
};

// ============================================================================
// STREAM FOR MORGAN (HTTP LOGGING)
// ============================================================================

export const httpLoggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;

