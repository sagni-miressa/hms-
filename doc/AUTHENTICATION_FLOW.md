# End-to-End Authentication Flow

This document explains how authentication works in the Hiring Management System from login to protected route access.

## Overview

The system uses **JWT (JSON Web Tokens)** with **RS256** asymmetric encryption for stateless authentication. It implements a dual-token strategy:
- **Access Token**: Short-lived (15 minutes), signed with RSA private key
- **Refresh Token**: Long-lived (7 days), stored in database

---

## 🔐 Complete Authentication Flow

### Phase 1: User Login

#### Step 1: Client Request
```
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  "email": "admin@hiring-system.com",
  "password": "SecurePassword123!",
  "mfaToken": "123456",  // Optional, if MFA enabled
  "deviceId": "device-123"  // Optional
}
```

#### Step 2: Route Handler (`auth.routes.ts`)
- Rate limiting applied (`authRateLimit` middleware)
- Request validation (`validate` middleware with `loginSchema`)
- Calls `authService.login()`

#### Step 3: Authentication Service (`auth.service.ts` - `login()`)

**3.1 User Lookup**
```typescript
const user = await prisma.user.findUnique({
  where: { email: email.toLowerCase() }
});
```
- Normalizes email to lowercase
- Returns `InvalidCredentialsError` if user not found

**3.2 Account Status Checks**
- **Account Lockout**: Checks if account is locked due to failed attempts
- **Active Status**: Verifies `user.isActive === true`
- Throws `AccountLockedError` or `AccountInactiveError` if checks fail

**3.3 Password Verification**
```typescript
const isPasswordValid = await verifyPassword(password, user.passwordHash);
```
- Uses `bcrypt.compare()` to verify password against stored hash
- On failure:
  - Increments `failedLoginCount`
  - Locks account after 5 failed attempts (30-minute lockout)
  - Logs security event
  - Throws `InvalidCredentialsError`

**3.4 MFA Verification** (if enabled)
```typescript
if (user.mfaEnabled) {
  const isMFAValid = verifyMFAToken(user.mfaSecret!, mfaToken);
  // Uses TOTP (Time-based One-Time Password) with 1-step window
}
```
- Verifies 6-digit TOTP code from authenticator app
- Throws `MFARequiredError` if token missing
- Throws `InvalidMFACodeError` if token invalid

**3.5 Success Actions**
- Resets `failedLoginCount` to 0
- Updates `lastLoginAt` and `lastActivityAt` timestamps
- Logs successful login audit event

#### Step 4: Token Generation

**4.1 Access Token Creation**
```typescript
const accessToken = generateAccessToken(authenticatedUser);
```

**Token Payload Structure:**
```json
{
  "sub": "user-id-123",           // User ID
  "email": "admin@hiring-system.com",
  "roles": ["SYSTEM_ADMIN"],
  "clearanceLevel": "RESTRICTED",
  "type": "access",
  "iat": 1766148637,              // Issued at
  "exp": 1766149537,              // Expires (15 min)
  "aud": "hiring-api",            // Audience
  "iss": "hiring-management-system" // Issuer
}
```

**Signing Process:**
- Algorithm: **RS256** (RSA with SHA-256)
- Private Key: `process.env.JWT_ACCESS_PRIVATE_KEY`
- Expiration: 15 minutes (configurable)
- Includes issuer and audience for validation

**4.2 Refresh Token Creation**
```typescript
const refreshToken = await generateRefreshToken(
  user.id, 
  deviceId, 
  ipAddress, 
  userAgent
);
```

**Refresh Token Details:**
- Generated using `nanoid(64)` - cryptographically random 64-character string
- Stored in `RefreshToken` database table with:
  - `userId`, `token`, `deviceId`, `ipAddress`, `userAgent`
  - `expiresAt`: 7 days from creation
  - `lastUsedAt`: Updated on each use
  - `revokedAt`: Set when token is revoked

**4.3 Session Caching**
```typescript
await sessionCache.set(`session:${user.id}`, authenticatedUser, SESSION_CACHE_TTL);
```
- Stores user data in Redis cache (30 minutes TTL)
- Reduces database queries on subsequent requests

#### Step 5: Response
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "4w4mbqmGXzANZPixdVB5PF8reD1C527x-n_esFyu3msZ6kRwvd16STTLQMwI5Lsh",
    "requiresMFA": false
  },
  "meta": {
    "timestamp": "2025-12-19T12:50:37.231Z",
    "requestId": "xwQ-vrCFVrT6JzOPWE1M_"
  }
}
```

---

### Phase 2: Protected Route Access

#### Step 1: Client Request
```
GET /api/v1/auth/me
Headers: {
  "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Step 2: Authentication Middleware (`authentication.ts`)

**2.1 Token Extraction**
```typescript
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  // Expects: "Bearer <token>"
  // Returns token string or null
}
```
- Parses `Authorization` header
- Validates `Bearer` scheme
- Extracts token string

**2.2 Token Verification**
```typescript
const payload = verifyAccessToken(token);
```

**Verification Process (`auth.service.ts` - `verifyAccessToken()`):**

1. **Public Key Retrieval**
   ```typescript
   const publicKey = process.env.JWT_ACCESS_PUBLIC_KEY || process.env.JWT_ACCESS_SECRET;
   ```
   - Uses public key for RS256 verification
   - Falls back to secret for backward compatibility

2. **JWT Verification**
   ```typescript
   jwt.verify(token, publicKey, {
     issuer: 'hiring-management-system',
     audience: 'hiring-api',
     algorithms: ['RS256']
   })
   ```
   - Verifies signature using RSA public key
   - Validates issuer and audience
   - Checks expiration (`exp` claim)
   - Validates algorithm

3. **Token Type Check**
   ```typescript
   if (payload.type !== 'access') {
     throw new TokenInvalidError('Invalid token type');
   }
   ```

4. **Error Handling**
   - `TokenExpiredError`: Token's `exp` claim has passed
   - `TokenInvalidError`: Signature invalid, wrong issuer/audience, or malformed token
   - `JsonWebTokenError`: Generic JWT library errors

**2.3 User Loading**

**Cache Check First:**
```typescript
let user = await sessionCache.get<AuthenticatedUser>(`session:${payload.sub}`);
```

**Database Fallback:**
```typescript
if (!user) {
  const dbUser = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id, email, username, roles, clearanceLevel, ... }
  });
  
  // Additional checks:
  if (!dbUser) throw new TokenInvalidError('User not found');
  if (!dbUser.isActive) throw new AccountInactiveError();
  
  // Cache for future requests
  await sessionCache.set(`session:${user.id}`, user, 1800);
}
```

**2.4 Activity Tracking**
```typescript
prisma.user.update({
  where: { id: user.id },
  data: { lastActivityAt: new Date() }
}).catch(...); // Async, doesn't block request
```

**2.5 Request Augmentation**
```typescript
(req as AuthenticatedRequest).user = user;
next(); // Continue to route handler
```

#### Step 3: Route Handler
```typescript
router.get('/me', authenticate, requireAuth, asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  // authReq.user is now available with full user data
  res.json({ data: { user: authReq.user } });
}));
```

**`requireAuth` Middleware:**
- Ensures `req.user` exists
- Throws `AuthenticationError` if missing
- Used as a safety check after `authenticate`

---

### Phase 3: Token Refresh

When access token expires, client uses refresh token to get new access token.

#### Step 1: Client Request
```
POST /api/v1/auth/refresh
Body: {
  "refreshToken": "4w4mbqmGXzANZPixdVB5PF8reD1C527x-n_esFyu3msZ6kRwvd16STTLQMwI5Lsh"
}
```

#### Step 2: Refresh Process (`auth.service.ts` - `refreshAccessToken()`)

**2.1 Refresh Token Verification**
```typescript
const userId = await verifyRefreshToken(refreshToken);
```

**Verification Steps:**
1. Lookup token in database
2. Check if token exists and not revoked
3. Verify expiration (`expiresAt > now`)
4. Update `lastUsedAt` timestamp

**2.2 User Validation**
- Load user from database
- Verify user is active
- Throw `TokenInvalidError` if user not found or inactive

**2.3 New Token Generation**
- Generate new access token
- Generate new refresh token
- Revoke old refresh token (token rotation)

**2.4 Response**
```json
{
  "data": {
    "accessToken": "new-access-token...",
    "refreshToken": "new-refresh-token..."
  }
}
```

---

## 🔑 Key Components

### Token Structure

**Access Token (JWT):**
- **Header**: `{"alg": "RS256", "typ": "JWT"}`
- **Payload**: User ID, email, roles, clearance level, expiration
- **Signature**: RSA signature using private key

**Refresh Token:**
- Random 64-character string (nanoid)
- Stored in database with metadata
- Can be revoked independently

### Security Features

1. **Account Lockout**: 5 failed attempts → 30-minute lockout
2. **MFA Support**: TOTP-based two-factor authentication
3. **Token Rotation**: Refresh tokens rotated on each use
4. **Session Caching**: Redis cache reduces DB load
5. **Activity Tracking**: Last login and activity timestamps
6. **Audit Logging**: All authentication events logged

### Environment Variables

```env
# RSA Key Pair (for RS256)
JWT_ACCESS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
JWT_ACCESS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Fallback (for backward compatibility)
JWT_ACCESS_SECRET="fallback-secret-if-no-public-key"

# Configuration
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Error Handling

**Authentication Errors:**
- `InvalidCredentialsError`: Wrong email/password
- `AccountLockedError`: Account locked due to failed attempts
- `AccountInactiveError`: User account is inactive
- `MFARequiredError`: MFA token required but not provided
- `InvalidMFACodeError`: MFA token is invalid
- `TokenExpiredError`: Access token has expired
- `TokenInvalidError`: Token is malformed, invalid, or user not found

---

## 📊 Flow Diagram

```
┌─────────┐
│ Client  │
└────┬────┘
     │ POST /auth/login
     │ { email, password, mfaToken? }
     ▼
┌─────────────────┐
│ Rate Limiter    │ ← Prevents brute force
└────────┬────────┘
     │
     ▼
┌─────────────────┐
│ Validator       │ ← Schema validation
└────────┬────────┘
     │
     ▼
┌─────────────────┐
│ Auth Service    │
│ - Find user     │
│ - Check lockout │
│ - Verify pwd    │
│ - Verify MFA    │
└────────┬────────┘
     │
     ▼
┌─────────────────┐
│ Token Gen       │
│ - Access (JWT)  │ ← RS256 signed
│ - Refresh (DB)  │ ← Stored in DB
└────────┬────────┘
     │
     ▼
┌─────────────────┐
│ Session Cache   │ ← Redis
└────────┬────────┘
     │
     ▼
┌─────────┐
│ Client  │ ← Receives tokens
└────┬────┘
     │
     │ GET /auth/me
     │ Authorization: Bearer <token>
     ▼
┌─────────────────┐
│ Authenticate    │
│ Middleware      │
│ - Extract token │
│ - Verify JWT    │ ← RS256 verify
│ - Load user     │ ← Cache or DB
└────────┬────────┘
     │
     ▼
┌─────────────────┐
│ Require Auth    │ ← Safety check
└────────┬────────┘
     │
     ▼
┌─────────────────┐
│ Route Handler   │ ← req.user available
└────────┬────────┘
     │
     ▼
┌─────────┐
│ Client  │ ← Response with user data
└─────────┘
```

---

## 🔄 Token Lifecycle

1. **Login**: Access token (15 min) + Refresh token (7 days) issued
2. **API Requests**: Access token used in `Authorization: Bearer <token>` header
3. **Token Expiry**: Access token expires after 15 minutes
4. **Refresh**: Client uses refresh token to get new access token
5. **Logout**: Refresh token revoked in database
6. **Re-authentication**: If refresh token expires, user must login again

---

## 🛡️ Security Best Practices Implemented

1. ✅ **Asymmetric Encryption**: RS256 prevents secret key exposure
2. ✅ **Short-lived Access Tokens**: 15-minute expiration limits exposure
3. ✅ **Token Rotation**: Refresh tokens rotated on each use
4. ✅ **Account Lockout**: Prevents brute force attacks
5. ✅ **MFA Support**: Additional authentication factor
6. ✅ **Audit Logging**: All auth events tracked
7. ✅ **Session Caching**: Reduces database load while maintaining security
8. ✅ **Activity Tracking**: Monitors user activity
9. ✅ **Token Revocation**: Refresh tokens can be revoked
10. ✅ **Rate Limiting**: Prevents abuse of auth endpoints

