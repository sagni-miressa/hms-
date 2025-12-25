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

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: Buffer.from(user.id), // Must be Uint8Array
    userName: user.username || user.email,
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
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

  // Debug logging
  console.log('User has', user.webAuthnCredentials.length, 'credentials');
  console.log('RP ID:', rpID);
  console.log('Origin:', origin);

  const allowCredentials = user.webAuthnCredentials.map(cred => ({
    id: isoBase64URL.fromBuffer(Buffer.from(cred.credentialID)),
    transports: cred.transports as any,
  }));

  console.log('allowCredentials:', allowCredentials);

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

export default router;
