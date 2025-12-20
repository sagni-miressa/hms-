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
  // For development, use ethereal.email or console logging
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'test@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'test',
      },
    });
  }

  // Production SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const getVerificationEmailTemplate = (name: string, token: string, baseUrl: string) => ({
  subject: 'Verify Your Email Address',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to Hiring Management System!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${baseUrl}/verify-email?token=${token}" class="button">Verify Email Address</a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${baseUrl}/verify-email?token=${token}</p>
        <p>This link will expire in 24 hours.</p>
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
    
    Thank you for registering. Please verify your email address by visiting:
    ${baseUrl}/verify-email?token=${token}
    
    This link will expire in 24 hours.
    
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
  token: string
): Promise<void> => {
  try {
    const baseUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
    const template = getVerificationEmailTemplate(name, token, baseUrl);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@hiring-system.com',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      // In development without SMTP, log the verification link
      logger.info('Email verification (dev mode)', {
        email,
        verificationLink: `${baseUrl}/verify-email?token=${token}`,
      });
      return;
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info('Verification email sent', { email, messageId: info.messageId });
  } catch (error) {
    logger.error('Failed to send verification email', { error, email });
    // Don't throw - email sending failure shouldn't block registration
    // In production, consider using a queue system
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
  try {
    const recipients = Array.isArray(to) ? to : [to];
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

    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      logger.warn('Alert email (dev mode)', { to: recipients, subject, message, severity });
      return;
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info('Alert email sent', { to: recipients, subject, messageId: info.messageId });
  } catch (error) {
    logger.error('Failed to send alert email', { error, to });
  }
};

export default {
  sendVerificationEmail,
  sendAlertEmail,
};
