/**
 * Email Service
 * Handles email sending for verification and notifications
 */

import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from '@/utils/logger.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesDir = join(__dirname, '..', 'templates');

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

const createTransporter = () => {
  // Check if SMTP credentials are provided
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.error('SMTP configuration incomplete. Email sending is disabled.', {
      hasHost: !!process.env.SMTP_HOST,
      hasUser: !!process.env.SMTP_USER,
      hasPass: !!process.env.SMTP_PASS,
      message: 'Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables',
    });
    return null;
  }

  // Production SMTP configuration
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Pool configuration
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // Connection timeout
      connectionTimeout: 20000, // Increased to 20s
      // Greeting timeout
      greetingTimeout: 20000,
      // Socket timeout
      socketTimeout: 20000,
    });

    logger.info('SMTP transporter created successfully');

    return transporter;
  } catch (error) {
    logger.error('Failed to create SMTP transporter', { error });
    return null;
  }
};

const transporter = createTransporter();

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Load and render email template with variables
 */
const loadTemplate = (filename: string, variables: Record<string, string>): string => {
  try {
    const templatePath = join(templatesDir, filename);
    let html = readFileSync(templatePath, 'utf-8');

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value);
    });

    return html;
  } catch (error) {
    logger.error(`Failed to load email template: ${filename}`, { error });
    throw new Error(`Failed to load email template: ${filename}`);
  }
};

const getPasswordResetEmailTemplate = (name: string, resetLink: string) => {
  const html = loadTemplate('password-reset-email.html', {
    name,
    resetLink,
  });

  return {
    subject: 'Reset Your Password',
    html,
    text: `
    Password Reset Request
    
    Hi ${name},
    
    We received a request to reset your password. Click the link below to reset it:
    
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    
    For security reasons, this link can only be used once.
  `,
  };
};

const getVerificationEmailTemplate = (name: string, code: string) => {
  const html = loadTemplate('verification-email.html', {
    name,
    code,
  });

  return {
    subject: 'Verify Your Email Address',
    html,
    text: `
    Welcome to Hiring Management System!
    
    Hi ${name},
    
    Thank you for registering. Please verify your email address using the following 6-digit code:
    
    ${code}
    
    This code will expire in 10 minutes.
    
    Enter this code on the verification page to complete your registration.
    
    If you didn't create this account, please ignore this email.
  `,
  };
};

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send email verification
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  code: string
): Promise<void> => {
  try {
    const template = getVerificationEmailTemplate(name, code);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@recruithub.com',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    // Verify transporter is configured - throw error if not (configuration issue)
    if (!transporter) {
      const error = new Error(
        'SMTP transporter not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.'
      );
      logger.error('Cannot send verification email - SMTP not configured', {
        email,
        error: error.message,
      });
      throw error; // Configuration errors should propagate
    }

    // Attempt to send email
    const info = await transporter.sendMail(mailOptions);

    // Verify email was accepted
    if (info.rejected && info.rejected.length > 0) {
      logger.warn('Email was rejected by server', {
        email,
        rejected: info.rejected,
        accepted: info.accepted,
      });
    }

    logger.info('Verification email sent successfully', {
      email,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    // Log all errors for monitoring
    logger.error('Failed to send verification email', {
      error,
      email,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    // Re-throw configuration errors so they're visible to callers
    // Network/transmission errors are logged but not re-thrown to avoid blocking registration
    if (error instanceof Error && error.message.includes('SMTP transporter not configured')) {
      throw error;
    }
    // Other errors (network issues, etc.) are logged but not thrown
    // This allows registration to succeed even if email delivery temporarily fails
    // In production, consider using a queue system for reliable email delivery
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetLink: string
): Promise<void> => {
  try {
    const template = getPasswordResetEmailTemplate(name, resetLink);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@recruithub.com',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    // Verify transporter is configured - throw error if not (configuration issue)
    if (!transporter) {
      const error = new Error(
        'SMTP transporter not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.'
      );
      logger.error('Cannot send password reset email - SMTP not configured', {
        email,
        error: error.message,
      });
      throw error; // Configuration errors should propagate
    }

    // Attempt to send email
    const info = await transporter.sendMail(mailOptions);

    // Verify email was accepted
    if (info.rejected && info.rejected.length > 0) {
      logger.warn('Password reset email was rejected by server', {
        email,
        rejected: info.rejected,
        accepted: info.accepted,
      });
    }

    logger.info('Password reset email sent successfully', {
      email,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    // Log all errors for monitoring
    logger.error('Failed to send password reset email', {
      error,
      email,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    // Re-throw configuration errors so they're visible to callers
    if (error instanceof Error && error.message.includes('SMTP transporter not configured')) {
      throw error;
    }
    // Other errors (network issues, etc.) are logged but not thrown
  }
};

/**
 * Send alert email
 */
export const sendAlertEmail = async (
  to: string | string[],
  subject: string,
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): Promise<void> => {
  const recipients = Array.isArray(to) ? to : [to];
  try {
    // Severity colors matching system theme
    const severityConfig = {
      low: {
        color: '#10B981',
        bg: '#ecfdf5',
      },
      medium: {
        color: '#ec7f13', // Primary orange
        bg: '#fef7ed',
      },
      high: {
        color: '#f4993c', // Primary orange-400
        bg: '#fef7ed',
      },
      critical: {
        color: '#b2590c', // Primary orange-700
        bg: '#fff5eb',
      },
    };

    const config = severityConfig[severity];

    const html = loadTemplate('alert-email.html', {
      severity: severity.toUpperCase(),
      subject,
      message,
      severityColor: config.color,
      severityBg: config.bg,
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'alerts@recruithub.com',
      to: recipients.join(', '),
      subject: `[${severity.toUpperCase()}] ${subject}`,
      html,
      text: `[${severity.toUpperCase()}] ${subject}\n\n${message}`,
    };

    // Verify transporter is configured - throw error if not (configuration issue)
    if (!transporter) {
      const error = new Error('SMTP transporter not configured. Cannot send alert email.');
      logger.error('Cannot send alert email - SMTP not configured', {
        to: recipients,
        subject,
        severity,
        error: error.message,
      });
      throw error; // Configuration errors should propagate
    }

    // Attempt to send email
    const info = await transporter.sendMail(mailOptions);

    // Verify email was accepted
    if (info.rejected && info.rejected.length > 0) {
      logger.warn('Alert email was rejected by server', {
        to: recipients,
        rejected: info.rejected,
        accepted: info.accepted,
      });
    }

    logger.info('Alert email sent successfully', {
      to: recipients,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    // Log all errors for monitoring
    logger.error('Failed to send alert email', {
      error,
      to: recipients,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    // Re-throw configuration errors so they're visible to callers
    if (error instanceof Error && error.message.includes('SMTP transporter not configured')) {
      throw error;
    }
    // Other errors (network issues, etc.) are logged but not thrown
    // Alert emails failing shouldn't break the application flow
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAlertEmail,
};
