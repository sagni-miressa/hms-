/**
 * Database Configuration
 * Prisma Client with connection pooling and read replica support
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/utils/logger.js';

// ============================================================================
// PRISMA CLIENT CONFIGURATION
// ============================================================================

const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],

  // Connection pool settings for high concurrency
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

export const connectDatabase = async () => {
  await prisma.$connect();

  if (prismaReplica !== prisma) {
    await prismaReplica.$connect();
  }
};


// Primary database client (read/write)
export const prisma = new PrismaClient(prismaClientOptions);

// Read replica client (read-only queries)
export const prismaReplica = process.env.DATABASE_URL_READ_REPLICA
  ? new PrismaClient({
      ...prismaClientOptions,
      datasources: {
        db: {
          url: process.env.DATABASE_URL_READ_REPLICA,
        },
      },
    })
  : prisma; // Fallback to primary if no replica

// ============================================================================
// QUERY LOGGING
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  (prisma.$on as any)('query', (e: any) => {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

(prisma.$on as any)('error', (e: any) => {
  logger.error('Prisma Error', {
    message: e.message,
    target: e.target,
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    if (prismaReplica !== prisma) {
      await prismaReplica.$disconnect();
    }
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections', { error });
    throw error;
  }
};

// Handle process termination
// Commented out to prevent event loop blocking
// process.on('beforeExit', async () => {
//   await disconnectDatabase();
// });

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
};

// ============================================================================
// TRANSACTION HELPER
// ============================================================================

/**
 * Execute operations in a transaction with retry logic
 */
export const withTransaction = async <T>(
  operation: (
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >
  ) => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(operation, {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
      return result;
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Transaction attempt ${attempt} failed`, {
        error: lastError.message,
        attempt,
        maxRetries,
      });

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }

  throw lastError;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default prisma;
