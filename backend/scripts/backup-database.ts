/**
 * Database Backup CLI Script
 * Run manually: npm run backup:db
 */

import 'dotenv/config';
import { backupDatabase } from '../src/services/backup.service.js';
import { logger } from '../src/utils/logger.js';

const main = async () => {
  logger.info('Starting manual database backup');

  const result = await backupDatabase();

  if (result.success) {
    logger.info('Database backup completed successfully', { filePath: result.filePath });
    console.log('✅ Database backup completed:', result.filePath);
    process.exit(0);
  } else {
    logger.error('Database backup failed', { error: result.error });
    console.error('❌ Database backup failed:', result.error);
    process.exit(1);
  }
};

main().catch(error => {
  logger.error('Backup script error', { error });
  console.error('❌ Backup script error:', error);
  process.exit(1);
});
