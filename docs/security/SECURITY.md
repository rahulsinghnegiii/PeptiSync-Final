# PeptiSync Nova - Security Implementation

This document outlines the comprehensive security measures implemented in the PeptiSync application.

## Table of Contents

1. [Authentication Security](#authentication-security)
2. [Authorization & Access Control](#authorization--access-control)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [CSRF Protection](#csrf-protection)
5. [XSS Prevention](#xss-prevention)
6. [SQL Injection Prevention](#sql-injection-prevention)
7. [Rate Limiting](#rate-limiting)
8. [Session Management](#session-management)
9. [Data Protection](#data-protection)
10. [Security Headers](#security-headers)

---

## Authentication Security

### Password Requirements

**Implementation:** `src/lib/passwordValidation.ts`

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Password strength indicator in UI

### Email Verification

**Implementation:** `src/contexts/AuthContext.tsx`

- Email verification required before full access
- Verification email sent on registration
- Verification link expires after 24 hours
- Re-send verification option available

### Password Reset Flow

**Implementation:** `src/pages/ResetPassword.tsx`, `src/pages/UpdatePassword.tsx`

- Secure password reset via email
- Reset token expires after 1 hour
- Token can only be used once
- Old password is invalidated immediately

### Brute Force Protection

**Implementation:** `src/lib/rateLimiter.ts`

- Rate limiting on login attempts
- 5 attempts per 15 minutes per IP
- Account lockout after excessive attempts
- CAPTCHA integration ready

---

## Authorization & Access Control

### Role-Based Access Control (RBAC)

**Implementation:** `src/lib/authorization.ts`

Three role levels:
1. **User** (default) - Basic access
2. **Moderator** - Enhanced permissions
3. **Admin** - Full access

Role hierarchy:
- Admin inherits all moderator permissions
- Moderator inherits all user permissions

### Row Level Security (RLS)

**Implementation:** `supabase/migrations/20251011000000_verify_and_strengthen_rls.sql`

All database tables have RLS enabled:

#### Profiles Table
- Users can view/edit their own profile
- Admins can view/edit all profiles

#### Products Table
- Anyone can view active products
- Only admins can create/update/delete products

#### Cart Items Table
- Users can only access their own cart items
- Complete isolation between users

#### Orders Table
- Users can only view their own orders
- Admins can view all orders
- Order status updates restricted to admins

#### Reviews Table
- Anyone can view reviews
- Only verified purchasers can create reviews
- Users can only edit/delete their own reviews

### Permission Guards

**Implementation:** `src/components/PermissionGuard.tsx`

Frontend route protection:
```typescript
<PermissionGuard requiredRole="admin">
  <AdminPanel />
</PermissionGuard>
```

Features:
- Automatic redirect on unauthorized access
- Loading state during permission check
- Toast notification for denied access
- Conditional rendering based on role

### API Permission Checks

**Implementation:** `supabase/functions/check-permissions/index.ts`

Backend permission verification:
- All Edge Functions verify user authentication
- Role checks before sensitive operations
- Resource ownership validation
- Audit logging for admin actions

---

## Input Validation & Sanitization

### Client-Side Validation

**Implementation:** `src/lib/inputSanitization.ts`

All user inputs are validated and sanitized:

#### HTML Sanitization
```typescript
sanitizeHtml(input) // Removes dangerous HTML tags
escapeHtml(input)   // Escapes special characters
removeScripts(input) // Removes script tags and event handlers
```

#### Email Validation
```typescript
sanitizeEmail(email) // Validates and normalizes email
```

#### URL Sanitization
```typescript
sanitizeUrl(url) // Prevents javascript:, data:, vbscript: protocols
```

#### Number Validation
```typescript
sanitizeNumber(input) // Ensures valid numeric input
```

### Form Validation

**Implementation:** React Hook Form + Zod schemas

All forms use Zod validation schemas:
- Type-safe validation
- Custom error messages
- Async validation support
- Field-level validation

Example schemas:
- `src/lib/validations/authSchema.ts` - Authentication forms
- `src/lib/validations/productSchema.ts` - Product forms
- `src/lib/validations/checkoutSchema.ts` - Checkout forms

### File Upload Validation

**Implementation:** `src/components/admin/ImageUpload.tsx`

- File type validation (jpg, png, webp only)
- File size limits (5MB for products, 2MB for avatars)
- Image dimension validation
- Malicious file detection
- Secure upload to Supabase Storage

---

## CSRF Protection

### Implementation

**Files:**
- `src/lib/csrfProtection.ts`
- `src/hooks/useCsrfProtection.ts`

### Features

1. **Token Generation**
   - Cryptographically secure random tokens
   - 32-byte tokens (256-bit security)
   - Stored in session storage

2. **Token Validation**
   - All state-changing requests include CSRF token
   - Token validated on backend
   - Token rotated on login/logout

3. **Protected Fetch Wrapper**
```typescript
protectedFetch(url, options) // Automatically includes CSRF token
```

4. **Form Protection**
```typescript
const { token, headers } = useCsrfProtection();
// Token automatically added to form submissions
```

### Usage in Forms

All forms automatically include CSRF protection:
- Checkout forms
- Profile update forms
- Product management forms
- Order management forms

---

## XSS Prevention

### Content Security Policy

**Implementation:** `netlify.toml`, `vercel.json`, `render.yaml`

Headers configured:
```
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

### Output Encoding

All user-generated content is encoded before display:
- Product names and descriptions
- User reviews and comments
- Profile information
- Order notes

### Dangerous HTML Removal

**Implementation:** `src/lib/inputSanitization.ts`

- Script tags removed
- Event handlers stripped
- Dangerous protocols blocked
- HTML entities escaped

### React's Built-in Protection

React automatically escapes values in JSX:
```typescript
<div>{userInput}</div> // Automatically escaped
```

Only use `dangerouslySetInnerHTML` when absolutely necessary and after sanitization.

---

## SQL Injection Prevention

### Parameterized Queries

All database queries use Supabase's query builder:
```typescript
// ✅ Safe - parameterized
supabase.from('products').select('*').eq('id', productId)

// ❌ Unsafe - never do this
supabase.rpc('raw_query', { query: `SELECT * FROM products WHERE id = ${productId}` })
```

### Input Sanitization

**Implementation:** `src/lib/inputSanitization.ts`

Additional SQL input sanitization:
- SQL keywords removed
- Special characters escaped
- Single quotes handled
- Backup protection (primary defense is parameterized queries)

### RLS Policies

Row Level Security provides additional protection:
- Queries automatically filtered by user context
- Cannot bypass with SQL injection
- Database-level enforcement

---

## Rate Limiting

### Implementation

**File:** `src/lib/rateLimiter.ts`

### Rate Limits

1. **Authentication Endpoints**
   - Login: 5 attempts per 15 minutes
   - Registration: 3 attempts per hour
   - Password reset: 3 attempts per hour

2. **API Endpoints**
   - General API: 100 requests per minute
   - Search: 30 requests per minute
   - File upload: 10 requests per hour

3. **Admin Actions**
   - Product creation: 20 per hour
   - Order updates: 100 per hour

### Features

- Per-user rate limiting
- Per-IP rate limiting
- Sliding window algorithm
- Automatic cleanup of old entries
- Custom limits per endpoint

### Usage

```typescript
import { apiRateLimiter } from '@/lib/rateLimiter';

if (!apiRateLimiter.isAllowed(userId)) {
  throw new Error('Rate limit exceeded');
}
```

---

## Session Management

### Implementation

**File:** `src/lib/sessionTimeout.ts`

### Features

1. **Automatic Timeout**
   - 30-minute inactivity timeout
   - Warning at 28 minutes
   - Automatic logout at 30 minutes

2. **Activity Tracking**
   - Mouse movements
   - Keyboard input
   - Click events
   - Touch events

3. **Session Refresh**
   - Automatic token refresh
   - Seamless re-authentication
   - No data loss on refresh

4. **Secure Storage**
   - Tokens stored in localStorage
   - HttpOnly cookies for sensitive data
   - Automatic cleanup on logout

### Configuration

```typescript
const sessionManager = new SessionTimeoutManager({
  timeoutMinutes: 30,
  warningMinutes: 28,
  onTimeout: () => signOut(),
  onWarning: () => showWarning(),
});
```

---

## Data Protection

### Encryption

1. **In Transit**
   - All connections use HTTPS/TLS 1.3
   - Certificate pinning ready
   - Secure WebSocket connections

2. **At Rest**
   - Passwords hashed with bcrypt
   - Sensitive data encrypted in database
   - Supabase handles encryption keys

### Sensitive Data Handling

1. **Payment Information**
   - Never stored in database
   - Handled entirely by Stripe
   - PCI DSS compliant

2. **Personal Information**
   - Minimal data collection
   - GDPR compliant
   - User can delete account and data

3. **File Storage**
   - Secure Supabase Storage
   - Public/private bucket separation
   - Signed URLs for private files

### Data Validation

All data validated before storage:
- Type checking
- Format validation
- Range validation
- Business logic validation

---

## Security Headers

### Implementation

Configured in:
- `netlify.toml`
- `vercel.json`
- `render.yaml`

### Headers Applied

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Cache Control

Static assets:
```
Cache-Control: public, max-age=31536000, immutable
```

HTML files:
```
Cache-Control: public, max-age=0, must-revalidate
```

---

## Security Best Practices

### Code Review Checklist

- [ ] All user inputs are validated
- [ ] All outputs are encoded
- [ ] Authentication is required for sensitive operations
- [ ] Authorization is checked for all resources
- [ ] CSRF tokens are included in forms
- [ ] Rate limiting is applied
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't include sensitive data
- [ ] Dependencies are up to date
- [ ] Security headers are configured

### Monitoring & Logging

1. **Authentication Events**
   - Login attempts (success/failure)
   - Password resets
   - Email verifications
   - Account lockouts

2. **Authorization Events**
   - Permission denied attempts
   - Role changes
   - Admin actions

3. **Security Events**
   - Rate limit violations
   - CSRF token failures
   - Suspicious activity patterns

### Incident Response

1. **Detection**
   - Monitor logs for anomalies
   - Set up alerts for security events
   - Regular security audits

2. **Response**
   - Isolate affected systems
   - Revoke compromised credentials
   - Notify affected users
   - Document incident

3. **Recovery**
   - Patch vulnerabilities
   - Restore from backups if needed
   - Update security measures
   - Post-mortem analysis

---

## Security Contacts

For security issues:
- **Email:** security@peptisync.com
- **Response Time:** 24 hours
- **Disclosure Policy:** Responsible disclosure

---

## Compliance

### GDPR Compliance

- ✅ User consent for data collection
- ✅ Right to access data
- ✅ Right to delete data
- ✅ Data portability
- ✅ Privacy policy
- ✅ Cookie consent

### PCI DSS Compliance

- ✅ No card data stored
- ✅ Stripe handles all payment processing
- ✅ Secure transmission (HTTPS)
- ✅ Regular security testing

---

## Regular Security Tasks

### Weekly
- [ ] Review authentication logs
- [ ] Check for failed login attempts
- [ ] Monitor rate limit violations

### Monthly
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Test backup restoration
- [ ] Security scan with tools

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review and update policies
- [ ] Team security training

---

**Last Updated:** 2025-10-11  
**Version:** 1.0  
**Status:** Production Ready

