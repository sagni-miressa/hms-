# Security Architecture & Guidelines

## 🛡️ Security Philosophy

This system implements **Zero-Trust Architecture** with **Defense in Depth**. Every request is authenticated, authorized, and audited. Security is not an afterthought—it's the foundation.

## 🔐 Multi-Layer Authorization

### 1. **RBAC** - Role-Based Access Control

Users are assigned roles with specific permissions:

```typescript
APPLICANT       → Apply to jobs, view own applications
RECRUITER       → Manage jobs, review applications (department-scoped)
INTERVIEWER     → View assigned candidates, submit feedback
HR_MANAGER      → All recruiter + approve offers, view salaries
AUDITOR         → Read-only access to audit logs
SYSTEM_ADMIN    → Full system access
```

**Location**: `backend/src/config/constants.ts` → `ROLE_PERMISSIONS`

### 2. **MAC** - Mandatory Access Control (Clearance-Based)

Information is classified by sensitivity:

```typescript
PUBLIC        → Job listings, public pages
INTERNAL      → Application data, internal notes
CONFIDENTIAL  → Salary info, offers, sensitive feedback
RESTRICTED    → System config, audit logs, admin functions
```

Fields are filtered based on user clearance level:

```typescript
// Salary hidden unless CONFIDENTIAL clearance
if (user.clearanceLevel < CONFIDENTIAL) {
  delete job.salaryRange;
  delete job.salaryMin;
  delete job.salaryMax;
}
```

**Location**: `backend/src/services/authorization.service.ts` → `filterByClearance()`

### 3. **DAC** - Discretionary Access Control

Resource owners can grant specific permissions to others:

```typescript
// Grant interviewer access to specific application
await grantDACAccess(
  grantedById: hrManagerId,
  granteeId: interviewerId,
  resourceType: 'Application',
  resourceId: applicationId,
  permission: 'feedback'
);
```

**Database Table**: `acls` with expiration support  
**Location**: `backend/src/services/authorization.service.ts` → DAC functions

### 4. **ABAC** - Attribute-Based Access Control

Access decisions based on user & resource attributes:

```typescript
// Recruiters can only access applications in their department
if (user.department !== job.department) {
  throw new ABACDeniedError('Not authorized for this department');
}
```

**Location**: `backend/src/services/authorization.service.ts` → ABAC functions

### 5. **RuBAC** - Rule-Based Access Control

Contextual rules for access:

```typescript
// Working hours enforcement
WORKING_HOURS: {
  appliesTo: ['RECRUITER', 'HR_MANAGER'],
  allowedHours: { start: 9, end: 18 },
  allowedDays: [1, 2, 3, 4, 5], // Monday-Friday
}

// IP whitelist for admins
IP_WHITELIST: {
  appliesTo: ['SYSTEM_ADMIN'],
  allowedIPs: ['1.2.3.4', '5.6.7.8'],
}
```

**Location**: `backend/src/config/constants.ts` → `RUBAC_RULES`

## 🔒 Authentication

### JWT-Based with Refresh Tokens

```typescript
// Short-lived access token (15 minutes)
accessToken: JWT {
  sub: userId,
  email,
  roles,
  clearanceLevel,
  exp: 15m
}

// Long-lived refresh token (7 days)
refreshToken: Stored in DB with {
  userId,
  deviceId,
  ipAddress,
  expiresAt,
  revokedAt
}
```

**Key Features**:
- RS256 algorithm (asymmetric encryption)
- Automatic token refresh on expiry
- Refresh token rotation (new token issued, old revoked)
- Device tracking
- IP address logging

**Location**: `backend/src/services/auth.service.ts`

### Password Security

```typescript
// Password requirements
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

// Hashing: bcrypt with 12 rounds
await bcrypt.hash(password, 12);
```

### Multi-Factor Authentication (MFA)

```typescript
// TOTP-based (Google Authenticator, Authy)
- Required for: SYSTEM_ADMIN, HR_MANAGER, AUDITOR
- Optional for others
- Backup codes provided on setup
```

**Location**: `backend/src/services/auth.service.ts` → MFA functions

## 🔍 Audit Logging

**Every significant action is logged** with non-repudiable details:

```typescript
AuditLog {
  userId,
  username,         // Denormalized (survives user deletion)
  userRoles,
  action,          // LOGIN_SUCCESS, APPLICATION_STATUS_CHANGED, etc.
  resourceType,
  resourceId,
  details,         // Action-specific data
  changes: {       // Before/after for updates
    before,
    after
  },
  ipAddress,
  userAgent,
  requestId,       // Correlate with access logs
  timestamp
}
```

**Never Deleted**: Audit logs are immutable and never deleted (compliance requirement).

**Location**: `backend/src/services/audit.service.ts`  
**Schema**: `backend/prisma/schema.prisma` → `AuditLog` model

## 🚫 Rate Limiting

Multiple tiers to prevent abuse:

```typescript
// General API: 100 requests/minute per user
// Auth endpoints: 10 attempts/minute per email
// File uploads: 50 uploads/hour per user
// Custom limits per operation
```

**Backend**: Redis-backed (persists across restarts)  
**Location**: `backend/src/middleware/rateLimit.ts`

## 🛡️ Input Validation

**Double validation** (client + server):

```typescript
// Client-side: Zod schemas in React Hook Form
// Server-side: Zod middleware before controllers

// Example: Job creation
const createJobSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(10000),
  salaryMin: z.number().optional(),
  // ... all fields validated
});
```

**Location**:
- Frontend: `frontend/src/pages/*.tsx` (inline schemas)
- Backend: `backend/src/routes/*.routes.ts` + `backend/src/middleware/validation.ts`

## 🔐 Session Management

```typescript
// Session stored in Redis (30-minute idle timeout)
// Absolute timeout: 12 hours
// Max concurrent sessions: 3 per user
// Force logout on role/clearance change
```

**Location**: `backend/src/config/redis.ts` → `sessionCache`

## 📦 File Upload Security

```typescript
// Restrictions
- Max size: 10MB
- Allowed types: PDF, DOCX, TXT
- Virus scanning: ClamAV (production)
- Randomized filenames
- Presigned URLs (1-hour expiry)
- Stored outside web root (S3/MinIO)

// Scan before storage
if (virusScanResult.infected) {
  throw new VirusDetectedError();
}
```

**Location**: `backend/src/config/constants.ts` → `SECURITY.FILE_UPLOAD`

## 🔒 Account Lockout

Protection against brute force:

```typescript
// 5 failed login attempts → Account locked for 30 minutes
// Lockout audit logged with severity: HIGH
// Email notification sent to user (future enhancement)
```

**Location**: `backend/src/services/auth.service.ts` → `handleFailedLogin()`

## 🌐 CORS Configuration

```typescript
// Whitelist exact origins (no wildcards in production)
CORS_ORIGINS=https://app.example.com,https://www.example.com

// Credentials allowed (for cookies)
credentials: true

// Only specific methods and headers
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
```

**Location**: `backend/src/app.ts` → CORS middleware

## 🔐 Security Headers

Helmet.js with strict configuration:

```typescript
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

**Location**: `backend/src/app.ts` → Helmet middleware

## 🗄️ Database Security

### Prisma Best Practices

```typescript
// Parameterized queries (SQL injection prevention)
await prisma.user.findUnique({
  where: { email: userInput }  // Prisma handles escaping
});

// Row-level security (PostgreSQL)
// Optional: Enable RLS for extra defense layer
ALTER TABLE application ENABLE ROW LEVEL SECURITY;
```

### Connection Security

```typescript
// Connection pooling (limit connections)
// Read replicas (separate read/write)
// Encrypted connections (SSL/TLS)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

## 🔑 Secrets Management

### Development

```env
# .env file (never committed)
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

### Production

**Use external secret management**:
- AWS Secrets Manager
- HashiCorp Vault
- Kubernetes Secrets
- Doppler

**Never** hardcode secrets in:
- Source code
- Docker images
- Environment variables in docker-compose.yml
- CI/CD pipelines (use secret stores)

## 🚨 Threat Model

### Protected Against

✅ SQL Injection (Prisma parameterized queries)  
✅ XSS (React escaping, CSP headers)  
✅ CSRF (SameSite cookies, token-based auth)  
✅ Brute Force (rate limiting, account lockout)  
✅ Session Hijacking (HttpOnly cookies, short expiry, secure flags)  
✅ Privilege Escalation (multi-layer authorization)  
✅ Information Disclosure (clearance-based filtering, minimal error messages)  
✅ Denial of Service (rate limiting, input validation, resource limits)  
✅ Path Traversal (input validation, presigned URLs)  
✅ Malicious File Uploads (type checking, size limits, virus scanning)

### Attack Surface

**Minimize exposure**:
- API endpoints require authentication (except public routes)
- Error messages don't leak implementation details
- Stack traces only in development
- No verbose logging to client
- CORS restricted to whitelisted domains

## 📊 Security Monitoring

### Metrics to Track

```typescript
// Login failures per user (detect brute force)
// Failed authorization attempts (detect privilege escalation)
// Unusual access patterns (detect compromised accounts)
// Rate limit violations (detect DoS attempts)
// MFA failures (detect account takeover attempts)
```

### Alerting

**Set up alerts for**:
- 10+ failed logins from same IP in 5 minutes
- Multiple failed MFA attempts
- Admin login from new location/device
- Bulk data access (potential data exfiltration)
- Modification of audit logs (security violation)

**Tools**: Sentry, ELK Stack, Prometheus + Grafana

## 🔄 Incident Response

### If Breach Suspected

1. **Isolate**: Disable affected accounts
2. **Audit**: Review audit logs for IOCs
3. **Revoke**: Revoke all refresh tokens
4. **Rotate**: Rotate JWT secrets (forces re-login)
5. **Notify**: Inform affected users
6. **Patch**: Fix vulnerability
7. **Document**: Post-mortem and lessons learned

### Recovery Plan

```bash
# Revoke all sessions
redis-cli FLUSHDB

# Rotate JWT secrets
openssl rand -base64 64 > new_secret.txt

# Force password reset for compromised accounts
UPDATE users SET passwordHash = NULL WHERE id IN (...);

# Export audit logs for forensics
npm run export-audit-logs --from="2024-01-01" --to="2024-12-31"
```

## 📋 Security Checklist

### Before Production

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (64+ bytes)
- [ ] Enable HTTPS with valid certificate
- [ ] Configure CORS for production domain
- [ ] Set up admin IP whitelist
- [ ] Enable Redis authentication
- [ ] Restrict database access
- [ ] Enable virus scanning for uploads
- [ ] Set up audit log alerting
- [ ] Configure automated backups
- [ ] Test account lockout
- [ ] Verify MFA enforcement
- [ ] Review all environment variables
- [ ] Run security audit (npm audit, Snyk)
- [ ] Penetration testing
- [ ] Load testing with attack scenarios

### Ongoing

- [ ] Weekly npm audit + dependency updates
- [ ] Monthly security log review
- [ ] Quarterly penetration testing
- [ ] Annual security training for team
- [ ] Regular backup restoration testing
- [ ] Review and rotate secrets (quarterly)
- [ ] Update IP whitelists as needed
- [ ] Monitor for zero-day vulnerabilities

## 📚 References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- CIS Controls: https://www.cisecurity.org/controls/

---

**"Security is a process, not a product." — Bruce Schneier**

This system is designed with security at its core. Maintain this standard. Your users' careers depend on it.

