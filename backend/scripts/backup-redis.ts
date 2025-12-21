/**
 * Redis Backup CLI Script
 * Run manually: npm run backup:redis
 */

import 'dotenv/config';
import { backupRedis } from '../src/services/backup.service.js';
import { logger } from '../src/utils/logger.js';

const main = async () => {
  logger.info('Starting manual Redis backup');

  const result = await backupRedis();

  if (result.success) {
    logger.info('Redis backup completed successfully', { filePath: result.filePath });
    console.log('✅ Redis backup completed:', result.filePath);
    process.exit(0);
  } else {
    logger.error('Redis backup failed', { error: result.error });
    console.error('❌ Redis backup failed:', result.error);
    process.exit(1);
  }
};

main().catch(error => {
  logger.error('Backup script error', { error });
  console.error('❌ Backup script error:', error);
  process.exit(1);
});
