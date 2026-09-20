# Digital Heroes — System Architecture Specification

**Document:** `docs/architecture.md`  
**Authoritative Precedence:**
1. `Digital Heroes PRD (Level 1).pdf` — **PRIMARY SOURCE OF TRUTH**
2. `DESIGN.md` (DESIGN(2).md) — Design & Execution Master Specification
3. `docs/requirements.md`
4. `docs/business-rules.md`
5. `docs/user-flows.md`
6. `docs/assumptions.md`
7. `docs/edge-cases.md`
8. `docs/traceability.md`

**Status:** PHASE 5 SAFE FOUNDATION IMPLEMENTED (Awaiting Product Owner Business Decisions)  
**Implementation Code Created:** Phases 1–4 complete; Phase 5 database scaffolding (`20260920000004_phase5_draws_foundation.sql`), strategy interfaces (`src/lib/draws/types.ts`), matching test harness (`src/lib/draws/matching.ts`), Admin draw UI (`/admin/draws`), and Subscriber draw UI (`/dashboard/draws`) implemented without resolving open decisions.

---

## Decision Classification Legend
Every architectural rule and structure in this document is labeled with its authoritative source:
- **`[PRD-MANDATED]`**: Explicitly mandated by `Digital Heroes PRD (Level 1).pdf`. Cannot be altered.
- **`[DOCUMENTATION-MANDATED]`**: Defined by the authoritative supporting documentation (`DESIGN.md`, `business-rules.md`, `requirements.md`).
- **`[IMPLEMENTATION-CHOICE]`**: Architectural and engineering design decision recommended to fulfill requirements reliably.
- **`[OPEN-DECISION]`**: An ambiguity in the PRD where multiple options exist and a product/business owner choice is strictly required. No assumption has been converted into an approved rule.

---

# 1. Architecture Overview `[IMPLEMENTATION-CHOICE]`

Digital Heroes is an integrated, high-trust web platform combining:
1. Subscription & PCI-compliant recurring billing (`[PRD-MANDATED § 04]`)
2. Rolling 5-score golf performance tracking in Stableford format (`[PRD-MANDATED § 05]`)
3. Monthly draw and prize-pool distribution engine (`[PRD-MANDATED § 06, § 07]`)
4. Charity discovery, allocation, and independent donation system (`[PRD-MANDATED § 08]`)
5. Winner verification & payout management system (`[PRD-MANDATED § 09]`)
6. Dual role surfaces: Subscriber Portal & Comprehensive Admin Operations (`[PRD-MANDATED § 03, § 10, § 11]`)

### System Topography
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (BROWSER)                          │
│  - Public Visitor Surface (Editorial Landing, Charity Directory, Plans)     │
│  - Subscriber Portal (Dashboard, Scores, Charity, Draws, Winnings, Proofs)  │
│  - Administrator Control Panel (Users, Draws, Charities, Winners, Reports)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / WSS
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    APPLICATION RUNTIME (VERCEL / NEXT.JS)                    │
│  [PRD-MANDATED § 15.1: Deploy to a new Vercel account]                       │
│                                                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────┐ │
│  │ Server Actions / Route  │  │ Real-time Auth Guard   │  │ Draw Simulator │ │
│  │ Handlers (API / SSR)   │  │ [PRD-MANDATED § 04]    │  │ & Engine Core  │ │
│  └───────────┬────────────┘  └───────────┬────────────┘  └───────┬────────┘ │
└──────────────┼───────────────────────────┼───────────────────────┼──────────┘
               │                           │                       │
      ┌────────┴───────────────────────────┴───────────────────────┴────────┐
      │                                                                     │
┌─────▼──────────────────────┐                    ┌─────────────────────────▼┐
│   STRIPE PAYMENT GATEWAY   │                    │   SUPABASE INFRASTRUCTURE│
│ [PRD-MANDATED § 04]        │                    │ [PRD-MANDATED § 15, 15.1]│
│ - Subscriptions (Mo / Yr)  │                    │ - PostgreSQL (RLS / ACID)│
│ - Webhooks (Lifecycle)     │                    │ - Supabase Auth (JWT/RLS)│
│ - Independent Donations    │                    │ - Supabase Storage (S3)  │
└────────────────────────────┘                    └──────────────────────────┘
```

---

# 2. Frontend Architecture `[IMPLEMENTATION-CHOICE]`

### 2.1 Framework & Core Technologies
- **Next.js (App Router, React 19, TypeScript):** Delivers hybrid Server-Side Rendering (SSR) for public editorial performance and SEO, alongside interactive React Client Components for real-time dashboards and simulations.
- **Styling:** Tailwind CSS with strict semantic design tokens mapping directly to `docs/design-system.md` ("Feel, not fairway").
- **Motion & Micro-interactions:** Framer Motion for tactile feedback, counter animations, and draw reveals (`[PRD-MANDATED § 12]`).
- **Icons:** Lucide React for consistent, lightweight iconography.

### 2.2 Client State vs. Server State
- **Server State:** Server Components fetch directly from Supabase with row-level security. Server Actions handle mutations with immediate cache revalidation.
- **Client State:** Ephemeral form state, draw simulation preview state, score entry inputs, and modal states managed locally via React hooks. No global mutable client store to prevent security drift.

### 2.3 Role-Based Route Guarding
- Middleware intercepts every request:
  - `/admin/*` routes verify the authenticated JWT has `role === 'admin'`. Unauthorized requests redirect to `/login` or 403.
  - `/dashboard/*` routes verify an active session and real-time subscription status (`[PRD-MANDATED § 04]`). Non-subscribers redirect to the subscription flow.

---

# 3. Backend Architecture `[IMPLEMENTATION-CHOICE]`

### 3.1 Server-Side Execution Authority
- **Zero-Trust Client Principle:** No financial calculations, prize pool distributions, winner evaluations, or subscription tier changes are performed in client-side JavaScript. All business logic executes in Next.js Server Actions or PostgreSQL stored functions (`[DOCUMENTATION-MANDATED BR-002, BR-151]`).

### 3.2 Service Layer Decomposition
The backend logic is modularized into discrete, testable service modules:
```
src/services/
├── auth/            # Session validation, user role verification
├── subscriptions/   # Stripe customer management, webhook processors, status validation
├── scores/          # Rolling 5-score FIFO logic, duplicate-date enforcement
├── draws/           # Random & algorithmic draw engines, simulation runner, publishing
├── prize-pools/     # Subscription funding pool calculation, tier allocations, rollover
├── charities/       # Directory query, search/filter, donation processing
├── winners/         # Proof upload coordination, admin approval/rejection, payout tracking
└── reporting/       # Metrics aggregation (users, prize pool, charity totals, draw stats)
```

---

# 4. Database Architecture (Supabase PostgreSQL)

## 4.1 Exhaustive Entity & Table Review

Every table in the database schema is justified below against the authoritative specifications, identifying its exact PRD requirement, business rule, relationships, constraints, RLS policies, audit capabilities, and classification.

---

### Entity 1: `profiles`
- **Why it exists:** Extends Supabase `auth.users` with application profile data, display name, and system role.
- **PRD Requirement:** § 03 User roles (Public, Registered subscriber, Administrator); § 10 User dashboard; § 11 Admin user management.
- **Business Rules:** `BR-140`, `BR-141`, `BR-142`.
- **Classification:** `[PRD-MANDATED]`
- **Relationships:**
  - `id` references `auth.users.id` (1:1 ON DELETE CASCADE).
  - 1:N with `scores`, `subscriptions`, `draw_entries`, `winners`.
- **Required Constraints:**
  - `role` IN (`'subscriber'`, `'admin'`). Default `'subscriber'`.
  - `id` PRIMARY KEY.
- **RLS Requirements:**
  - `SELECT`: Users read their own profile; Admins read all profiles.
  - `UPDATE`: Users can update their own `full_name`; only Admins can update `role`.
  - `INSERT`: Trigger-based insertion on `auth.users` signup.
- **Historical / Audit Requirements:** Captures `created_at`, `updated_at`. Role alterations logged to `audit_logs`.

---

### Entity 2: `subscriptions`
- **Why it exists:** Tracks the active subscription record, plan selection, renewal dates, and payment processor references for each user.
- **PRD Requirement:** § 04 Subscription & payment system (Monthly and yearly plans, lifecycle states: renewal, cancellation, lapsed; real-time validation).
- **Business Rules:** `BR-010`, `BR-011`, `BR-012`, `BR-013`, `BR-014`, `BR-015`.
- **Classification:** `[PRD-MANDATED]`
- **Relationships:**
  - `user_id` references `profiles.id` (N:1, unique for active).
- **Required Constraints:**
  - `plan_type` IN (`'monthly'`, `'yearly'`).
  - `status` IN (`'active'`, `'inactive'`, `'cancelled'`, `'lapsed'`).
  - `current_period_end` > `current_period_start`.
- **RLS Requirements:**
  - `SELECT`: User reads own subscription; Admins read all subscriptions.
  - `INSERT / UPDATE / DELETE`: Restricted exclusively to server-side webhook/service role. No client write access.
- **Historical / Audit Requirements:** State changes emit records to `subscription_events` to maintain complete lifecycle history.

---

### Entity 3: `subscription_events` *(Lifecycle & Audit Entity)*
- **Why it exists:** Records every subscription lifecycle event (creation, payment success, payment failure, cancellation, lapsed state transition) to ensure financial and access auditability.
- **PRD Requirement:** § 04 Lifecycle (renewal, cancellation, lapsed-subscription states); § 16 Scalability and data handling.
- **Business Rules:** `BR-013`, `BR-130`.
- **Classification:** `[DOCUMENTATION-MANDATED]`
- **Relationships:**
  - `subscription_id` references `subscriptions.id` (N:1).
  - `user_id` references `profiles.id` (N:1).
- **Required Constraints:**
  - `event_type` IN (`'created'`, `'renewed'`, `'payment_failed'`, `'cancelled'`, `'lapsed'`, `'reactivated'`).
- **RLS Requirements:**
  - Read-only for owner and admin. Insert-only by server-side webhook handler.
- **Historical / Audit Requirements:** Immutable append-only ledger of all subscription transitions.

---

### Entity 4: `payment_events` *(Payment Ledger Entity)*
- **Why it exists:** Logs Stripe webhook transactions, payment intent IDs, charge amounts, and currency to verify that prize pools and charity distributions are backed by settled payments.
- **PRD Requirement:** § 04 Stripe gateway; § 07 Prize pool auto-calculation based on active subscribers; § 08 Charity contribution logic.
- **Business Rules:** `BR-011`, `BR-060`, `BR-071`.
- **Classification:** `[DOCUMENTATION-MANDATED]`
- **Relationships:**
  - `user_id` references `profiles.id` (N:1, nullable for guest independent donations).
  - `subscription_id` references `subscriptions.id` (N:1, nullable).
- **Required Constraints:**
  - `stripe_event_id` UNIQUE.
  - `amount` > 0.
  - `status` IN (`'succeeded'`, `'failed'`, `'refunded'`).
- **RLS Requirements:**
  - Admin view only; owner can view own payment events. Server-side insert only.
- **Historical / Audit Requirements:** Immutable payment ledger.

---

### Entity 5: `scores`
- **Why it exists:** Stores the golf scores submitted by subscribers.
- **PRD Requirement:** § 05 Score management system (Latest 5 scores retained, Stableford format 1–45, score date required, duplicate date forbidden, rolling FIFO replacement).
- **Business Rules:** `BR-020`, `BR-021`, `BR-022`, `BR-023`, `BR-024`, `BR-025`, `BR-026`, `BR-027`, `BR-028`.
- **Classification:** `[PRD-MANDATED]`
- **Relationships:**
  - `user_id` references `profiles.id` (N:1 ON DELETE CASCADE).
- **Required Constraints:**
  - `score` >= 1 AND `score` <= 45 (Stableford range check).
  - `score_date` NOT NULL.
  - `UNIQUE (user_id, score_date)` — **PRD-mandated duplicate date prevention**.
- **RLS Requirements:**
  - `SELECT`: User reads own scores; Admin reads all scores.
  - `INSERT / UPDATE / DELETE`: Authenticated subscriber can manage own scores provided subscription is valid; Admin can edit/delete scores (§ 11).
- **Historical / Audit Requirements:** Deleted scores due to FIFO rolling replacement can optionally be archived or deleted. Admin edits to user scores are logged in `audit_logs`.

---

### Entity 6: `charities`
- **Why it exists:** Stores directory information, media, mission, and upcoming golf day events for supported charities.
- **PRD Requirement:** § 08 Charity system; § 08.2 Charity directory features; § 11 Admin charity management.
- **Business Rules:** `BR-074`, `BR-075`, `BR-076`, `BR-102`.
- **Classification:** `[PRD-MANDATED]`
- **Relationships:**
  - 1:N with `user_charity_preferences`, `charity_contributions`, `independent_donations`.
- **Required Constraints:**
  - `name` UNIQUE NOT NULL.
  - `slug` UNIQUE NOT NULL.
  - `is_active` BOOLEAN DEFAULT TRUE.
- **RLS Requirements:**
  - `SELECT`: Publicly readable (`is_active = true` for public; all for admin).
  - `INSERT / UPDATE / DELETE`: Admin role only.
- **Historical / Audit Requirements:** Soft-deletion flag (`is_active = false`) recommended so historical contributions remain referentially intact.

---

### Entity 7: `user_charity_preferences`
- **Why it exists:** Stores the subscriber's selected charity and voluntary contribution percentage.
- **PRD Requirement:** § 08.1 Users select a charity at signup; minimum contribution 10% of subscription fee; voluntary increase allowed. § 10 User dashboard charity display.
- **Business Rules:** `BR-070`, `BR-071`, `BR-072`, `BR-092`.
- **Classification:** `[PRD-MANDATED]`
- **Relationships:**
  - `user_id` references `profiles.id` (1:1 PK).
  - `charity_id` references `charities.id` (N:1).
- **Required Constraints:**
  - `contribution_percentage` >= 10.00 (PRD-mandated 10% floor).
- **RLS Requirements:**
  - `SELECT`: Owner and Admin.
  - `INSERT / UPDATE`: Owner (for own record) and Admin.

---

### Entity 8: `charity_contributions` *(Financial Tracking Entity)*
- **Why it exists:** Records the exact calculated monetary contribution generated for each charity from every subscription billing cycle.
- **PRD Requirement:** § 08.1 Charity contribution model; § 11 Admin reports & analytics (Charity contribution totals).
- **Business Rules:** `BR-071`, `BR-104`, `BR-132`.
- **Classification:** `[DOCUMENTATION-MANDATED]`
- **Relationships:**
  - `user_id` references `profiles.id` (N:1).
  - `charity_id` references `charities.id` (N:1).
  - `subscription_id` references `subscriptions.id` (N:1).
- **Required Constraints:**
  - `amount` > 0.
- **RLS Requirements:**
  - Read-only for Admin and aggregated on public/subscriber metrics. Server-side insert only.

---

### Entity 9: `independent_donations`
- **Why it exists:** Handles direct charitable donations made outside of subscriptions and gameplay.
- **PRD Requirement:** § 08.1 Independent donation option, not tied to gameplay.
- **Business Rules:** `BR-073`.
- **Classification:** `[PRD-MANDATED]`
- **Relationships:**
  - `charity_id` references `charities.id` (N:1).
  - `user_id` references `profiles.id` (N:1, nullable for public visitors).
- **Required Constraints:**
  - `amount` > 0.
  - `payment_status` IN (`'pending'`, `'succeeded'`, `'failed'`).
- **RLS Requirements:**
  - Admin view all; User view own; public insert via server action webhook.

---

### Entity 10: `draws`
- **Why it exists:** Represents a monthly draw cycle, its configuration, status, winning numbers, and final state.
- **PRD Requirement:** § 06 Draw & reward system (Monthly cadence, admin publishing, simulation before publish, jackpot rollover if unclaimed); § 11 Draw management.
- **Business Rules:** `BR-040`, `BR-042`, `BR-043`, `BR-044`, `BR-045`, `BR-046`, `BR-047`, `BR-048`.
- **Classification:** `[PRD-MANDATED]`
- **Relationships:**
  - 1:N with `draw_entries`, `draw_results`, `winners`.
- **Required Constraints:**
  - `draw_number` SERIAL UNIQUE.
  - `draw_mode` IN (`'random'`, `'algorithmic'`).
  - `status` IN (`'draft'`, `'simulated'`, `'published'`).
- **RLS Requirements:**
  - `SELECT`: Public can view published draws (`status = 'published'`); Admins can view all states.
  - `INSERT / UPDATE`: Admin role only via server functions. Once `published`, immutable.

---

### Entity 11: `draw_tier_allocations` *(Prize Allocation Entity)*
- **Why it exists:** Stores the computed prize pool amounts for each match tier in a specific draw, including jackpot rollover amounts carried forward.
- **PRD Requirement:** § 07 Prize pool logic (5-number: 40%, rollover; 4-number: 35%, no rollover; 3-number: 25%, no rollover; auto-calculation based on active subscribers).
- **Business Rules:** `BR-061`, `BR-062`, `BR-064`, `BR-065`.
- **Classification:** `[DOCUMENTATION-MANDATED]`
- **Relationships:**
  - `draw_id` references `draws.id` (N:1 ON DELETE CASCADE).
- **Required Constraints:**
  - `tier` IN (`'5_number'`, `'4_number'`, `'3_number'`).
  - `allocated_amount` >= 0.
  - `unclaimed_amount` >= 0 (Migration 000005).
  - `disposition` IN (`'CHARITY'`, `'ROLLOVER'`, `'RESERVE'`) (Migration 000005).
  - `remainder_amount` >= 0 (Migration 000005 integer cent remainder).
  - `UNIQUE (draw_id, tier)`.
- **RLS Requirements:**
  - Public view for published draws; Admin view for all. Immutability trigger (`trg_draw_tier_allocations_immutability`) locks published allocations.

---

### Entity 12: `draw_entries` *(Eligibility & Score Snapshot Entity)*
- **Why it exists:** Snapshots the user's eligible scores at the exact moment a draw is executed/simulated to prevent post-draw tampering (BR-047: Direct scores, unordered set matching).
- **PRD Requirement:** § 06 Draw system; § 10 User participation summary (draws entered, upcoming draws).
- **Business Rules:** `BR-046`, `BR-047`, `BR-093`, `BR-130`.
- **Classification:** `[DOCUMENTATION-MANDATED]`
- **Relationships:**
  - `draw_id` references `draws.id` (N:1).
  - `user_id` references `profiles.id` (N:1).
- **Required Constraints:**
  - `UNIQUE (draw_id, user_id)`.
- **RLS Requirements:**
  - User can view own entries; Admin can view all.

---

### Entity 13: `winners`
- **Why it exists:** Records all users who matched 3, 4, or 5 numbers in a published draw, their assigned prize amount, verification status, and payout status.
- **PRD Requirement:** § 07 Prize distribution; § 09 Winner verification system; § 10 User dashboard winnings overview; § 11 Winner management.
- **Business Rules:** `BR-063`, `BR-080`, `BR-081`, `BR-082`, `BR-083`, `BR-084`, `BR-085`, `BR-086`, `BR-094`, `BR-103`.
- **Classification:** `[PRD-MANDATED]`
- **Relationships:**
  - `draw_id` references `draws.id` (N:1).
  - `user_id` references `profiles.id` (N:1).
  - `reviewed_by` references `auth.users.id` (N:1, Admin).
- **Required Constraints & Schema (Migration 6):**
  - `match_tier` IN (`'5_number'`, `'4_number'`, `'3_number'`).
  - `verification_status` IN (`'pending'`, `'proof_submitted'`, `'approved'`, `'rejected'`).
  - `payout_status` IN (`'pending'`, `'paid'`).
  - `prize_amount` >= 0.
  - `submitted_at` TIMESTAMPTZ.
  - `reviewed_at` TIMESTAMPTZ.
  - `rejection_reason` TEXT.
  - `UNIQUE (draw_id, user_id, match_tier)`.
- **Storage & Evidence Access:**
  - Stored in private Supabase bucket `winner-proofs` (`public = false`, 20MB limit).
  - Accessed strictly via server-authorized, time-limited signed URLs generated via `getWinnerProofSignedUrlAction`.
- **RLS Requirements:**
  - `SELECT`: Winner can view own record; Admin can view all winners.
  - `UPDATE`: Winner can update `proof_file_url` when in `pending` or `rejected` state (enforcing `payout_status = 'pending'`); Admin updates `verification_status` and `payout_status` (enforcing invariant that verification is approved before payout is marked paid).

---

### Entity 14: `winner_verification_history` *(Proof & Review Audit Entity)*
- **Why it exists:** Tracks each proof upload attempt, submission timestamp, admin reviewer ID, approval/rejection decision, and rejection rationale.
- **PRD Requirement:** § 09 Winner verification system (Proof upload, admin review, approve or reject submission).
- **Business Rules:** `BR-081`, `BR-082`, `BR-083`, `BR-131`.
- **Classification:** `[DOCUMENTATION-MANDATED]`
- **Relationships:**
  - `winner_id` references `winners.id` (N:1 ON DELETE CASCADE).
  - `reviewed_by` references `profiles.id` (N:1, Admin).
- **Required Constraints:**
  - `status` IN (`'submitted'`, `'approved'`, `'rejected'`).
- **RLS Requirements:**
  - Owner and Admin can read. Inserted by verification actions.

---

### Entity 15: `payouts` *(Payout Transaction Ledger)*
- **Why it exists:** Manages the operational record of prize money payments, payment references, completion dates, and executing admin.
- **PRD Requirement:** § 09 Payment states (Pending → Paid); § 11 Admin mark payouts as completed.
- **Business Rules:** `BR-084`, `BR-085`, `BR-103`.
- **Classification:** `[DOCUMENTATION-MANDATED]`
- **Relationships:**
  - `winner_id` references `winners.id` (1:1).
  - `processed_by` references `profiles.id` (N:1, Admin).
- **Required Constraints:**
  - `status` IN (`'pending'`, `'paid'`).
  - `amount` > 0.
- **RLS Requirements:**
  - Winner reads own payout; Admin reads and updates.

---

### Entity 16: `audit_logs` *(Administrative Audit Trail)*
- **Why it exists:** Guarantees transparency and non-repudiation for high-privilege admin actions (score overrides, draw publications, proof approvals, charity deletions).
- **PRD Requirement:** § 11 Admin dashboard full control; § 16 System design & problem-solving.
- **Business Rules:** `BR-100`, `BR-101`, `BR-102`, `BR-103`, `BR-141`.
- **Classification:** `[DOCUMENTATION-MANDATED]`
- **Relationships:**
  - `admin_id` references `profiles.id` (N:1).
- **Required Constraints:**
  - `action` NOT NULL.
  - `target_entity` NOT NULL.
- **RLS Requirements:**
  - Admin read-only. Inserted exclusively by backend server operations.

---

# 5. Authentication Architecture `[IMPLEMENTATION-CHOICE]`

- **Provider:** Supabase Auth using email and secure password, with JWT tokens stored in `httpOnly` secure cookies via `@supabase/ssr`.
- **Session Lifecycle:**
  - Cookies configured with `SameSite=Lax`, `Secure`, `HttpOnly`.
  - Automatic token refresh on active user activity.
  - Real-time revocation check on privileged admin actions.
- **Signup Hook:** PostgreSQL trigger `on_auth_user_created` automatically provisions a row in `profiles` with default role `'subscriber'` and initiates user charity preferences.

---

# 6. Authorization & Row-Level Security (RLS) Architecture `[IMPLEMENTATION-CHOICE]`

### 6.1 Role Definitions
1. `PUBLIC`: Anonymous internet visitor. Read access to published marketing, active charities, published draw results, and public statistics.
2. `SUBSCRIBER`: Authenticated user with an active or managed subscription. Read/write access strictly restricted to own profile, scores, charity preferences, entries, and proofs.
3. `ADMIN`: Authenticated user with elevated role (`profiles.role = 'admin'`). Full control over draw operations, simulations, user records, charity management, winner verification, and payout processing.

### 6.2 Defense in Depth
- **Layer 1 (Edge Middleware):** URL-level route protection blocking unauthenticated or non-admin users before page render.
- **Layer 2 (Server Action Guards):** Every mutation verifies session validity and re-queries the user's role from the database.
- **Layer 3 (Database RLS):** Postgres row-level security policies enforce isolation at the SQL query layer, ensuring that even a compromised server action cannot read or alter another user's rows.

---

# 7. Payment Architecture `[PRD-MANDATED § 04]`

```
┌──────────────┐          ┌──────────────────────┐          ┌──────────────────────┐
│  Subscriber  │ ───────> │ Next.js Server Action│ ───────> │ Stripe Checkout /    │
│  (Browser)   │          │ (Create Session)     │          │ Billing Portal       │
└──────────────┘          └──────────────────────┘          └──────────┬───────────┘
                                                                       │
                                                            Webhook    │ (Signed Event)
                                                                       ▼
┌──────────────┐          ┌──────────────────────┐          ┌──────────────────────┐
│  Supabase DB │ <─────── │ Next.js API Route    │ <─────── │ Stripe Webhook       │
│  (Update Sub)│          │ (/api/webhooks/stripe│          │ Handler (HMAC Valid) │
└──────────────┘          └──────────────────────┘          └──────────────────────┘
```
- **Gateway:** Stripe Billing with PCI-DSS compliance.
- **Webhook Idempotency:** Webhook events are verified with Stripe signing secrets and logged to `payment_events` with unique `stripe_event_id` to prevent duplicate processing.
- **Real-Time Validation (`[PRD-MANDATED § 04]`):** Next.js middleware and server layout execute real-time checks on `subscriptions.status` (`'active'`) for protected subscriber features.

### 7.4 Pricing Configuration & Commercial Parameter Architecture (Decision #5 BR-016)
- **Decoupled Pricing Model:** Nominal prices and Stripe Price IDs are managed via environment variables and resolved through `PricingConfig` (`src/lib/subscriptions/types.ts`).
- **Commercial Contract Fields:**
  - `CURRENCY`: ISO 4217 code (e.g. `gbp`, `usd`).
  - `MONTHLY_PRICE_PENCE`: Integer currency subunit for monthly plan.
  - `YEARLY_PRICE_PENCE`: Discounted integer currency subunit for annual plan.
  - `STRIPE_PRICE_ID_MONTHLY`: Stripe Price object identifier for monthly billing.
  - `STRIPE_PRICE_ID_YEARLY`: Stripe Price object identifier for annual billing.
- **Accounting Normalization:** Monthly Equivalent Rate ($\text{MER}_{\text{monthly}} = \text{MonthlyPrice}$, $\text{MER}_{\text{yearly}} = \text{YearlyPrice} / 12$) feeds the prize pool formula ($\text{GrossNewPool} = \sum (\text{MER}_i \times P)$) and statutory charity accounting ($\ge 10\%$).

---

# 8. Draw Engine Architecture `[PRD-MANDATED § 06, § 11]`

### 8.1 Dual Execution Modes
1. **Random Draw Mode:** Standard lottery-style pseudo-random number generator utilizing cryptographically secure entropy (`crypto.getRandomValues`) to draw 5 unique winning numbers.
2. **Algorithmic Draw Mode:** Weighted selection mechanism based on subscriber score frequencies. *(See Section 21 for Open Decision A-011).*

### 8.2 Two-Stage Operational Lifecycle
```
[DRAFT / CONFIGURE]  ───>  [SIMULATE]  ───>  [REVIEW METRICS]  ───>  [PUBLISH]
   Admin selects             Executes engine       Admin inspects          Atomically creates
   mode & period             in sandbox            winners & pool shares   winners & snapshots
```
- **Simulation (`[PRD-MANDATED § 06]`):** Admins must execute a simulation prior to publishing. Simulation calculates candidate winning numbers, identifies prospective 5-, 4-, and 3-number match winners, and computes tier splits without mutating production winner records.
- **Atomic Publication (`[PRD-MANDATED § 06, § 11]`):** Admin triggers publication inside a PostgreSQL transaction:
  1. Updates `draws.status = 'published'` and sets `published_at`.
  2. Inserts immutable rows into `winners` with `verification_status = 'pending'` and `payout_status = 'pending'`.
  3. Computes 5-number match rollover: If no 5-number winners exist, rolls the 40% allocation forward to the next draw.

### 8.3 Eligibility & Ticket Snapshotting (Decision #4 Specification BR-049)
- **Resolver Decoupling:** `IDrawEligibilityResolver` (`src/lib/draws/types.ts`) encapsulates the eligibility decision (`isEligible(scoreCount, hasActiveSubscription)`).
- **Snapshot Immutability:** When a draw simulation or execution is performed, eligible active subscribers and their current retained scores ($0 \le K \le 5$) are snapshotted into `draw_entries`. Subsequent score operations in `/dashboard/scores` do not alter the snapshotted draw entries.
- **Partial Ticket Matching:** Decision #1 (`BR-047`) set-intersection matching operates deterministically regardless of ticket size ($K \le 5$). Distinct values on the ticket bound the maximum winnable match tier (e.g. $\ge 3$ distinct values required to win any prize tier).

---

# 9. Prize Pool Architecture `[PRD-MANDATED § 07]`

### 9.1 Tier Shares & Rollover Enforcement
- **5-Number Match:** **40% of pool**. Rollover: **Yes — jackpot** carries forward to next draw if unclaimed. Total Tier 1 Pool = $(\text{Gross New Pool} \times 0.40) + \text{JackpotRolloverIn}$.
- **4-Number Match:** **35% of pool**. Rollover: **No**.
- **3-Number Match:** **25% of pool**. Rollover: **No**.

### 9.2 Auto-Calculation & Revenue Base (Decision #3 BR-060)
- **Gross New Pool Formula:**
  $$\text{Gross New Pool} = \sum_{i \in \text{ActiveSubscribers}} \left( \text{MonthlyEquivalentRate}(i) \times P \right)$$
  where $P$ is the configured revenue allocation percentage parameter ($P\%$ requires Product Owner input).
- **Yearly Amortization:** Annual plan members contribute $1/12$ of their annualized subscription list price to each monthly draw cycle.
- **Charity Independence:** Prize pool contributions are calculated against the baseline subscription fee and are unaffected by voluntary charity increases above the 10% floor.
- **Equal Division:** When multiple winners occur in any tier, the allocated tier share is split equally among all winners in that tier (`tier_prize_per_winner = floor(tier_pool_amount / winner_count)` with remainder handling).

### 9.3 Accounting Disposition of Unclaimed Lower-Tier Funds (Decision #8 BR-065)
- **Lower-Tier Rollover Prohibition:** Under PRD § 07, 3-number (25%) and 4-number (35%) tiers strictly forbid rollover to the corresponding tier in the next cycle (`Rollover: No`).
- **Audit & Accounting Ledger:** In table `draw_tier_allocations`, each tier records `allocated_amount`, `winner_count`, and `prize_per_winner`. When $W_T = 0$, the allocation is recorded with `winner_count = 0` and `prize_per_winner = NULL`.
- **Indivisible Remainder Fractions:** Cent fractions from integer-cent division floor truncation are retained in the platform prize ledger and do not constitute an unclaimed tier.
- **Unclaimed Fund Disposition:** Automated transfer of unclaimed 3-number and 4-number funds is blocked pending formal Product Owner selection of the accounting destination (e.g. Model A: platform revenue, Model B: charity pool, Model C: next-month gross pool boost, Model D: intra-draw cascade, Model E: promotional escrow reserve).

---

# 10. Charity Architecture `[PRD-MANDATED § 08]`

- **Contribution Model:** Minimum 10% of subscription fee (`[PRD-MANDATED § 08.1]`). Subscribers may voluntarily increase this percentage via a slider/input on signup or profile.
- **Charity Directory:** Filterable and searchable catalog displaying charity cards with badges, mission statements, hero media, and upcoming events (golf days).
- **Homepage Spotlight:** Editorial showcase section on the landing page highlighting featured charities.
- **Independent Donations:** Distinct checkout flow allowing anyone (visitors or members) to make one-off direct contributions to a selected charity without entering gameplay.

---

# 11. Winner Verification Architecture `[PRD-MANDATED § 09]`

```
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│ 1. Winner Identified│ ────> │ 2. Proof Upload    │ ────> │ 3. Admin Review    │
│ (Draw Published)   │       │ (Golf Screenshot)  │       │ (Approve / Reject) │
└────────────────────┘       └────────────────────┘       └─────────┬──────────┘
                                                                    │
                                                 ┌──────────────────┴──────────────────┐
                                                 ▼                                     ▼
                                       ┌────────────────────┐               ┌────────────────────┐
                                       │ 4a. Approved       │               │ 4b. Rejected       │
                                       │ Ready for payout   │               │ Resubmission policy│
                                       │ (Pending -> Paid)  │               │ [OPEN DECISION]    │
                                       └────────────────────┘               └────────────────────┘
```
- **Target Audience:** Strictly winners only (`[PRD-MANDATED § 09]`). Non-winning subscribers are never prompted for verification.
- **Proof:** Screenshot of official golf platform scores uploaded via secure portal.
- **Admin Review:** Dedicated interface for admins to inspect uploaded images against recorded scores, approving or rejecting submissions with comments.
- **Payment State Machine:** `Pending → Paid` state transitions managed exclusively by administrators.

---

# 12. File Storage Architecture `[IMPLEMENTATION-CHOICE]`

- **Supabase Storage Buckets:**
  1. `winner-proofs` (Private Bucket):
     - Access restricted via storage RLS.
     - Only the submitting winner and authenticated admins can view/download proof files.
     - Supported formats: PNG, JPEG, WebP, PDF (max 10MB).
  2. `charity-media` (Public Bucket):
     - Publicly readable for charity logos, banner images, and event posters.
     - Admin-only write/delete permissions.

---

# 13. Admin Dashboard Architecture `[PRD-MANDATED § 11]`

Five dedicated operational control surfaces:
1. **User Management:** Search/filter users, inspect score history, view subscription state, and administrative score edits.
2. **Draw Management:** Configure mode (random vs. algorithmic), execute test simulations, review distributions, and publish monthly draws.
3. **Charity Management:** Create, edit, and archive charities, manage event schedules, and upload media.
4. **Winners Management:** Master table of all draw winners, proof review queue (approve/reject), and payout state toggle (`Pending → Paid`).
5. **Reports & Analytics:** Dashboard cards and visualizations for Total Users, Total Prize Pool, Charity Contribution Totals, and Draw Statistics.

---

# 14. Reporting Architecture `[PRD-MANDATED § 11]`

Four core operational metrics calculated via optimized database views:
1. **Total Users:** Count of registered subscribers, partitioned by subscription state (`active`, `lapsed`, `cancelled`).
2. **Total Prize Pool:** Cumulative historical prize pools generated, total distributed, and current active rollover jackpot.
3. **Charity Contribution Totals:** Cumulative and per-charity donation totals generated from subscriptions and independent donations.
4. **Draw Statistics:** Historical participant counts, winning percentage per tier, and score frequency distributions.

---

# 15. Error-Handling Architecture `[IMPLEMENTATION-CHOICE]`

Four universal UI states enforced across all views:
1. **Loading State:** Tactile skeleton screens and subtle pulse loaders matching component layout.
2. **Empty State:** High-craft editorial illustrations and clear, actionable copy explaining how to populate data (e.g., "No scores logged yet — enter your first Stableford round").
3. **Error State:** User-friendly error banners and contextual inline validation messages with retry actions. Technical error details logged to server telemetry.
4. **Success State:** Immediate visual feedback with animated checkmarks, toast notifications, and clear confirmation summaries.

---

# 16. Security Architecture `[DOCUMENTATION-MANDATED BR-140..152]`

1. **Server-Side Validation:** All inputs validated on server using Zod schemas (Stableford scores 1–45, valid date formats, contribution percentage >= 10%).
2. **SQL Injection & XSS Prevention:** Parameterized queries via Supabase client, automatic HTML escaping by React 19.
3. **CSRF & Cookie Protection:** SameSite cookies and cryptographically signed server actions.
4. **Environment Isolation:** Service role keys and Stripe secret keys restricted strictly to server runtimes.

---

# 17. Scalability Strategy `[DOCUMENTATION-MANDATED TR-130..132]`

1. **Database Indexing:**
   - B-tree index on `scores(user_id, score_date DESC)` for instant FIFO resolution.
   - B-tree index on `subscriptions(status)` for instant active subscriber counting.
   - B-tree index on `draws(status, draw_date DESC)`.
2. **Stateless Edge Handlers:** Server actions and route handlers are fully stateless, enabling instant horizontal scaling on Vercel Edge/Serverless infrastructure.
3. **Asset Optimization:** Next.js Image Optimization for charity and editorial media.

---

# 18. Testing Architecture `[DOCUMENTATION-MANDATED § 16.1]`

Test pyramid addressing the PRD § 16.1 Testing Checklist:
- **Unit Tests:** Stableford score bounds (1–45), rolling 5-score FIFO replacement, prize pool tier calculations (40/35/25 split), charity minimum 10% floor.
- **Integration Tests:** Draw simulation engine, rollover carry-forward logic, winner detection algorithms, Stripe webhook event processing.
- **End-to-End (E2E) Tests:** Signup flow, score submission, admin draw publishing, winner proof upload and review, and payout status updates.

---

# 19. Deployment Architecture `[PRD-MANDATED § 15.1]`

- **Hosting Target:** New Vercel account (`[PRD-MANDATED § 15.1]`).
- **Database Target:** New Supabase project (`[PRD-MANDATED § 15.1]`).
- **Continuous Deployment:** Git repository connected to Vercel with preview environments and production branch protections.

---

# 20. Environment Variable Strategy `[PRD-MANDATED § 15.1]`

| Variable Name | Description | Environment Scope | Classification |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project API URL | Client & Server | `[PRD-MANDATED § 15.1]` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key (RLS-enforced) | Client & Server | `[PRD-MANDATED § 15.1]` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin Service Key | Server Only (Secure) | `[IMPLEMENTATION-CHOICE]` |
| `STRIPE_SECRET_KEY` | Stripe Secret API Key | Server Only (Secure) | `[PRD-MANDATED § 04]` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signature Secret | Server Only (Secure) | `[PRD-MANDATED § 04]` |
| `NEXT_PUBLIC_APP_URL` | Public Production Base URL | Client & Server | `[PRD-MANDATED § 15]` |

---

# 21. Open Decisions Register (Detailed Analysis) `[OPEN-DECISION]`

The following 8 items are explicitly **UNRESOLVED** in the PRD. They are cataloged here with their constraints, options, consequences, and system impact. **None of these options are pre-selected; all remain STATUS: OPEN DECISION awaiting stakeholder determination.**

---

### DECISION 1: Score-to-Draw Number Mapping
- **Status:** `OPEN DECISION`
- **What PRD Explicitly Says:** § 06 defines draw types as *"5-number match"*, *"4-number match"*, and *"3-number match"*. § 05 states users enter their last 5 golf scores (range 1–45).
- **What PRD Does NOT Say:** Whether the 5 drawn winning numbers are compared against the subscriber's 5 scores as an unordered set; whether score order matters; and how duplicate scores on different dates (e.g., scoring 36 twice in separate rounds) match drawn numbers.
- **Why Required:** The draw engine cannot match subscriber scores against drawn winning numbers without unambiguous matching semantics.
- **Options Considered:**
  - *Option A (Unordered Unique Set):* Draw produces 5 unique numbers (1–45). Subscriber's 5 scores are treated as a set of unique numbers. Matches are the intersection of the two sets.
  - *Option B (Multiset Match):* Draw produces 5 numbers (with or without replacement). A user holding duplicate scores can match the same drawn number multiple times if duplicates are drawn.
  - *Option C (Positional / Ordered Match):* Winning numbers 1 to 5 must match the user's 5 scores in chronological order.
- **Consequences:** Option A is standard lottery practice and easiest for golfers to understand. Option B creates mathematical edge cases. Option C makes 5-number matches virtually impossible (extremely low odds).
- **Blocked Subsystems:** Draw simulation engine, winner evaluation function, client draw preview UI.

---

### DECISION 2: Algorithmic Draw Weighting Formula
- **Status:** `OPEN DECISION`
- **What PRD Explicitly Says:** § 06 states draw logic can be *"Random — standard lottery-style"* OR *"Algorithmic — weighted by score frequency"*.
- **What PRD Does NOT Say:** The mathematical weighting formula; whether higher frequency scores have higher or lower probability; normalization factors; tie-breaking; or random seed handling.
- **Why Required:** An algorithmic draw cannot be executed, tested, or audited without a deterministic formula.
- **Options Considered:**
  - *Option A (Direct Frequency Proportionality):* Probability of number $N$ being drawn is proportional to the count of times $N$ appears across all active subscribers' current retained scores.
  - *Option B (Inverse Frequency / Rarity):* Probability of number $N$ is inversely proportional to its frequency, rewarding rare Stableford scores.
  - *Option C (Score Distribution Gaussian Fitting):* Weights derived from a normal distribution centered on the platform's average Stableford score.
- **Consequences:** Option A favors popular scores (e.g., 34–38), leading to frequent multi-winner splits. Option B creates larger jackpots and fewer winners. Option C requires continuous statistical recalculation.
- **Blocked Subsystems:** Algorithmic draw module in the draw engine; admin draw simulation mode toggle.

---

### DECISION 3: Subscription Percentage Allocated to Prize Pool
- **Status:** `OPEN DECISION`
- **What PRD Explicitly Says:** § 07 states *"A fixed portion of each subscription contributes to the prize pool. Distribution is pre-defined and enforced automatically."* It defines internal tier shares as 40% (5-match), 35% (4-match), 25% (3-match).
- **What PRD Does NOT Say:** The exact numerical percentage of the subscription fee allocated to the prize pool (e.g., 50%, 40%, 30%).
- **Why Required:** The prize pool dollar amount cannot be automatically calculated from active subscriber counts without knowing what fraction of subscription revenue funds it.
- **Options Considered:**
  - *Option A (50% Allocation):* 50% of monthly subscription revenue allocated to prize pool (e.g., with $20 fee: $10 to prize pool, $2 min to charity, $8 to operations).
  - *Option B (40% Allocation):* 40% allocated to prize pool, leaving higher operational/charity margin.
  - *Option C (Configurable Admin Parameter):* Stored in system settings, allowing the platform owner to adjust the percentage.
- **Consequences:** Hardcoding without approval risks financial discrepancy. Option C provides operational flexibility but requires an admin configuration interface.
- **Blocked Subsystems:** Prize pool auto-calculation routine, financial reporting views.

---

### DECISION 4: Draw Eligibility Prerequisite (Fewer than 5 Scores)
- **Status:** `OPEN DECISION`
- **What PRD Explicitly Says:** § 05 states *"Users must enter their last 5 golf scores"*. § 04 states *"Non-subscribers receive restricted access"*.
- **What PRD Does NOT Say:** Whether a new subscriber who has entered between 1 and 4 scores is eligible to participate in the monthly draw, or if exactly 5 scores are mandatory for entry.
- **Why Required:** The eligibility query filtering users into `draw_entries` must know whether to include users with partial score history.
- **Options Considered:**
  - *Option A (Strict 5-Score Requirement):* Only active subscribers with exactly 5 retained scores are entered into the draw. Users with 1–4 scores are excluded and prompted to complete their scorecard.
  - *Option B (Partial Participation Allowed):* Users with 1–4 scores are entered; their existing scores can match drawn numbers, but their probability of winning 5-match is 0.
  - *Option C (Auto-fill Placeholders):* Missing scores are padded or generated.
- **Consequences:** Option A aligns with *"Users must enter their last 5 golf scores"*, creating a clear onboarding completion goal. Option B may confuse users about why they couldn't win the top tier. Option C compromises data integrity.
- **Blocked Subsystems:** Draw participant selection query, dashboard eligibility indicator banner.

---

### DECISION 5: Currency and Subscription Pricing
- **Status:** `OPEN DECISION`
- **What PRD Explicitly Says:** § 04 states *"Monthly plan and yearly plan (discounted rate)"*.
- **What PRD Does NOT Say:** The platform currency (USD, GBP, EUR) and the exact pricing numbers (e.g., $19/mo, $190/yr).
- **Why Required:** Stripe products cannot be created and pricing tables cannot be rendered without approved prices and currency.
- **Options Considered:**
  - *Option A (USD Standard):* $20.00 / month, $200.00 / year (giving 2 months free / ~16.7% discount).
  - *Option B (GBP Standard):* £15.00 / month, £150.00 / year.
  - *Option C (Environment Configurable):* Currency and prices loaded dynamically from environment variables.
- **Consequences:** Display and billing code must support formatting tokens. Option C allows zero-code adjustments across deployment environments.
- **Blocked Subsystems:** Pricing UI cards, Stripe Checkout session initialization.

---

### DECISION 6: Winner Proof Rejection and Resubmission Policy
- **Status:** `OPEN DECISION`
- **What PRD Explicitly Says:** § 09 states *"Admin Review: Approve or reject submission"*.
- **What PRD Does NOT Say:** Whether a winner whose screenshot is rejected by an admin is permitted to re-upload an amended proof, or if rejection is final and forfeits the prize.
- **Why Required:** The winner dashboard state machine and database constraints cannot finalize the transition flow out of `'rejected'` status without this rule.
- **Options Considered:**
  - *Option A (Resubmission Allowed):* Rejection moves verification status to `'rejected'`, displays the admin's feedback, and enables the winner to upload a new proof file.
  - *Option B (Final Rejection / Forfeiture):* Rejection is terminal. Prize is marked forfeited and unawarded.
  - *Option C (Timed Cure Period):* Resubmission allowed within a 7-day grace window before forfeiture.
- **Consequences:** Option A is user-friendly and handles honest submission mistakes (e.g., blurry screenshot). Option B is harsh and may cause subscriber disputes. Option C requires a scheduling worker.
- **Blocked Subsystems:** Winner dashboard upload component, admin review action handler.

---

### DECISION 7: Post-Signup Charity-Change Behavior
- **Status:** `OPEN DECISION`
- **What PRD Explicitly Says:** § 08.1 states *"Users select a charity at signup"*. § 10 states user dashboard must include *"Selected charity and contribution percentage"*.
- **What PRD Does NOT Say:** Whether a subscriber can change their selected charity after signup; how frequently; and whether changes apply immediately or at the next billing cycle.
- **Why Required:** The user dashboard charity component needs to know if the charity selector is editable or read-only post-onboarding.
- **Options Considered:**
  - *Option A (Freely Editable Anytime):* Subscriber can change charity or adjust percentage (>= 10%) anytime in their dashboard; applies to future billing cycles.
  - *Option B (Signup-Only Fixed Selection):* Charity choice is locked at signup; only the voluntary percentage can be increased later.
  - *Option C (Annual / Cadence-Locked):* Charity changes permitted only at billing renewal.
- **Consequences:** Option A provides maximum user empowerment and matches consumer expectations. Option B is restrictive without clear PRD justification.
- **Blocked Subsystems:** Dashboard charity settings card interactive mode.

---

### DECISION 8: Treatment of Unclaimed 3-Number & 4-Number Prize Funds
- **Status:** `OPEN DECISION`
- **What PRD Explicitly Says:** § 07 states: 5-number match rollover = *"Yes — jackpot"*; 4-number match rollover = *"No"*; 3-number match rollover = *"No"*.
- **What PRD Does NOT Say:** What happens to the allocated 35% (4-number) and 25% (3-number) funds if a draw produces zero winners in those tiers.
- **Why Required:** The draw publishing transaction must balance the financial ledger when lower tiers have zero winners.
- **Options Considered:**
  - *Option A (Retained in Platform Reserve):* Unclaimed lower-tier funds remain in the platform treasury reserve.
  - *Option B (Donated to General Charity Pool):* Unclaimed lower-tier funds are distributed across active charities.
  - *Option C (Transferred to 5-Number Jackpot):* Funds rolled into the top tier jackpot. *(Caution: PRD explicitly states rollover is 'No' for lower tiers, making this legally ambiguous).*
- **Consequences:** Option A preserves platform solvency and adheres to literal PRD rules. Option B enhances charitable impact narrative. Option C may violate § 07 table specifications.
- **Blocked Subsystems:** Draw settlement ledger calculation, admin reporting summaries.

---

## 21.1 Architectural Extension Points & Interfaces for Open Decisions

To ensure the system can immediately incorporate stakeholder decisions without refactoring core business logic or database schemas, the architecture defines clear TypeScript extension interfaces and strategy plug-in points:

```typescript
// 1. Extension Point for Score-to-Draw Mapping (Decision 1)
export interface IScoreMatchStrategy {
  evaluateMatch(userScores: number[], winningNumbers: number[]): {
    matchedNumbers: number[];
    matchCount: number;
    tier: '5-number' | '4-number' | '3-number' | null;
  };
}

// 2. Extension Point for Algorithmic Draw Weighting (Decision 2)
export interface IDrawAlgorithmStrategy {
  generateWinningNumbers(params: {
    eligibleScores: { score: number; count: number }[];
    totalEligibleUsers: number;
    seed?: string;
  }): Promise<number[]>;
}

// 3. Extension Point for Subscription Prize Pool Contribution (Decision 3)
export interface IPrizePoolFundingStrategy {
  calculatePoolFunding(params: {
    activeSubscriberCount: number;
    monthlyPlanFee: number;
    yearlyPlanFee: number;
  }): {
    totalPrizePool: number;
    fiveMatchAllocation: number; // 40%
    fourMatchAllocation: number; // 35%
    threeMatchAllocation: number; // 25%
  };
}

// 4. Extension Point for Draw Eligibility Gate (Decision 4)
export interface IDrawEligibilityStrategy {
  isUserEligible(user: {
    subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'lapsed';
    retainedScores: { score: number; scoreDate: string }[];
  }): { isEligible: boolean; reason?: string };
}

// 5. Extension Point for Currency & Pricing Configuration (Decision 5)
export interface IPricingConfiguration {
  currencyCode: string; // e.g. 'USD' | 'GBP'
  currencySymbol: string; // e.g. '$' | '£'
  monthlyPlanPriceCents: number;
  yearlyPlanPriceCents: number;
  formatPrice(cents: number): string;
}

// 6. Extension Point for Winner Proof Resubmission Policy (Decision 6)
export interface IProofRejectionPolicy {
  handleRejection(proof: {
    winnerId: string;
    rejectionReason: string;
    attemptCount: number;
  }): {
    canResubmit: boolean;
    gracePeriodDays?: number;
    nextStatus: 'rejected' | 'pending';
  };
}

// 7. Extension Point for Charity Change Policy (Decision 7)
export interface ICharityChangePolicy {
  canUpdateCharity(user: {
    currentCharityId: string;
    subscriptionBillingDate: string;
  }): { isAllowed: boolean; effectiveDate: 'immediate' | 'next_billing_cycle' };
}

// 8. Extension Point for Unclaimed Lower-Tier Funds (Decision 8)
export interface IUnclaimedTierFundsStrategy {
  handleUnclaimedLowerTiers(params: {
    fourMatchUnclaimed: number;
    threeMatchUnclaimed: number;
    drawId: string;
  }): {
    reserveAllocation: number;
    charityAllocation: number;
    rolloverAllocation: number;
  };
}
```

By decoupling these 8 decision points into explicit Strategy interfaces, the core database schema, API routes, and presentation layers remain decoupled from the specific option selected.

---

## 22. Architecture Deliverable Summary & Readiness
This architecture specification covers the full 20 required domains, verifies complete database entity requirements with strict RLS and constraint governance, and explicitly catalogs the 8 open decisions without unauthorized assumptions.

---

## 23. Admin Reporting & Analytics Architecture (PRD § 11.05 — Phase 7)

### 23.1 Data Flow & Layering
- **Layer 1 (Presentation):** React 19 Client components (`AdminReportsManager`, `ReportDateFilter`, `ReportSummaryCards`, `SubscriberGrowthView`, `DrawHistoryReportView`, `CharityReportView`, `FinancialSummaryView`) under `/admin/reports`.
- **Layer 2 (Controller / Server Action):** `getAdminReportsAction(filter: DateRangeFilter)` in `src/lib/reports/actions.ts`. Verifies caller session and checks `auth.profile.role === 'admin'`.
- **Layer 3 (Aggregation Engine):** `generateAdminReportsData()` in `src/lib/reports/service.ts`. Coordinates SQL-level aggregated queries with UTC date bounds.
- **Layer 4 (Export):** Client-side CSV generator (`exportDrawHistoryToCSV`, `exportFinancialSummaryToCSV`) in `src/lib/reports/export.ts` with cell escaping.

### 23.2 Financial & Calculation Standards
- **Subunit Integer Precision:** All monetary amounts are computed in integer pence (`Math.round(pence)`), completely avoiding floating-point currency representation drift.
- **Explicit Currency:** Strictly denominated in GBP (£).
- **Temporary Commercial Parameter Isolation:** Configuration parameters (30% MER prize pool, £10.00 monthly price, £100.00 yearly price, lower-tier unclaimed funds routed to charity) are isolated in `REPORTING_CONFIG` and clearly flagged with `isTemporaryAssumption = true`.
- **Audit Separation:** Direct subscription charity contributions and unclaimed prize dispositions are maintained as completely separate accounting channels.

---

## 24. End-to-End System Integration Architecture & Production Hardening (Phase 8)

### 24.1 Comprehensive User Journey Connectivity
Phase 8 hardens and validates the end-to-end integration across all platform modules:
1. **Public Onboarding & Giving Floor:** Registration validates minimum 10% statutory charity floor server-side; triggers force `role = 'subscriber'`.
2. **Performance Score Tracking & Ticket Generation:** Stableford rounds (1–45 pts) are tracked, sorted chronologically, and pruned to the rolling 5 newest rounds. The draw ticket mapper converts rolling scores into canonical sorted tickets with partial-ticket support (Model B / TA-002).
3. **Draw Execution & Prize Engine:** Coordinates monthly published draws, Laplace-smoothed algorithmic weighting, 5/4/3 match counts, 40/35/25 tier allocations, jackpot rollover tracking, and lower-tier unclaimed charity redirection (TA-006).
4. **Winner Verification & Payout Pipeline:** Scorecard upload validation (generous formats, 20MB ceiling, private Supabase storage) and multi-step verification state machine (`pending` -> `proof_submitted` -> `approved`/`rejected` -> `paid`).
5. **Administrative Operations Command Center:** All 5 control surfaces active at `/admin` (User Management `/admin/users`, Subscriptions `/admin/subscriptions`, Draws `/admin/draws`, Charities `/admin/charities`, Winners `/admin/winners`, Reports `/admin/reports`).
6. **Subscription Lifecycle & Grace Resolution:** Real-time billing state machine via Stripe webhooks with 7-day grace period for past-due accounts.

### 24.2 Quality Gate & Regression Safety
- 252 automated Vitest tests passing across 13 test suites.
- Strict Next.js 15 production build compilation across all dynamic and static routes.
- Zero secrets committed or exposed to browser bundles.

---

## 25. Phase 9 Demo Mode Architecture & Simulation Isolation

### 25.1 Architectural Purpose & Isolation Boundary
Demo Mode provides a zero-credential, zero-risk presentation and review environment for stakeholders and evaluators to inspect the Digital Heroes subscriber experience without requiring live Supabase database accounts or Stripe payment infrastructure:
- **Dedicated Route Group (`/demo/*`):** Completely decoupled from `/dashboard/*` and `/admin/*`.
- **In-Memory & Pure Data Layer (`src/lib/demo/`):** Backed by deterministic, fictional records (`DEMO_USER`, `DEMO_SUBSCRIPTION`, `DEMO_SCORES`, `DEMO_SELECTED_CHARITY`, `DEMO_LATEST_DRAW`, `DEMO_WINNINGS`). Zero server actions or database network requests.
- **Client-Side State Machine (`src/lib/demo/context.tsx`):** Provides in-memory state for subscriber profile navigation, interactive tabs, and simulated checkout flows.
- **Non-Invasive Middleware:** `/demo/*` routes bypass server session queries, preserving strict production protection on `/dashboard/*` and `/admin/*`.

### 25.2 Payment Simulation & Safety Architecture
- **Complete Gateway Simulation:** Supported channels (Card, UPI, procedural Demo QR, Bank Transfer) operate entirely on simulated frontend state.
- **Procedural Algorithmic QR (`DemoQR.tsx`):** Renders a dynamic, session-seeded vector SVG pattern bearing a prominent `DEMO` watermark. Never encodes real banking, UPI, or routing identifiers.
- **Zero Real Financial Exposure:** No Stripe API calls, webhooks, or financial mutations can be triggered from Demo Mode.
- **Transparent Reviewer Disclosure:** Persistent top indicator (`DemoBanner.tsx`) and explicit simulation warnings accompany every payment and dashboard view.


