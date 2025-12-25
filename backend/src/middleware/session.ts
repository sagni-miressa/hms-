/**
 * Session Middleware
 * Redis-backed sessions for WebAuthn challenges
 */

import session from 'express-session';
import RedisStore from 'connect-redis';
import { redis } from '../config/redis.js';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

// Initialize store with connect-redis v7 API for ioredis
const redisStore = new RedisStore({
  client: redis as any,
  prefix: 'ats-session:',
  ttl: 300, // 5 minutes
});

export const sessionMiddleware = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'ats.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 5, // 5 minutes for challenges
  },
});

export default sessionMiddleware;
