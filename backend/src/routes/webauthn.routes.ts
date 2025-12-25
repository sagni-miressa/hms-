import express from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { rpID, origin, rpName } from '../config/webauthn';
import { prisma } from '../config/database.js';

const router = express.Router();

// Registration START
router.post('/register/start', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.username || user.email,
    attestationType: 'indirect',
    authenticatorSelection: {
      userVerification: 'preferred',
    },
  });

  req.session.webauthnChallenge = options.challenge;
  req.session.webauthnUserId = user.id;

  return res.json(options);
});

// Registration FINISH
router.post('/register/finish', async (req, res) => {
  const { id, rawId, response, type } = req.body;

  const expectedChallenge = req.session.webauthnChallenge;
  const userId = req.session.webauthnUserId;

  if (!expectedChallenge || !userId) {
    return res.status(400).json({ error: 'No challenge in session' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    const verification = await verifyRegistrationResponse({
      credential: { id, rawId, response, type },
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;
      await prisma.mfaCredential.create({
        data: {
          userId: user.id,
          credentialID: Buffer.from(credentialID),
          credentialPublicKey: Buffer.from(credentialPublicKey),
          counter,
        },
      });

      req.session.webauthnChallenge = undefined;
      req.session.webauthnUserId = undefined;

      return res.json({ ok: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Verification failed' });
  }
});

// Authentication START
router.post('/login/start', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = await prisma.user.findUnique({ where: { email }, include: { mfaCredentials: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const options = generateAuthenticationOptions({
    allowCredentials: user.mfaCredentials.map(cred => ({
      id: cred.credentialID,
      type: 'public-key',
      transports: ['usb', 'ble', 'nfc', 'internal'],
    })),
    userVerification: 'preferred',
    rpID,
  });

  req.session.webauthnChallenge = options.challenge;
  req.session.webauthnUserId = user.id;

  return res.json(options);
});

// Authentication FINISH
router.post('/login/finish', async (req, res) => {
  const { id, rawId, response, type } = req.body;

  const expectedChallenge = req.session.webauthnChallenge;
  const userId = req.session.webauthnUserId;

  if (!expectedChallenge || !userId) {
    return res.status(400).json({ error: 'No challenge in session' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { mfaCredentials: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const credential = user.mfaCredentials.find(c => c.credentialID.equals(Buffer.from(rawId, 'base64')));
  if (!credential) return res.status(404).json({ error: 'Credential not found' });

  try {
    const verification = await verifyAuthenticationResponse({
      credential: { id, rawId, response, type },
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: credential.credentialID,
        credentialPublicKey: credential.credentialPublicKey,
        counter: credential.counter,
      },
    });

    if (verification.verified) {
      await prisma.mfaCredential.update({
        where: { id: credential.id },
        data: { counter: verification.authenticationInfo.newCounter },
      });

      req.session.webauthnChallenge = undefined;
      req.session.webauthnUserId = undefined;

      return res.json({ ok: true, message: 'Login successful' });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Authentication failed' });
  }
});

export default router;
