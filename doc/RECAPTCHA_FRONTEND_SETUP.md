# reCAPTCHA Frontend Setup & Testing Guide

This guide explains how to set up and test reCAPTCHA on the frontend registration form.

## 📋 Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Environment Configuration](#environment-configuration)
3. [Testing Guide](#testing-guide)
4. [Troubleshooting](#troubleshooting)

---

## Setup Instructions

### Step 1: Get reCAPTCHA Keys from Google

1. **Go to Google reCAPTCHA Admin Console**:

   - Visit: https://www.google.com/recaptcha/admin/create

2. **Create a New Site**:

   - **Label**: "ATS System" (or any name)
   - **reCAPTCHA type**:
     - **v2**: "I'm not a robot" Checkbox (recommended for testing)
     - **v3**: Invisible reCAPTCHA (runs in background)
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - `127.0.0.1` (for local testing)
     - `yourdomain.com` (for production)
     - `*.yourdomain.com` (for subdomains)

3. **Get Your Keys**:
   - After creating, you'll receive:
     - **Site Key** (public) - Use in frontend
     - **Secret Key** (private) - Use in backend `.env`

### Step 2: Configure Frontend Environment

Create or update `frontend/.env` or `frontend/.env.local`:

```env
# reCAPTCHA Configuration
VITE_RECAPTCHA_SITE_KEY=your-site-key-here
VITE_RECAPTCHA_VERSION=v2
```

**Options for `VITE_RECAPTCHA_VERSION`**:

- `v2` - Checkbox reCAPTCHA (user clicks "I'm not a robot")
- `v3` - Invisible reCAPTCHA (runs automatically)

### Step 3: Configure Backend Environment

Update `backend/.env`:

```env
# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your-secret-key-here
RECAPTCHA_MIN_SCORE=0.5  # Only for v3, default is 0.5
```

### Step 4: Restart Development Servers

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

---

## Environment Configuration

### Frontend Variables

| Variable                  | Required | Description                      | Example                                   |
| ------------------------- | -------- | -------------------------------- | ----------------------------------------- |
| `VITE_RECAPTCHA_SITE_KEY` | Yes\*    | Google reCAPTCHA Site Key        | `6LcAbCdEfGhIjKlMnOpQrStUvWxYz1234567890` |
| `VITE_RECAPTCHA_VERSION`  | No       | reCAPTCHA version (`v2` or `v3`) | `v2`                                      |

\*Required only if you want to enable reCAPTCHA. If not set, reCAPTCHA will be disabled.

### Backend Variables

| Variable               | Required | Description                    | Example                                    |
| ---------------------- | -------- | ------------------------------ | ------------------------------------------ |
| `RECAPTCHA_SECRET_KEY` | Yes\*    | Google reCAPTCHA Secret Key    | `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` |
| `RECAPTCHA_MIN_SCORE`  | No       | Minimum score for v3 (0.0-1.0) | `0.5`                                      |

\*Required for reCAPTCHA verification. If not set, registration will fail in production.

---

## Testing Guide

### Test 1: Verify reCAPTCHA is Displayed

1. **Navigate to Registration Page**:

   ```
   http://localhost:3005/register
   ```

2. **Check for reCAPTCHA Widget**:

   - **v2**: You should see a checkbox with "I'm not a robot"
   - **v3**: No visible widget (runs invisibly)

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for any errors related to reCAPTCHA
   - Should see: "reCAPTCHA script loaded"

### Test 2: Successful Registration with reCAPTCHA

1. **Fill out the registration form**:

   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `SecurePass123!@#`
   - Confirm Password: `SecurePass123!@#`

2. **Complete reCAPTCHA**:

   - **v2**: Click the checkbox and complete any challenge if shown
   - **v3**: No action needed (runs automatically)

3. **Submit the form**:
   - Click "Sign up"
   - Should see success message
   - Check backend logs for: "reCAPTCHA verification" with `success: true`

### Test 3: Registration Without Completing reCAPTCHA (v2)

1. **Fill out the form** but don't check the reCAPTCHA checkbox
2. **Try to submit**:
   - Button should be disabled
   - Should see toast: "Please complete the reCAPTCHA verification"

### Test 4: Invalid reCAPTCHA Token

1. **Using Browser DevTools**:

   - Open Network tab
   - Submit form with valid reCAPTCHA
   - Intercept the request
   - Modify `recaptchaToken` to an invalid value
   - Should receive: `RECAPTCHA_FAILED` error

2. **Using curl** (for API testing):
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePass123!@#",
       "fullName": "Test User",
       "recaptchaToken": "invalid-token-12345"
     }'
   ```
   - Expected: `400 Bad Request` with `RECAPTCHA_FAILED` error

### Test 5: Check Backend Logs

After registration, check backend console for:

```
reCAPTCHA verification {
  success: true,
  score: 0.9,  // For v3
  action: 'register',
  hostname: 'localhost',
  ...
}
```

### Test 6: Test with Google Test Keys

For automated testing, Google provides test keys that always pass:

**Test Site Key (v2)**:

```
6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Test Secret Key (v2)**:

```
6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**Test Site Key (v3)**:

```
6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Test Secret Key (v3)**:

```
6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**Note**: These test keys always return `success: true` and score `0.9` for v3, regardless of user interaction.

---

## Troubleshooting

### Issue: reCAPTCHA Widget Not Showing

**Possible Causes**:

1. **Site Key not set**: Check `VITE_RECAPTCHA_SITE_KEY` in `.env`
2. **Domain not authorized**: Ensure `localhost` is added to reCAPTCHA site domains
3. **Script loading error**: Check browser console for errors
4. **Network issues**: Ensure you can access `https://www.google.com`

**Solution**:

- Verify environment variables are loaded (restart dev server)
- Check browser console for errors
- Verify domain is added in Google reCAPTCHA console

### Issue: "reCAPTCHA verification failed" Error

**Possible Causes**:

1. **Secret key mismatch**: Backend secret key doesn't match site key
2. **Token expired**: reCAPTCHA tokens expire after ~2 minutes
3. **Domain mismatch**: Token generated for different domain
4. **Score too low** (v3): Score below minimum threshold

**Solution**:

- Verify `RECAPTCHA_SECRET_KEY` matches the secret key for your site key
- Check backend logs for detailed error information
- For v3, try lowering `RECAPTCHA_MIN_SCORE` temporarily

### Issue: Button Disabled Even After Completing reCAPTCHA

**Possible Causes**:

1. **Token not set**: `onChange` callback not firing
2. **State not updating**: React state issue

**Solution**:

- Check browser console for reCAPTCHA errors
- Verify `Recaptcha` component is receiving correct `siteKey`
- Check React DevTools to see if `recaptchaToken` state is updating

### Issue: reCAPTCHA Works Locally But Not in Production

**Possible Causes**:

1. **Domain not authorized**: Production domain not added to reCAPTCHA site
2. **HTTPS required**: reCAPTCHA requires HTTPS in production
3. **Environment variables not set**: Production env vars missing

**Solution**:

- Add production domain to reCAPTCHA site settings
- Ensure production uses HTTPS
- Verify environment variables are set in production environment

---

## Verification Checklist

- [ ] reCAPTCHA widget appears on registration page
- [ ] Can complete reCAPTCHA challenge (v2) or it runs automatically (v3)
- [ ] Registration succeeds with valid reCAPTCHA token
- [ ] Registration fails with invalid reCAPTCHA token
- [ ] Button is disabled until reCAPTCHA is completed (v2)
- [ ] Backend logs show successful verification
- [ ] Error messages display correctly for failed verification
- [ ] reCAPTCHA resets after failed registration attempt

---

## Additional Notes

### reCAPTCHA v2 vs v3

**v2 (Checkbox)**:

- ✅ User-friendly, visible challenge
- ✅ Better for user trust
- ❌ Requires user interaction
- ❌ Can be intrusive

**v3 (Invisible)**:

- ✅ No user interaction required
- ✅ Provides risk score (0.0-1.0)
- ✅ Better user experience
- ❌ Less transparent to users
- ❌ Requires score threshold configuration

### Best Practices

1. **Use v2 for registration forms** (better user trust)
2. **Use v3 for login forms** (less intrusive)
3. **Set appropriate score threshold** (0.5 is recommended for v3)
4. **Monitor verification logs** for suspicious patterns
5. **Test with real keys** before production deployment

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs for verification details
3. Verify environment variables are set correctly
4. Ensure domains are authorized in Google reCAPTCHA console
5. Test with Google's test keys first
