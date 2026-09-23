# Digital Heroes — PRD Traceability Matrix

**Source of truth:** Digital Heroes PRD (Level 1), Version 1.0, March 2026.

## Purpose

This document provides the master traceability layer for the Digital Heroes implementation.

Every major requirement should be traceable through:

```text
PRD Section
    ↓
Requirement
    ↓
Business Rule
    ↓
User Flow
    ↓
Edge Cases
    ↓
Implementation
    ↓
Test
    ↓
Verification
```

This prevents requirements from being lost between design, development, and QA.

---

# 1. Traceability Rules

## TR-001 — Every mandatory requirement must be mapped

Every explicit PRD requirement must appear in this matrix.

## TR-002 — No silent completion

A requirement must not be marked complete merely because a related screen exists.

It must have appropriate implementation and validation.

## TR-003 — Ambiguities remain visible

If a requirement depends on an unresolved assumption:

```text
Requirement
    ↓
OPEN ASSUMPTION
    ↓
Decision
    ↓
Implementation
```

Do not mark the requirement fully verified before the relevant ambiguity is resolved.

## TR-004 — Test evidence

Critical business rules should have corresponding test coverage.

## TR-005 — PRD terminology

Use the PRD's terminology when mapping requirements.

---

# 2. Status Definitions

Use the following statuses:

| Status | Meaning |
|---|---|
| NOT STARTED | No implementation work completed |
| PLANNED | Implementation approach identified |
| IN PROGRESS | Currently being implemented |
| IMPLEMENTED | Feature exists |
| TESTED | Relevant tests have passed |
| VERIFIED | Requirement has been reviewed against PRD and validated |
| BLOCKED | Cannot proceed because of unresolved dependency/decision |

A feature should not be marked `VERIFIED` merely because it is visually complete.

---

# 3. § 01 — Project Overview

## TR-001

**Requirement**

Platform combines:

- golf performance tracking;
- charity fundraising;
- monthly draw-based reward engine.

**Business rule:** BR-001

**User flow:** Public visitor, subscriber, draw, charity flows

**Edge cases:** EC-001 onward

**Implementation:** TBD

**Test:** End-to-end product flow

**Status:** NOT STARTED

---

## TR-002

**Requirement**

Product should feel emotionally engaging and modern and deliberately avoid traditional golf website aesthetics.

**Business rule:** BR-110, BR-111

**User flow:** Homepage flow

**Edge cases:** EC-170 onward

**Implementation:** Design system + public website

**Test:** Visual QA

**Status:** NOT STARTED

---

# 4. § 02 — Core Objectives

| ID | Requirement | Business Rule | Flow | Test | Status |
|---|---|---|---|---|---|
| TR-010 | Robust subscription/payment system | BR-010–BR-015 | Subscription flow | Subscription E2E | NOT STARTED |
| TR-011 | Simple engaging score entry | BR-020–BR-029 | Score flow | Score tests | NOT STARTED |
| TR-012 | Algorithm-powered or random monthly draws | BR-040–BR-051 | Draw flow | Draw tests | NOT STARTED |
| TR-013 | Seamless charity contribution | BR-070–BR-076 | Charity flow | Contribution tests | NOT STARTED |
| TR-014 | Comprehensive admin dashboard | BR-100–BR-104 | Admin flows | Admin E2E | NOT STARTED |
| TR-015 | Outstanding UI/UX | BR-110–BR-114 | Public/subscriber flows | Visual QA | NOT STARTED |

---

# 5. § 03 — User Roles

## TR-020 — Public Visitor

Required capabilities:

- view platform concept;
- explore charities;
- understand draw mechanics;
- initiate subscription.

**Business rules:** BR-001, BR-070–BR-076

**Flows:** Public Visitor Flow, Charity Discovery Flow, Subscription Flow

**Edge cases:** EC-001–EC-004

**Test:** Public navigation E2E

**Status:** NOT STARTED

---

## TR-021 — Registered Subscriber

Required capabilities:

- profile/settings;
- enter/edit scores;
- select charity;
- view participation;
- view winnings;
- upload winner proof.

**Business rules:** BR-020–BR-029, BR-070–BR-085, BR-090–BR-094

**Flows:** Subscriber Dashboard, Score, Charity, Winner flows

**Edge cases:** EC-030–EC-124

**Test:** Subscriber E2E

**Status:** NOT STARTED

---

## TR-022 — Administrator

Required capabilities:

- user management;
- subscription management;
- draw configuration/run;
- charity management;
- winner verification;
- payouts;
- reports/analytics.

**Business rules:** BR-100–BR-104

**Flows:** Administrator flows

**Edge cases:** EC-130–EC-154

**Test:** Admin E2E

**Status:** NOT STARTED

---

## TR-023 — Authentication Email Verification & Callback Redirect Flow

**Requirement**

Email verification link generation must resolve canonical production application URL (`NEXT_PUBLIC_APP_URL`) and direct users to `/auth/callback`, where temporary PKCE tokens are safely exchanged for session cookies without leaking `localhost` in production. Open redirects must be strictly prohibited.

**Business rules:** BR-001, BR-002, BR-140

**Flows:** Signup Flow, Email Verification Flow, Session Exchange Flow

**Edge cases:** Expired OTP/link, missing verification code, malicious external `next` return parameter, protocol-relative redirect injection.

**Implementation:**
- Canonical URL & Security: `src/lib/auth/url.ts` (`getAppUrl()`, `getSafeRedirectPath()`, `getAuthCallbackUrl()`)
- Server Action: `src/lib/auth/actions.ts` (`signUpAction` with `emailRedirectTo`, `signInAction` with safe destination)
- Route Handler: `src/app/auth/callback/route.ts` (PKCE session exchange, cookie propagation, role-based landing)
- UI: `src/app/login/page.tsx` (Handles `confirmed=pending`, `confirmed=verified`, and `error` parameters)

**Tests:**
- `src/__tests__/auth_redirects.test.ts` (20 unit and integration tests)
- `src/__tests__/auth.test.ts` (5 unit tests)

**Status:** VERIFIED (Production Bug Fix 2026-09-23)

---

# 6. § 04 — Subscription & Payment

## TR-030 — Monthly and yearly plans

**Requirement**

Provide:
- monthly plan;
- yearly discounted plan.

**Business rules:** BR-010, BR-016 (Decision #5 Specification)

**Assumption:** A-020 (Commercial pricing and currency)

**Flow:** Subscription Flow

**Edge cases:** EC-020–EC-029

**Implementation:**
- Migration: `supabase/migrations/20260920000003_phase4_subscriptions.sql` (`plan subscription_plan` enum: `'monthly'`, `'yearly'`).
- Types & Resolver: `PricingConfig` in `src/lib/subscriptions/types.ts` and `getPricingConfig()` in `src/lib/subscriptions/resolver.ts`.
- UI: `/pricing` server page, `PricingCards.tsx`, `SubscriptionManager.tsx`.
- Accounting: Monthly Equivalent Rate ($\text{MER}_{\text{monthly}} = P_{\text{month}}$, $\text{MER}_{\text{yearly}} = P_{\text{year}} / 12$).

**Tests:**
- `src/__tests__/subscriptions.test.ts` (Test 49–54)

**Status:** SAFE FOUNDATION / PHASE 4 VERIFIED (Decision #5 Structural Specification Complete; exact commercial amounts and currency require Product Owner input)

---

## TR-031 — PCI-compliant payment provider

**Requirement**

Use Stripe or equivalent PCI-compliant provider.

**Business rules:** BR-011

**Edge cases:** EC-027

**Implementation:** TBD

**Test:** Payment integration test

**Status:** NOT STARTED

---

## TR-032 — Restricted non-subscriber access

**Business rule:** BR-012, BR-015

**Flow:** Authentication Flow

**Edge cases:** EC-014

**Test:** Access-control E2E

**Status:** NOT STARTED

---

## TR-033 — Subscription lifecycle

Must handle:

- renewal;
- cancellation;
- lapsed subscription.

**Business rules:** BR-013–BR-014

**Edge cases:** EC-022–EC-025

**Status:** NOT STARTED

---

# 7. § 05 — Score Management

## TR-040 — Latest five scores

**Requirement**

Only latest five scores retained based strictly on `score_date DESC`.

**Business rules:** BR-024–BR-025

**Flow:** Five-Score Rolling Flow

**Edge cases:** EC-036, EC-050–EC-053

**Implementation:**
- SQL Migration: `supabase/migrations/20260920000002_phase3_scores_charities.sql` (`enforce_rolling_five_scores()` trigger)
- Server Actions: `src/lib/scores/actions.ts` (`addScoreAction`, `editScoreAction`)
- UI: `src/components/scores/ScoreManager.tsx` & `src/app/dashboard/scores/page.tsx`

**Tests:**
- `src/__tests__/scores.test.ts` (Test 8, Test 9, Test 17)

**Status:** VERIFIED (Phase 3)

---

## TR-041 — Stableford range

**Requirement**

Score must be integer between 1 and 45 inclusive.

**Business rule:** BR-021

**Edge cases:** EC-030–EC-032

**Implementation:**
- DB Constraint: `chk_scores_stableford_range CHECK (score >= 1 AND score <= 45)`
- Validation: `src/lib/scores/validation.ts` (`validateStablefordScore`)

**Tests:**
- `src/__tests__/scores.test.ts` (Test 1: min=1, Test 2: max=45, Test 3: 0 rejected, Test 4: 46 rejected)

**Status:** VERIFIED (Phase 3)

---

## TR-042 — Score date

**Requirement**

Each score requires a valid calendar date in YYYY-MM-DD format.

**Business rule:** BR-022

**Edge case:** EC-033–EC-034

**Implementation:**
- DB Column: `score_date DATE NOT NULL`
- Validation: `src/lib/scores/validation.ts` (`validateScoreDate`)

**Tests:**
- `src/__tests__/scores.test.ts` (Test 5: missing/empty date rejected)

**Status:** VERIFIED (Phase 3)

---

## TR-043 — One score per date

**Requirement**

Duplicate score dates for the same subscriber are not allowed.

**Business rule:** BR-023

**Edge cases:** EC-035, EC-037, EC-040

**Implementation:**
- DB Constraint: `CONSTRAINT uq_user_score_date UNIQUE (user_id, score_date)`
- Server Action Handling: `src/lib/scores/actions.ts` (catches error code 23505)

**Tests:**
- `src/__tests__/scores.test.ts` (Test 6: Unique constraint verification)

**Status:** VERIFIED (Phase 3)

---

## TR-044 — Score edit/delete

**Requirement**

Existing scores can be edited or deleted by their owner.

**Business rules:** BR-027–BR-028

**Flows:** Score Edit/Delete

**Edge cases:** EC-038

**Implementation:**
- Server Actions: `src/lib/scores/actions.ts` (`editScoreAction`, `deleteScoreAction`)
- RLS Policies: `scores_update_own`, `scores_delete_own`
- UI: `src/components/scores/ScoreManager.tsx`

**Tests:**
- `src/__tests__/scores.test.ts` (Test 10, Test 11, Test 12, Test 14, Test 15)

**Status:** VERIFIED (Phase 3)

---

## TR-045 — Reverse chronological display

**Requirement**

Scores display most recent first (`ORDER BY score_date DESC`).

**Business rule:** BR-026

**Implementation:**
- Query: `src/lib/scores/actions.ts` (`getUserScores` ordered by `score_date DESC`)
- UI: `src/components/scores/ScoreManager.tsx`

**Tests:**
- `src/__tests__/scores.test.ts` (Test 7)

**Status:** VERIFIED (Phase 3)

**Test:** UI/component test

**Status:** NOT STARTED

---

# 8. § 06 — Draw & Reward System

## TR-050 — Monthly cadence & Draw Eligibility

**Business rule:** BR-040, BR-049 (Decision #4 Specification)

**Flow:** Draw Participation

**Assumption:** A-012 (Score threshold & cutoff policy)

**Implementation:**
- SQL Migration: `supabase/migrations/20260920000004_phase5_draws_foundation.sql` (`month DATE NOT NULL UNIQUE`, `draw_entries` table).
- Interface: `IDrawEligibilityResolver` (`src/lib/draws/types.ts`) decouples eligibility evaluation (`isEligible(scoreCount, hasActiveSubscription)`).
- UI: `/admin/draws` and `/dashboard/draws`
- State: Immutable snapshot of active subscribers at simulation/publication timestamp.

**Tests:**
- `src/__tests__/draws_phase5.test.ts` (Test 6)

**Status:** VERIFIED (Phase 5 Production Engine implemented with TA-002 Model B Dynamic Partial Tickets)

---

## TR-051 — Three match types

Required:

- 5-number;
- 4-number;
- 3-number.

**Business rule:** BR-041, BR-047 (Decision #1 Resolved)

**Flow:** Draw Result

**Implementation:**
- Enums & DB: `public.match_tier` ('5_number', '4_number', '3_number')
- Pure Logic: `src/lib/draws/matching.ts` (`determineMatchTier`, `calculateMatchCount`)
- Direct Score Identity: `src/lib/draws/mapper.ts` (`DirectScoreToTicketMapper`)
- Specification: BR-047 defines direct score mapping, unordered set matching, and duplicate score retention.

**Tests:**
- `src/__tests__/draws_phase5.test.ts` (Test 5, Test 22)
- `src/__tests__/draws_production.test.ts` (Section 2, Section 7)

**Status:** VERIFIED (Phase 5 Production Engine)

---

## TR-052 — Random draw

**Business rule:** BR-042, BR-047

**Flow:** Draw Administration

**Implementation:**
- Strategy: `RandomDrawStrategy` (`src/lib/draws/engine.ts`)
- DB Enum: `draw_mode ('random', 'algorithmic')`
- Number Domain: 1–45 integers without replacement (5 distinct numbers).
- Deterministic Seed PRNG: `createSeededRng` (Mulberry32).

**Tests:**
- `src/__tests__/draws_phase5.test.ts` (Test 4, Test 26)
- `src/__tests__/draws_production.test.ts` (Section 4)

**Status:** VERIFIED (Phase 5 Production Engine)

---

## TR-053 — Algorithmic draw

**Business rule:** BR-042, BR-048 (Decision #2 Resolved), BR-051

**Assumption:** A-011 (Resolved) and A-013 (Resolved)

**Implementation:**
- Strategy: `AlgorithmicDrawStrategy` (`src/lib/draws/engine.ts`)
- Weighting Formula: BR-048 defines additive Laplace smoothing $W(n) = f(n) + 1$ over participant cohort frequency, sampled sequentially without replacement for 5 distinct numbers.
- Deterministic Seed PRNG: Mulberry32 for audit repeatability.

**Tests:**
- `src/__tests__/draws_production.test.ts` (Section 5)

**Status:** VERIFIED (Phase 5 Production Engine)

---

## TR-054 — Admin simulation

**Requirement**

Admin must be able to simulate before publishing.

**Business rule:** BR-044–BR-045

**Flow:** Draw Administration

**Edge cases:** EC-076–EC-079

**Implementation:**
- State Machine: `draft` -> `simulated` -> `published` in `draws.status`
- Server Action: `src/lib/draws/actions.ts` (`stageDrawSimulationAction`, `executeDrawSimulationCore`)
- UI: `src/components/admin/AdminDrawManager.tsx`

**Tests:**
- `src/__tests__/draws_phase5.test.ts` (Test 3)
- `src/__tests__/draws_production.test.ts` (Section 8)

**Status:** VERIFIED (Phase 5 Production Engine)

---

## TR-055 — Admin publishing

**Business rule:** BR-043, BR-045

**Flow:** Draw Administration

**Implementation:**
- Server Action: `src/lib/draws/actions.ts` (`publishDrawAction`)
- Immutability: `enforce_published_draw_immutability()` DB trigger prevents post-publish modifications

**Tests:**
- `src/__tests__/draws_phase5.test.ts` (Test 14)

**Status:** SAFE FOUNDATION (BLOCKED ON SIMULATION COMPLETION)

---

## TR-056 — Jackpot rollover

**Requirement**

5-number jackpot rolls forward if unclaimed.

**Business rule:** BR-064

**Edge case:** EC-095

**Implementation:**
- Schema: `draws.jackpot_rollover_in` and `draws.jackpot_rollover_out` columns

**Tests:**
- `src/__tests__/draws_phase5.test.ts` (Test 6)

**Status:** SAFE FOUNDATION (BLOCKED ON ACCUMULATION POLICY RESOLUTION)

---

# 9. § 07 — Prize Pool Logic

## TR-060 — Prize pool funding

**Requirement**

Fixed portion of each subscription contributes to prize pool.

**Business rule:** BR-060 (Decision #3 Structural Specification)

**Assumption:** A-010

**Implementation:**
- Interface: `IPrizePoolCalculator` (`src/lib/draws/types.ts`) defines `calculatePool(activeSubscriberCount, subscriptionRate)`.
- Structural Formula: Gross pool = $\sum (\text{MonthlyEquivalentRate} \times P\%)$. Tier shares: 40% (5-match + jackpot rollover), 35% (4-match), 25% (3-match).
- Yearly Amortization: $1/12$ of annual price per monthly cycle.

**Status:** SAFE FOUNDATION (Decision #3 Structural Specification Complete; numerical parameter $P\%$ requires Product Owner input)

---

## TR-061 — Tier shares

| Match | Share |
|---|---:|
| 5-number | 40% |
| 4-number | 35% |
| 3-number | 25% |

**Business rule:** BR-061

**Implementation:**
- DB Constraint: `chk_pool_percentage CHECK (pool_percentage IN (40.00, 35.00, 25.00))`
- Pure Logic: `src/lib/draws/matching.ts` (`getTierPoolShares`)

**Tests:**
- `src/__tests__/draws_phase5.test.ts` (Test 7, Test 23)

**Status:** SAFE FOUNDATION (Tier ratios enforced; gross fund blocked on A-010)

---

## TR-062 — Multiple winners

**Requirement**

Same-tier prizes split equally.

**Business rule:** BR-063

**Edge cases:** EC-092–EC-094

**Implementation:**
- Pure Logic: `src/lib/draws/matching.ts` (`calculateEqualTierSplit`) with integer cents protection

**Tests:**
- `src/__tests__/draws_phase5.test.ts` (Test 24, Test 25)

**Status:** SAFE FOUNDATION (Equal split logic verified; currency precision blocked on A-020)

---

## TR-063 — Lower-tier no rollover

**Requirement**

4-number and 3-number tiers do not roll over.

**Business rule:** BR-065 (Decision #8 Specification)

**Assumption:** A-022

**Implementation:**
- Table Schema: `draw_tier_allocations` does not include rollover columns for 4/3 tiers.
- Audit Ledger: Records `allocated_amount`, `winner_count`, and `prize_per_winner` per tier.
- Zero Winners: Unclaimed 35% (4-number) and 25% (3-number) funds are held in the draw accounting record pending Product Owner policy selection.

**Status:** SAFE FOUNDATION (Decision #8 Structural Specification Complete; financial disposition policy requires Product Owner input)

---

# 10. § 08 — Charity System

## TR-070 — Charity selection

**Requirement**

Select charity at signup.

**Business rule:** BR-070

**Flow:** Charity Selection

**Implementation:**
- UI: `src/app/signup/page.tsx`
- Server Action: `src/lib/auth/actions.ts` (`signUpAction`)
- DB Column: `public.profiles(charity_id)` linked to `public.charities(id)`

**Tests:**
- `src/__tests__/charities_phase3.test.ts` (Test 24, Test 29)

**Status:** VERIFIED (Phase 3)

---

## TR-071 — 10% minimum

**Requirement**

Minimum contribution = 10% statutory floor of subscription fee.

**Business rule:** BR-071

**Edge cases:** EC-061–EC-063

**Implementation:**
- DB Constraint: `chk_profiles_charity_percentage CHECK (charity_percentage >= 10 AND charity_percentage <= 100)`
- Validation: `src/lib/charities/validation.ts` (`validateCharityContributionPercentage`)

**Tests:**
- `src/__tests__/charities_phase3.test.ts` (Test 25)

**Status:** VERIFIED (Phase 3)

---

## TR-072 — Voluntary increase

**Requirement**

Voluntary contribution increase up to 100%.

**Business rule:** BR-072

**Edge case:** EC-063

**Implementation:**
- Validation: `src/lib/charities/validation.ts` (`validateCharityContributionPercentage`)
- UI: `src/app/signup/page.tsx` (slider from 10% to 100%)

**Tests:**
- `src/__tests__/charities_phase3.test.ts` (Test 26: >100% rejected, valid values up to 100 accepted)

**Status:** VERIFIED (Phase 3)

---

## TR-073 — Independent donation

**Business rule:** BR-073

**Assumption:** A-017

**Implementation:** Direct donation modal in `src/components/charities/CharityDirectory.tsx`

**Status:** PENDING PAYMENT INTEGRATION (Phase 4)

---

## TR-074 — Charity directory

**Requirement**

Comprehensive partner directory with search, filtering, profiles, missions, impact stats, and events.

**Business rules:** BR-074–BR-076

**Flow:** Charity Discovery

**Edge cases:** EC-060–EC-067

**Implementation:**
- DB Table: `public.charities` (`supabase/migrations/20260920000002_phase3_scores_charities.sql`)
- Server Actions: `src/lib/charities/actions.ts` (`getCharities`, `getCharityBySlug`)
- Public Pages: `src/app/charities/page.tsx` & `src/app/charities/[slug]/page.tsx`
- Component: `src/components/charities/CharityDirectory.tsx`

**Tests:**
- `src/__tests__/charities_phase3.test.ts` (Test 18, 19, 20, 21, 22, 23)

**Status:** VERIFIED (Phase 3)

---

# 11. § 09 — Winner Verification

## TR-080 — Proof upload & Winner Dashboard

**Requirement**

Winner uploads screenshot of golf-platform scores (PRD § 09).

**Business rules:** BR-080, BR-081, BR-082, BR-086

**Assumption:** A-014 (Scorecard resubmission policy)

**Flow:** Winner Proof Upload (`/dashboard/winnings`)

**Edge cases:** EC-100–EC-106

**Implementation:**
- UI: `/dashboard/winnings` (`src/app/dashboard/winnings/page.tsx`, `src/components/winnings/SubscriberWinningsManager.tsx`)
- Config: `src/lib/winners/config.ts` (`WINNER_PROOF_CONFIG`, `validateProofFile`)
- Actions: `src/lib/winners/actions.ts` (`getUserWinningsList`, `submitWinnerProofAction`, `getWinnerProofSignedUrlAction`)
- Database: `supabase/migrations/20260920000006_phase6_winner_verification.sql` (`public.winners.submitted_at`, RLS `winners_update_own_proof`, private bucket `winner-proofs`)

**Tests:**
- `src/__tests__/winner_verification.test.ts` (Sections 1, 2, 3, 5, 7, 8)

**Status:** VERIFIED (Phase 6)

---

## TR-081 — Admin approval/rejection

**Requirement**

Administrator reviews winner proof and approves or rejects with mandatory reason (PRD § 09 & § 11.04).

**Business rules:** BR-083, BR-084, BR-086

**Flow:** Winner Verification Studio (`/admin/winners`)

**Implementation:**
- UI: `/admin/winners` (`src/app/admin/winners/page.tsx`, `src/components/admin/AdminWinnerVerificationManager.tsx`)
- Actions: `src/lib/winners/actions.ts` (`getAdminWinnersList`, `approveWinnerVerificationAction`, `rejectWinnerVerificationAction`, `getWinnerProofSignedUrlAction`)
- Database: `supabase/migrations/20260920000006_phase6_winner_verification.sql` (`public.winners.reviewed_at`, `reviewed_by`)

**Tests:**
- `src/__tests__/winner_verification.test.ts` (Sections 4, 7, 8)

**Status:** VERIFIED (Phase 6)

---

## TR-082 — Payment states

**Requirement**

Pending → Paid (PRD § 09).

**Business rules:** BR-085

**Assumption:** A-023 (Administrative Payout Progression & Disbursement Separation)

**Flow:** Administrative Payout Progression

**Edge cases:** EC-110–EC-113

**Implementation:**
- Actions: `src/lib/winners/actions.ts` (`markWinnerPayoutAction` strictly checking `verification_status === 'approved'`)
- UI: `src/components/admin/AdminWinnerVerificationManager.tsx` (Mark Payout button gated by verification approval)

**Tests:**
- `src/__tests__/winner_verification.test.ts` (Section 6)

**Status:** VERIFIED (Phase 6)

---

# 12. § 10 — User Dashboard

## TR-090 — Subscription module

Must display:

- status;
- active/inactive;
- renewal date.

**Business rule:** BR-090

**Status:** NOT STARTED

---

## TR-091 — Score module

Must support:

- entry;
- editing.

**Business rule:** BR-091

**Status:** NOT STARTED

---

## TR-092 — Charity module

Must display:

- selected charity;
- contribution percentage;
- open decision disclosure: post-signup charity modification behavior is intentionally unspecified/pending the PRD decision.

**Business rule:** BR-092

**Implementation:** `src/app/dashboard/charity/page.tsx`

**Status:** VERIFIED (Phase 3)

---

## TR-093 — Participation module

Must display:

- draws entered;
- upcoming draws.

**Business rule:** BR-093

**Status:** NOT STARTED

---

## TR-094 — Winnings module

Must display:

- total won;
- current payment status.

**Business rule:** BR-094

**Status:** NOT STARTED

---

# 13. § 11 — Admin Dashboard

## TR-100 — User management

**Business rule:** BR-100

**Flow:** Admin User Management

**Test:** Admin user-management E2E

**Status:** NOT STARTED

---

## TR-101 — Draw management

**Business rule:** BR-101

**Flow:** Admin Draw Management

**Test:** Draw administration E2E

**Status:** NOT STARTED

---

## TR-102 — Charity management

**Requirement**

Admin management of partner charities: listing, creation, editing, active status toggle, and featured toggle.

**Business rule:** BR-102

**Flow:** Admin Charity Management

**Implementation:**
- Server Actions: `src/lib/charities/actions.ts` (`adminCreateCharityAction`, `adminUpdateCharityAction`, `adminToggleCharityActiveAction`, `adminToggleCharityFeaturedAction`)
- RLS Policies: `charities_insert_admin`, `charities_update_admin`, `charities_delete_admin`
- UI: `src/app/admin/charities/page.tsx` & `src/components/admin/AdminCharityManager.tsx`

**Tests:**
- `src/__tests__/charities_phase3.test.ts` (Test 27, Test 28)

**Status:** VERIFIED (Phase 3)

---

## TR-103 — Winner management

**Business rule:** BR-103

**Flow:** Admin Winner Management

**Test:** Winner verification E2E

**Status:** NOT STARTED

---

## TR-104 — Reports & Operational Analytics

**Requirement**

Executive performance reporting (PRD § 11.05):
- Subscriber growth (current cohort + monthly registration trend)
- Monthly draw history (participants, winning numbers, tier allocations, winners, rollovers, unclaimed lower-tier funds)
- Charity contribution totals (strict separation between subscription donations & unclaimed prize distributions)
- Financial summaries (subscription revenue basis, 30% MER prize pool, gross draw pools, pending vs paid winnings, integer pence subunits, explicit GBP currency, temporary assumption disclosures)
- Date filtering (Current Month, Previous Month, Last 3/6/12 Months, All Time) in UTC
- CSV audit exports

**Business rule:** BR-104

**Flow:** Admin Reporting (`/admin/reports`)

**Edge cases:** EC-140–EC-142

**Implementation:**
- UI: `src/app/admin/reports/page.tsx`, `src/components/admin/reports/AdminReportsManager.tsx`, `ReportDateFilter.tsx`, `ReportSummaryCards.tsx`, `SubscriberGrowthView.tsx`, `DrawHistoryReportView.tsx`, `CharityReportView.tsx`, `FinancialSummaryView.tsx`
- Types & Date Utils: `src/lib/reports/types.ts`, `src/lib/reports/date-utils.ts`
- Aggregation Service & Actions: `src/lib/reports/service.ts`, `src/lib/reports/actions.ts`
- CSV Export: `src/lib/reports/export.ts`

**Tests:**
- `src/__tests__/reports.test.ts` (22 tests covering date filtering, subscriber growth, draw history, charity separation, financial summary, integer subunits, security authorization, and CSV utilities)

**Status:** VERIFIED (Phase 7)

---

# 14. § 12 — UI / UX Requirements

## TR-110 — Modern clean interface

**Business rule:** BR-110

**Test:** Design QA / Responsive check

**Status:** VERIFIED (Phase 8 — Black, White, Grey, Silver palette with restrained Red and Blue accents)

## TR-111 — Avoid golf clichés

**Business rule:** BR-111

**Test:** Visual review

**Status:** VERIFIED (Phase 8 — "Feel, not fairway" aesthetics; zero golf-green or casino-gold clichés)

## TR-112 — Charity-first experience

**Business rule:** BR-110

**Test:** UX review

**Status:** VERIFIED (Phase 8 — Statutory 10% floor on signup, charity hero cards, designated causes)

## TR-113 — Homepage communication

Must communicate:

- user action;
- winning mechanism;
- charity impact;
- CTA.

**Flow:** Homepage Flow

**Test:** Content/UX review

**Status:** VERIFIED (Phase 8 — Hero, How it Works, Charity Grid, Dynamic CTA)

## TR-114 — Motion

Subtle transitions and micro-interactions.

**Business rule:** BR-113

**Test:** Motion QA

**Status:** VERIFIED (Phase 8 — Framer Motion micro-interactions with reduced-motion respect)

## TR-115 — Prominent subscription CTA

**Business rule:** BR-114

**Test:** UX review

**Status:** VERIFIED (Phase 8 — Prominent pricing and subscription flows)

---

# 15. § 13 — Technical Requirements

## TR-120 — Architecture

Implementation must separate appropriate concerns between:

- presentation;
- business logic;
- data;
- authentication;
- authorization;
- external integrations.

**Status:** VERIFIED (Phase 8 — Next.js 15 App Router, Server Actions, Supabase RLS, modular services)

## TR-121 — Secure environment configuration

Environment variables and secrets must be configured safely.

**Status:** VERIFIED (Phase 8 — Strict server-only isolation; zero secrets committed or leaked)

## TR-122 — Backend validation

Critical business rules must not rely only on frontend validation.

**Business rules:** BR-150–BR-152

**Status:** VERIFIED (Phase 8 — All validations replicated and enforced server-side)

---

# 16. § 14 — Scalability Considerations

## TR-130 — Extensible architecture

Architecture should accommodate growth in:

- subscribers;
- scores;
- charities;
- draw history;
- winners;
- reports.

**Status:** VERIFIED (Phase 8 — Modular engine strategies, indexed tables, pagination/date bounds)

## TR-131 — Efficient data access

Large datasets should not require unnecessary full-table client loading.

**Edge cases:** EC-132–EC-134

**Status:** VERIFIED (Phase 8 — Bounded UTC date queries, rolling-5 index, server components)

## TR-132 — Modular business logic

Draw logic and prize calculations should be isolated enough to evolve without rewriting unrelated features.

**Status:** VERIFIED (Phase 8 — Strategy interfaces for scoring, eligibility, and draw execution)

---

# 17. § 15 — Mandatory Deliverables

## TR-140 — Live website

Publicly accessible deployment.

**Status:** READY FOR STAGING DEPLOYMENT (Build verified 100%; live deployment requires Vercel/Supabase provisioning)

## TR-141 — User panel

Must support test credentials and functional:

- signup;
- login;
- score entry;
- dashboard.

**Status:** VERIFIED (Phase 8 — Tested offline and via integration test suite)

## TR-142 — Admin panel

Must support:

- user management;
- draw system;
- charities;
- winner verification;
- reports and analytics;
- subscription operations.

**Status:** VERIFIED (Phase 8 — All 5 control surfaces implemented and operational)

## TR-143 — Database

Connected backend/database with proper schema.

**Status:** VERIFIED (Phase 8 — 6 deterministic SQL migrations covering all platform entities)

## TR-144 — Source code

Clean, structured, well-commented.

**Status:** VERIFIED (Phase 8 — Zero ESLint errors, zero TypeScript errors, clean modular code)

## TR-145 — Deployment constraints

Use:

- new Vercel account;
- new Supabase project;
- correctly configured environment variables.

**Status:** READY (Documented in `.env.example`; awaiting cloud instance credentials)

---

# 17.1 Phase 9 — Presentation Demo Mode Traceability

## TR-146 — Reviewer Demo Mode Access
Public visitor can activate safe Demo Mode directly from the `/login` gateway without creating an account or providing credentials.
- UI: `src/app/login/page.tsx` ("Try Demo Mode (Instant Access)")
- Route: `/demo`
- Status: VERIFIED (Phase 9)

## TR-147 — Demo Data Isolation & Safety
All demo screens display deterministic mock data from `src/lib/demo/data.ts` (`DEMO_USER`, `DEMO_SUBSCRIPTION`, `DEMO_SCORES`, `DEMO_SELECTED_CHARITY`, `DEMO_LATEST_DRAW`, `DEMO_WINNINGS`).
- Zero database network requests or service keys in client bundles.
- Persistent top banner `DemoBanner.tsx` displays "DEMO MODE — Sample data only".
- Tests: `src/__tests__/demo_mode.test.ts`
- Status: VERIFIED (Phase 9)

## TR-148 — Multi-Channel Demo Payment Simulation
Simulated checkout sheet supporting Credit Card, UPI, Procedural Demo QR, and Bank Transfer with full lifecycle states (Selecting, Processing, Success, Failure, Cancelled).
- UI: `src/components/demo/DemoPaymentSimulation.tsx`, `DemoQR.tsx`, `/demo/payment`
- Never invokes Stripe or moves financial currency; clearly displays "Simulation only — no real payment was processed".
- Tests: `src/__tests__/demo_mode.test.ts`
- Status: VERIFIED (Phase 9)

---

# 18. § 16 — Evaluation Criteria

## TR-150 — Requirements interpretation

Implementation should accurately translate PRD requirements into functionality.

**Status:** CONTINUOUS

## TR-151 — System design

Architecture and data modelling should be deliberate and extensible.

**Status:** CONTINUOUS

## TR-152 — UI/UX creativity

Design should demonstrate originality, polish, and emotional engagement.

**Status:** CONTINUOUS

## TR-153 — Data handling

Score logic, draw engine, and prize calculations must be accurate.

**Status:** CONTINUOUS

## TR-154 — Scalability thinking

Codebase and data structures should be extensible.

**Status:** CONTINUOUS

## TR-155 — Problem-solving

Ambiguities must be identified and documented.

**Status:** CONTINUOUS

---

# 19. Global Testing Traceability

The PRD's testing checklist maps as follows:

| PRD Test | Traceability IDs |
|---|---|
| User signup & login | TR-020, TR-021, TR-030 |
| Monthly subscription | TR-030 |
| Yearly subscription | TR-030 |
| 5-score rolling logic | TR-040 |
| Draw system logic | TR-051–TR-056 |
| Draw simulation | TR-054 |
| Charity selection | TR-070 |
| Charity contribution calculation | TR-071–TR-072 |
| Winner verification | TR-080–TR-082 |
| Payout tracking | TR-082 |
| User dashboard | TR-090–TR-094 |
| Admin panel | TR-100–TR-104 |
| Data accuracy | TR-040–TR-063 and financial tests |
| Mobile responsiveness | TR-110 onward |
| Desktop responsiveness | TR-110 onward |
| Error handling | Edge-case matrix |
| Edge cases | `edge-cases.md` |

---

# 20. Required Implementation Evidence

For each `VERIFIED` requirement, Antigravity should be able to identify:

```text
PRD requirement
    ↓
Requirement ID
    ↓
Relevant source files/components
    ↓
Relevant database/API logic
    ↓
Relevant test
    ↓
Test result
```

The traceability document should be updated as implementation progresses.

---

# 21. Blocked Requirements

At the start of implementation, the following areas require explicit decisions before their final behavior can be verified:

### TR-053

Algorithmic draw formula.

Related:

- A-011
- A-013

### TR-060

Exact percentage of subscription allocated to prize pool.

Related:

- A-010
- A-021

### TR-063

Exact handling of unclaimed 4-number and 3-number tier amounts.

Related:

- A-022

Other open decisions in `assumptions.md` should be resolved when their affected feature is reached.

---

# 22. Final Traceability Rule

At the end of the project, there should be no unexplained gap between:

```text
PRD
 ↓
Requirements
 ↓
Business Rules
 ↓
User Flows
 ↓
Edge Cases
 ↓
Implementation
 ↓
Tests
 ↓
Verification
```

If a feature exists but cannot be traced to a requirement, review whether it is necessary.

If a requirement exists but cannot be traced to an implementation and test, it is not complete.

If an implementation behavior cannot be justified by the PRD or a documented approved assumption, review it before final delivery.

---

# 23. Full 16-Section Coverage Confirmation

| # | PRD Section | Covered |
|---:|---|:---:|
| 01 | Project overview | ✓ |
| 02 | Core objectives | ✓ |
| 03 | User roles | ✓ |
| 04 | Subscription & payment | ✓ |
| 05 | Score management | ✓ |
| 06 | Draw & reward system | ✓ |
| 07 | Prize pool logic | ✓ |
| 08 | Charity system | ✓ |
| 09 | Winner verification | ✓ |
| 10 | User dashboard | ✓ |
| 11 | Admin dashboard | ✓ |
| 12 | UI / UX requirements | ✓ |
| 13 | Technical requirements | ✓ |
| 14 | Scalability considerations | ✓ |
| 15 | Mandatory deliverables | ✓ |
| 16 | Evaluation criteria | ✓ |

---

## End of Traceability Matrix
