/**
 * Backup All CLI Script
 * Run manually: npm run backup:all
 */

import 'dotenv/config';
import { backupDatabase, backupRedis, getBackupStatus } from '../src/services/backup.service.js';
import { logger } from '../src/utils/logger.js';

const main = async () => {
  logger.info('Starting manual backup of all services');

  const [dbResult, redisResult] = await Promise.all([backupDatabase(), backupRedis()]);

  const status = await getBackupStatus();

  console.log('\n📊 Backup Summary:');
  console.log('==================');
  console.log(`Database: ${dbResult.success ? '✅ Success' : '❌ Failed'}`);
  if (dbResult.filePath) {
    console.log(`  File: ${dbResult.filePath}`);
  }
  if (dbResult.error) {
    console.log(`  Error: ${dbResult.error}`);
  }

  console.log(`Redis: ${redisResult.success ? '✅ Success' : '❌ Failed'}`);
  if (redisResult.filePath) {
    console.log(`  File: ${redisResult.filePath}`);
  }
  if (redisResult.error) {
    console.log(`  Error: ${redisResult.error}`);
  }

  console.log('\n📈 Backup Statistics:');
  console.log('====================');
  console.log(`Total Backups: ${status.databaseBackupCount + status.redisBackupCount}`);
  console.log(`Database Backups: ${status.databaseBackupCount}`);
  console.log(`Redis Backups: ${status.redisBackupCount}`);
  console.log(`Total Size: ${(status.totalSize / 1024 / 1024).toFixed(2)} MB`);
  if (status.lastDatabaseBackup) {
    console.log(`Last DB Backup: ${status.lastDatabaseBackup.toISOString()}`);
  }
  if (status.lastRedisBackup) {
    console.log(`Last Redis Backup: ${status.lastRedisBackup.toISOString()}`);
  }

  const allSuccess = dbResult.success && redisResult.success;
  process.exit(allSuccess ? 0 : 1);
};

main().catch(error => {
  logger.error('Backup script error', { error });
  console.error('❌ Backup script error:', error);
  process.exit(1);
});
