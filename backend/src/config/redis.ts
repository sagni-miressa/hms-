/**
 * Redis Configuration
 * Cache for permissions, rate limiting, and session management
 */

import Redis from 'ioredis';
import { logger } from '@/utils/logger.js';

// ============================================================================
// REDIS CLIENT
// ============================================================================

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),

  // Connection settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,

  // Retry strategy
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  // Connection timeout
  connectTimeout: 10000,

  // Keep alive
  keepAlive: 30000,

  // Lazy connect
  lazyConnect: false,
};

export const redis = new Redis(redisConfig);

// ============================================================================
// EVENT HANDLERS
// ============================================================================

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('error', error => {
  logger.error('Redis error', { error: error.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', (delay: number) => {
  logger.info('Redis reconnecting', { delayMs: delay });
});

// ============================================================================
// CACHE UTILITIES
// ============================================================================

export class CacheService {
  private prefix: string;

  constructor(prefix: string = 'app') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(this.getKey(key));
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set cache value with TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.setex(this.getKey(key), ttlSeconds, serialized);
      } else {
        await redis.set(this.getKey(key), serialized);
      }
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(this.getKey(key));
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(this.getKey(pattern));
      if (keys.length === 0) return 0;
      return await redis.del(...keys);
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    try {
      const fullKey = this.getKey(key);
      const value = await redis.incr(fullKey);
      if (ttlSeconds && value === 1) {
        await redis.expire(fullKey, ttlSeconds);
      }
      return value;
    } catch (error) {
      logger.error('Cache increment error', { key, error });
      return 0;
    }
  }

  /**
   * Get remaining TTL
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(this.getKey(key));
    } catch (error) {
      logger.error('Cache TTL error', { key, error });
      return -1;
    }
  }
}

// ============================================================================
// SPECIALIZED CACHE SERVICES
// ============================================================================

// Permission cache (10 minute TTL)
export const permissionCache = new CacheService('perms');
export const PERMISSION_CACHE_TTL = 600; // 10 minutes

// Rate limit cache
export const rateLimitCache = new CacheService('ratelimit');

// Session cache
export const sessionCache = new CacheService('session');
export const SESSION_CACHE_TTL = 1800; // 30 minutes

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

export const disconnectRedis = async () => {
  try {
    await redis.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection', { error });
    throw error;
  }
};

// Commented out to prevent event loop blocking
// process.on('beforeExit', async () => {
//   await disconnectRedis();
// });

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed', { error });
    return false;
  }
};

export default redis;
