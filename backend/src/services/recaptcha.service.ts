/**
 * reCAPTCHA Service (v2)
 * Verifies reCAPTCHA v2 tokens to prevent bot registrations
 */

import axios from 'axios';
import { logger } from '@/utils/logger.js';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const REQUEST_TIMEOUT = 5000;

/**
 * Verify reCAPTCHA v2 token
 * Production-ready: Always requires proper configuration and fails closed on errors
 */
export const verifyRecaptcha = async (token: string, ipAddress?: string): Promise<boolean> => {
  if (!RECAPTCHA_SECRET_KEY) {
    logger.error(
      'reCAPTCHA secret key not configured. Please set RECAPTCHA_SECRET_KEY environment variable.'
    );
    throw new Error('reCAPTCHA verification not configured');
  }

  if (!token?.trim()) {
    logger.warn('reCAPTCHA token missing or empty');
    return false;
  }

  try {
    const response = await axios.post(RECAPTCHA_VERIFY_URL, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
        remoteip: ipAddress,
      },
      timeout: REQUEST_TIMEOUT,
    });

    const { success, challenge_ts, hostname, 'error-codes': errorCodes } = response.data;

    logger.info('reCAPTCHA v2 verification', {
      success,
      hostname,
      challenge_ts,
      errorCodes,
      ipAddress,
    });

    if (errorCodes?.length > 0) {
      logger.warn('reCAPTCHA API returned error codes', {
        errorCodes,
        tokenPrefix: token.substring(0, 10),
      });
      return false;
    }

    // reCAPTCHA v2: Check success boolean
    if (success !== true) {
      logger.warn('reCAPTCHA v2 verification failed', { success });
      return false;
    }

    return true;
  } catch (error) {
    const errorDetails: Record<string, unknown> = {
      message: error instanceof Error ? error.message : String(error),
    };

    if (error instanceof Error) {
      errorDetails.stack = error.stack;
    }

    if (axios.isAxiosError(error)) {
      errorDetails.isAxiosError = true;
      errorDetails.responseStatus = error.response?.status;
      errorDetails.responseData = error.response?.data;
    }

    logger.error('reCAPTCHA verification failed due to error', errorDetails);
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
