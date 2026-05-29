# NepalSewa — Task List

**Legend:** ✅ Done | 🔄 In Progress | ⬜ Pending | ❌ Blocked

---

## Phase 1: Fix The Core Marketplace Loop

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Build payment integration (eSewa Epay v2) | ✅ | Initiate, success/failure callbacks, verify, Transacton model |
| 2 | Build bid acceptance API → create assignment | ✅ | `POST /api/bids/[bidId]/accept` |
| 3 | Build assignment status API (in-progress → complete) | ✅ | `PATCH /api/assignments/[assignmentId]` |
| 4 | Build review submission API | ✅ | `POST/GET /api/reviews` |
| 5 | Create missing dashboard pages | ✅ | 14 pages created |

## Phase 2: Communication & UX

| # | Task | Status | Notes |
|---|---|---|---|
| 6 | Build email notification system | ❌ | Requires Resend/SMTP account |
| 7 | Add search/filter API for requests | ✅ | Server-side search, ward, budget, urgency filters |
| 8 | Build file upload + image picker | ✅ | `POST /api/upload` + image picker in New Request form |
| 9 | Add middleware.ts for route protection | ✅ | Renamed to `proxy.ts` (Next.js 16) |
| 10 | Add error boundaries & loading skeletons | ✅ | `ErrorBoundary`, `DashboardErrorBoundary`, skeleton components |

## Phase 3: Security & Polish

| # | Task | Status | Notes |
|---|---|---|---|
| 11 | Add rate limiting | ✅ | In-memory rate limiter on register endpoint (5 req/min) |
| 12 | Password complexity requirements | ✅ | Min 8 chars, 1 uppercase, 1 number |
| 13 | Input sanitization | ✅ | Removes HTML special chars on register |
| 14 | Add Prisma seed file | ✅ | 8 categories, 33 services, admin user |
| 15 | Fix ₹ → NPR currency symbol | ✅ | Changed to "NPR" labels |
| 16 | Email verification | ⬜ | Not started |
| 17 | Terms & privacy pages | ✅ | Created |
| 18 | Write tests | ⬜ | Not started |

## Phase 4: Launch Prep

| # | Task | Status | Notes |
|---|---|---|---|
| 19 | Production database setup | ⬜ | Needs Neon/Supabase |
| 20 | Configure Google OAuth | ⬜ | Needs real Google credentials |
| 21 | Monitoring (Sentry) | ⬜ | |
| 22 | Deploy to Vercel | ⬜ | |
| 23 | Onboard real taskers | ⬜ | |
| 24 | Run first real transactions | ⬜ | eSewa test credentials ready in `.env` |

## Summary

| Category | Completed | Blocked |
|---|---|---|
| Core marketplace loop | 4/4 APIs (including payments) | — |
| Dashboard pages | 14/14 | — |
| Search & filtering | ✅ | — |
| File upload | ✅ | — |
| Auth & security | Rate limit + password + sanitize | Email verification |
| **Payment integration** | **eSewa Epay v2** | — |
| Route protection | ✅ | — |
| Error handling | ✅ | — |
| Seed data | ✅ | — |
| Brand polish | ✅ | — |
| Legal pages | ✅ | — |
| **Build status** | **43 routes, no errors** | |
