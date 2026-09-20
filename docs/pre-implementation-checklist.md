# Digital Heroes — Pre-Implementation Verification Checklist

**Document:** `docs/pre-implementation-checklist.md`  
**Date:** September 20, 2026  
**Status:** ALL SPECIFICATION PHASES COMPLETE — AWAITING IMPLEMENTATION APPROVAL  
**Authoritative Precedence Enforced:**
1. `Digital Heroes PRD (Level 1).pdf` — **PRIMARY SOURCE OF TRUTH**
2. `DESIGN.md` (DESIGN(2).md) — Design & Execution Master Specification
3. `docs/requirements.md`
4. `docs/business-rules.md`
5. `docs/user-flows.md`
6. `docs/assumptions.md`
7. `docs/edge-cases.md`
8. `docs/traceability.md`
9. `docs/architecture.md`
10. `docs/screen-inventory.md`
11. `docs/design-system.md`

---

## 1. Authoritative Pre-Implementation Verification Checklist

- [x] **PRD is source of truth**  
  Confirmed. `Digital Heroes PRD (Level 1).pdf` is established as the supreme specification authority. In any instance of conflict between supporting documentation and the PRD, the PRD strictly takes precedence.

- [x] **Requirements documented**  
  Confirmed. `docs/requirements.md` (695 lines) decomposes all 16 PRD sections into functional and technical requirement statements.

- [x] **Business rules documented**  
  Confirmed. `docs/business-rules.md` (672 lines) details governance rules (`BR-001` through `BR-152`), server-side enforcement, constraints, and operational standards.

- [x] **User flows documented**  
  Confirmed. `docs/user-flows.md` (849 lines) documents step-by-step navigational and state transitions across Public, Subscriber, and Administrator journeys.

- [x] **Assumptions documented**  
  Confirmed. `docs/assumptions.md` (721 lines) catalogs all identified gaps and explicitly records boundaries without unauthorized assumptions.

- [x] **Edge cases documented**  
  Confirmed. `docs/edge-cases.md` (1,108 lines) specifies testable scenarios across input validation, financial boundaries, concurrency, and authorization failures (`EC-001` through `EC-195`).

- [x] **Traceability documented**  
  Confirmed. `docs/traceability.md` (1,178 lines) maps every mandatory PRD section and requirement to verification criteria and implementation targets (`TR-001` through `TR-155`).

- [x] **Architecture documented**  
  Confirmed. `docs/architecture.md` provides a complete 22-section architecture specification, including exhaustive database entity justifications, RLS policies, audit ledgers, and classification tags.

- [x] **Screen inventory documented**  
  Confirmed. `docs/screen-inventory.md` documents all 32 views across Public (8), Subscriber (10), and Admin (14) surfaces, detailing all 4 UI states, mobile/desktop behaviors, accessibility rules, and explicit non-requirements.

- [x] **Design system documented**  
  Confirmed. `docs/design-system.md` specifies tokens, typography, radii, spacing, domain components, motion curves, and accessibility compliance under the "Feel, not fairway" mandate.

- [x] **Open decisions documented**  
  Confirmed. All 8 ambiguous business items are explicitly documented with status `OPEN DECISION`, accompanied by what the PRD says, what it does not say, options, consequences, affected systems, and decoupled TypeScript extension interfaces.

- [x] **No application code created**  
  Confirmed. Exactly 0 lines of application code exist in the repository. No `package.json`, `tsconfig.json`, or source files have been created.

- [x] **No database migrations created**  
  Confirmed. No SQL migration scripts, seed files, or Supabase configurations have been generated.

- [x] **No infrastructure created**  
  Confirmed. No external Vercel deployments, Supabase projects, or Stripe webhook endpoints have been created.

- [x] **No invented business rules**  
  Confirmed. Every business rule is traced directly to the PRD. Unspecified parameters remain open decisions awaiting user determination.

- [x] **Design palette matches requested direction**  
  Confirmed. Palette strictly adheres to:
  - **Primary:** Deep Black (`#050709`), Near Black (`#0A0E13`), Crisp White (`#FFFFFF`), Metallic Silver (`#8F9CAE`, `#CBD5E1`), and Charcoal/Graphite (`#151B23`, `#1E2631`).
  - **Selective Accents:** Signal Red (`#E11D48`) and Electric/Professional Blue (`#2563EB`, `#3B82F6`), used strictly for high-priority actions, verification badges, and focus rings (under 10% viewport surface).
  - **Strict Exclusions Enforced:** Zero golf-course green, no emerald primary brand color, no ochre, no champagne/gold, no dominant cream/sand backgrounds, and no cursive interface typography.

---

## 2. Status of the 8 Open Decisions

All 8 decisions remain **`STATUS: OPEN DECISION`** awaiting stakeholder determination:
1. **Decision 1:** Score-to-draw number mapping (Unordered unique set vs. Multiset vs. Positional)
2. **Decision 2:** Algorithmic draw weighting formula (Frequency-proportional vs. Inverse frequency vs. Distribution-fitted)
3. **Decision 3:** Subscription percentage allocated to prize pool (50% vs. 40% vs. Configurable admin setting)
4. **Decision 4:** Draw eligibility prerequisite (Strict 5 scores vs. Partial scores allowed)
5. **Decision 5:** Currency and subscription pricing (USD vs. GBP vs. Configurable tokens)
6. **Decision 6:** Winner proof resubmission policy (Resubmission permitted vs. Terminal forfeiture vs. Cure period)
7. **Decision 7:** Post-signup charity-change behavior (Editable anytime vs. Locked at signup vs. Renewal-locked)
8. **Decision 8:** Treatment of unclaimed 3-number and 4-number prize funds (Platform reserve vs. Charity pool vs. Jackpot rollover)

---

## 3. Implementation History & Evolution
Following explicit authorizations, Phases 1 through 7 were systematically implemented, test-driven, and verified.

---

## 4. Phase 8 E2E System Integration & Production Hardening Checklist

- [x] **Journey 1: Public Visitor -> Signup -> Charity Selection -> Subscription -> Dashboard**  
  Verified. Enforces &ge; 10% charity floor, forces `role = 'subscriber'`, integrates profile creation.
- [x] **Journey 2: Subscriber -> Score Entry -> Rolling-Five -> Draw Ticket Generation**  
  Verified. Validates 1–45 pts Stableford range, preserves chronological rolling-5 pool, maps to sorted tickets (TA-002).
- [x] **Journey 3: Subscriber -> Upcoming Draw -> Published Draw -> Winning Result -> Winnings**  
  Verified. 40/35/25 statutory allocations, 5/4/3 match counting, jackpot rollover, lower-tier unclaimed charity distribution (TA-006), penny remainder preservation.
- [x] **Journey 4: Winner -> Submit Proof -> Admin Review -> Approve/Reject -> Resubmission -> Mark Paid**  
  Verified. 20MB ceiling, generous image/PDF formats, private signed URL storage, strict state transitions (`pending` -> `proof_submitted` -> `approved` -> `paid`).
- [x] **Journey 5: Administrator -> Manage Users -> Manage Charities -> Manage Draws -> Publish Draw -> Verify Winners -> Reporting**  
  Verified. Active user directory (`/admin/users`), subscriptions ledger (`/admin/subscriptions`), and connected control surfaces.
- [x] **Journey 6: Subscription Lifecycle -> Active -> Grace Period -> Lapsed Access**  
  Verified. 7-day grace period for past-due accounts, period-end access retention for canceled accounts.
- [x] **Security & RLS Invariants**  
  Verified. All 8 database tables enforce own-user access or admin authorization. Server-only secrets isolated.
- [x] **Quality Gates: Tests, Lint, TypeScript, Build**  
  Verified. 252 tests passing (100%), ESLint 0 errors, TypeScript 0 errors, Next.js 15 production build compiled 100%.

---

## 5. Phase 9 Demo Mode & Presentation Readiness Checklist

- [x] **Clear Entry Point on Login Screen**  
  Verified. "Try Demo Mode (Instant Access)" button prominent on `/login` card; directs users to `/demo` without credentials.
- [x] **Complete Data Isolation**  
  Verified. Deterministic mock data in `src/lib/demo/data.ts` (`DEMO_USER`, `DEMO_SUBSCRIPTION`, `DEMO_SCORES`, `DEMO_SELECTED_CHARITY`, `DEMO_LATEST_DRAW`, `DEMO_WINNINGS`). Zero server actions or Supabase RLS bypasses.
- [x] **Persistent Visual Indicator**  
  Verified. `DemoBanner.tsx` displayed persistently atop `/demo/*` routes declaring "DEMO MODE — Sample data only · No real account".
- [x] **Multi-Channel Payment Simulation**  
  Verified. Complete modal simulation for Card, UPI, Procedural Demo QR, and Bank Transfer with full lifecycle states (Selecting, Processing, Success, Failure, Cancelled). Never invokes Stripe.
- [x] **Procedural Algorithmic Demo QR**  
  Verified. Dynamic vector SVG with `DEMO` watermark overlay. No real payment information encoded.
- [x] **Regression & Quality Safety**  
  Verified. 260/260 tests passing (14 test suites), ESLint 0 errors / 0 warnings, TypeScript 0 errors, Next.js 15 production build passing across 27 routes.


