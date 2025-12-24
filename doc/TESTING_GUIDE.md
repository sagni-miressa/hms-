# Comprehensive Testing Guide

This guide provides step-by-step instructions to test all features and security requirements of the ATS (Applicant Tracking System).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Authentication & Identification](#authentication--identification)
3. [Access Control Systems](#access-control-systems)
4. [Audit Trails & Logging](#audit-trails--logging)
5. [Data Backups](#data-backups)
6. [Password Security](#password-security)
7. [Session Management](#session-management)
8. [Multi-Factor Authentication](#multi-factor-authentication)

---

## Prerequisites

### Setup Test Environment

```bash
# 1. Start the backend server
cd backend
npm run dev

# 2. Start the frontend (if testing UI)
cd frontend
npm run dev

# 3. Ensure database and Redis are running
docker-compose up -d

# 4. Set up test environment variables
cp .env.example .env
# Configure: DATABASE_URL, REDIS_URL, JWT keys, SMTP, etc.
```

### Test Tools

- **API Client**: Postman, Insomnia, or `curl`
- **Database Client**: pgAdmin, DBeaver, or `psql`
- **Redis Client**: Redis CLI or RedisInsight
- **Authenticator App**: Google Authenticator or Authy (for MFA testing)

### Base URL

```
Backend API: http://localhost:5000/api/v1
```

---

## 1. Authentication & Identification

### 1.1 User Registration

**Requirement**: Secure registration with email verification

**Test Steps**:

1. **Register a new user**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePass123!@#",
       "fullName": "Test User"
     }'
   ```

2. **Expected Result**:

   - ✅ Status: `201 Created`
   - ✅ Response contains `userId`
   - ✅ Message indicates email verification required
   - ✅ User created with `isVerified: false`
   - ✅ Email verification token generated

3. **Verify in Database**:

   ```sql
   SELECT id, email, "isVerified", "createdAt" FROM "User" WHERE email = 'test@example.com';
   SELECT token, "expiresAt" FROM "EmailVerificationToken" WHERE email = 'test@example.com';
   ```

4. **Test Invalid Registration**:
   - ❌ Weak password: `"password": "123"` → Should fail validation
   - ❌ Invalid email: `"email": "invalid"` → Should fail validation
   - ❌ Duplicate email → Should fail with appropriate error

### 1.2 Email Verification

**Test Steps**:

1. **Get verification token from database**:

   ```sql
   SELECT token FROM "EmailVerificationToken" WHERE email = 'test@example.com';
   ```

2. **Verify email**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{
       "token": "<token-from-database>"
     }'
   ```

3. **Expected Result**:

   - ✅ Status: `200 OK`
   - ✅ User `isVerified` set to `true`
   - ✅ Token marked as verified
   - ✅ Audit log created with `EMAIL_VERIFIED` action

4. **Test Invalid Token**:

   - ❌ Expired token → Should return `TOKEN_EXPIRED`
   - ❌ Invalid token → Should return `INVALID_TOKEN`
   - ❌ Already verified → Should return `ALREADY_VERIFIED`

5. **Resend verification**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/resend-verification \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com"
     }'
   ```

### 1.3 reCAPTCHA (Bot Prevention)

**Requirement**: Prevent bot registrations using Google reCAPTCHA

**How It Works**:

1. **Frontend Flow**:

   - User completes reCAPTCHA challenge (v2 checkbox or v3 invisible)
   - Google returns a token to the frontend
   - Frontend sends this token in the `recaptchaToken` field during registration

2. **Backend Verification**:

   - Backend receives the token in the registration request
   - Calls Google's verification API with:
     - Secret key (from environment)
     - Token (from frontend)
     - User's IP address
   - Google returns verification result with:
     - `success`: boolean (true/false)
     - `score`: number 0.0-1.0 (for v3 only, higher is better)
     - `hostname`: domain where token was generated
   - Backend validates:
     - For v2: Checks if `success === true`
     - For v3: Checks if `success === true` AND `score >= minScore` (default 0.5)

3. **Configuration**:

   - **Environment Variables**:
     ```env
     RECAPTCHA_SECRET_KEY=your-secret-key-here
     RECAPTCHA_MIN_SCORE=0.5  # Optional, default 0.5 (for v3 only)
     ```
   - **Development Mode**: If `RECAPTCHA_SECRET_KEY` is not set:
     - Development: Verification is skipped (returns `true`)
     - Production: Registration will fail with error

4. **Behavior**:
   - Token is **optional** in the request (if not provided, verification is skipped)
   - If token is provided, it **must** be valid
   - Invalid tokens result in `RECAPTCHA_FAILED` error
   - Network errors in development mode allow registration (fail-open)
   - Network errors in production mode block registration (fail-closed)

**Test Steps**:

#### Test 1: Registration Without reCAPTCHA (Development Mode)

When `RECAPTCHA_SECRET_KEY` is not set in development:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-no-captcha@example.com",
    "password": "SecurePass123!@#",
    "fullName": "Test User No Captcha"
  }'
```

**Expected Result**:

- ✅ Status: `201 Created` (registration succeeds)
- ✅ Check server logs: Should see "reCAPTCHA verification skipped (no secret key in development)"

#### Test 2: Registration With Valid reCAPTCHA Token

**Prerequisites**:

- Set up reCAPTCHA keys (see [Environment Setup Guide](../doc/ENVIRONMENT_SETUP.md))
- Get a valid token from your frontend or Google's test tokens

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-with-captcha@example.com",
    "password": "SecurePass123!@#",
    "fullName": "Test User With Captcha",
    "recaptchaToken": "<valid-recaptcha-token-from-frontend>"
  }'
```

**Expected Result**:

- ✅ Status: `201 Created` (if token is valid)
- ✅ Check server logs: Should see "reCAPTCHA verification" with success details

#### Test 3: Registration With Invalid reCAPTCHA Token

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-invalid-captcha@example.com",
    "password": "SecurePass123!@#",
    "fullName": "Test User Invalid",
    "recaptchaToken": "invalid-token-12345"
  }'
```

**Expected Result**:

- ❌ Status: `400 Bad Request`
- ❌ Error code: `RECAPTCHA_FAILED`
- ❌ Error message: "reCAPTCHA verification failed. Please try again."
- ✅ Audit log created with reason: "reCAPTCHA verification failed"

#### Test 4: Registration With Expired reCAPTCHA Token

reCAPTCHA tokens expire after ~2 minutes. Test with an old token:

```bash
# Use a token that was generated more than 2 minutes ago
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-expired-captcha@example.com",
    "password": "SecurePass123!@#",
    "fullName": "Test User Expired",
    "recaptchaToken": "<expired-token>"
  }'
```

**Expected Result**:

- ❌ Status: `400 Bad Request`
- ❌ Error code: `RECAPTCHA_FAILED`

#### Test 5: reCAPTCHA v3 Score Validation

For reCAPTCHA v3, test with different scores:

```bash
# Test with low score (should fail if minScore is 0.5)
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-low-score@example.com",
    "password": "SecurePass123!@#",
    "fullName": "Test User Low Score",
    "recaptchaToken": "<token-with-low-score>"
  }'
```

**Expected Result**:

- If score < `RECAPTCHA_MIN_SCORE`: ❌ Status `400` with `RECAPTCHA_FAILED`
- If score >= `RECAPTCHA_MIN_SCORE`: ✅ Status `201 Created`

#### Test 6: Missing Token (Optional Behavior)

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-no-token@example.com",
    "password": "SecurePass123!@#",
    "fullName": "Test User No Token"
  }'
```

**Expected Result**:

- ✅ Status: `201 Created` (registration succeeds)
- ℹ️ Note: Token is optional, so missing token doesn't cause failure

#### Test 7: Network Error Handling

To test network error handling, you can temporarily block Google's API or use an invalid verification URL.

**Expected Behavior**:

- **Development**: Registration succeeds (fail-open)
- **Production**: Registration fails (fail-closed)

#### Test 8: Verify Server Logs

Check server logs for reCAPTCHA verification details:

```bash
# Look for log entries like:
# "reCAPTCHA verification" with fields:
# - success: boolean
# - score: number (for v3)
# - action: string
# - hostname: string
```

**Verification Checklist**:

- [ ] Registration without token works in development
- [ ] Registration with valid token succeeds
- [ ] Registration with invalid token fails with `RECAPTCHA_FAILED`
- [ ] Registration with expired token fails
- [ ] reCAPTCHA v3 score validation works correctly
- [ ] Server logs show verification attempts
- [ ] Audit logs record failed verification attempts
- [ ] IP address is sent to Google for verification

**Google reCAPTCHA Test Keys**:

For testing, Google provides test keys that always pass:

- **Site Key (v2)**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key (v2)**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`
- **Site Key (v3)**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key (v3)**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

**Note**: These test keys always return `success: true` and score `0.9` for v3, regardless of the actual user interaction.

---

## 2. Password Security

### 2.1 Password Policies

**Requirement**: Minimum length, complexity requirements

**Test Steps**:

1. **Test Password Validation**:

   ```bash
   # Test weak passwords (should all fail)
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "weak@test.com", "password": "short", "fullName": "Test"}'
   # Expected: Validation error for minimum length

   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "weak2@test.com", "password": "nouppercase123!@#", "fullName": "Test"}'
   # Expected: Validation error for missing uppercase

   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "weak3@test.com", "password": "NOLOWERCASE123!@#", "fullName": "Test"}'
   # Expected: Validation error for missing lowercase

   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "weak4@test.com", "password": "NoNumbers!@#", "fullName": "Test"}'
   # Expected: Validation error for missing numbers

   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "weak5@test.com", "password": "NoSpecial123", "fullName": "Test"}'
   # Expected: Validation error for missing special characters
   ```

2. **Test Valid Password**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "valid@test.com",
       "password": "ValidPass123!@#",
       "fullName": "Valid User"
     }'
   # Expected: Success (201 Created)
   ```

### 2.2 Password Hashing

**Test Steps**:

1. **Verify password is hashed in database**:

   ```sql
   SELECT email, "passwordHash" FROM "User" WHERE email = 'test@example.com';
   ```

   - ✅ Password hash should NOT be plain text
   - ✅ Should be bcrypt hash (starts with `$2b$` or `$2a$`)

2. **Verify password verification works**:
   - Login with correct password → Should succeed
   - Login with incorrect password → Should fail

### 2.3 Account Lockout Policy

**Requirement**: Lock account after failed login attempts

**Test Steps**:

1. **Attempt multiple failed logins**:

   ```bash
   # Attempt 1-5 (should all fail)
   for i in {1..5}; do
     curl -X POST http://localhost:5000/api/v1/auth/login \
       -H "Content-Type: application/json" \
       -d '{
         "email": "test@example.com",
         "password": "WrongPassword123!@#"
       }'
     echo "Attempt $i"
   done
   ```

2. **Check account lockout**:

   ```sql
   SELECT email, "failedLoginAttempts", "lockedUntil" FROM "User" WHERE email = 'test@example.com';
   ```

   - ✅ After 5 failed attempts, `lockedUntil` should be set (30 minutes from now)
   - ✅ `failedLoginAttempts` should be 5

3. **Attempt login while locked**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "CorrectPassword123!@#"
     }'
   ```

   - ❌ Should return `ACCOUNT_LOCKED` error

4. **Verify lockout expires** (wait 30 minutes or manually update database):

   ```sql
   UPDATE "User" SET "lockedUntil" = NULL, "failedLoginAttempts" = 0 WHERE email = 'test@example.com';
   ```

5. **Verify successful login resets counter**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "CorrectPassword123!@#"
     }'
   ```
   - ✅ Should succeed
   - ✅ `failedLoginAttempts` should reset to 0

### 2.4 Password Change

**Test Steps**:

1. **Login to get access token**:

   ```bash
   TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePass123!@#"
     }' | jq -r '.data.accessToken')
   ```

2. **Change password**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/password/change \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "currentPassword": "SecurePass123!@#",
       "newPassword": "NewSecurePass456!@#"
     }'
   ```

3. **Expected Result**:

   - ✅ Status: `200 OK`
   - ✅ Password updated in database
   - ✅ Audit log created with `PASSWORD_CHANGED` action

4. **Test Invalid Current Password**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/password/change \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "currentPassword": "WrongPassword",
       "newPassword": "NewSecurePass456!@#"
     }'
   ```

   - ❌ Should return `INVALID_CREDENTIALS` error

5. **Verify new password works**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "NewSecurePass456!@#"
     }'
   ```
   - ✅ Should succeed

---

## 3. Token-Based Authentication

### 3.1 Login & Token Generation

**Test Steps**:

1. **Login with valid credentials**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "NewSecurePass456!@#"
     }'
   ```

2. **Expected Response**:

   ```json
   {
     "data": {
       "accessToken": "eyJhbGc...",
       "refreshToken": "eyJhbGc...",
       "requiresMFA": false
     }
   }
   ```

3. **Verify tokens**:

   - ✅ Access token is JWT format
   - ✅ Refresh token is stored in database
   - ✅ Access token contains user info (decode with jwt.io)

4. **Test Invalid Credentials**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "WrongPassword"
     }'
   ```
   - ❌ Should return `401 Unauthorized`

### 3.2 Access Token Usage

**Test Steps**:

1. **Get current user info**:

   ```bash
   curl -X GET http://localhost:5000/api/v1/auth/me \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **Expected Response**:

   ```json
   {
     "data": {
       "user": {
         "id": "...",
         "email": "test@example.com",
         "roles": ["APPLICANT"],
         "clearanceLevel": "PUBLIC",
         "mfaEnabled": false
       }
     }
   }
   ```

3. **Test Invalid Token**:

   ```bash
   curl -X GET http://localhost:5000/api/v1/auth/me \
     -H "Authorization: Bearer invalid-token"
   ```

   - ❌ Should return `401 Unauthorized`

4. **Test Expired Token** (wait for expiration or use old token):
   - ❌ Should return `401 Unauthorized` with `TOKEN_EXPIRED`

### 3.3 Token Refresh

**Test Steps**:

1. **Refresh access token**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{
       "refreshToken": "<refresh-token-from-login>"
     }'
   ```

2. **Expected Result**:

   - ✅ New access token issued
   - ✅ New refresh token issued (optional, depends on implementation)
   - ✅ Old refresh token invalidated (if rotation enabled)

3. **Test Invalid Refresh Token**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{
       "refreshToken": "invalid-token"
     }'
   ```

   - ❌ Should return `401 Unauthorized`

4. **Test Expired Refresh Token**:
   - ❌ Should return `401 Unauthorized` with `REFRESH_TOKEN_EXPIRED`

### 3.4 Logout

**Test Steps**:

1. **Logout**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/logout \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "refreshToken": "<refresh-token>"
     }'
   ```

2. **Expected Result**:

   - ✅ Status: `200 OK`
   - ✅ Refresh token revoked in database
   - ✅ Session cleared from Redis

3. **Verify token is invalidated**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{
       "refreshToken": "<revoked-refresh-token>"
     }'
   ```
   - ❌ Should return `401 Unauthorized`

---

## 4. Multi-Factor Authentication (MFA)

### 4.1 MFA Setup

**Test Steps**:

1. **Setup MFA** (requires authentication):

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/mfa/setup \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"
   ```

2. **Expected Response**:

   ```json
   {
     "data": {
       "secret": "JBSWY3DPEHPK3PXP",
       "qrCodeUrl": "otpauth://totp/...",
       "backupCodes": ["12345678", "87654321", ...]
     }
   }
   ```

3. **Scan QR code** with authenticator app (Google Authenticator, Authy)

4. **Verify MFA token**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/mfa/verify \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "token": "<6-digit-code-from-authenticator-app>"
     }'
   ```

5. **Expected Result**:
   - ✅ Status: `200 OK`
   - ✅ MFA enabled for user (`mfaEnabled: true` in database)

### 4.2 MFA Login Flow

**Test Steps**:

1. **Login without MFA token** (user has MFA enabled):

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "NewSecurePass456!@#"
     }'
   ```

2. **Expected Response**:

   ```json
   {
     "data": {
       "requiresMFA": true
     }
   }
   ```

   - ✅ No tokens returned
   - ✅ `requiresMFA: true` indicates MFA token needed

3. **Login with MFA token**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "NewSecurePass456!@#",
       "mfaToken": "<6-digit-code-from-authenticator-app>"
     }'
   ```

4. **Expected Result**:

   - ✅ Status: `200 OK`
   - ✅ Access and refresh tokens returned

5. **Test Invalid MFA Token**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "NewSecurePass456!@#",
       "mfaToken": "000000"
     }'
   ```
   - ❌ Should return `INVALID_MFA_TOKEN` error

---

## 5. Access Control Systems

### 5.1 Mandatory Access Control (MAC)

**Requirement**: Data classification and clearance-based access

**Test Steps**:

1. **Create users with different clearance levels**:

   ```sql
   -- Public clearance user
   UPDATE "User" SET "clearanceLevel" = 'PUBLIC' WHERE email = 'public@test.com';

   -- Internal clearance user
   UPDATE "User" SET "clearanceLevel" = 'INTERNAL' WHERE email = 'internal@test.com';

   -- Confidential clearance user
   UPDATE "User" SET "clearanceLevel" = 'CONFIDENTIAL' WHERE email = 'confidential@test.com';
   ```

2. **Create a job with salary data** (requires CONFIDENTIAL clearance):

   ```bash
   # Login as HR Manager (CONFIDENTIAL clearance)
   HR_TOKEN="<hr-manager-token>"

   curl -X POST http://localhost:5000/api/v1/jobs \
     -H "Authorization: Bearer $HR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Software Engineer",
       "salaryRange": "$80,000 - $120,000",
       "clearanceRequired": "CONFIDENTIAL"
     }'
   ```

3. **Test Public user access**:

   ```bash
   PUBLIC_TOKEN="<public-user-token>"

   curl -X GET http://localhost:5000/api/v1/jobs/<job-id> \
     -H "Authorization: Bearer $PUBLIC_TOKEN"
   ```

   - ✅ Job title visible
   - ❌ Salary data should be filtered out (not in response)

4. **Test Internal user access**:

   ```bash
   INTERNAL_TOKEN="<internal-user-token>"

   curl -X GET http://localhost:5000/api/v1/jobs/<job-id> \
     -H "Authorization: Bearer $INTERNAL_TOKEN"
   ```

   - ✅ Job title visible
   - ❌ Salary data should still be filtered (requires CONFIDENTIAL)

5. **Test Confidential user access**:

   ```bash
   CONFIDENTIAL_TOKEN="<confidential-user-token>"

   curl -X GET http://localhost:5000/api/v1/jobs/<job-id> \
     -H "Authorization: Bearer $CONFIDENTIAL_TOKEN"
   ```

   - ✅ Job title visible
   - ✅ Salary data visible

6. **Verify in audit logs**:
   ```sql
   SELECT action, "resourceType", "resourceId", "userId", "ipAddress"
   FROM "AuditLog"
   WHERE action = 'RESOURCE_ACCESSED'
   ORDER BY "createdAt" DESC;
   ```

### 5.2 Discretionary Access Control (DAC)

**Requirement**: Resource owners can grant/revoke permissions

**Test Steps**:

1. **Create a resource** (e.g., application):

   ```bash
   # Login as applicant
   APPLICANT_TOKEN="<applicant-token>"

   curl -X POST http://localhost:5000/api/v1/applications \
     -H "Authorization: Bearer $APPLICANT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "jobId": "<job-id>",
       "coverLetter": "I am interested in this position..."
     }'
   ```

2. **Grant access to another user** (e.g., interviewer):

   ```bash
   # Login as resource owner (applicant or HR manager)
   OWNER_TOKEN="<owner-token>"

   curl -X POST http://localhost:5000/api/v1/acl/grant \
     -H "Authorization: Bearer $OWNER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "granteeId": "<interviewer-user-id>",
       "resourceType": "Application",
       "resourceId": "<application-id>",
       "permission": "feedback"
     }'
   ```

3. **Verify access granted**:

   ```sql
   SELECT * FROM "ACL"
   WHERE "resourceType" = 'Application'
   AND "resourceId" = '<application-id>';
   ```

4. **Test access by granted user**:

   ```bash
   INTERVIEWER_TOKEN="<interviewer-token>"

   curl -X GET http://localhost:5000/api/v1/applications/<application-id> \
     -H "Authorization: Bearer $INTERVIEWER_TOKEN"
   ```

   - ✅ Should succeed (access granted)

5. **Revoke access**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/acl/revoke \
     -H "Authorization: Bearer $OWNER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "granteeId": "<interviewer-user-id>",
       "resourceType": "Application",
       "resourceId": "<application-id>"
     }'
   ```

6. **Verify access revoked**:
   ```bash
   curl -X GET http://localhost:5000/api/v1/applications/<application-id> \
     -H "Authorization: Bearer $INTERVIEWER_TOKEN"
   ```
   - ❌ Should return `403 Forbidden`

### 5.3 Role-Based Access Control (RBAC)

**Requirement**: Role-based permissions

**Test Steps**:

1. **Create users with different roles**:

   ```sql
   -- Applicant
   UPDATE "User" SET roles = ARRAY['APPLICANT'] WHERE email = 'applicant@test.com';

   -- Recruiter
   UPDATE "User" SET roles = ARRAY['RECRUITER'] WHERE email = 'recruiter@test.com';

   -- HR Manager
   UPDATE "User" SET roles = ARRAY['HR_MANAGER'] WHERE email = 'hr@test.com';

   -- System Admin
   UPDATE "User" SET roles = ARRAY['SYSTEM_ADMIN'] WHERE email = 'admin@test.com';
   ```

2. **Test Applicant permissions**:

   ```bash
   APPLICANT_TOKEN="<applicant-token>"

   # Should succeed: Create application
   curl -X POST http://localhost:5000/api/v1/applications \
     -H "Authorization: Bearer $APPLICANT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"jobId": "<job-id>"}'

   # Should fail: Create job (not allowed)
   curl -X POST http://localhost:5000/api/v1/jobs \
     -H "Authorization: Bearer $APPLICANT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test Job"}'
   ```

   - ❌ Should return `403 Forbidden` (insufficient role)

3. **Test Recruiter permissions**:

   ```bash
   RECRUITER_TOKEN="<recruiter-token>"

   # Should succeed: View applications
   curl -X GET http://localhost:5000/api/v1/applications \
     -H "Authorization: Bearer $RECRUITER_TOKEN"

   # Should succeed: Update application status
   curl -X PATCH http://localhost:5000/api/v1/applications/<application-id> \
     -H "Authorization: Bearer $RECRUITER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "REVIEWED"}'
   ```

4. **Test HR Manager permissions**:

   ```bash
   HR_TOKEN="<hr-manager-token>"

   # Should succeed: Create job
   curl -X POST http://localhost:5000/api/v1/jobs \
     -H "Authorization: Bearer $HR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "Senior Engineer", "department": "Engineering"}'

   # Should succeed: View all applications
   curl -X GET http://localhost:5000/api/v1/applications \
     -H "Authorization: Bearer $HR_TOKEN"
   ```

5. **Test System Admin permissions**:

   ```bash
   ADMIN_TOKEN="<admin-token>"

   # Should succeed: View audit logs
   curl -X GET http://localhost:5000/api/v1/system/audit-logs \
     -H "Authorization: Bearer $ADMIN_TOKEN"

   # Should succeed: View backup status
   curl -X GET http://localhost:5000/api/v1/system/backup/status \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

6. **Test role hierarchy** (HR_MANAGER inherits RECRUITER permissions):
   ```bash
   # HR Manager should have all Recruiter permissions
   curl -X GET http://localhost:5000/api/v1/applications \
     -H "Authorization: Bearer $HR_TOKEN"
   ```
   - ✅ Should succeed (inherited permission)

### 5.4 Rule-Based Access Control (RuBAC)

**Requirement**: Time, location, device-based rules

**Test Steps**:

1. **Test working hours restriction** (9 AM - 6 PM, Monday-Friday):

   ```bash
   # Set system time to outside working hours (or mock in test)
   # Attempt access outside working hours
   curl -X POST http://localhost:5000/api/v1/jobs \
     -H "Authorization: Bearer $HR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title": "Test Job"}'
   ```

   - ❌ If outside working hours → Should return `403 Forbidden` with `ACCESS_DENIED_OUTSIDE_WORKING_HOURS`

2. **Test IP whitelisting** (if configured):

   ```bash
   # Attempt access from non-whitelisted IP
   curl -X POST http://localhost:5000/api/v1/jobs \
     -H "Authorization: Bearer $HR_TOKEN" \
     -H "Content-Type: application/json" \
     -H "X-Forwarded-For: 192.168.1.100" \
     -d '{"title": "Test Job"}'
   ```

   - ❌ If IP not whitelisted → Should return `403 Forbidden`

3. **Test device restrictions** (if configured):
   ```bash
   # Attempt access with unauthorized device
   curl -X POST http://localhost:5000/api/v1/jobs \
     -H "Authorization: Bearer $HR_TOKEN" \
     -H "Content-Type: application/json" \
     -H "User-Agent: Suspicious-Bot/1.0" \
     -d '{"title": "Test Job"}'
   ```

### 5.5 Attribute-Based Access Control (ABAC)

**Requirement**: Fine-grained control based on attributes

**Test Steps**:

1. **Set user departments**:

   ```sql
   UPDATE "User" SET department = 'Engineering' WHERE email = 'recruiter@test.com';
   UPDATE "User" SET department = 'Marketing' WHERE email = 'recruiter2@test.com';
   ```

2. **Create jobs in different departments**:

   ```bash
   # Create Engineering job
   curl -X POST http://localhost:5000/api/v1/jobs \
     -H "Authorization: Bearer $HR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Software Engineer",
       "department": "Engineering"
     }'

   # Create Marketing job
   curl -X POST http://localhost:5000/api/v1/jobs \
     -H "Authorization: Bearer $HR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Marketing Manager",
       "department": "Marketing"
     }'
   ```

3. **Test department-based access**:

   ```bash
   ENGINEERING_RECRUITER_TOKEN="<engineering-recruiter-token>"

   # Should succeed: Access Engineering job
   curl -X GET http://localhost:5000/api/v1/jobs/<engineering-job-id> \
     -H "Authorization: Bearer $ENGINEERING_RECRUITER_TOKEN"

   # Should fail: Access Marketing job (different department)
   curl -X GET http://localhost:5000/api/v1/jobs/<marketing-job-id> \
     -H "Authorization: Bearer $ENGINEERING_RECRUITER_TOKEN"
   ```

   - ❌ Should return `403 Forbidden` (not authorized for Marketing department)

4. **Test combined attributes** (role + department + time):
   ```bash
   # HR Manager in Finance during working hours
   # Should succeed: Access Finance department resources
   # Should fail: Access outside working hours
   ```

---

## 6. Audit Trails & Logging

### 6.1 User Activity Logging

**Test Steps**:

1. **Perform various actions**:

   - Login
   - Create application
   - Update profile
   - Change password
   - Grant permissions

2. **Query audit logs**:

   ```sql
   SELECT
     action,
     "resourceType",
     "resourceId",
     "userId",
     "ipAddress",
     "userAgent",
     "createdAt"
   FROM "AuditLog"
   ORDER BY "createdAt" DESC
   LIMIT 20;
   ```

3. **Verify log entries contain**:

   - ✅ Username/user ID
   - ✅ Timestamp
   - ✅ IP address
   - ✅ User agent
   - ✅ Specific action performed
   - ✅ Resource type and ID (if applicable)

4. **Test specific actions**:

   ```sql
   -- Login attempts
   SELECT * FROM "AuditLog" WHERE action = 'LOGIN_SUCCESS' OR action = 'LOGIN_FAILED';

   -- Resource access
   SELECT * FROM "AuditLog" WHERE action = 'RESOURCE_ACCESSED';

   -- Permission changes
   SELECT * FROM "AuditLog" WHERE action IN ('PERMISSION_GRANTED', 'PERMISSION_REVOKED');

   -- Password changes
   SELECT * FROM "AuditLog" WHERE action = 'PASSWORD_CHANGED';
   ```

### 6.2 System Events Logging

**Test Steps**:

1. **Check system startup logs**:

   ```bash
   # Check backend logs
   tail -f backend/logs/combined-*.log
   # Or check console output when starting server
   ```

2. **Verify system events logged**:

   - ✅ Server startup
   - ✅ Database connection
   - ✅ Redis connection
   - ✅ Scheduler initialization

3. **Test configuration changes** (if applicable):
   ```sql
   SELECT * FROM "AuditLog" WHERE action = 'CONFIGURATION_CHANGED';
   ```

### 6.3 Log Encryption

**Test Steps**:

1. **Check encrypted audit logs**:

   ```sql
   SELECT
     action,
     "encryptedDetails",
     "details"
   FROM "AuditLog"
   WHERE "encryptedDetails" IS NOT NULL
   LIMIT 5;
   ```

2. **Verify sensitive data is encrypted**:

   - ✅ Password-related fields encrypted
   - ✅ PII data encrypted
   - ✅ Sensitive details in `encryptedDetails` field

3. **Test decryption** (if utility available):
   ```typescript
   // Use logEncryption utility to decrypt
   import { decryptLogData } from "@/utils/logEncryption";
   const decrypted = decryptLogData(encryptedDetails);
   ```

### 6.4 Centralized Logging

**Test Steps**:

1. **Enable centralized logging** (if not already):

   ```env
   # .env
   LOGSTASH_ENABLED=true
   LOGSTASH_HOST=logstash.example.com
   LOGSTASH_PORT=5000
   ```

2. **Install transport package** (if needed):

   ```bash
   npm install winston-logstash
   ```

3. **Restart server and verify**:

   ```bash
   # Check logs for transport enabled message
   grep "Logstash transport enabled" backend/logs/combined-*.log
   ```

4. **Verify logs in centralized system**:
   - Check Logstash/ELK Stack
   - Check CloudWatch (if configured)
   - Check HTTP webhook endpoint (if configured)

### 6.5 Alerting Mechanisms

**Test Steps**:

1. **Trigger account lockout** (should send alert):

   ```bash
   # Attempt 5 failed logins
   for i in {1..5}; do
     curl -X POST http://localhost:5000/api/v1/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email": "test@example.com", "password": "WrongPassword"}'
   done
   ```

2. **Check alert sent**:

   ```sql
   SELECT * FROM "AuditLog" WHERE action = 'ALERT_SENT' ORDER BY "createdAt" DESC;
   ```

3. **Verify email alert** (check SMTP logs or email inbox):

   - ✅ Alert email sent to configured address
   - ✅ Contains account lockout details

4. **Test other alert triggers**:
   - Multiple failed logins
   - Suspicious activity
   - Unauthorized access attempts
   - Backup failures

---

## 7. Data Backups

### 7.1 Automated Backup Scheduling

**Test Steps**:

1. **Enable backups**:

   ```env
   # .env
   BACKUP_ENABLED=true
   BACKUP_DATABASE_ENABLED=true
   BACKUP_REDIS_ENABLED=true
   BACKUP_DATABASE_SCHEDULE=0 2 * * *  # Daily at 2 AM
   BACKUP_REDIS_SCHEDULE=0 3 * * *      # Daily at 3 AM
   ```

2. **Check scheduler status**:

   ```bash
   curl -X GET http://localhost:5000/api/v1/system/backup/status \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

3. **Expected Response**:

   ```json
   {
     "data": {
       "enabled": true,
       "tasks": [
         {
           "name": "database-backup",
           "schedule": "0 2 * * *",
           "enabled": true
         },
         {
           "name": "redis-backup",
           "schedule": "0 3 * * *",
           "enabled": true
         }
       ]
     }
   }
   ```

4. **Manually trigger backup** (for testing):

   ```bash
   # Database backup
   curl -X POST http://localhost:5000/api/v1/system/backup/database \
     -H "Authorization: Bearer $ADMIN_TOKEN"

   # Redis backup
   curl -X POST http://localhost:5000/api/v1/system/backup/redis \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

5. **Verify backup files created**:

   ```bash
   ls -lh backend/backups/database/
   ls -lh backend/backups/redis/
   ```

6. **Verify backup integrity**:

   ```bash
   # Check file size (should not be 0)
   ls -lh backend/backups/database/*.sql

   # Verify PostgreSQL dump format
   head -n 5 backend/backups/database/*.sql
   ```

### 7.2 Backup Retention Policy

**Test Steps**:

1. **Create old backup files** (for testing):

   ```bash
   # Create a backup file with old timestamp
   touch -t 202401010000 backend/backups/database/old-backup.sql
   ```

2. **Trigger cleanup**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/system/backup/cleanup \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

3. **Verify old backups deleted**:

   ```bash
   ls -lh backend/backups/database/
   # Old backup should be deleted
   ```

4. **Check retention configuration**:
   ```env
   BACKUP_RETENTION_DAYS=30  # Keep backups for 30 days
   ```

### 7.3 S3 Backup Upload (if configured)

**Test Steps**:

1. **Configure S3**:

   ```env
   BACKUP_S3_ENABLED=true
   BACKUP_S3_BUCKET=my-backups-bucket
   BACKUP_S3_REGION=us-east-1
   BACKUP_S3_ACCESS_KEY_ID=<access-key>
   BACKUP_S3_SECRET_ACCESS_KEY=<secret-key>
   ```

2. **Trigger backup**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/system/backup/database \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

3. **Verify upload to S3**:

   ```bash
   # Check S3 bucket
   aws s3 ls s3://my-backups-bucket/database/
   ```

4. **Check logs for S3 upload**:
   ```bash
   grep "Backup uploaded to S3" backend/logs/combined-*.log
   ```

### 7.4 Backup Verification

**Test Steps**:

1. **Verify backup file**:

   ```typescript
   // Use backup verification function
   import { verifyBackup } from "@/services/backup.service";
   const isValid = await verifyBackup(
     "backups/database/backup.sql",
     "database"
   );
   ```

2. **Test restore** (manual):

   ```bash
   # Restore database from backup
   psql -h localhost -U hiring_user -d hiring_system < backups/database/backup.sql
   ```

3. **Verify data integrity**:
   ```sql
   SELECT COUNT(*) FROM "User";
   SELECT COUNT(*) FROM "Job";
   SELECT COUNT(*) FROM "Application";
   ```

---

## 8. Session Management

### 8.1 Session Caching

**Test Steps**:

1. **Login and verify session cached**:

   ```bash
   # Login
   TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "NewSecurePass456!@#"}'
     | jq -r '.data.accessToken')
   ```

2. **Check Redis for session**:

   ```bash
   redis-cli
   > KEYS session:*
   > GET session:<user-id>
   ```

3. **Verify session TTL**:

   ```bash
   redis-cli
   > TTL session:<user-id>
   # Should return TTL in seconds (e.g., 1800 for 30 minutes)
   ```

4. **Test session expiration**:
   - Wait for TTL to expire
   - Attempt to use access token
   - Should require re-authentication

### 8.2 Concurrent Sessions

**Test Steps**:

1. **Login from multiple devices**:

   ```bash
   # Device 1
   TOKEN1=$(curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "NewSecurePass456!@#", "deviceId": "device1"}'
     | jq -r '.data.accessToken')

   # Device 2
   TOKEN2=$(curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "NewSecurePass456!@#", "deviceId": "device2"}'
     | jq -r '.data.accessToken')
   ```

2. **Verify both tokens work**:

   ```bash
   curl -X GET http://localhost:5000/api/v1/auth/me \
     -H "Authorization: Bearer $TOKEN1"

   curl -X GET http://localhost:5000/api/v1/auth/me \
     -H "Authorization: Bearer $TOKEN2"
   ```

3. **Check refresh tokens in database**:
   ```sql
   SELECT "deviceId", "ipAddress", "userAgent", "createdAt", "expiresAt"
   FROM "RefreshToken"
   WHERE "userId" = '<user-id>';
   ```

---

## 9. Rate Limiting

### 9.1 Authentication Rate Limiting

**Test Steps**:

1. **Attempt multiple login requests rapidly**:

   ```bash
   for i in {1..10}; do
     curl -X POST http://localhost:5000/api/v1/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email": "test@example.com", "password": "WrongPassword"}'
     echo "Request $i"
   done
   ```

2. **Expected Result**:

   - ✅ First 5 requests processed
   - ❌ Subsequent requests return `429 Too Many Requests`
   - ✅ Rate limit headers present: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

3. **Wait for rate limit window** and retry:
   - Should succeed after window expires

---

## 10. Security Headers & CORS

### 10.1 Security Headers

**Test Steps**:

1. **Check response headers**:

   ```bash
   curl -I http://localhost:5000/api/v1/auth/me \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **Verify headers present**:
   - ✅ `X-Content-Type-Options: nosniff`
   - ✅ `X-Frame-Options: DENY`
   - ✅ `X-XSS-Protection: 1; mode=block`
   - ✅ `Strict-Transport-Security: max-age=31536000` (if HTTPS)

### 10.2 CORS Configuration

**Test Steps**:

1. **Test CORS preflight**:

   ```bash
   curl -X OPTIONS http://localhost:5000/api/v1/auth/login \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST"
   ```

2. **Verify CORS headers**:
   - ✅ `Access-Control-Allow-Origin` set correctly
   - ✅ `Access-Control-Allow-Methods` includes required methods
   - ✅ `Access-Control-Allow-Headers` includes required headers

---

## 11. Input Validation & Sanitization

### 11.1 Input Validation

**Test Steps**:

1. **Test SQL injection attempts**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com'\'' OR 1=1--", "password": "test"}'
   ```

   - ❌ Should fail validation (not SQL injection)

2. **Test XSS attempts**:

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "SecurePass123!@#", "fullName": "<script>alert(\"XSS\")</script>"}'
   ```

   - ❌ Should sanitize or reject

3. **Test path traversal**:
   ```bash
   curl -X GET http://localhost:5000/api/v1/jobs/../../../etc/passwd \
     -H "Authorization: Bearer $TOKEN"
   ```
   - ❌ Should fail validation

---

## 12. Health Checks

### 12.1 System Health

**Test Steps**:

1. **Check basic health**:

   ```bash
   curl http://localhost:5000/api/v1/system/health
   ```

2. **Expected Response**:

   ```json
   {
     "status": "healthy",
     "timestamp": "2025-01-01T00:00:00.000Z",
     "uptime": 3600,
     "environment": "development",
     "version": "1.0.0"
   }
   ```

3. **Check readiness**:

   ```bash
   curl http://localhost:5000/api/v1/system/health/ready
   ```

4. **Expected Response**:
   ```json
   {
     "status": "healthy",
     "services": {
       "database": true,
       "redis": true
     },
     "uptime": 3600
   }
   ```

---

## 13. Test Checklist Summary

### ✅ Authentication & Identification

- [ ] User registration with email verification
- [ ] reCAPTCHA bot prevention
- [ ] Email verification flow
- [ ] Resend verification email

### ✅ Password Security

- [ ] Password policy enforcement (length, complexity)
- [ ] Password hashing (bcrypt)
- [ ] Account lockout after failed attempts
- [ ] Password change functionality
- [ ] Secure password transmission (HTTPS)

### ✅ Token-Based Authentication

- [ ] Login and token generation
- [ ] Access token usage
- [ ] Token refresh
- [ ] Logout and token revocation

### ✅ Multi-Factor Authentication

- [ ] MFA setup (TOTP)
- [ ] QR code generation
- [ ] MFA verification
- [ ] MFA login flow
- [ ] Backup codes

### ✅ Access Control

- [ ] Mandatory Access Control (MAC) - Clearance levels
- [ ] Discretionary Access Control (DAC) - Permission granting
- [ ] Role-Based Access Control (RBAC) - Role permissions
- [ ] Rule-Based Access Control (RuBAC) - Time/location rules
- [ ] Attribute-Based Access Control (ABAC) - Department/attributes

### ✅ Audit Trails & Logging

- [ ] User activity logging
- [ ] System events logging
- [ ] Log encryption
- [ ] Centralized logging (Logstash/CloudWatch)
- [ ] Alerting mechanisms

### ✅ Data Backups

- [ ] Automated backup scheduling
- [ ] Database backup
- [ ] Redis backup
- [ ] Backup retention policy
- [ ] S3 backup upload (if configured)
- [ ] Backup verification

### ✅ Session Management

- [ ] Session caching (Redis)
- [ ] Session expiration
- [ ] Concurrent sessions
- [ ] Device tracking

### ✅ Security Features

- [ ] Rate limiting
- [ ] Security headers
- [ ] CORS configuration
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 14. Test Data Setup

### Create Test Users

```sql
-- Applicant
INSERT INTO "User" (email, "passwordHash", "fullName", "isVerified", roles, "clearanceLevel", department)
VALUES ('applicant@test.com', '$2b$12$...', 'Test Applicant', true, ARRAY['APPLICANT'], 'PUBLIC', NULL);

-- Recruiter
INSERT INTO "User" (email, "passwordHash", "fullName", "isVerified", roles, "clearanceLevel", department)
VALUES ('recruiter@test.com', '$2b$12$...', 'Test Recruiter', true, ARRAY['RECRUITER'], 'INTERNAL', 'Engineering');

-- HR Manager
INSERT INTO "User" (email, "passwordHash", "fullName", "isVerified", roles, "clearanceLevel", department)
VALUES ('hr@test.com', '$2b$12$...', 'Test HR Manager', true, ARRAY['HR_MANAGER'], 'CONFIDENTIAL', 'HR');

-- System Admin
INSERT INTO "User" (email, "passwordHash", "fullName", "isVerified", roles, "clearanceLevel", department)
VALUES ('admin@test.com', '$2b$12$...', 'Test Admin', true, ARRAY['SYSTEM_ADMIN'], 'RESTRICTED', NULL);
```

### Generate Password Hashes

```bash
# Use Node.js to generate bcrypt hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TestPassword123!@#', 12).then(console.log)"
```

---

## 15. Troubleshooting

### Common Issues

1. **Token Expired**:

   - Refresh token or login again
   - Check token expiration time

2. **Rate Limited**:

   - Wait for rate limit window to expire
   - Check rate limit configuration

3. **Access Denied**:

   - Verify user roles and permissions
   - Check clearance levels
   - Verify resource ownership (for DAC)

4. **Backup Failed**:

   - Check database/Redis connection
   - Verify backup directory permissions
   - Check disk space

5. **Logs Not Appearing**:
   - Check log level configuration
   - Verify centralized logging transport enabled
   - Check network connectivity to log server

---

**Last Updated**: December 2025  
**Status**: ✅ **Complete Testing Guide**
