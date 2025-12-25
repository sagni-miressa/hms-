import express, { Request, Response } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { rpID, origin, rpName } from '../config/webauthn.js';
import { prisma } from '../config/database.js';
import * as authService from '../services/auth.service.js';
import sessionMiddleware from '../middleware/session.js';
import { authenticate, requireAuth } from '../middleware/authentication.js';
import { createAuditLog } from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../types/index.js';

const router = express.Router();

// Use session middleware for all webauthn routes
router.use(sessionMiddleware);

// Registration START
router.post('/register/start', authenticate, requireAuth, async (req: Request, res: Response) => {
  // User is already authenticated, use req.user
  const user = (req as AuthenticatedRequest).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  // Fetch full user details including profile
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });

  if (!fullUser) return res.status(404).json({ error: 'User not found' });

  // Get display name from profile
  const displayName = fullUser.profile?.fullName || fullUser.username || fullUser.email;

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: Buffer.from(user.id), // Must be Uint8Array
    userName: user.email,
    userDisplayName: displayName, // Human-readable name shown in passkey picker
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'required', // Force passkey to be saved on device
      requireResidentKey: true, // Backwards compatibility
    },
    extensions: {
      credProps: true, // Request credential properties
    },
  });

  // Store challenge in session
  req.session.webauthnChallenge = options.challenge;
  req.session.webauthnUserId = user.id;

  return res.json({ data: options });
});

// Registration FINISH
router.post('/register/finish', authenticate, requireAuth, async (req: Request, res: Response) => {
  const expectedChallenge = req.session.webauthnChallenge;
  const userId = req.session.webauthnUserId;

  if (!expectedChallenge || !userId) {
    return res.status(400).json({ error: 'No challenge in session' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        verification.registrationInfo;
      const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

      await prisma.$transaction([
        prisma.webAuthnCredential.create({
          data: {
            userId: user.id,
            credentialID: Buffer.from(credentialID),
            publicKey: Buffer.from(credentialPublicKey),
            counter,
            deviceType: credentialDeviceType,
            backedUp: credentialBackedUp,
            transports: (req.body.response.transports as string[]) || [],
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { mfaEnabled: true },
        }),
      ]);

      await createAuditLog(user.id, {
        action: 'MFA_ENABLED',
        resourceType: 'User',
        resourceId: user.id,
        details: { method: 'webauthn', deviceType: credentialDeviceType },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // Clear session
      req.session.webauthnChallenge = undefined;
      req.session.webauthnUserId = undefined;

      return res.json({ data: { ok: true } });
    }
  } catch (err) {
    console.error('WebAuthn registration verification failed:', err);
    return res.status(400).json({ error: 'Verification failed' });
  }

  return res.status(400).json({ error: 'Verification failed' });
});

// Authentication START
router.post('/login/start', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { webAuthnCredentials: true },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const allowCredentials = user.webAuthnCredentials.map(cred => ({
    id: isoBase64URL.fromBuffer(Buffer.from(cred.credentialID)),
    transports: cred.transports as any,
  }));

  const options = await generateAuthenticationOptions({
    allowCredentials,
    userVerification: 'preferred',
    rpID,
  });

  // Store challenge in session
  req.session.webauthnChallenge = options.challenge;
  req.session.webauthnUserId = user.id;

  return res.json({ data: options });
});

// Authentication FINISH
router.post('/login/finish', async (req: Request, res: Response) => {
  const expectedChallenge = req.session.webauthnChallenge;
  const userId = req.session.webauthnUserId;

  if (!expectedChallenge || !userId) {
    return res.status(400).json({ error: 'No challenge in session' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { webAuthnCredentials: true },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const body = req.body;

  // Debug logging
  console.log('Login attempt - body.id:', body.id);
  console.log(
    'Available credentials:',
    user.webAuthnCredentials.map(c => ({
      id: isoBase64URL.fromBuffer(Buffer.from(c.credentialID)),
      dbId: c.id,
    }))
  );

  const credential = user.webAuthnCredentials.find(c => {
    const credIdBase64URL = isoBase64URL.fromBuffer(Buffer.from(c.credentialID));
    return credIdBase64URL === body.id || body.rawId === credIdBase64URL;
  });

  if (!credential) {
    console.error('Credential not found for body.id:', body.id);
    return res.status(404).json({ error: 'Credential not found' });
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: isoBase64URL.fromBuffer(Buffer.from(credential.credentialID)),
        publicKey: new Uint8Array(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports as any,
      },
    });

    if (verification.verified) {
      // Update counter
      await prisma.webAuthnCredential.update({
        where: { id: credential.id },
        data: {
          counter: verification.authenticationInfo.newCounter,
          lastUsedAt: new Date(),
        },
      });

      // Clear session
      req.session.webauthnChallenge = undefined;
      req.session.webauthnUserId = undefined;

      await createAuditLog(user.id, {
        action: 'LOGIN_SUCCESS',
        details: { method: 'webauthn' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // Issue JWT tokens
      const tokens = await authService.issueTokens(
        user,
        undefined, // deviceId
        req.ip,
        req.headers['user-agent']
      );

      return res.json({ data: tokens });
    }
  } catch (err) {
    console.error('WebAuthn authentication verification failed:', err);
    return res.status(400).json({ error: 'Authentication failed' });
  }

  return res.status(400).json({ error: 'Authentication failed' });
});

// GET credentials - list all credentials for the authenticated user
router.get('/credentials', authenticate, requireAuth, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const credentials = await prisma.webAuthnCredential.findMany({
      where: { userId },
      select: {
        id: true,
        deviceType: true,
        backedUp: true,
        transports: true,
        nickname: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ data: credentials });
  } catch (error) {
    console.error('Failed to fetch credentials:', error);
    return res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

// DELETE credential
router.delete(
  '/credentials/:credentialId',
  authenticate,
  requireAuth,
  async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user?.id;
    const { credentialId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Verify the credential belongs to the user
      const credential = await prisma.webAuthnCredential.findFirst({
        where: {
          id: credentialId,
          userId: userId,
        },
      });

      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      // Delete the credential
      await prisma.webAuthnCredential.delete({
        where: { id: credentialId },
      });

      // Check if user has any remaining WebAuthn credentials
      const remainingCredentials = await prisma.webAuthnCredential.count({
        where: { userId },
      });

      // If no more WebAuthn credentials, disable MFA
      if (remainingCredentials === 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { mfaEnabled: false },
        });
      }

      await createAuditLog(userId, {
        action: 'MFA_DISABLED',
        resourceType: 'User',
        resourceId: userId,
        details: { method: 'webauthn', credentialId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.json({ data: { ok: true, message: 'Credential deleted' } });
    } catch (error) {
      console.error('Failed to delete credential:', error);
      return res.status(500).json({ error: 'Failed to delete credential' });
    }
  }
);

export default router;
