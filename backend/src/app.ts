/**
 * Express Application Setup
 * Security-hardened with comprehensive middleware pipeline
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import 'express-async-errors';

import { API } from './config/constants';
import { requestContext, requestLogger } from './middleware/requestContext';
import { apiRateLimit } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './routes/auth.routes.js';
import webauthnRoutes from './routes/webauthn.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import applicationsRoutes from './routes/applications.routes.js';
import systemRoutes from './routes/system.routes.js';

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================

const app = express();

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

/**
 * Helmet - Security headers
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...API.CORS.ORIGINS],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
  })
);

/**
 * CORS - Cross-Origin Resource Sharing
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (API.CORS.ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS origin blocked', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: [...API.CORS.METHODS],
    allowedHeaders: [...API.CORS.ALLOWED_HEADERS],
    credentials: API.CORS.CREDENTIALS,
    maxAge: API.CORS.MAX_AGE,
  })
);

/**
 * Body Parsers
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Compression
 */
app.use(compression());

/**
 * NoSQL Injection Prevention
 */
app.use(mongoSanitize());

/**
 * HTTP Parameter Pollution Prevention
 */
app.use(hpp());

/**
 * Trust proxy (if behind reverse proxy)
 */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ============================================================================
// CUSTOM MIDDLEWARE
// ============================================================================

/**
 * Request context (ID, timing)
 */
app.use(requestContext);

/**
 * Request logging
 */
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

/**
 * API Rate limiting
 */
app.use(API.PREFIX, apiRateLimit);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.get('/health/ready', async (_req, res) => {
  try {
    const { checkDatabaseHealth } = await import('@/config/database.js');
    const { checkRedisHealth } = await import('@/config/redis.js');

    const [dbHealthy, redisHealthy] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    const status = dbHealthy && redisHealthy ? 'ready' : 'not_ready';
    const statusCode = status === 'ready' ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy,
        redis: redisHealthy,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use(`${API.PREFIX}/auth`, authRoutes);
app.use(`${API.PREFIX}/webauthn`, webauthnRoutes);
app.use(`${API.PREFIX}/jobs`, jobsRoutes);
app.use(`${API.PREFIX}/applications`, applicationsRoutes);
app.use(`${API.PREFIX}/system`, systemRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 Not Found
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown`);

  try {
    // Close database connections
    const { disconnectDatabase } = await import('./config/database.js');
    await disconnectDatabase();

    // Close Redis connections
    const { disconnectRedis } = await import('./config/redis.js');
    await disconnectRedis();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// EXPORT
// ============================================================================

export default app;
