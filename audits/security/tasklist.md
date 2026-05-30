# Security Audit — Tasklist

- [x] **C1** — Remove `.env` from git tracking
- [x] **C3** — Validate role on registration (allowlist)
- [x] **C4** — Fix IDOR on requests GET (scope to own user)
- [x] **C5** — Remove hardcoded eSewa fallback keys
- [x] **H1** — Validate callbackUrl to prevent open redirect
- [x] **H2** — Add file upload type/size validation
- [x] **H3** — Check request is OPEN before bidding
- [x] **H4** — Use server-side amount for payments
- [x] **H5** — Add auth on payment failure callback
- [x] **H6** — Add role check (TASKER) for bid creation
- [x] **H7** — Fix race condition in payment success handler
- [x] **M4** — Add transaction deduplication in payment initiation
- [x] **M5** — Add client-side password strength validation
- [x] **L1** — Remove fallback Resend API key
- [x] **L2** — Use randomUUID() instead of randomBytes(3)
- [x] **L3** — Remove fallback eSewa merchant code
- [x] **L7** — Add input sanitization on user PATCH
- [x] **L8** — Add Nepali phone validation
- [ ] ⏳ **M1** — Move rate limiter to external store (Upstash)
- [ ] ⏳ **M2** — Add rate limiting to login/payment/bid endpoints
- [ ] 📋 **M3** — Document CSRF protection assumptions
- [ ] ⏳ **L4** — Add eviction for stale rate limit entries
- [ ] ⏳ **L6** — Add email notification failure logging

**Fixed: 18/23 | Manual Review: 1 | Pending: 4**
