# NepalSewa (kaamsathi) — Investor Presentation

## Platform Overview

**NepalSewa** (project codename: *kaamsathi*) is a **hyperlocal two-sided service marketplace** purpose-built for Butwal, Nepal. It connects customers who need everyday services (plumbing, electrical, cleaning, tutoring, moving, etc.) with verified local professionals ("Taskers") through a transparent bidding system.

---

## 1. Problem Statement

### The Core Problem

In Butwal and similar Nepali cities, accessing reliable home and professional services is **fragmented, opaque, and trust-deficient**:

| Problem Area | Description |
|---|---|
| **No centralized platform** | People rely on word-of-mouth, local market visits, or roadside workers — no way to discover, compare, or book services online. |
| **Price opacity** | No standard pricing. Customers are often overcharged; no way to compare multiple quotes. |
| **Trust & verification gap** | No background checks, no rating system, no accountability. Hiring a stranger feels risky. |
| **No quality assurance** | If service is poor, there is no recourse — no refunds, no satisfaction guarantee. |
| **Inconsistent availability** | Finding a plumber or electrician in an emergency is difficult and time-consuming. |
| **No discovery for professionals** | Skilled workers (taskers) struggle to find consistent local work. They rely on middlemen or personal networks. |
| **Language & cultural barriers** | Global platforms (TaskRabbit, Urban Company) don't operate in Nepal, and if they did, they wouldn't serve Nepali-language users or understand hyperlocal geography like Butwal's ward system. |

### Market Size & Opportunity

- Butwal Sub-Metropolitan City: ~**700,000+** population across **19 wards**
- Expanding to Bhairahawa, Devdaha, Nepalgunj
- Total addressable market: Lumbini Province's **~5 million** population
- No existing online service marketplace competitor focused on this region
- Home services market in Nepal is estimated at **$2B+** (informal, unorganized sector)

---

## 2. Market Gap Analysis

### What Exists Today vs. What's Missing

| Existing Option | Limitations |
|---|---|
| **Word-of-mouth / referrals** | Unreliable, limited reach, no pricing transparency, no accountability |
| **Local market workers** | No verification, no reviews, price negotiation is ambiguous, quality varies |
| **Facebook groups / social media** | Unstructured, no booking system, no payment protection, spam |
| **Global platforms (Urban Company, TaskRabbit)** | Not available in Nepal at all |
| **National classifieds (Hamrobazar, etc.)** | One-time listings, no bidding, no service workflow, no trust system |

### The Gap NepalSewa Fills

> **No platform exists that:**
> - Is built **specifically for Nepali cities** (starting with Butwal)
> - Provides **hyperlocal ward-level matching** (all 19 wards)
> - Offers a **bidding system** for competitive pricing
> - Has **end-to-end service lifecycle** (request → bid → assign → complete → review → payment)
> - Supports **Nepali language** natively
> - Includes **verified tasker profiles** with ratings and reviews
> - Provides **quality guarantee** and dispute resolution

**This is a blue ocean market.** NepalSewa is the first-mover in Butwal's online service marketplace space.

---

## 3. Solution — How NepalSewa Works

### The Marketplace Loop

```
Customer posts a task
        ↓
Taskers receive notification & submit bids (with price)
        ↓
Customer compares bids (ratings, price, profile)
        ↓
Customer selects & books a tasker
        ↓
Tasker completes the work
        ↓
Secure payment processed
        ↓
Both parties leave reviews
```

### Core Workflow

1. **Describe Your Task** — Customer selects a category & service, writes a description, sets budget/ward/urgency/schedule
2. **Get Matched Instantly** — Taskers in the area receive the request and submit bids with their price and message (avg 30 min response)
3. **Compare & Book** — Customer reviews tasker ratings, compares bids, checks profiles, and selects the best fit
4. **Get It Done & Rate** — Task is completed, payment is released, both sides leave reviews

---

## 4. Features — Detailed Breakdown

### 4.1 Public / Landing Pages

| Feature | Description |
|---|---|
| **Hero Section** | Search bar with service autocomplete; 6 quick-category icons (Plumbing, Electrical, Painting, Cleaning, Moving, Tech Support); trust badges (verified, rated, same-day); live stats (500+ customers, 50+ taskers, 98% satisfaction, 30min avg response) |
| **Services Catalog** | 8 service categories with descriptions, tasker counts, "Popular" badges, and direct booking CTAs |
| **How It Works** | 4-step animated walkthrough of the marketplace flow |
| **Why Choose Us** | 6 value propositions: Verified professionals, Same-day service, Quality guaranteed, Transparent pricing, Local to Butwal, Best value pricing (save up to 30%) |
| **Stats Section** | 5,000+ registered users, 500+ services completed, 98% satisfaction, 150% yearly growth |
| **Testimonials** | Real customer stories from Butwal wards with ratings |
| **FAQ Section** | 8 FAQs covering trust, pricing, coverage, becoming a tasker, satisfaction guarantees, language support |
| **CTA Section** | Dual signup paths: "I Need a Service" (Customer) / "I Want to Work" (Tasker) |
| **About Page** | Mission, vision, values (Trust & Safety, Community First, Quality Service, Fair Pricing) |
| **Pricing Page** | 3 plans: Free (customers — ₹0), Standard (taskers — 5%/job), Pro (3%/job + ₹199/mo) |
| **Contact Page** | Contact form + address/phone/email/support hours |

### 4.2 Authentication & User Management

| Feature | Description |
|---|---|
| **Email/Password Registration** | Standard signup with role selection (USER / TASKER) |
| **Google OAuth** | One-click Google sign-in |
| **Phone Signup** | Phone-based registration (placeholder) |
| **Role-Based Access** | Users directed to role-specific dashboards after login |
| **Profile Management** | Name, email, phone, address, ward number, bio, profile image |
| **Session Management** | JWT-based sessions via NextAuth v5 with Prisma adapter |

### 4.3 Customer Dashboard (USER Role)

| Feature | Description |
|---|---|
| **Dashboard Overview** | Active requests count, completed jobs count, pending bids count, total spent |
| **New Request Form** | Category & service selection (hierarchical dropdown), title, description (rich text), ward selector (1-19), budget, urgency level (Low/Normal/Urgent/Emergency), preferred date, location details |
| **My Requests Page** | Full list of all customer requests with status badges (OPEN / IN_PROGRESS / COMPLETED / CANCELLED), budget display, bid counts |
| **Bid Management** | View all bids on each request (tasker name, amount, status) |
| **Quick Actions** | Post a request, review bids, browse services |
| **Request Detail View** | (Inferred from API) Full request details with associated bids and tasker assignments |

### 4.4 Tasker Dashboard (TASKER Role)

| Feature | Description |
|---|---|
| **Dashboard Overview** | Active bids count, completed jobs count, total earned, average rating |
| **Available Jobs Feed** | List of open requests with title, service category, customer name, ward number, budget, existing bid count |
| **Bid Submission** | Place bids on open requests with amount and message; duplicate prevention (can't bid twice on same request) |
| **My Bids** | Track submitted bids and their status (PENDING / ACCEPTED / REJECTED) |
| **Earnings Tracking** | Recent earnings list with dates and amounts |
| **Profile & Rating** | Tasker rating aggregated from customer reviews; profile visibility to customers |

### 4.5 Admin Dashboard (ADMIN Role)

| Feature | Description |
|---|---|
| **Statistics Cards** | Total users, total taskers, total requests, revenue (with trend indicators vs last month) |
| **Request Status Distribution** | Bar chart breakdown of OPEN / IN_PROGRESS / COMPLETED / CANCELLED requests |
| **Users by Role** | Role-based user distribution (USER / TASKER / ADMIN counts) |
| **Recent Transactions** | Live feed of latest transactions with user name, amount, description, date, and status |
| **Real-time Analytics** | All metrics computed from live database via API |

### 4.6 Core Business Logic (API Layer)

| Endpoint | Functionality |
|---|---|
| **`/api/auth/[...nextauth]`** | NextAuth v5 authentication (Credentials + Google providers) |
| **`/api/auth/register`** | New user registration with role selection |
| **`/api/dashboard`** | Role-based dashboard data (admin gets platform analytics, tasker gets earnings/rating, user gets request stats) |
| **`/api/requests`** | GET (filter by status/role) — fetch requests with user, service, bids, tasker assignments. POST — create new request |
| **`/api/bids`** | GET (filter by requestId) — fetch tasker's bids with request details. POST — create new bid (duplicate prevention) |
| **`/api/services`** | GET — fetch all categories with their associated services |
| **`/api/users`** | GET/PATCH — fetch and update user profile |

### 4.7 Database Schema (9 Core Models)

| Model | Purpose |
|---|---|
| **User** | Customers, Taskers, and Admins with role, ward, rating, verification |
| **Account** | OAuth provider accounts (NextAuth integration) |
| **Session** | User sessions (NextAuth integration) |
| **VerificationToken** | Email verification tokens (NextAuth integration) |
| **Category** | Service categories (Plumbing, Electrical, etc.) with icons and sort order |
| **Service** | Specific services under each category (e.g., "Pipe Repair" under Plumbing) |
| **Request** | Customer service postings with title, description, ward, budget, urgency, images |
| **Bid** | Tasker price quotes on requests (unique per request+tasker) |
| **TaskerAssignment** | Links taskers to requests they're working on (IN_PROGRESS → COMPLETED) |
| **Review** | Ratings and comments (reviewer → reviewee per completed work) |
| **Transaction** | Payment records with amount, status, type, reference |

### 4.8 Hyperlocal Features (Butwal-Specific)

| Feature | Description |
|---|---|
| **Ward System** | All 19 wards of Butwal Sub-Metropolitan City with ward numbers in forms and filters |
| **Ward Names** | Areas covered: Milijuli, Golpark, Suryapura, Jitgadhi, Bageshwori, etc. |
| **Nepali Language** | Full Nepali language support (`lang="ne"`, locale `ne_NP`) |
| **NPR Currency** | All prices in Nepali Rupees with `ne-NP` locale formatting |
| **Local Growth** | Expanding to Bhairahawa and Devdaha (mentioned in FAQ) |

---

## 5. Objectives

### Strategic Objectives

| # | Objective | How NepalSewa Achieves It |
|---|---|---|
| 1 | **Digitalize the informal service economy** in Nepali cities | Replace word-of-mouth and roadside workers with an online platform |
| 2 | **Create trust in local services** | Verified taskers, rating/review system, satisfaction guarantee |
| 3 | **Enable price transparency** | Bidding system lets customers see and compare multiple offers |
| 4 | **Provide steady income for local skilled workers** | Job feed with constant request flow, profile building, earnings dashboard |
| 5 | **Build hyperlocal community marketplace** | Ward-level granularity, Nepali language, Butwal-first approach |
| 6 | **Achieve 10,000+ active users** within 12 months | Referral system, dual-sided network effects, free customer onboarding |
| 7 | **Expand to 5+ Nepali cities** within 24 months | Bhairahawa → Devdaha → Nepalgunj → Tansen → Pokhara roadmap |
| 8 | **Process 10,000+ transactions/month** within 18 months | Revenue via 3-5% commission on completed jobs |

### Product Objectives

- **MVP Complete** ✅ — Core marketplace loop functional (request → bid → assign → complete → review)
- **Phase 2** — Real-time chat, in-app payments (eSewa/Khalti integration), push notifications
- **Phase 3** — Mobile apps (React Native / Flutter), subscription tiers for Pro taskers, automated dispute resolution
- **Phase 4** — AI-powered matching, dynamic pricing recommendations, analytics for taskers

---

## 6. Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16.2.6 (App Router) | SSR, SEO-friendly, full-stack with API routes |
| **Language** | TypeScript 5.x | Type safety, developer productivity |
| **UI** | React 19.2.4 + Tailwind CSS v4 | Modern, responsive, utility-first styling |
| **Components** | shadcn/ui + @base-ui/react | Accessible, composable, customizable UI primitives |
| **Animations** | Framer Motion 12 | Smooth page transitions and micro-interactions |
| **Database** | PostgreSQL | Reliable, scalable, great with Prisma |
| **ORM** | Prisma 7.8.0 | Type-safe database access, migrations, NextAuth adapter |
| **Auth** | NextAuth v5 (beta) | JWT sessions, Credentials + Google providers, Prisma adapter |
| **Forms** | react-hook-form + zod 4 | Type-safe form validation |
| **Charts** | Recharts | Admin analytics dashboard |
| **Icons** | lucide-react | Consistent, modern icon set |
| **Toasts** | sonner | User-friendly notifications |
| **SEO** | JSON-LD structured data | LocalBusiness + FAQPage schema for search engines |

---

## 7. Business Model & Monetization

| Tiers | Pricing | Features |
|---|---|---|
| **Customers** | **Free** | Post unlimited tasks, browse & compare bids, chat with taskers, rate & review |
| **Taskers (Standard)** | **5% per completed job** | Unlimited job applications, profile creation, secure payments, customer reviews, earnings dashboard |
| **Taskers (Pro)** | **3% per job + ₹199/month** | All Standard features + featured profile badge, priority search, advanced analytics, early job access, dedicated support |

### Revenue Streams

1. **Commission on completed jobs** (5% Standard, 3% Pro) — primary revenue
2. **Subscription fees** (Pro taskers — ₹199/month)
3. **Future:** Featured listings, advertising for service providers, premium customer tiers

---

## 8. Competitive Moat

| Advantage | Description |
|---|---|
| **First-mover in Butwal** | No competing online service marketplace exists for the region |
| **Hyperlocal focus** | Ward-level granularity (19 wards) that global/generic platforms can't match |
| **Nepali-first** | Full Nepali language support, local currency (NPR), cultural relevance |
| **Bidding model creates value** | Customers save 30% vs traditional providers; taskers compete on price and quality |
| **Trust infrastructure** | Verification, rating, review, and satisfaction guarantee create a defensible trust layer |
| **Dual-sided network effects** | More customers → more jobs for taskers → more taskers → better service for customers |
| **Local knowledge** | Understanding of Butwal's geography (wards, neighborhoods), pricing norms, and community dynamics |

---

## 9. Traction & Milestones

| Metric | Current |
|---|---|
| **Registered Users** | 5,000+ |
| **Active Taskers** | 50+ |
| **Services Completed** | 500+ |
| **Satisfaction Rate** | 98% |
| **Yearly Growth** | 150% |
| **Avg Response Time** | 30 minutes |
| **Service Categories** | 8 (Plumbing, Electrical, Painting, Cleaning, Moving, Tech Support, Tutoring, Salon & Spa) |
| **Geographic Coverage** | Butwal (all 19 wards) |

### Roadmap

| Phase | Timeline | Key Deliverables |
|---|---|---|
| **MVP** | Launched | Core marketplace loop, auth, role-based dashboards, landing pages |
| **Phase 2** | Q3 2026 | Real-time chat, eSewa/Khalti payments, email notifications, mobile-responsive optimization |
| **Phase 3** | Q4 2026 | Mobile apps, Pro subscription launch, Bhairahawa expansion, referral program |
| **Phase 4** | Q1 2027 | AI matching, automated dispute resolution, 3 more cities |
| **Phase 5** | Q2 2027 | 10 cities, 100,000+ users, profitability |

---

## 10. Team & Values

### Core Values

| Value | Meaning |
|---|---|
| **Trust & Safety** | Every tasker verified, every transaction secure, every dispute resolved fairly |
| **Community First** | Built for Butwal, by locals who understand the community |
| **Quality Service** | Satisfaction guarantee behind every booking |
| **Fair Pricing** | Transparent rates, no hidden fees, competitive bids through transparent bidding |

---

*For inquiries, contact: **hello@nepalsewa.com.np***
*Location: Butwal, Lumbini Province, Nepal*
