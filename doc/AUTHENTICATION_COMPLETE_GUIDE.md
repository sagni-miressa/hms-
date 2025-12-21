# Complete Authentication Guide

This comprehensive guide covers authentication setup, flow, and end-to-end implementation in the Hiring Management System.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication Flow (End-to-End)](#authentication-flow-end-to-end)
4. [Frontend Integration](#frontend-integration)
5. [Token Management](#token-management)
6. [Security Features](#security-features)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Authentication Architecture

The system uses **JWT (JSON Web Tokens)** with **RS256** asymmetric encryption for stateless authentication. It implements a dual-token strategy:

- **Access Token**: Short-lived (15 minutes), signed with RSA private key
- **Refresh Token**: Long-lived (7 days), stored in database with metadata

### Key Technologies

- **JWT**: JSON Web Tokens for stateless authentication
- **RS256**: RSA signature with SHA-256 (asymmetric encryption)
- **bcrypt**: Password hashing (12 rounds)
- **TOTP**: Time-based One-Time Password for MFA (via speakeasy)
- **Redis**: Session caching and rate limiting
- **Prisma**: Database ORM for user and token management

### Security Model

- **Zero-Trust Architecture**: Every request is authenticated and authorized
- **Defense in Depth**: Multiple security layers
- **Stateless Authentication**: No server-side sessions (except Redis cache)
- **Token Rotation**: Refresh tokens rotated on each use

---

## Setup & Configuration

### Prerequisites

1. **Database**: PostgreSQL with Prisma schema
2. **Redis**: For session caching and rate limiting
3. **Node.js**: v18+ with npm/yarn

### Step 1: Generate RSA Key Pair

The system uses RS256 (asymmetric encryption), requiring an RSA key pair.

#### Option A: Using OpenSSL (Recommended)

```bash
# Generate private key (2048-bit RSA)
openssl genrsa -out jwt_private_key.pem 2048

# Extract public key
openssl rsa -in jwt_private_key.pem -pubout -out jwt_public_key.pem

# View private key (for .env file)
cat jwt_private_key.pem

# View public key (for .env file)
cat jwt_public_key.pem
```

#### Option B: Using Node.js Script

Create `scripts/generate-jwt-keys.js`:

```javascript
const crypto = require("crypto");
const fs = require("fs");

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

fs.writeFileSync("jwt_private_key.pem", privateKey);
fs.writeFileSync("jwt_public_key.pem", publicKey);

console.log("Keys generated!");
console.log("\nPrivate Key:");
console.log(privateKey);
console.log("\nPublic Key:");
console.log(publicKey);
```

Run: `node scripts/generate-jwt-keys.js`

### Step 2: Configure Environment Variables

Create `backend/.env`:

```env
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://user:password@localhost:5432/hiring_system

# ============================================================================
# JWT CONFIGURATION (RS256)
# ============================================================================
# RSA Private Key (for signing tokens)
JWT_ACCESS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"

# RSA Public Key (for verifying tokens)
JWT_ACCESS_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"

# Fallback secret (for backward compatibility, not recommended)
JWT_ACCESS_SECRET=fallback-secret-if-no-public-key

# Token expiration
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================================================================
# REDIS (Session Cache & Rate Limiting)
# ============================================================================
REDIS_URL=redis://localhost:6379

# ============================================================================
# SECURITY
# ============================================================================
# Log encryption key (32 bytes, base64)
LOG_ENCRYPTION_KEY=K8j3mN9pQ2rT5vW8yZ1bC4eF7hJ0kL3nP6sU9vX2zA5=

# Alert emails
ALERT_EMAIL_ADMINS=admin@yourdomain.com
ALERT_EMAIL_SECURITY=security@yourdomain.com

# ============================================================================
# SMTP (Email Verification)
# ============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173

# ============================================================================
# ENVIRONMENT
# ============================================================================
NODE_ENV=development
PORT=5000
```

**Important Notes:**

- Private key must be kept secret (never commit to Git)
- Public key can be shared (used for verification)
- Use different keys for development and production
- Store production keys in secure secret management (AWS Secrets Manager, Vault, etc.)

### Step 3: Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Step 4: Redis Setup

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
```

### Step 5: Verify Configuration

```bash
cd backend
npm run dev
```

Check for:

- ✅ No missing environment variable errors
- ✅ Database connection successful
- ✅ Redis connection successful
- ✅ Server starts on port 5000

---

## Authentication Flow (End-to-End)

### Phase 1: User Registration

#### Step 1: Client Request

```typescript
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "recaptchaToken": "03AGdBq..." // Optional
}
```

#### Step 2: Backend Processing

1. **Rate Limiting**: `authRateLimit` middleware (10 requests/minute)
2. **Validation**: Zod schema validation
3. **reCAPTCHA Verification**: If token provided
4. **Password Validation**:
   - Minimum 12 characters
   - Uppercase, lowercase, number, special character
5. **User Creation**:
   - Hash password with bcrypt (12 rounds)
   - Create user with `APPLICANT` role
   - Generate email verification token (64-char nanoid)
   - Send verification email

#### Step 3: Email Verification

User receives email with verification link:

```
http://localhost:5173/verify-email?token=abc123...
```

#### Step 4: Verify Email

```typescript
POST /api/v1/auth/verify-email
{
  "token": "abc123..."
}
```

- Validates token
- Sets `isVerified = true`
- User can now login

---

### Phase 2: User Login

#### Step 1: Client Request

```typescript
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "mfaToken": "123456",  // Optional, if MFA enabled
  "deviceId": "device-123"  // Optional
}
```

#### Step 2: Backend Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Rate Limiting (authRateLimit)                           │
│    - 10 requests/minute per email                           │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Request Validation (Zod schema)                          │
│    - Email format validation                                │
│    - Password presence check                                │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User Lookup                                              │
│    - Find user by email (case-insensitive)                  │
│    - If not found → InvalidCredentialsError                 │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Account Status Checks                                    │
│    - Check account lockout (lockedUntil > now)              │
│    - Check isActive === true                                │
│    - Check isVerified === true                              │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Password Verification                                     │
│    - bcrypt.compare(password, user.passwordHash)            │
│    - If invalid:                                            │
│      • Increment failedLoginCount                           │
│      • Lock account if >= 5 attempts (30 min)               │
│      • Log security event                                    │
│      • Alert if >= 3 attempts                              │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. MFA Verification (if enabled)                           │
│    - If user.mfaEnabled:                                    │
│      • Require mfaToken                                     │
│      • Verify TOTP code (speakeasy)                         │
│      • 1-step window tolerance                              │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Success Actions                                         │
│    - Reset failedLoginCount = 0                             │
│    - Update lastLoginAt, lastActivityAt                    │
│    - Log successful login audit event                        │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Token Generation                                         │
│    - Generate Access Token (JWT, RS256, 15 min)             │
│    - Generate Refresh Token (nanoid, 7 days, DB)            │
│    - Cache session in Redis (30 min TTL)                    │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Response                                                 │
│    {                                                        │
│      "accessToken": "eyJhbGci...",                          │
│      "refreshToken": "4w4mbqm...",                         │
│      "requiresMFA": false                                   │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
```

#### Step 3: Access Token Structure

**JWT Payload:**

```json
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "roles": ["APPLICANT"],
  "clearanceLevel": "PUBLIC",
  "type": "access",
  "iat": 1766148637,
  "exp": 1766149537,
  "aud": "hiring-api",
  "iss": "hiring-management-system"
}
```

**JWT Header:**

```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

**JWT Signature:**

- Signed with RSA private key
- Verified with RSA public key

#### Step 4: Refresh Token Structure

**Database Record:**

```typescript
{
  id: "token-id",
  userId: "user-id-123",
  token: "4w4mbqmGXzANZPixdVB5PF8reD1C527x-n_esFyu3msZ6kRwvd16STTLQMwI5Lsh",
  deviceId: "device-123",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  expiresAt: "2025-12-26T12:50:37.231Z",
  lastUsedAt: null,
  revokedAt: null,
  createdAt: "2025-12-19T12:50:37.231Z"
}
```

---

### Phase 3: Protected Route Access

#### Step 1: Client Request

```typescript
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 2: Authentication Middleware Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Token Extraction                                          │
│    - Parse Authorization header                              │
│    - Extract "Bearer <token>"                                │
│    - If missing → AuthenticationError                        │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Token Verification (verifyAccessToken)                   │
│    - Load public key (JWT_ACCESS_PUBLIC_KEY)                │
│    - jwt.verify(token, publicKey, {                          │
│        issuer: 'hiring-management-system',                   │
│        audience: 'hiring-api',                               │
│        algorithms: ['RS256']                                 │
│      })                                                      │
│    - Check expiration (exp claim)                            │
│    - Check token type === 'access'                           │
│    - If invalid → TokenInvalidError/TokenExpiredError        │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. User Loading (Cache First)                               │
│    - Check Redis: session:${userId}                          │
│    - If cached → Use cached user                             │
│    - If not cached:                                          │
│      • Load from database                                    │
│      • Verify isActive === true                              │
│      • Cache in Redis (30 min TTL)                           │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Activity Tracking                                        │
│    - Update lastActivityAt (async, non-blocking)            │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Request Augmentation                                      │
│    - Attach user to request: req.user = authenticatedUser   │
│    - Continue to route handler                              │
└─────────────────────────────────────────────────────────────┘
```

#### Step 3: Route Handler

```typescript
router.get(
  "/me",
  authenticate,
  requireAuth,
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    // authReq.user is now available with full user data

    res.json({
      data: {
        user: {
          id: authReq.user.id,
          email: authReq.user.email,
          username: authReq.user.username,
          roles: authReq.user.roles,
          clearanceLevel: authReq.user.clearanceLevel,
          department: authReq.user.department,
          mfaEnabled: authReq.user.mfaEnabled,
        },
      },
    });
  })
);
```

---

### Phase 4: Token Refresh

When access token expires (after 15 minutes), client uses refresh token to get new tokens.

#### Step 1: Client Request

```typescript
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "4w4mbqmGXzANZPixdVB5PF8reD1C527x-n_esFyu3msZ6kRwvd16STTLQMwI5Lsh"
}
```

#### Step 2: Refresh Process

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Refresh Token Verification                               │
│    - Lookup token in RefreshToken table                      │
│    - Check revokedAt === null                                │
│    - Check expiresAt > now                                  │
│    - Update lastUsedAt                                       │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. User Validation                                          │
│    - Load user from database                                 │
│    - Verify isActive === true                               │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Token Rotation                                           │
│    - Generate new access token                               │
│    - Generate new refresh token                              │
│    - Revoke old refresh token (set revokedAt)               │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Response                                                 │
│    {                                                        │
│      "accessToken": "new-access-token...",                  │
│      "refreshToken": "new-refresh-token..."                 │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
```

**Token Rotation Security:**

- Old refresh token is immediately revoked
- Prevents token reuse if compromised
- Each refresh generates new tokens

---

### Phase 5: Logout

#### Step 1: Client Request

```typescript
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "refreshToken": "4w4mbqm..."
}
```

#### Step 2: Logout Process

1. **Revoke Refresh Token**: Set `revokedAt = now()` in database
2. **Clear Session Cache**: Delete `session:${userId}` from Redis
3. **Log Audit Event**: Record logout action
4. **Response**: Success message

**Note**: Access token remains valid until expiration (stateless). Client should discard it.

---

## Frontend Integration

### Authentication Store (Zustand)

**Location**: `frontend/src/stores/authStore.ts`

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;

  // Helpers
  hasRole: (role: Role) => boolean;
  hasClearance: (clearance: ClearanceLevel) => boolean;
}
```

**Persistence**: Tokens stored in localStorage (via Zustand persist middleware)

### Login Flow (Frontend)

**Location**: `frontend/src/pages/Login.tsx`

```typescript
const loginMutation = useMutation({
  mutationFn: login,
  onSuccess: async (data) => {
    // 1. Store tokens
    const { setTokens } = useAuthStore.getState();
    setTokens(data.accessToken, data.refreshToken);

    // 2. Fetch user profile
    const userResponse = await getCurrentUser();

    // 3. Update auth store
    setAuth(userResponse.user, data.accessToken, data.refreshToken);

    // 4. Navigate to dashboard
    navigate("/dashboard");
  },
  onError: (error) => {
    // Handle errors (show toast, etc.)
  },
});
```

### API Interceptor (Token Refresh)

**Location**: `frontend/src/lib/api.ts`

```typescript
// Add token to requests
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { refreshToken, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          // Try to refresh token
          const newTokens = await refreshToken(refreshToken);
          useAuthStore
            .getState()
            .setTokens(newTokens.accessToken, newTokens.refreshToken);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout
          logout();
          window.location.href = "/login";
        }
      } else {
        logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

### Protected Routes

**Location**: `frontend/src/components/ProtectedRoute.tsx`

```typescript
const ProtectedRoute = ({ children, requiredRole, requiredClearance }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !user?.roles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }

  if (requiredClearance && !hasClearance(requiredClearance)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

---

## Token Management

### Access Token Lifecycle

1. **Issued**: On successful login
2. **Valid**: 15 minutes from issuance
3. **Used**: Included in `Authorization: Bearer <token>` header
4. **Expired**: After 15 minutes
5. **Refreshed**: Client uses refresh token to get new access token

### Refresh Token Lifecycle

1. **Issued**: On successful login
2. **Valid**: 7 days from issuance
3. **Stored**: Database with metadata (deviceId, IP, userAgent)
4. **Rotated**: New token issued, old token revoked on each refresh
5. **Revoked**: On logout or security event
6. **Expired**: After 7 days (user must re-login)

### Token Storage

**Frontend:**

- **Access Token**: localStorage (via Zustand persist)
- **Refresh Token**: localStorage (via Zustand persist)

**Backend:**

- **Access Token**: Not stored (stateless JWT)
- **Refresh Token**: Database (`RefreshToken` table)

**Security Considerations:**

- ⚠️ localStorage is vulnerable to XSS attacks
- ✅ Consider httpOnly cookies for production (requires CSRF protection)
- ✅ Tokens are short-lived (15 min access, 7 day refresh)

---

## Security Features

### 1. Account Lockout

**Configuration**: `backend/src/config/constants.ts`

```typescript
LOCKOUT: {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
}
```

**Behavior:**

- After 5 failed login attempts, account locked for 30 minutes
- Security event logged with HIGH severity
- Email alert sent to user
- Lockout automatically expires after 30 minutes

### 2. Password Security

**Requirements:**

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Hashing:**

- Algorithm: bcrypt
- Rounds: 12 (configurable via `SECURITY.PASSWORD.MIN_LENGTH`)

### 3. Multi-Factor Authentication (MFA)

**Setup Flow:**

1. User requests MFA setup: `POST /api/v1/auth/mfa/setup`
2. Backend generates TOTP secret and QR code
3. User scans QR code with authenticator app (Google Authenticator, Authy)
4. User verifies with 6-digit code: `POST /api/v1/auth/mfa/verify`
5. MFA enabled for user

**Required For:**

- `SYSTEM_ADMIN`
- `HR_MANAGER`
- `AUDITOR`

**Verification:**

- TOTP (Time-based One-Time Password)
- 1-step window tolerance (30 seconds before/after)
- Backup codes provided on setup

### 4. Rate Limiting

**Auth Endpoints:**

- 10 requests/minute per email address
- Prevents brute force attacks

**General API:**

- 100 requests/minute per user

**Implementation**: Redis-backed rate limiting

### 5. Session Caching

**Redis Cache:**

- Key: `session:${userId}`
- TTL: 30 minutes
- Stores: User data (id, email, roles, clearance, etc.)

**Benefits:**

- Reduces database queries
- Faster authentication checks
- Automatic expiration

### 6. Audit Logging

**All authentication events logged:**

- `LOGIN_SUCCESS`
- `LOGIN_FAILED`
- `LOGOUT`
- `PASSWORD_CHANGED`
- `MFA_ENABLED`
- `ACCOUNT_LOCKED`

**Logged Details:**

- User ID, email, IP address, user agent
- Timestamp, success/failure
- Action-specific details

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint                           | Auth Required | Description               |
| ------ | ---------------------------------- | ------------- | ------------------------- |
| POST   | `/api/v1/auth/register`            | No            | Register new applicant    |
| POST   | `/api/v1/auth/login`               | No            | Login with email/password |
| POST   | `/api/v1/auth/refresh`             | No            | Refresh access token      |
| POST   | `/api/v1/auth/logout`              | Yes           | Logout and revoke tokens  |
| GET    | `/api/v1/auth/me`                  | Yes           | Get current user info     |
| POST   | `/api/v1/auth/verify-email`        | No            | Verify email address      |
| POST   | `/api/v1/auth/resend-verification` | No            | Resend verification email |
| POST   | `/api/v1/auth/mfa/setup`           | Yes           | Setup MFA                 |
| POST   | `/api/v1/auth/mfa/verify`          | Yes           | Verify and enable MFA     |
| POST   | `/api/v1/auth/password/change`     | Yes           | Change password           |

### Request/Response Examples

#### Register

**Request:**

```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}
```

**Response:**

```json
{
  "data": {
    "userId": "user-id-123",
    "message": "Registration successful. Please check your email to verify your account."
  },
  "meta": {
    "timestamp": "2025-12-19T12:50:37.231Z",
    "requestId": "xwQ-vrCFVrT6JzOPWE1M_"
  }
}
```

#### Login

**Request:**

```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "mfaToken": "123456"
}
```

**Response:**

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

#### Get Current User

**Request:**

```json
GET /api/v1/auth/me
Authorization: Bearer eyJhbGci...
```

**Response:**

```json
{
  "data": {
    "user": {
      "id": "user-id-123",
      "email": "user@example.com",
      "username": "johndoe",
      "roles": ["APPLICANT"],
      "clearanceLevel": "PUBLIC",
      "department": null,
      "mfaEnabled": false
    }
  },
  "meta": {
    "timestamp": "2025-12-19T12:50:37.231Z",
    "requestId": "xwQ-vrCFVrT6JzOPWE1M_"
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "JWT public key not configured"

**Error:**

```
TokenInvalidError: JWT public key not configured
```

**Solution:**

- Ensure `JWT_ACCESS_PUBLIC_KEY` is set in `.env`
- Or set `JWT_ACCESS_SECRET` as fallback
- Verify key format (includes `-----BEGIN PUBLIC KEY-----`)

#### 2. "Token verification failed"

**Error:**

```
TokenInvalidError: Token verification failed
```

**Possible Causes:**

- Token signed with different key than verification key
- Token expired (check `exp` claim)
- Wrong issuer/audience
- Token malformed

**Solution:**

- Verify public key matches private key used for signing
- Check token expiration
- Ensure `JWT_ACCESS_PUBLIC_KEY` is correct

#### 3. "Account is locked"

**Error:**

```
AccountLockedError: Account is locked
```

**Solution:**

- Wait 30 minutes for automatic unlock
- Or manually unlock in database:
  ```sql
  UPDATE "User"
  SET "lockedUntil" = NULL, "failedLoginCount" = 0
  WHERE email = 'user@example.com';
  ```

#### 4. "Email not verified"

**Error:**

```
InvalidCredentialsError: Please verify your email address
```

**Solution:**

- Check email for verification link
- Or resend verification: `POST /api/v1/auth/resend-verification`
- Verify email in database: `UPDATE "User" SET "isVerified" = true WHERE email = '...'`

#### 5. "Invalid MFA code"

**Error:**

```
InvalidMFACodeError: Invalid MFA code
```

**Solution:**

- Ensure authenticator app time is synchronized
- Try code from next 30-second window
- Use backup code if available
- Re-setup MFA if needed

#### 6. Redis Connection Failed

**Error:**

```
Redis connection failed
```

**Solution:**

- Verify Redis is running: `redis-cli ping` (should return `PONG`)
- Check `REDIS_URL` in `.env`
- Restart Redis service

#### 7. Token Refresh Fails

**Error:**

```
TokenInvalidError: Invalid or revoked refresh token
```

**Possible Causes:**

- Refresh token expired (7 days)
- Token revoked (logout or security event)
- Token not found in database

**Solution:**

- User must re-login
- Check `RefreshToken` table for token status
- Verify token hasn't expired

### Debugging Tips

#### 1. Decode JWT Token

Use [jwt.io](https://jwt.io) to decode and inspect tokens:

- Paste token
- View payload (without verification)
- Check expiration, issuer, audience

#### 2. Check Redis Cache

```bash
redis-cli
> KEYS session:*
> GET session:user-id-123
```

#### 3. Check Database

```sql
-- Check user status
SELECT id, email, "isActive", "isVerified", "lockedUntil", "failedLoginCount"
FROM "User"
WHERE email = 'user@example.com';

-- Check refresh tokens
SELECT * FROM "RefreshToken"
WHERE "userId" = 'user-id-123'
ORDER BY "createdAt" DESC;
```

#### 4. Enable Debug Logging

Set in `.env`:

```env
LOG_LEVEL=debug
```

---

## Best Practices

### 1. Token Storage

**Development:**

- ✅ localStorage (convenient for development)

**Production:**

- ✅ Consider httpOnly cookies (XSS protection)
- ✅ Implement CSRF tokens if using cookies
- ⚠️ Avoid localStorage for sensitive applications

### 2. Token Rotation

- ✅ Always rotate refresh tokens on use
- ✅ Revoke old tokens immediately
- ✅ Limit concurrent refresh tokens per user

### 3. Security Headers

Ensure backend sets:

- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`

### 4. Key Management

- ✅ Use different keys for each environment
- ✅ Rotate keys periodically (6-12 months)
- ✅ Store production keys in secret management service
- ✅ Never commit keys to version control

### 5. Monitoring

Monitor for:

- High rate of failed logins
- Unusual token refresh patterns
- Account lockouts
- MFA failures

---

## Additional Resources

- [JWT.io](https://jwt.io) - JWT debugger and documentation
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

**Last Updated**: December 2025  
**Version**: 1.0
