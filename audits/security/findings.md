# Security Audit — Findings

## CRITICAL (5)

### C1. Secrets Committed to Git
- **File**: `.env`
- **Description**: `.env` with `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `ESEWA_SECRET_KEY`, `RESEND_API_KEY` was tracked by git.
- **Impact**: Anyone with repo access has full database admin, JWT signing, Google OAuth, eSewa merchant, and email API access.
- **Fix**: Add `.env` to `.gitignore`. Already covered by existing `*.env` pattern.

### C2. SSL/TLS Certificate Validation Disabled
- **File**: `src/lib/prisma.ts:18` — `ssl: { rejectUnauthorized: false }`
- **Description**: PostgreSQL connection disables SSL certificate verification.
- **Impact**: Man-in-the-middle attacks on database traffic.
- **Fix**: Conditional `rejectUnauthorized` based on `NODE_ENV` (already partially addressed in the codebase).

### C3. Privilege Escalation via Unvalidated Role on Registration
- **File**: `src/app/api/auth/register/route.ts`
- **Description**: Role field accepted from user input with no validation.
- **Impact**: Any user could register as ADMIN.
- **Fix**: ✅ Validate against allowlist `["USER", "TASKER"]`.

### C4. IDOR — Requests API Returns All Data
- **File**: `src/app/api/requests/route.ts`
- **Description**: When no role param, `where: {}` returned all requests including PII.
- **Impact**: Mass data leak of all user requests.
- **Fix**: ✅ Default to scoping to own userId.

### C5. Hardcoded eSewa Secret Key Fallback
- **File**: `src/lib/esewa.ts`
- **Description**: `|| "8gBm/:&EnhH.1/q"` fallback in source code (publicly known test key).
- **Impact**: Forged payment signatures if env var missing.
- **Fix**: ✅ Remove fallbacks, throw on missing env var.

## HIGH (7)

### H1. Open Redirect via callbackUrl
- **File**: `src/app/auth/signin/page.tsx`
- **Description**: Unvalidated callbackUrl allowed redirect to external sites.
- **Impact**: Phishing attacks post-authentication.
- **Fix**: ✅ Validate callbackUrl starts with "/".

### H2. Unrestricted File Upload
- **File**: `src/app/api/upload/route.ts`
- **Description**: No MIME type or size validation.
- **Impact**: Arbitrary file upload, potential XSS, storage abuse.
- **Fix**: ✅ Added MIME allowlist + 5MB limit.

### H3. No Check if Request is OPEN Before Bidding
- **File**: `src/app/api/bids/route.ts`
- **Description**: Taskers could bid on IN_PROGRESS, COMPLETED, CANCELLED requests.
- **Impact**: Invalid bids on non-open requests.
- **Fix**: ✅ Verify `request.status === "OPEN"`.

### H4. Client-Controlled Payment Amount
- **File**: `src/app/api/payments/initiate/route.ts`
- **Description**: Payment amount from client was used directly.
- **Impact**: Users could underpay.
- **Fix**: ✅ Look up bid amount from DB and verify.

### H5. No Authentication on Payment Failure Callback
- **File**: `src/app/api/payments/failure/route.ts`
- **Description**: No session check allowed anyone to mark transactions as FAILED.
- **Impact**: Arbitrary transaction status manipulation.
- **Fix**: ✅ Added session check + transaction ownership verification.

### H6. Missing Role Check for Bid Creation
- **File**: `src/app/api/bids/route.ts`
- **Description**: Any authenticated user could create bids (not just TASKERs).
- **Impact**: Regular users could bid, violating business logic.
- **Fix**: ✅ Added `session.user.role === "TASKER"` check.

### H7. Race Condition in Payment Success Handler
- **File**: `src/app/api/payments/success/route.ts`
- **Description**: TOCTOU between findFirst and update.
- **Impact**: Duplicate processing on concurrent callbacks.
- **Fix**: ✅ Use `updateMany` with status filter for atomic transition.

## MEDIUM (5)

### M1. In-Memory Rate Limiting (Serverless-Unsafe)
- **File**: `src/lib/rate-limit.ts`
- **Status**: ⏳ Pending — requires Upstash/Redis.

### M2. No Rate Limiting on Sensitive Endpoints
- **Files**: Multiple mutation endpoints
- **Status**: ⏳ Pending — requires external rate limit store.

### M3. CSRF Protection
- **Status**: 📋 Manual review — JWT strategy + Bearer header pattern mitigates CSRF.

### M4. Transaction Deduplication
- **File**: `src/app/api/payments/initiate/route.ts`
- **Fix**: ✅ Check for existing PENDING/COMPLETED transactions.

### M5. Client-Side Password Validation
- **File**: `src/app/auth/signup/page.tsx`
- **Fix**: ✅ Added password strength rules (8+ chars, uppercase, number).

## LOW (8)
- **L1**: ✅ Removed Resend API key fallback
- **L2**: ✅ Replaced randomBytes(3) with randomUUID()
- **L3**: ✅ Removed eSewa merchant code fallback
- **L4**: ⏳ Pending — rate limit cleanup
- **L5**: ✅ console.error replaced in 27 files
- **L6**: ⏳ Pending — email failure logging
- **L7**: ✅ Input sanitization on user PATCH
- **L8**: ✅ Nepali phone validation added
