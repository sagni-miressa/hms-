/**
 * OAuth Service
 * Handles OAuth authentication (Google, LinkedIn, etc.)
 */

import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/config/database.js';
import { generateAccessToken, generateRefreshToken } from './auth.service.js';
import { sessionCache, SESSION_CACHE_TTL } from '@/config/redis.js';
import { logger, logAudit } from '@/utils/logger.js';
import type { AuthenticatedUser } from '@/types/index.js';
import { Role, ClearanceLevel } from '@prisma/client';

// ============================================================================
// GOOGLE OAUTH
// ============================================================================

/**
 * Initialize Google OAuth client
 */
const getGoogleClient = (): OAuth2Client => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth credentials not configured');
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

/**
 * Generate Google OAuth URL
 */
export const getGoogleAuthUrl = (): string => {
  const client = getGoogleClient();

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'select_account', // Force account selection
  });

  return url;
};

/**
 * Handle Google OAuth callback
 */
export const handleGoogleCallback = async (
  code: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; refreshToken: string; user: AuthenticatedUser }> => {
  const client = getGoogleClient();

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    if (!tokens.id_token) {
      throw new Error('No ID token received from Google');
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload from Google');
    }

    const email = payload.email;
    const fullName = payload.name || '';
    const googleId = payload.sub;
    const picture = payload.picture;
    const emailVerified = payload.email_verified || false;

    if (!email) {
      throw new Error('Email not provided by Google');
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { provider: 'google', providerId: googleId }],
      },
      include: { profile: true },
    });

    if (user) {
      // Update existing user if needed
      if (user.provider !== 'google' || user.providerId !== googleId) {
        // User exists but not with Google OAuth - link the account
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleId,
            providerData: {
              picture,
              emailVerified,
            },
            isVerified: emailVerified || user.isVerified, // Trust Google verification
          },
          include: { profile: true },
        });
      } else {
        // Update provider data
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            providerData: {
              picture,
              emailVerified,
            },
            isVerified: emailVerified || user.isVerified,
          },
          include: { profile: true },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash: null, // No password for OAuth users
          provider: 'google',
          providerId: googleId,
          providerData: {
            picture,
            emailVerified,
          },
          roles: [Role.APPLICANT],
          clearanceLevel: ClearanceLevel.PUBLIC,
          isVerified: emailVerified, // Trust Google verification
          isActive: true,
          profile: {
            create: {
              fullName,
            },
          },
        },
        include: { profile: true },
      });

      logAudit({
        userId: user.id,
        action: 'RESOURCE_CREATED',
        resourceType: 'User',
        resourceId: user.id,
        details: { method: 'google_oauth' },
        ipAddress,
        userAgent,
        success: true,
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
      },
    });

    // Generate JWT tokens
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
    const refreshToken = await generateRefreshToken(user.id, undefined, ipAddress, userAgent);

    // Cache session
    await sessionCache.set(`session:${user.id}`, authenticatedUser, SESSION_CACHE_TTL);

    logAudit({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      details: { method: 'google_oauth' },
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      accessToken,
      refreshToken,
      user: authenticatedUser,
    };
  } catch (error) {
    logger.error('Google OAuth callback failed', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    logAudit({
      action: 'LOGIN_FAILED',
      details: { method: 'google_oauth', reason: 'OAuth callback failed' },
      ipAddress,
      userAgent,
      success: false,
    });

    throw error;
  }
};
