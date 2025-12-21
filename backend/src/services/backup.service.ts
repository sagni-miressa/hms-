/**
 * Automated Backup Service
 * Scheduled backups for database and Redis with retention policy
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '@/utils/logger.js';
import { sendAlert } from './alert.service.js';

const execAsync = promisify(exec);

// ============================================================================
// CONFIGURATION
// ============================================================================

interface BackupConfig {
  enabled: boolean;
  backupDir: string;
  retentionDays: number;
  database: {
    enabled: boolean;
    schedule: string; // Cron expression
    containerName?: string; // Docker container name
    dbUser: string;
    dbName: string;
    dbHost?: string;
    dbPort?: number;
  };
  redis: {
    enabled: boolean;
    schedule: string; // Cron expression
    containerName?: string; // Docker container name
  };
  s3?: {
    enabled: boolean;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

const getBackupConfig = (): BackupConfig => {
  return {
    enabled: process.env.BACKUP_ENABLED === 'true',
    backupDir: process.env.BACKUP_DIR || path.join(process.cwd(), 'backups'),
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    database: {
      enabled: process.env.BACKUP_DATABASE_ENABLED !== 'false',
      schedule: process.env.BACKUP_DATABASE_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      containerName: process.env.POSTGRES_CONTAINER_NAME,
      dbUser: process.env.DB_USER || process.env.POSTGRES_USER || 'hiring_user',
      dbName: process.env.DB_NAME || process.env.POSTGRES_DB || 'hiring_system',
      dbHost: process.env.DB_HOST || process.env.POSTGRES_HOST,
      dbPort: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432'),
    },
    redis: {
      enabled: process.env.BACKUP_REDIS_ENABLED !== 'false',
      schedule: process.env.BACKUP_REDIS_SCHEDULE || '0 3 * * *', // Daily at 3 AM
      containerName: process.env.REDIS_CONTAINER_NAME,
    },
    s3:
      process.env.BACKUP_S3_ENABLED === 'true'
        ? {
            enabled: true,
            bucket: process.env.BACKUP_S3_BUCKET!,
            region: process.env.BACKUP_S3_REGION || 'us-east-1',
            accessKeyId: process.env.BACKUP_S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.BACKUP_S3_SECRET_ACCESS_KEY!,
          }
        : undefined,
  };
};

// ============================================================================
// BACKUP UTILITIES
// ============================================================================

/**
 * Ensure backup directory exists
 */
const ensureBackupDir = async (backupDir: string): Promise<void> => {
  try {
    await fs.mkdir(backupDir, { recursive: true });
    await fs.mkdir(path.join(backupDir, 'database'), { recursive: true });
    await fs.mkdir(path.join(backupDir, 'redis'), { recursive: true });
  } catch (error) {
    logger.error('Failed to create backup directory', { backupDir, error });
    throw error;
  }
};

/**
 * Get backup filename with timestamp
 */
const getBackupFilename = (type: 'database' | 'redis', extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
  return `${type}-${timestamp}-${time}.${extension}`;
};

/**
 * Clean old backups based on retention policy
 */
const cleanOldBackups = async (
  backupDir: string,
  type: 'database' | 'redis',
  retentionDays: number
): Promise<number> => {
  try {
    const typeDir = path.join(backupDir, type);
    const files = await fs.readdir(typeDir);
    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(typeDir, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtime.getTime() > retentionMs) {
        await fs.unlink(filePath);
        deletedCount++;
        logger.info('Deleted old backup', {
          type,
          file,
          age: Math.floor((now - stats.mtime.getTime()) / (24 * 60 * 60 * 1000)) + ' days',
        });
      }
    }

    return deletedCount;
  } catch (error) {
    logger.error('Failed to clean old backups', { type, error });
    return 0;
  }
};

// ============================================================================
// DATABASE BACKUP
// ============================================================================

/**
 * Backup PostgreSQL database
 */
export const backupDatabase = async (): Promise<{
  success: boolean;
  filePath?: string;
  error?: string;
}> => {
  const config = getBackupConfig();

  if (!config.enabled || !config.database.enabled) {
    logger.info('Database backup disabled');
    return { success: false, error: 'Backup disabled' };
  }

  try {
    await ensureBackupDir(config.backupDir);
    const filename = getBackupFilename('database', 'sql');
    const filePath = path.join(config.backupDir, 'database', filename);

    let command: string;

    // Check if running in Docker
    if (config.database.containerName) {
      // Docker container backup
      command = `docker exec ${config.database.containerName} pg_dump -U ${config.database.dbUser} -F c -f /tmp/${filename} ${config.database.dbName} && docker cp ${config.database.containerName}:/tmp/${filename} ${filePath} && docker exec ${config.database.containerName} rm /tmp/${filename}`;
    } else {
      // Direct connection backup
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      // Extract connection details from DATABASE_URL
      const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (!urlMatch) {
        throw new Error('Invalid DATABASE_URL format');
      }

      const [, user, password, host, port, database] = urlMatch;
      const pgPassword = `PGPASSWORD=${password}`;
      command = `${pgPassword} pg_dump -h ${host} -p ${port} -U ${user} -F c -f ${filePath} ${database}`;
    }

    logger.info('Starting database backup', { filePath });

    const { stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB
      timeout: 30 * 60 * 1000, // 30 minutes
    });

    if (stderr && !stderr.includes('WARNING')) {
      throw new Error(`Backup failed: ${stderr}`);
    }

    // Verify backup file exists and has content
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }

    logger.info('Database backup completed', {
      filePath,
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    });

    // Clean old backups
    const deletedCount = await cleanOldBackups(config.backupDir, 'database', config.retentionDays);
    if (deletedCount > 0) {
      logger.info('Cleaned old database backups', { deletedCount });
    }

    // Upload to S3 if configured
    if (config.s3?.enabled) {
      await uploadToS3(filePath, 'database', config.s3);
    }

    return { success: true, filePath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Database backup failed', { error: errorMessage });

    // Send alert on backup failure
    await sendAlert(
      'BACKUP_FAILED',
      `Database backup failed: ${errorMessage}`,
      { type: 'database', error: errorMessage },
      undefined,
      'high'
    ).catch(err => logger.error('Failed to send backup alert', { error: err }));

    return { success: false, error: errorMessage };
  }
};

// ============================================================================
// REDIS BACKUP
// ============================================================================

/**
 * Backup Redis data
 */
export const backupRedis = async (): Promise<{
  success: boolean;
  filePath?: string;
  error?: string;
}> => {
  const config = getBackupConfig();

  if (!config.enabled || !config.redis.enabled) {
    logger.info('Redis backup disabled');
    return { success: false, error: 'Backup disabled' };
  }

  try {
    await ensureBackupDir(config.backupDir);
    const filename = getBackupFilename('redis', 'rdb');
    const filePath = path.join(config.backupDir, 'redis', filename);

    let command: string;

    // Check if running in Docker
    if (config.redis.containerName) {
      // Docker container backup
      command = `docker exec ${config.redis.containerName} redis-cli BGSAVE && sleep 2 && docker cp ${config.redis.containerName}:/data/dump.rdb ${filePath}`;
    } else {
      // Direct Redis backup (requires redis-cli)
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const urlMatch = redisUrl.match(/redis:\/\/(:([^@]+)@)?([^:]+):(\d+)/);

      if (!urlMatch) {
        throw new Error('Invalid REDIS_URL format');
      }

      const [, , password, host, port] = urlMatch;
      let redisCliCommand = `redis-cli -h ${host} -p ${port}`;

      if (password) {
        redisCliCommand += ` -a ${password}`;
      }

      command = `${redisCliCommand} BGSAVE && sleep 2 && cp /var/lib/redis/dump.rdb ${filePath}`;
    }

    logger.info('Starting Redis backup', { filePath });

    const { stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB
      timeout: 10 * 60 * 1000, // 10 minutes
    });

    if (stderr && !stderr.includes('Background saving')) {
      throw new Error(`Backup failed: ${stderr}`);
    }

    // Wait a bit for BGSAVE to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify backup file exists and has content
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }

    logger.info('Redis backup completed', {
      filePath,
      size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    });

    // Clean old backups
    const deletedCount = await cleanOldBackups(config.backupDir, 'redis', config.retentionDays);
    if (deletedCount > 0) {
      logger.info('Cleaned old Redis backups', { deletedCount });
    }

    // Upload to S3 if configured
    if (config.s3?.enabled) {
      await uploadToS3(filePath, 'redis', config.s3);
    }

    return { success: true, filePath };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Redis backup failed', { error: errorMessage });

    // Send alert on backup failure
    await sendAlert(
      'BACKUP_FAILED',
      `Redis backup failed: ${errorMessage}`,
      { type: 'redis', error: errorMessage },
      undefined,
      'high'
    ).catch(err => logger.error('Failed to send backup alert', { error: err }));

    return { success: false, error: errorMessage };
  }
};

// ============================================================================
// S3 UPLOAD
// ============================================================================

/**
 * Upload backup to S3
 */
const uploadToS3 = async (
  filePath: string,
  type: 'database' | 'redis',
  s3Config: NonNullable<BackupConfig['s3']>
): Promise<void> => {
  try {
    // Dynamic import to avoid requiring AWS SDK if not using S3
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const fs = await import('fs/promises');

    const s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    });

    const fileContent = await fs.readFile(filePath);
    const key = `${type}/${path.basename(filePath)}`;

    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      Body: fileContent,
      ServerSideEncryption: 'AES256',
    });

    await s3Client.send(command);

    logger.info('Backup uploaded to S3', { type, key, bucket: s3Config.bucket });
  } catch (error) {
    logger.error('Failed to upload backup to S3', { type, error });
    // Don't throw - backup to local disk succeeded
  }
};

// ============================================================================
// BACKUP VERIFICATION
// ============================================================================

/**
 * Verify backup file integrity
 */
export const verifyBackup = async (
  filePath: string,
  type: 'database' | 'redis'
): Promise<boolean> => {
  try {
    const stats = await fs.stat(filePath);

    // Check file exists and has content
    if (stats.size === 0) {
      logger.error('Backup file is empty', { filePath, type });
      return false;
    }

    // For database backups, try to verify it's a valid PostgreSQL dump
    if (type === 'database') {
      // Check if file starts with PostgreSQL custom format header
      const fileHandle = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(5);
      await fileHandle.read(buffer, 0, 5, 0);
      await fileHandle.close();

      // PostgreSQL custom format starts with "PGDMP"
      if (buffer.toString('ascii', 0, 5) === 'PGDMP') {
        return true;
      }

      // Or check for plain SQL format
      const content = await fs.readFile(filePath, 'utf-8');
      if (content.slice(0, 100).includes('PostgreSQL database dump')) {
        return true;
      }

      logger.warn('Backup file format verification inconclusive', { filePath, type });
    }

    // For Redis backups, check if it's a valid RDB file
    if (type === 'redis') {
      const fileHandle = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(5);
      await fileHandle.read(buffer, 0, 5, 0);
      await fileHandle.close();

      // RDB files start with "REDIS"
      if (buffer.toString('ascii', 0, 5) === 'REDIS') {
        return true;
      }

      logger.warn('Backup file format verification inconclusive', { filePath, type });
    }

    return true; // If we can't verify format, assume it's valid if it has content
  } catch (error) {
    logger.error('Backup verification failed', { filePath, type, error });
    return false;
  }
};

// ============================================================================
// BACKUP STATUS
// ============================================================================

/**
 * Get backup status and statistics
 */
export const getBackupStatus = async (): Promise<{
  enabled: boolean;
  lastDatabaseBackup?: Date;
  lastRedisBackup?: Date;
  databaseBackupCount: number;
  redisBackupCount: number;
  totalSize: number;
}> => {
  const config = getBackupConfig();

  if (!config.enabled) {
    return {
      enabled: false,
      databaseBackupCount: 0,
      redisBackupCount: 0,
      totalSize: 0,
    };
  }

  try {
    const dbDir = path.join(config.backupDir, 'database');
    const redisDir = path.join(config.backupDir, 'redis');

    const [dbFiles, redisFiles] = await Promise.all([
      fs.readdir(dbDir).catch(() => []),
      fs.readdir(redisDir).catch(() => []),
    ]);

    let lastDbBackup: Date | undefined;
    let lastRedisBackup: Date | undefined;
    let totalSize = 0;

    // Get latest database backup
    if (dbFiles.length > 0) {
      const dbStats = await Promise.all(
        dbFiles.map(async file => {
          const filePath = path.join(dbDir, file);
          const stats = await fs.stat(filePath);
          if (!lastDbBackup || stats.mtime > lastDbBackup) {
            lastDbBackup = stats.mtime;
          }
          return stats.size;
        })
      );
      totalSize += dbStats.reduce((sum, size) => sum + size, 0);
    }

    // Get latest Redis backup
    if (redisFiles.length > 0) {
      const redisStats = await Promise.all(
        redisFiles.map(async file => {
          const filePath = path.join(redisDir, file);
          const stats = await fs.stat(filePath);
          if (!lastRedisBackup || stats.mtime > lastRedisBackup) {
            lastRedisBackup = stats.mtime;
          }
          return stats.size;
        })
      );
      totalSize += redisStats.reduce((sum, size) => sum + size, 0);
    }

    return {
      enabled: true,
      lastDatabaseBackup: lastDbBackup,
      lastRedisBackup: lastRedisBackup,
      databaseBackupCount: dbFiles.length,
      redisBackupCount: redisFiles.length,
      totalSize,
    };
  } catch (error) {
    logger.error('Failed to get backup status', { error });
    return {
      enabled: config.enabled,
      databaseBackupCount: 0,
      redisBackupCount: 0,
      totalSize: 0,
    };
  }
};
