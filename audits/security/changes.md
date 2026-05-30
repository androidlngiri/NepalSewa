# Security Audit — Changes

## Files Modified

| # | File | Change |
|---|------|--------|
| 1 | `src/app/api/auth/register/route.ts` | Added role allowlist validation (USER/TASKER only) |
| 2 | `src/app/api/requests/route.ts` | Default to own userId when no role param |
| 3 | `src/lib/esewa.ts` | Removed hardcoded fallback keys; throws on missing env vars |
| 4 | `src/app/auth/signin/page.tsx` | Validate callbackUrl starts with "/" |
| 5 | `src/app/api/upload/route.ts` | Added MIME allowlist + 5MB size limit |
| 6 | `src/app/api/bids/route.ts` | Check request.status === "OPEN"; check role === TASKER; verify user.isActive |
| 7 | `src/app/api/payments/initiate/route.ts` | Server-side amount lookup; dedup check for existing PENDING/COMPLETED |
| 8 | `src/app/api/payments/success/route.ts` | Atomic updateMany with status filter; verify total_amount matches |
| 9 | `src/app/api/payments/failure/route.ts` | Added session + ownership check |
| 10 | `src/lib/email.ts` | Removed fallback API key |
| 11 | `src/app/api/users/route.ts` | Input sanitization on name/bio |
| 12 | `src/app/auth/signup/page.tsx` | Client-side password validation + Nepali phone regex |
| 13 | `src/app/api/health/route.ts` | Created health check endpoint |
| 14 | `src/app/api/contact/route.ts` | Created contact form API |
| 15 | `src/app/api/stats/public/route.ts` | Added Cache-Control headers |

## Files Created
- `src/app/api/health/route.ts`
- `src/app/api/contact/route.ts`

## Files Deleted / Not Modified
- `.env` — Already in `.gitignore` via `*.env` pattern. No action needed.
- C2 (SSL) — Left as-is; should be made conditional on NODE_ENV in future.
