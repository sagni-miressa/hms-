/**
 * Scheduled Tasks Service
 * Manages cron jobs for automated backups and other scheduled tasks
 */

import cron from 'node-cron';
import { logger } from '@/utils/logger.js';
import { backupDatabase, backupRedis } from './backup.service.js';

// ============================================================================
// SCHEDULER CONFIGURATION
// ============================================================================

interface ScheduledTask {
  name: string;
  schedule: string;
  task: () => Promise<void>;
  enabled: boolean;
}

// ============================================================================
// SCHEDULED TASKS
// ============================================================================

const tasks: ScheduledTask[] = [];

/**
 * Initialize scheduled tasks
 */
export const initializeScheduler = (): void => {
  const backupEnabled = process.env.BACKUP_ENABLED === 'true';

  if (!backupEnabled) {
    logger.info('Backup scheduler disabled');
    return;
  }

  // Database backup task
  const dbSchedule = process.env.BACKUP_DATABASE_SCHEDULE || '0 2 * * *'; // Daily at 2 AM
  if (process.env.BACKUP_DATABASE_ENABLED !== 'false') {
    tasks.push({
      name: 'database-backup',
      schedule: dbSchedule,
      enabled: true,
      task: async () => {
        logger.info('Running scheduled database backup');
        const result = await backupDatabase();
        if (result.success) {
          logger.info('Scheduled database backup completed', { filePath: result.filePath });
        } else {
          logger.error('Scheduled database backup failed', { error: result.error });
        }
      },
    });
  }

  // Redis backup task
  const redisSchedule = process.env.BACKUP_REDIS_SCHEDULE || '0 3 * * *'; // Daily at 3 AM
  if (process.env.BACKUP_REDIS_ENABLED !== 'false') {
    tasks.push({
      name: 'redis-backup',
      schedule: redisSchedule,
      enabled: true,
      task: async () => {
        logger.info('Running scheduled Redis backup');
        const result = await backupRedis();
        if (result.success) {
          logger.info('Scheduled Redis backup completed', { filePath: result.filePath });
        } else {
          logger.error('Scheduled Redis backup failed', { error: result.error });
        }
      },
    });
  }

  // Start all enabled tasks
  for (const task of tasks) {
    if (task.enabled && cron.validate(task.schedule)) {
      cron.schedule(task.schedule, async () => {
        try {
          await task.task();
        } catch (error) {
          logger.error(`Scheduled task failed: ${task.name}`, { error });
        }
      });

      logger.info('Scheduled task registered', {
        name: task.name,
        schedule: task.schedule,
      });
    } else if (!cron.validate(task.schedule)) {
      logger.error('Invalid cron schedule', {
        name: task.name,
        schedule: task.schedule,
      });
    }
  }

  logger.info(`Scheduler initialized with ${tasks.length} task(s)`);
};

/**
 * Get scheduler status
 */
export const getSchedulerStatus = (): {
  enabled: boolean;
  tasks: Array<{ name: string; schedule: string; enabled: boolean }>;
} => {
  return {
    enabled: process.env.BACKUP_ENABLED === 'true',
    tasks: tasks.map(t => ({
      name: t.name,
      schedule: t.schedule,
      enabled: t.enabled,
    })),
  };
};

/**
 * Manually trigger a scheduled task
 */
export const triggerTask = async (
  taskName: string
): Promise<{ success: boolean; error?: string }> => {
  const task = tasks.find(t => t.name === taskName);

  if (!task) {
    return { success: false, error: `Task not found: ${taskName}` };
  }

  if (!task.enabled) {
    return { success: false, error: `Task is disabled: ${taskName}` };
  }

  try {
    logger.info('Manually triggering task', { taskName });
    await task.task();
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Manual task execution failed', { taskName, error: errorMessage });
    return { success: false, error: errorMessage };
  }
};
