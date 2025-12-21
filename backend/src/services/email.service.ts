/**
 * Email Service
 * Handles email sending for verification and notifications
 */

import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger.js';

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
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Connection timeout
      connectionTimeout: 10000,
      // Greeting timeout
      greetingTimeout: 10000,
      // Socket timeout
      socketTimeout: 10000,
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

const getVerificationEmailTemplate = (name: string, code: string) => ({
  subject: 'Verify Your Email Address',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code-container { background-color: #F3F4F6; border: 2px dashed #4F46E5; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; }
        .verification-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; font-family: 'Courier New', monospace; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
        .warning { color: #EF4444; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to Hiring Management System!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email address using the 6-digit code below:</p>
        <div class="code-container">
          <p style="margin: 0 0 10px 0; color: #666;">Your verification code:</p>
          <div class="verification-code">${code}</div>
        </div>
        <p class="warning">⚠️ This code will expire in 10 minutes.</p>
        <p>Enter this code on the verification page to complete your registration.</p>
        <div class="footer">
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Welcome to Hiring Management System!
    
    Hi ${name},
    
    Thank you for registering. Please verify your email address using the following 6-digit code:
    
    ${code}
    
    This code will expire in 10 minutes.
    
    Enter this code on the verification page to complete your registration.
    
    If you didn't create this account, please ignore this email.
  `,
});

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
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@hiring-system.com',
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
      // In development, log the code to console for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('\n========================================');
        console.log('📧 EMAIL VERIFICATION CODE (NO SMTP)');
        console.log('========================================');
        console.log(`Email: ${email}`);
        console.log(`Verification Code: ${code}`);
        console.log('========================================\n');
      }
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
    const severityColors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#DC2626',
    };

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'alerts@hiring-system.com',
      to: recipients.join(', '),
      subject: `[${severity.toUpperCase()}] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert { padding: 15px; border-left: 4px solid ${severityColors[severity]}; background-color: #F9FAFB; margin: 20px 0; }
            .severity { display: inline-block; padding: 4px 8px; background-color: ${severityColors[severity]}; color: white; border-radius: 3px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Security Alert</h2>
            <div class="alert">
              <span class="severity">${severity.toUpperCase()}</span>
              <h3>${subject}</h3>
              <p>${message}</p>
            </div>
            <p>This is an automated alert from the Hiring Management System.</p>
          </div>
        </body>
        </html>
      `,
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
  sendAlertEmail,
};
