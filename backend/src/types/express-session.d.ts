import 'express-session';

declare module 'express-session' {
  interface SessionData {
    webauthnChallenge?: string;
    webauthnUserId?: string;
  }
}
