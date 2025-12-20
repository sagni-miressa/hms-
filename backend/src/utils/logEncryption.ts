/**
 * Log Encryption Utility
 * Encrypts sensitive audit log data
 */

import crypto from 'crypto';
import { logger } from './logger.js';

// ============================================================================
// ENCRYPTION CONFIGURATION
// ============================================================================

const ENCRYPTION_KEY = process.env.LOG_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// ============================================================================
// ENCRYPTION FUNCTIONS
// ============================================================================

/**
 * Derive encryption key from master key
 */
const deriveKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};

/**
 * Encrypt sensitive log data
 */
export const encryptLogData = (data: string): string | null => {
  if (!ENCRYPTION_KEY) {
    // In development, log warning but don't fail
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Log encryption key not set, logs will not be encrypted');
      return data; // Return unencrypted in development
    }
    logger.error('Log encryption key not configured');
    return null;
  }

  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(ENCRYPTION_KEY, salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);

    return combined.toString('base64');
  } catch (error) {
    logger.error('Failed to encrypt log data', { error });
    return null;
  }
};

/**
 * Decrypt sensitive log data
 */
export const decryptLogData = (encryptedData: string): string | null => {
  if (!ENCRYPTION_KEY) {
    logger.error('Log encryption key not configured');
    return null;
  }

  try {
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = deriveKey(ENCRYPTION_KEY, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decryptedBuffer = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decryptedBuffer.toString('utf8');
  } catch (error) {
    logger.error('Failed to decrypt log data', { error });
    return null;
  }
};

/**
 * Encrypt sensitive fields in log object
 */
export const encryptSensitiveFields = (logData: Record<string, any>): Record<string, any> => {
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'refreshToken',
    'mfaSecret',
    'email',
    'phone',
    'ssn',
    'creditCard',
    'ipAddress',
  ];

  const encrypted: Record<string, any> = { ...logData };

  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      const encryptedValue = encryptLogData(encrypted[field]);
      if (encryptedValue) {
        encrypted[`${field}_encrypted`] = encryptedValue;
        delete encrypted[field]; // Remove plaintext
      }
    }
  }

  return encrypted;
};

/**
 * Check if encryption is enabled
 */
export const isEncryptionEnabled = (): boolean => {
  return !!ENCRYPTION_KEY;
};

export default {
  encryptLogData,
  decryptLogData,
  encryptSensitiveFields,
  isEncryptionEnabled,
};
