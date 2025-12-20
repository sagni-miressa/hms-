/**
 * reCAPTCHA Service
 * Verifies reCAPTCHA tokens to prevent bot registrations
 */

import axios from 'axios';
import { logger } from '@/utils/logger.js';

// ============================================================================
// RECAPTCHA CONFIGURATION
// ============================================================================

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// ============================================================================
// RECAPTCHA VERIFICATION
// ============================================================================

/**
 * Verify reCAPTCHA token
 */
export const verifyRecaptcha = async (token: string, ipAddress?: string): Promise<boolean> => {
  // Skip verification in development if secret key not set
  if (!RECAPTCHA_SECRET_KEY) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('reCAPTCHA verification skipped (no secret key in development)');
      return true; // Allow in development
    }
    logger.error('reCAPTCHA secret key not configured');
    throw new Error('reCAPTCHA verification not configured');
  }

  if (!token) {
    logger.warn('reCAPTCHA token missing');
    return false;
  }

  try {
    const response = await axios.post(RECAPTCHA_VERIFY_URL, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
        remoteip: ipAddress,
      },
      timeout: 5000,
    });

    const { success, score, action, challenge_ts, hostname } = response.data;

    // Log verification attempt
    logger.info('reCAPTCHA verification', {
      success,
      score,
      action,
      hostname,
      hasToken: !!token,
    });

    // For reCAPTCHA v3, check score (0.0 to 1.0, higher is better)
    // For reCAPTCHA v2, success is boolean
    if (typeof score === 'number') {
      // v3: Require score >= 0.5 (configurable)
      const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
      return success && score >= minScore;
    }

    // v2: Just check success
    return success === true;
  } catch (error) {
    logger.error('reCAPTCHA verification failed', { error });
    // Fail open in development, fail closed in production
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }
};

/**
 * Check if reCAPTCHA is enabled
 */
export const isRecaptchaEnabled = (): boolean => {
  return !!RECAPTCHA_SECRET_KEY;
};

export default {
  verifyRecaptcha,
  isRecaptchaEnabled,
};
