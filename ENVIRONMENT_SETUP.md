# Environment Variables Configuration Guide

This guide explains how to configure SMTP, reCAPTCHA, and encryption keys for the ATS system.

## 📁 Where to Configure

Create or update the `.env` file in the `backend/` directory:

```bash
backend/.env
```

---

## 1. 📧 SMTP Configuration (Email Sending)

### Purpose
Used for sending email verification links and security alerts.

### Required Variables

```env
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### Step-by-Step Setup

#### Option A: Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Google account:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "ATS System" as the name
   - Copy the 16-character password

3. **Configure in `.env`**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop  # Your 16-char app password (spaces optional)
   SMTP_FROM=your-email@gmail.com
   ```

#### Option B: Other Email Providers

**Outlook/Office 365:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

#### Option C: Development Mode (No SMTP)

If you don't configure SMTP in development, the system will:
- Use Ethereal Email (test emails)
- Log emails to console
- Still work for testing

**No configuration needed** - the system will automatically use test mode.

---

## 2. 🤖 reCAPTCHA Configuration

### Purpose
Prevents bot registrations and spam.

### Required Variables

```env
RECAPTCHA_SECRET_KEY=your-secret-key-here
RECAPTCHA_MIN_SCORE=0.5  # Optional, default is 0.5 (for v3)
```

### Step-by-Step Setup

1. **Go to Google reCAPTCHA Admin Console**:
   - Visit: https://www.google.com/recaptcha/admin/create

2. **Create a New Site**:
   - **Label**: "ATS System" (or any name)
   - **reCAPTCHA type**: Choose v2 ("I'm not a robot" checkbox) or v3 (invisible)
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - `yourdomain.com` (for production)
     - `*.yourdomain.com` (for subdomains)

3. **Get Your Keys**:
   - After creating, you'll get:
     - **Site Key** (public) - Use this in your frontend
     - **Secret Key** (private) - Use this in backend `.env`

4. **Configure in `.env`**:
   ```env
   RECAPTCHA_SECRET_KEY=6LcAbCdEfGhIjKlMnOpQrStUvWxYz1234567890
   RECAPTCHA_MIN_SCORE=0.5  # Only for v3, ignore for v2
   ```

5. **Frontend Configuration** (if needed):
   - Add the Site Key to your frontend `.env`:
     ```env
     VITE_RECAPTCHA_SITE_KEY=6LcAbCdEfGhIjKlMnOpQrStUvWxYz1234567890
     ```

### Development Mode

If `RECAPTCHA_SECRET_KEY` is not set:
- **Development**: Verification is skipped (returns `true`)
- **Production**: Registration will fail

---

## 3. 🔐 Log Encryption Key

### Purpose
Encrypts sensitive data in audit logs (passwords, tokens, PII).

### Required Variables

```env
LOG_ENCRYPTION_KEY=your-32-byte-encryption-key-here
# OR
ENCRYPTION_KEY=your-32-byte-encryption-key-here
```

### Step-by-Step Setup

#### Generate a Strong Encryption Key

**Option 1: Using OpenSSL (Recommended)**
```bash
# Generate 32-byte (256-bit) key
openssl rand -base64 32

# Output example:
# K8j3mN9pQ2rT5vW8yZ1bC4eF7hJ0kL3nP6sU9vX2zA5=
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Using PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Option 4: Online Generator**
- Visit: https://generate-secret.vercel.app/32
- Copy the generated key

#### Configure in `.env`

```env
LOG_ENCRYPTION_KEY=K8j3mN9pQ2rT5vW8yZ1bC4eF7hJ0kL3nP6sU9vX2zA5=
```

**Important Notes:**
- ⚠️ **Never commit this key to version control**
- 🔒 Store it securely (use a password manager)
- 🔄 Use different keys for development and production
- 📝 Minimum 32 bytes (256 bits) recommended
- 🔑 If you lose this key, encrypted logs cannot be decrypted

---

## 4. 🚨 Alert Email Configuration

### Purpose
Email addresses that receive security alerts.

### Required Variables

```env
ALERT_EMAIL_ADMINS=admin1@example.com,admin2@example.com
ALERT_EMAIL_SECURITY=security@example.com
```

### Step-by-Step Setup

1. **Identify Recipients**:
   - **Admins**: System administrators who need alerts
   - **Security Team**: Security team email addresses

2. **Configure in `.env`**:
   ```env
   ALERT_EMAIL_ADMINS=admin@yourdomain.com,manager@yourdomain.com
   ALERT_EMAIL_SECURITY=security@yourdomain.com,alerts@yourdomain.com
   ```

3. **Multiple Emails**:
   - Separate multiple emails with commas
   - No spaces needed (but spaces are allowed)

---

## 📋 Complete `.env` Example

Create `backend/.env` with all configurations:

```env
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://user:password@localhost:5432/hiring_system

# ============================================================================
# JWT SECRETS
# ============================================================================
JWT_ACCESS_SECRET=your-access-token-secret-here
JWT_REFRESH_SECRET=your-refresh-token-secret-here

# ============================================================================
# SMTP (Email Configuration)
# ============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173

# ============================================================================
# reCAPTCHA
# ============================================================================
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_MIN_SCORE=0.5

# ============================================================================
# LOG ENCRYPTION
# ============================================================================
LOG_ENCRYPTION_KEY=K8j3mN9pQ2rT5vW8yZ1bC4eF7hJ0kL3nP6sU9vX2zA5=

# ============================================================================
# ALERTING
# ============================================================================
ALERT_EMAIL_ADMINS=admin@yourdomain.com
ALERT_EMAIL_SECURITY=security@yourdomain.com

# ============================================================================
# REDIS (if using)
# ============================================================================
REDIS_URL=redis://localhost:6379

# ============================================================================
# ENVIRONMENT
# ============================================================================
NODE_ENV=development
PORT=5000
```

---

## ✅ Verification Steps

### 1. Test SMTP Configuration

```bash
cd backend
npm run dev
```

Try registering a new user. Check:
- Email is sent (or logged to console in dev mode)
- No SMTP errors in logs

### 2. Test reCAPTCHA

1. Try registering without a reCAPTCHA token → Should fail
2. Try registering with a valid token → Should succeed
3. In development without `RECAPTCHA_SECRET_KEY` → Should allow (with warning)

### 3. Test Log Encryption

1. Check audit logs in database
2. Sensitive fields should be encrypted (base64 strings starting with encrypted data)
3. No errors in logs about encryption

### 4. Test Alerts

Trigger a security event (e.g., multiple failed logins):
- Check email inbox for alert
- Check logs for alert creation

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git**:
   ```bash
   # Ensure .env is in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use different keys for each environment**:
   - Development: Test keys
   - Staging: Staging keys
   - Production: Production keys

3. **Rotate keys periodically**:
   - Encryption keys: Every 6-12 months
   - JWT secrets: If compromised
   - SMTP passwords: As needed

4. **Store production keys securely**:
   - Use secret management services (AWS Secrets Manager, HashiCorp Vault)
   - Use environment variables in deployment platforms
   - Never hardcode in code

5. **Monitor for exposed keys**:
   - Use tools like GitGuardian or TruffleHog
   - Regular security audits

---

## 🆘 Troubleshooting

### SMTP Issues

**Error: "Invalid login"**
- Check username and password
- For Gmail: Use App Password, not regular password
- Verify 2FA is enabled (for Gmail)

**Error: "Connection timeout"**
- Check firewall settings
- Verify SMTP port (587 for TLS, 465 for SSL)
- Try different SMTP server

### reCAPTCHA Issues

**Error: "Invalid site key"**
- Verify secret key matches site key
- Check domain is registered in reCAPTCHA console
- Ensure using correct key type (v2 vs v3)

### Encryption Issues

**Error: "Encryption key not configured"**
- Check `LOG_ENCRYPTION_KEY` or `ENCRYPTION_KEY` is set
- Verify key is at least 32 bytes
- Check for typos in variable name

---

## 📚 Additional Resources

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Google reCAPTCHA Docs](https://developers.google.com/recaptcha/docs/display)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [OpenSSL Documentation](https://www.openssl.org/docs/)

---

## ✅ Quick Start Checklist

- [ ] Created `backend/.env` file
- [ ] Configured SMTP (or using dev mode)
- [ ] Set up reCAPTCHA keys
- [ ] Generated and added encryption key
- [ ] Configured alert email addresses
- [ ] Tested email sending
- [ ] Tested reCAPTCHA verification
- [ ] Verified `.env` is in `.gitignore`
- [ ] Backed up encryption key securely

---

**Need Help?** Check the logs in `backend/logs/` for detailed error messages.

