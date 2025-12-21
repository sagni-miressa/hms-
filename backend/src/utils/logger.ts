/**
 * Structured Logging with Winston
 * Security-focused with PII masking and sensitive field filtering
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import { LOGGING } from '@/config/constants.js';

// ============================================================================
// CUSTOM FORMATS
// ============================================================================

/**
 * Mask sensitive fields in log output
 * FIX #5: Do not replace info object, merge instead
 */
const maskSensitiveData = winston.format(info => {
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

  // FIX #5: Merge masked data with original info, don't replace
  const masked = mask(info);
  return { ...info, ...masked };
});

/**
 * Add request context
 */
const addContext = winston.format(info => {
  return {
    ...info,
    timestamp: new Date().toISOString()
  };
});

// ============================================================================
// CUSTOM LOG LEVELS
// ============================================================================
// FIX #3: Define http level for Morgan integration

const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// ============================================================================
// CREATE LOGS DIRECTORY
// ============================================================================
// FIX #4: Ensure logs directory exists

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================================================
// TRANSPORTS
// ============================================================================

const transports: winston.transport[] = [
  // Console transport - always enabled for immediate visibility
  // Use a simpler format that definitely works
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        // Get metadata, excluding winston internals
        const metaKeys = Object.keys(meta).filter(
          key => key !== 'splat' && !key.startsWith('Symbol') && meta[key] !== undefined
        );

        const metaStr =
          metaKeys.length > 0
            ? '\n' + JSON.stringify(Object.fromEntries(metaKeys.map(k => [k, meta[k]])), null, 2)
            : '';

        return `${timestamp} [${level}]: ${message}${metaStr}`;
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
      format: winston.format.combine(
        addContext(),
        maskSensitiveData(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
    })
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        addContext(),
        maskSensitiveData(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
    })
  );

  // Audit logs (never rotate, archive separately)
  transports.push(
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'info',
      format: winston.format.combine(
        addContext(),
        maskSensitiveData(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
    })
  );
}

// ============================================================================
// CENTRALIZED LOGGING TRANSPORTS
// ============================================================================

/**
 * Add centralized logging transports based on configuration
 * FIX #1: Accept logger instance as parameter to avoid using it before creation
 */
const addCentralizedTransports = async (loggerInstance: winston.Logger): Promise<void> => {
  // Logstash/ELK Stack transport (optional - install winston-logstash if needed)
  if (process.env.LOGSTASH_ENABLED === 'true' && process.env.LOGSTASH_HOST) {
    try {
      // Dynamic import to avoid requiring package if not used
      // @ts-expect-error - Optional package, may not be installed
      const winstonLogstash = await import('winston-logstash').catch(() => null);

      if (winstonLogstash && winstonLogstash.LogstashTransport) {
        transports.push(
          new winstonLogstash.LogstashTransport({
            host: process.env.LOGSTASH_HOST,
            port: parseInt(process.env.LOGSTASH_PORT || '5000'),
            protocol: (process.env.LOGSTASH_PROTOCOL || 'tcp') as 'tcp' | 'udp',
            node_name: process.env.LOGSTASH_NODE_NAME || 'hiring-api',
            application: 'hiring-system',
            environment: process.env.NODE_ENV || 'production',
          })
        );

        loggerInstance.info('Logstash transport enabled', {
          host: process.env.LOGSTASH_HOST,
          port: process.env.LOGSTASH_PORT || '5000',
        });
      } else {
        loggerInstance.warn(
          'Logstash transport requested but winston-logstash not installed. Install with: npm install winston-logstash'
        );
      }
    } catch (error) {
      loggerInstance.warn('Failed to load Logstash transport', { error });
    }
  }

  // AWS CloudWatch Logs transport (optional - install winston-cloudwatch if needed)
  if (process.env.CLOUDWATCH_ENABLED === 'true' && process.env.CLOUDWATCH_GROUP_NAME) {
    try {
      // Dynamic import to avoid requiring package if not used
      // @ts-expect-error - Optional package, may not be installed
      const winstonCloudwatch = await import('winston-cloudwatch').catch(() => null);

      if (winstonCloudwatch && winstonCloudwatch.CloudWatchLogs) {
        transports.push(
          new winstonCloudwatch.CloudWatchLogs({
            logGroupName: process.env.CLOUDWATCH_GROUP_NAME!,
            logStreamName:
              process.env.CLOUDWATCH_STREAM_NAME || `hiring-api-${process.env.NODE_ENV}`,
            awsRegion: process.env.CLOUDWATCH_REGION || 'us-east-1',
            awsAccessKeyId: process.env.CLOUDWATCH_ACCESS_KEY_ID,
            awsSecretKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
            messageFormatter: ({ level, message, ...meta }: any) => {
              return JSON.stringify({
                level,
                message,
                ...meta,
              });
            },
          })
        );

        loggerInstance.info('CloudWatch transport enabled', {
          group: process.env.CLOUDWATCH_GROUP_NAME,
          stream: process.env.CLOUDWATCH_STREAM_NAME,
        });
      } else {
        loggerInstance.warn(
          'CloudWatch transport requested but winston-cloudwatch not installed. Install with: npm install winston-cloudwatch'
        );
      }
    } catch (error) {
      loggerInstance.warn('Failed to load CloudWatch transport', { error });
    }
  }

  // HTTP/Webhook transport (for custom log aggregation services)
  if (process.env.LOG_WEBHOOK_ENABLED === 'true' && process.env.LOG_WEBHOOK_URL) {
    try {
      const { Http } = winston.transports;

      transports.push(
        new Http({
          host: new URL(process.env.LOG_WEBHOOK_URL).hostname,
          port: parseInt(new URL(process.env.LOG_WEBHOOK_URL).port || '443'),
          path: new URL(process.env.LOG_WEBHOOK_URL).pathname,
          ssl: process.env.LOG_WEBHOOK_URL.startsWith('https'),
          auth: process.env.LOG_WEBHOOK_AUTH
            ? {
                username: process.env.LOG_WEBHOOK_USERNAME,
                password: process.env.LOG_WEBHOOK_PASSWORD,
              }
            : undefined,
          headers: {
            'Content-Type': 'application/json',
            'X-Service': 'hiring-api',
            'X-Environment': process.env.NODE_ENV || 'production',
          },
        })
      );

      loggerInstance.info('HTTP webhook transport enabled', {
        url: process.env.LOG_WEBHOOK_URL.replace(/\/\/.*@/, '//***@'), // Mask credentials
      });
    } catch (error) {
      loggerInstance.warn('Failed to configure HTTP webhook transport', { error });
    }
  }

  // Syslog transport (optional - requires winston-syslog package)
  if (process.env.SYSLOG_ENABLED === 'true' && process.env.SYSLOG_HOST) {
    try {
      // Dynamic import to avoid requiring package if not used
      // @ts-expect-error - Optional package, may not be installed
      const winstonSyslog = await import('winston-syslog').catch(() => null);

      if (winstonSyslog && winstonSyslog.Syslog) {
        transports.push(
          new winstonSyslog.Syslog({
            host: process.env.SYSLOG_HOST,
            port: parseInt(process.env.SYSLOG_PORT || '514'),
            protocol: (process.env.SYSLOG_PROTOCOL || 'udp') as 'udp' | 'tcp',
            app_name: 'hiring-api',
            facility: 'local0',
            localhost: process.env.SYSLOG_LOCALHOST || 'hiring-api',
          })
        );

        loggerInstance.info('Syslog transport enabled', {
          host: process.env.SYSLOG_HOST,
          port: process.env.SYSLOG_PORT || '514',
        });
      } else {
        loggerInstance.warn(
          'Syslog transport requested but winston-syslog not installed. Install with: npm install winston-syslog'
        );
      }
    } catch (error) {
      loggerInstance.warn('Failed to configure Syslog transport', { error });
    }
  }
};

// ============================================================================
// LOGGER INSTANCE
// ============================================================================
// FIX #3: Add custom levels including 'http' for Morgan
// FIX #2: Ensure level is set correctly (defaults to 'info' if not set)

export const logger = winston.createLogger({
  levels: customLevels,
  level: LOGGING.LEVEL || 'info',
  // No default format - let each transport define its own
  // This allows console to use readable format, files to use JSON
  format: winston.format.combine(
    addContext(),
    maskSensitiveData(),
    winston.format.errors({ stack: true })
  ),
  transports,

  // Don't exit on uncaught exceptions
  exitOnError: false,

  // Handle uncaught exceptions and rejections
  handleExceptions: true,
  handleRejections: true,
});

// FIX #1: Initialize centralized transports AFTER logger creation
addCentralizedTransports(logger).catch(error => {
  console.error('Failed to initialize centralized logging transports', error);
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
