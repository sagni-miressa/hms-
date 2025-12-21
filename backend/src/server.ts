import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { initializeScheduler } from './services/scheduler.service.js';
import { logger } from './utils/logger.js';

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.platform === 'win32' ? '127.0.0.1' : '0.0.0.0';

const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'JWT_ACCESS_PRIVATE_KEY'];

const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Check for JWT public key (required for RS256 verification)
if (!process.env.JWT_ACCESS_PUBLIC_KEY && !process.env.JWT_ACCESS_SECRET) {
  console.error(
    'Missing JWT public key: Either JWT_ACCESS_PUBLIC_KEY or JWT_ACCESS_SECRET must be set'
  );
  process.exit(1);
}

await connectDatabase();

// Initialize scheduled tasks (backups, etc.)
initializeScheduler();
logger.info('Scheduled tasks initialized');

const server = app.listen(PORT, HOST, () => {
  logger.info('Server started', { port: PORT, host: HOST, environment: process.env.NODE_ENV });
  console.log('Server running on port: ', PORT);
  
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EACCES') {
    console.error(`Port ${PORT} requires elevated privileges`);
  } else if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 30000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', reason => {
  console.error(reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error(error);
  process.exit(1);
});
