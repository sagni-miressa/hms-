/**
 * Authentication Service
 * JWT-based authentication with MFA support
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import { prisma } from '@/config/database.js';
import { sessionCache, SESSION_CACHE_TTL } from '@/config/redis.js';
import { SECURITY } from '@/config/constants.js';
import { logger, logAudit, logSecurity } from '@/utils/logger.js';
import {
  InvalidCredentialsError,
  AccountLockedError,
  AccountInactiveError,
  MFARequiredError,
  InvalidMFACodeError,
  TokenExpiredError,
  TokenInvalidError,
} from '@/utils/errors.js';
import type { JWTPayload, AuthenticatedUser, MFASetupResult } from '@/types/index.js';
import { Role, ClearanceLevel } from '@prisma/client';

// ============================================================================
// JWT UTILITIES
// ============================================================================

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (user: AuthenticatedUser): string => {
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    roles: user.roles,
    clearanceLevel: user.clearanceLevel,
    type: 'access',
  };

  const options: jwt.SignOptions = {
    expiresIn: SECURITY.JWT.ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: SECURITY.JWT.ISSUER,
    audience: SECURITY.JWT.AUDIENCE,
    algorithm: SECURITY.JWT.ALGORITHM,
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_PRIVATE_KEY!, options);
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = async (
  userId: string,
  deviceId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> => {
  const token = nanoid(64);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      deviceId,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return token;
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    // For RS256, use public key for verification
    const publicKey = process.env.JWT_ACCESS_PUBLIC_KEY || process.env.JWT_ACCESS_SECRET;

    if (!publicKey) {
      throw new TokenInvalidError('JWT public key not configured');
    }

    const payload = jwt.verify(token, publicKey, {
      issuer: SECURITY.JWT.ISSUER,
      audience: SECURITY.JWT.AUDIENCE,
      algorithms: [SECURITY.JWT.ALGORITHM as any],
    }) as JWTPayload;

    if (payload.type !== 'access') {
      throw new TokenInvalidError('Invalid token type');
    }

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TokenInvalidError(`Token verification failed: ${error.message}`);
    }
    throw new TokenInvalidError();
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = async (token: string): Promise<string> => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken || refreshToken.revokedAt) {
    throw new TokenInvalidError('Invalid or revoked refresh token');
  }

  if (refreshToken.expiresAt < new Date()) {
    throw new TokenExpiredError('Refresh token expired');
  }

  // Update last used timestamp
  await prisma.refreshToken.update({
    where: { id: refreshToken.id },
    data: { lastUsedAt: new Date() },
  });

  return refreshToken.userId;
};

/**
 * Revoke refresh token
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revokedAt: new Date() },
  });
};

/**
 * Revoke all user refresh tokens
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

/**
 * Hash password with bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SECURITY.PASSWORD.MIN_LENGTH);
};

/**
 * Verify password
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < SECURITY.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY.PASSWORD.MIN_LENGTH} characters`);
  }

  if (SECURITY.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (SECURITY.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (SECURITY.PASSWORD.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (SECURITY.PASSWORD.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

// ============================================================================
// MFA UTILITIES
// ============================================================================

/**
 * Generate MFA secret and QR code
 */
export const generateMFASecret = async (email: string): Promise<MFASetupResult> => {
  const secret = speakeasy.generateSecret({
    name: `${SECURITY.MFA.WINDOW} (${email})`,
    issuer: process.env.MFA_ISSUER || 'Hiring System',
    length: 32,
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () => nanoid(10));

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes,
  };
};

/**
 * Verify MFA token
 */
export const verifyMFAToken = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: SECURITY.MFA.WINDOW,
  });
};

// ============================================================================
// ACCOUNT LOCKOUT
// ============================================================================

/**
 * Check if account is locked
 */
const checkAccountLockout = async (user: any): Promise<void> => {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AccountLockedError('Account is locked', user.lockedUntil);
  }

  // Reset lockout if time has passed
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { lockedUntil: null, failedLoginCount: 0 },
    });
  }
};

/**
 * Increment failed login attempts
 */
const handleFailedLogin = async (userId: string, ipAddress?: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginCount: true },
  });

  if (!user) return;

  const newCount = (user.failedLoginCount || 0) + 1;

  const updateData: any = {
    failedLoginCount: newCount,
  };

  // Lock account if max attempts reached
  if (newCount >= SECURITY.LOCKOUT.MAX_FAILED_ATTEMPTS) {
    updateData.lockedUntil = new Date(
      Date.now() + SECURITY.LOCKOUT.LOCKOUT_DURATION_MINUTES * 60 * 1000
    );

    logSecurity({
      userId,
      event: 'ACCOUNT_LOCKED',
      severity: 'high',
      details: { reason: 'Too many failed login attempts', attempts: newCount },
    });

    // Send alert on account lockout
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user) {
      const { alertAccountLocked } = await import('@/services/alert.service.js');
      await alertAccountLocked(userId, user.email, 'Too many failed login attempts', ipAddress);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

/**
 * Reset failed login attempts
 */
const resetFailedLoginAttempts = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount: 0, lockedUntil: null },
  });
};

// ============================================================================
// AUTHENTICATION METHODS
// ============================================================================

/**
 * Login with email and password
 */
export const login = async (
  email: string,
  password: string,
  mfaToken?: string,
  deviceId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; refreshToken: string; requiresMFA: boolean }> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    logAudit({
      action: 'LOGIN_FAILED',
      details: { email, reason: 'User not found' },
      ipAddress,
      userAgent,
      success: false,
    });
    throw new InvalidCredentialsError();
  }

  // Check account status
  await checkAccountLockout(user);

  if (!user.isActive) {
    throw new AccountInactiveError();
  }

  // Check if user is OAuth-only (no password)
  if (!user.passwordHash) {
    logAudit({
      userId: user.id,
      action: 'LOGIN_FAILED',
      details: { reason: 'OAuth-only account - password login not available' },
      ipAddress,
      userAgent,
      success: false,
    });
    throw new InvalidCredentialsError(
      'This account uses OAuth login. Please sign in with your OAuth provider.'
    );
  }

  // Check email verification
  if (!user.isVerified) {
    logAudit({
      userId: user.id,
      action: 'LOGIN_FAILED',
      details: { reason: 'Email not verified' },
      ipAddress,
      userAgent,
      success: false,
    });
    throw new InvalidCredentialsError('Please verify your email address before logging in');
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    await handleFailedLogin(user.id, ipAddress);

    logAudit({
      userId: user.id,
      action: 'LOGIN_FAILED',
      details: { reason: 'Invalid password' },
      ipAddress,
      userAgent,
      success: false,
    });

    // Alert on multiple failed logins
    const failedCount =
      (
        await prisma.user.findUnique({
          where: { id: user.id },
          select: { failedLoginCount: true },
        })
      )?.failedLoginCount || 0;

    if (failedCount >= 3) {
      const { alertFailedLogins } = await import('@/services/alert.service.js');
      await alertFailedLogins(user.id, user.email, failedCount, ipAddress);
    }

    throw new InvalidCredentialsError();
  }

  // Check MFA
  if (user.mfaEnabled) {
    if (!mfaToken) {
      throw new MFARequiredError();
    }

    const isMFAValid = verifyMFAToken(user.mfaSecret!, mfaToken);

    if (!isMFAValid) {
      logSecurity({
        userId: user.id,
        event: 'INVALID_MFA_ATTEMPT',
        severity: 'medium',
        ipAddress,
        userAgent,
      });
      throw new InvalidMFACodeError();
    }
  }

  // Reset failed attempts
  await resetFailedLoginAttempts(user.id);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      lastActivityAt: new Date(),
    },
  });

  // Generate tokens
  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
    clearanceLevel: user.clearanceLevel,
    department: user.department,
    isActive: user.isActive,
    mfaEnabled: user.mfaEnabled,
  };

  const accessToken = generateAccessToken(authenticatedUser);
  const refreshToken = await generateRefreshToken(user.id, deviceId, ipAddress, userAgent);

  // Cache session
  await sessionCache.set(`session:${user.id}`, authenticatedUser, SESSION_CACHE_TTL);

  logAudit({
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    ipAddress,
    userAgent,
    success: true,
  });

  return {
    accessToken,
    refreshToken,
    requiresMFA: false,
  };
};

/**
 * Logout user
 */
export const logout = async (userId: string, refreshToken?: string): Promise<void> => {
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  await sessionCache.delete(`session:${userId}`);

  logAudit({
    userId,
    action: 'LOGOUT',
    success: true,
  });
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const userId = await verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new TokenInvalidError();
  }

  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
    clearanceLevel: user.clearanceLevel,
    department: user.department,
    isActive: user.isActive,
    mfaEnabled: user.mfaEnabled,
  };

  const newAccessToken = generateAccessToken(authenticatedUser);
  const newRefreshToken = await generateRefreshToken(user.id);

  // Revoke old refresh token
  await revokeRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Register new applicant
 */
export const register = async (
  email: string,
  password: string,
  fullName: string
): Promise<{ userId: string }> => {
  // Validate password
  const passwordErrors = validatePasswordStrength(password);
  if (passwordErrors.length > 0) {
    throw new Error(passwordErrors.join(', '));
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes (typical for codes)

  // Create user with profile
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      roles: [Role.APPLICANT],
      clearanceLevel: ClearanceLevel.PUBLIC,
      isVerified: false, // Require email verification
      profile: {
        create: {
          fullName,
        },
      },
    },
  });

  // Create email verification code separately
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token: verificationCode, // Store 6-digit code in token field
      email: email.toLowerCase(),
      expiresAt,
    },
  });

  logAudit({
    userId: user.id,
    action: 'RESOURCE_CREATED',
    resourceType: 'User',
    resourceId: user.id,
    success: true,
  });

  // Send verification email
  // Use fire-and-forget pattern to not block registration, but ensure it's attempted
  const { sendVerificationEmail } = await import('./email.service.js');

  // Send email asynchronously - don't block registration response
  // Errors are logged but don't fail the registration
  sendVerificationEmail(email, fullName, verificationCode)
    .then(() => {
      logger.info('Verification email sent successfully', { userId: user.id, email });
    })
    .catch(error => {
      logger.error('Failed to send verification email', {
        error,
        userId: user.id,
        email,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      // Log critical error but don't throw - registration should succeed even if email fails
      // In production, consider using a queue system for reliable email delivery
    });

  return { userId: user.id };
};

/**
 * Request password reset (forgot password)
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { profile: true },
  });

  // Don't reveal if user exists - always return success
  if (!user) {
    logger.info('Password reset requested for non-existent email', {
      email: email.toLowerCase(),
    });
    return;
  }

  // Generate secure reset token
  const resetToken = nanoid(64);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete old reset token if exists
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  // Create new reset token
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      email: user.email,
      expiresAt,
    },
  });

  // Generate reset link
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3005';
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  // Send password reset email
  const { sendPasswordResetEmail } = await import('./email.service.js');
  try {
    await sendPasswordResetEmail(user.email, user.profile?.fullName || user.email, resetLink);
  } catch (error) {
    logger.error('Failed to send password reset email', {
      error,
      userId: user.id,
      email: user.email,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    // If it's a configuration error, throw it
    if (error instanceof Error && error.message.includes('SMTP transporter not configured')) {
      throw error;
    }
  }

  logAudit({
    userId: user.id,
    action: 'PASSWORD_RESET_REQUESTED',
    ipAddress: undefined,
    userAgent: undefined,
    success: true,
  });
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  email: string,
  newPassword: string
): Promise<void> => {
  // Validate password strength
  const passwordErrors = validatePasswordStrength(newPassword);
  if (passwordErrors.length > 0) {
    throw new Error(passwordErrors.join(', '));
  }

  // Find reset token
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      email: email.toLowerCase(),
    },
    include: { user: true },
  });

  if (!resetToken) {
    throw new Error('Invalid or expired reset token');
  }

  if (resetToken.usedAt) {
    throw new Error('Reset token has already been used');
  }

  if (resetToken.expiresAt < new Date()) {
    throw new Error('Reset token has expired');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  // Revoke all refresh tokens for security
  await prisma.refreshToken.updateMany({
    where: { userId: resetToken.userId },
    data: { revokedAt: new Date() },
  });

  logAudit({
    userId: resetToken.userId,
    action: 'PASSWORD_CHANGED',
    details: { method: 'password_reset' },
    success: true,
  });

  logSecurity({
    userId: resetToken.userId,
    event: 'PASSWORD_RESET_COMPLETED',
    severity: 'medium',
  });
};
