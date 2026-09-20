# Digital Heroes — Business Rules

**Source of truth:** Digital Heroes PRD (Level 1), Version 1.0, March 2026.

This document converts the PRD's functional requirements into explicit business rules that the application must enforce. Where the PRD leaves a business rule unspecified, this document marks it as an **open decision** rather than inventing a rule.

---

# 1. Rule Governance

## BR-001 — PRD precedence

The Digital Heroes PRD is the authoritative source for product requirements.

Any implementation decision must remain compatible with the PRD unless a later approved requirement explicitly changes it.

## BR-002 — Server-side enforcement

Business-critical rules must not depend solely on frontend validation.

The backend/database layer must enforce critical constraints wherever technically appropriate.

## BR-003 — No silent assumptions

If a business rule is not specified by the PRD:

- do not silently invent it;
- document the ambiguity;
- choose an implementation only after the decision is recorded.

---

# 2. Subscription & Access Rules

## BR-010 — Supported plans

The platform must provide:

- Monthly plan
- Yearly plan

The yearly plan is specified as having a discounted rate.

## BR-011 — Payment provider

Payment must use Stripe or an equivalent PCI-compliant payment provider.

## BR-012 — Restricted non-subscriber access

Users without an active subscription must have restricted access to platform features.

## BR-013 — Subscription lifecycle

The system must handle:

- Renewal
- Cancellation
- Lapsed-subscription states

## BR-014 — Authenticated subscription validation

Subscription status must be checked in real time on authenticated requests, according to the PRD.

## BR-015 — Subscription state must control protected access

A protected feature must not rely only on whether a user has an account. The relevant subscription state must also be considered.

## BR-016 — Currency & Commercial Subscription Pricing (Decision #5 Specification)

The business rules and configuration architecture governing subscription pricing and currency are formally established as follows:

1. **Decoupled Configuration Contract:** Exact commercial pricing (currency ISO code, nominal monthly amount, nominal yearly amount, yearly discount structure, and Stripe Price IDs) must be loaded from verified environment/configuration parameters rather than hardcoded in source code or database schemas.
2. **Monthly Equivalent Rate (MER) Preservation:** For all financial calculations (prize pool allocation per BR-060 and charity tracking per BR-071), membership contributions are normalized to a monthly cycle:
   $$\text{MER}_{\text{monthly}} = \text{MonthlyPrice}$$
   $$\text{MER}_{\text{yearly}} = \frac{\text{YearlyPrice}}{12}$$
3. **Discounted Annual Rate:** The yearly plan must offer a discounted rate relative to 12 months of the monthly plan ($\text{YearlyPrice} < 12 \times \text{MonthlyPrice}$), as mandated by PRD § 04. The exact discount percentage or price differential requires Product Owner specification.
4. **Gross Customer Charge Base:** Statutory charity contributions (minimum 10% per PRD § 08.1) and prize pool contributions (BR-060) are calculated against the nominal base subscription fee.
5. **Missing Commercial Parameter Status:** The exact currency and nominal price points require formal Product Owner input. When Stripe keys or Price IDs are absent, the application displays an explicit configuration-required state rather than dummy prices.

---

# 3. Score Management Rules

## BR-020 — Stableford format

Golf scores must be entered in Stableford format.

## BR-021 — Valid score range

A score is valid only when:

**1 ≤ score ≤ 45**

## BR-022 — Score date required

Every score must contain a date.

## BR-023 — One score per date

A subscriber may have only one score for a given date.

A second score for the same date must not create a duplicate record.

The existing score may instead be edited or deleted.

## BR-024 — Maximum retained score history

Only the latest five scores are retained at any time.

## BR-025 — New score replaces oldest retained score

When adding a score causes the retained set to exceed five:

1. Keep the newly entered score.
2. Identify the oldest retained score.
3. Remove/replace the oldest retained score.
4. Retain exactly the latest five scores.

## BR-026 — Reverse chronological display

Scores must be displayed:

**Most recent → Oldest**

## BR-027 — Edit existing score

An existing score may be edited, subject to all normal validation rules.

## BR-028 — Delete existing score

An existing score may be deleted.

## BR-029 — Score validation consistency

The same score rules must apply whether a score is:

- created
- edited
- processed through an API
- imported through an administrative operation

---

# 4. Draw Rules

## BR-040 — Monthly cadence

The draw operates on a monthly cadence.

## BR-041 — Supported match tiers

The system must support:

- 5-number match
- 4-number match
- 3-number match

## BR-042 — Supported draw modes

The PRD specifies two draw modes:

1. Random / standard lottery-style
2. Algorithmic / weighted by score frequency

## BR-043 — Admin draw control

Administrators control draw configuration and publishing.

## BR-044 — Simulation before publication

A draw must support simulation before final publication.

## BR-045 — Publication control

A draw simulation must not automatically become the publicly published result unless the defined workflow explicitly performs publication.

## BR-046 — Published result integrity

Once a draw result is published, the system should preserve the published result as the historical result rather than silently changing it through ordinary user actions.

> This is an implementation integrity rule derived from the PRD's requirement that administrators run simulations and publish results. The PRD does not specify an exact database immutability mechanism.

## BR-047 — Score-to-Draw Ticket Mapping (Decision #1 Resolved)

The ticket mapping rule is formally established as:

1. **Number Domain:** 1–45, directly matching the statutory Stableford scoring range (PRD § 05). Winning numbers are drawn from integers 1–45 without replacement (5 distinct numbers).
2. **Ticket Construction:** Direct score identity. A participant's retained Stableford scores directly constitute their draw ticket numbers. No hashing, modulo, or synthetic transformations.
3. **Ordering:** Unordered / set-based intersection. Matching is determined by counting how many drawn numbers exist within the participant's ticket numbers, regardless of sequence or date played.
4. **Duplicate Scores:** Raw duplicate scores are preserved on the ticket without synthetic adjustment. Since the winning draw consists of distinct numbers, matching is computed as the count of distinct winning numbers contained in the ticket. A participant with duplicate scores has fewer distinct numbers in play and cannot match 5 distinct drawn numbers.
5. **Tickets per Subscriber:** Exactly one (1) ticket entry per active subscriber per monthly draw cycle (`UNIQUE(draw_id, user_id)`).
6. **Canonical Representation:** Ticket numbers are presented in ascending numerical order for deterministic display and comparison.
7. **Snapshot Timing:** The ticket is derived dynamically from the rolling-5 scores until draw execution, at which point it is snapshotted immutably into `draw_entries`.

## BR-049 — Draw Eligibility & Ticket Quota (Decision #4 Specification)

The business rules governing draw participation and eligibility thresholds are formally specified as follows:

1. **Subscription Status Gate:** Active subscription (`status = 'active'`) is a mandatory prerequisite for draw participation. Inactive, lapsed, or cancelled subscribers cannot participate regardless of score count.
2. **Score Threshold Models (Awaiting PO Selection):**
   - **Model A (Strict 5-Score Threshold):** Requires `COUNT(scores) == 5`. Users with 0–4 scores receive no draw ticket.
   - **Model B (Dynamic Partial Tickets — Recommended Architecture):** Any active subscriber with $\ge 1$ score receives a ticket with their retained scores ($K \in \{1..5\}$). Distinct matching applies naturally:
     - 1 score $\rightarrow$ max 1 match (ineligible for winning tiers).
     - 2 distinct scores $\rightarrow$ max 2 matches (ineligible for winning tiers).
     - 3 distinct scores $\rightarrow$ eligible for 3-number tier (25% pool).
     - 4 distinct scores $\rightarrow$ eligible for 3-number and 4-number tiers (25%, 35% pool).
     - 5 distinct scores $\rightarrow$ eligible for all tiers (3, 4, and 5 jackpot).
   - **Model C (Minimum 3-Score Threshold):** Requires `COUNT(DISTINCT scores) >= 3` to enter, as fewer than 3 distinct scores cannot win any defined prize tier.
3. **Zero-Score Handling:**
   Active subscribers with 0 logged scores cannot match any drawn numbers. Under Model A and C, they are excluded from `draw_entries`. Under Model B, they receive an empty ticket `[]` with 0 matches. No synthetic numbers are ever generated.
4. **Duplicate Score Impact:**
   Duplicate scores are preserved on the ticket per BR-047, but since winning numbers are 5 distinct integers, maximum match potential equals the count of *distinct* score values on the ticket. For example, a ticket with `[36, 36, 40]` can match at most 2 distinct winning numbers and cannot win the 3-match tier.
5. **New Subscribers & Cutoff Timing:**
   There is no arbitrary account-age waiting period. A new subscriber who activates before the draw simulation/execution cutoff is eligible based on their scores logged at the time of the administrator snapshot.
6. **Decoupling Interface:**
   The concrete eligibility decision is encapsulated in `IDrawEligibilityResolver` (`isEligible(scoreCount, hasActiveSubscription)`), allowing the system to run any approved model without database schema changes.

---

# 5. Algorithmic Draw Specification

## BR-048 — Algorithmic Weighting Formula (Decision #2 Resolved)

The algorithmic draw mode specified by PRD § 06 ("weighted by score frequency") is governed by the following mathematical and operational rules:

1. **Population:** Frequency is computed strictly across all retained Stableford scores of eligible subscribers participating in the current monthly draw cycle (`draw_entries`).
2. **Frequency Definition:** For each integer $n \in \{1, 2, \dots, 45\}$, $f(n)$ is the total occurrences of score $n$ in the participating tickets.
3. **Weighting Direction:** Higher frequency yields proportionally higher selection probability. Common golf scores have higher odds of being drawn, increasing match density for the community.
4. **Additive Laplace Smoothing ($\alpha = 1$):** To ensure all 45 domain numbers maintain a strictly positive probability and prevent deadlock when fewer than 5 distinct scores are logged, the sampling weight is:
   $$W(n) = f(n) + 1 \quad \text{for } n \in \{1, 2, \dots, 45\}$$
   - If a number has 0 submissions, $W(n) = 1$.
   - If a number has 100 submissions, $W(n) = 101$.
5. **Sequential Sampling Without Replacement:**
   - For step $k \in \{1, 2, 3, 4, 5\}$:
     $$P_k(n) = \frac{W(n)}{\sum_{m \in S_k} W(m)} \quad \text{for } n \in S_k$$
     where $S_1 = \{1, 2, \dots, 45\}$ and $S_{k+1} = S_k \setminus \{X_k\}$.
   - Selected numbers are removed after each step, guaranteeing exactly 5 distinct winning numbers.
6. **Snapshot Timing:** The frequency distribution $f(n)$ is calculated at draw execution time from the snapshotted participant entries in `draw_entries`.
7. **Deterministic Reproducibility:** Algorithmic simulation accepts a cryptographic seed (e.g. SHA-256 of cycle metadata) allowing exact recreation during audits and compliance tests.

## BR-051 — Draw logic must be testable

Regardless of execution mode (Random or Algorithmic), draw logic must be deterministic and testable against mock seed fixtures.

---

# 6. Prize Pool Rules

## BR-060 — Prize pool contribution (Decision #3 Structural Specification)

A fixed portion of each subscription contributes to the prize pool (PRD § 07).

The PRD establishes that the prize pool is automatically calculated from active subscribers, but does not specify the exact numerical percentage $P\%$ (or fixed monetary amount) of the subscription fee allocated to the prize pool.

The structural business rules and calculation framework are formally established as follows:

1. **Structural Formula:**
   $$\text{Gross New Pool} = \sum_{i \in \text{ActiveSubscribers}} \left( \text{MonthlyEquivalentRate}(i) \times P \right)$$
   where $P \in (0, 100 - C_{\min}]$ is the configured subscription allocation percentage, and $C_{\min} \ge 10\%$ is the statutory minimum charity contribution.
2. **Yearly Plan Amortization:**
   To prevent revenue distortion between monthly and yearly members, the monthly equivalent rate for annual subscribers is:
   $$\text{MonthlyEquivalentRate}_{\text{yearly}} = \frac{\text{YearlySubscriptionPrice}}{12}$$
   Annual subscribers contribute their proportional $1/12$ share to each of the 12 monthly draw cycles during their active year.
3. **Active Subscriber Snapshot:**
   Eligible subscription revenue is determined by all subscribers with `status = 'active'` at the snapshot moment of draw simulation/publication. Lapsed, cancelled, or past-due subscriptions generate 0 contribution to the current draw pool.
4. **Charity Independence:**
   The prize pool allocation is computed independently against the base subscription rate. Voluntary subscriber increases to charity percentage (PRD § 08.1) do NOT reduce the prize pool contribution; voluntary charity increases adjust the platform operational margin.
5. **Numerical Parameter Status:**
   The exact numerical value of $P\%$ requires Product Owner input. Code implementations (`IPrizePoolCalculator`) must accept $P$ as a configurable parameter rather than a hardcoded magic number.

## BR-061 — Prize tier allocation

The defined prize pool is distributed as:

| Match | Pool Share |
|---|---:|
| 5-number match | 40% |
| 4-number match | 35% |
| 3-number match | 25% |

These percentages apply to the prize pool, not automatically to the entire subscription fee.

## BR-062 — Automatic pool calculation

The prize pool tiers must be calculated automatically based on active subscriber count.

## BR-063 — Equal division within tier

If multiple users win in the same tier, the prize allocated to that tier is split equally among those winners.

## BR-064 — 5-number jackpot rollover

If the 5-number tier has no winner, its jackpot carries forward.

## BR-065 — Lower-tier no rollover & unclaimed funds accounting (Decision #8 Specification)

The PRD explicitly mandates that lower tiers do not roll over:
- 4-number match: **Rollover = No** (35% pool share)
- 3-number match: **Rollover = No** (25% pool share)

The structural rules governing lower-tier allocations when zero winners occur ($W_4 = 0$ or $W_3 = 0$) are formally established as follows:

1. **No Lower-Tier Carry-Forward:** Unclaimed 3-number and 4-number allocations must NEVER roll over into the corresponding lower tier of the next draw cycle.
2. **Audit Ledger Requirement:** For every published draw, the system records `allocated_amount`, `winner_count`, and `prize_per_winner` in `draw_tier_allocations`. When $W_T = 0$, the unclaimed amount remains explicitly documented in historical records.
3. **Distinction from Remainder Fractions:**
   - **Zero-Winner Tier ($W_T = 0$):** The entire 35% or 25% allocation is unclaimed and subject to the PO-selected financial disposition policy.
   - **Integer-Cent Division Remainder ($W_T > 0$):** Indivisible cents resulting from equal division (`tier_amount - (prize_per_winner * winner_count)`) are retained in the platform prize ledger and do not constitute an unclaimed tier.
4. **Candidate Accounting Destinations (Awaiting PO Selection):**
   - **Model A:** Reverts to platform operating revenue.
   - **Model B:** Contributed to platform charity partner pool.
   - **Model C:** Re-injected into next month's gross prize pool.
   - **Model D:** Cascaded to another tier in the same draw (e.g. into Tier 3 or Tier 5).
   - **Model E:** Retained in promotional escrow reserve.
5. **Policy Requirement:** Automated transfer of unclaimed funds to any account or destination is blocked pending formal written policy from the Product Owner.

## BR-066 — Calculation accuracy

Prize calculations must be consistent, reproducible, and testable.

---

# 7. Charity Rules

## BR-070 — Charity selected during signup

A subscriber selects a charity at signup.

## BR-071 — Minimum charity contribution

The charity contribution must be at least:

**10% of the subscription fee**

## BR-072 — Increased charity contribution

A user may voluntarily increase the charity contribution percentage above the minimum.

## BR-073 — Independent donation

The platform supports an independent donation option that is not tied to gameplay.

## BR-074 — Charity discovery

Users must be able to discover charities through:

- directory
- search
- filtering

## BR-075 — Charity profile information

Charity profiles must support:

- description
- images
- upcoming events such as golf days

## BR-076 — Featured charity

The homepage must support a featured charity section.

---

# 8. Winner Verification Rules (Phase 6 Implemented & Verified)

## BR-080 — Winner-only verification & Isolated Dashboard (/dashboard/winnings)

1. The verification process applies to winners only (PRD § 09).
2. The authenticated subscriber dashboard (`/dashboard/winnings`) displays:
   - Cycle draw number and month
   - Official winning 5 numbers
   - Subscriber's 5 retained scorecard ticket numbers
   - Match count (3, 4, or 5 numbers)
   - Winning prize tier (`5_number`, `4_number`, `3_number`)
   - Allocated prize amount (£)
   - Verification status badge (`pending`, `proof_submitted`, `approved`, `rejected`)
   - Payout ledger status (`pending`, `paid`)
   - Scorecard evidence upload UI when action is required
3. Non-winners receive a clean empty state with educational guidance.
4. Cross-user isolation: Subscribers can never query or view another user's winning entries.

## BR-081 — Proof requirement & Non-restrictive upload policy

1. A winner must provide a screenshot or document of scores from the golf platform as proof (PRD § 09).
2. Generous format acceptance: PNG, JPG, JPEG, WebP, GIF, HEIC, HEIF, BMP, TIFF, and PDF.
3. Generous file size limit: Up to 20 MB (WINNER_PROOF_CONFIG.MAX_FILE_SIZE_MB = 20).
4. Storage: Uploaded files are stored in a private Supabase bucket (`winner-proofs`).

## BR-082 — Winner ownership enforcement & Tamper resistance

1. Strict server-side ownership barrier: A subscriber may only upload evidence for their own winning entry (`auth.uid() = user_id`).
2. Non-owners and unauthenticated users cannot upload or alter winner evidence.
3. Subscribers cannot alter prize amounts, winning tiers, or payout statuses.

## BR-083 — Administrator verification studio (/admin/winners) & Mandatory rejection reason

1. An administrator reviews winner proof submissions in `/admin/winners` (PRD § 11.04).
2. The studio presents: winner name, email, draw, tier, prize amount, evidence file, submission timestamp, verification state, and payout state.
3. The administrator can:
   - **Approve** the submission: Transitions status to `approved`, clears rejection reasons, and records `reviewed_at` and `reviewed_by`.
   - **Reject** the submission: Strictly requires a non-empty, clear rejection reason explaining why the evidence was rejected. Transitions status to `rejected` and records `rejection_reason`, `reviewed_at`, and `reviewed_by`.
4. All verification mutations are server-authorized; client-controlled identifier spoofing is rejected.

## BR-084 — Scorecard resubmission policy (Assumption A-023)

1. When a submission is rejected, the winning entry is not forfeited.
2. The subscriber is notified via their dashboard with the administrator's exact rejection reason and is provided an upload form to submit updated proof.
3. Resubmission safely replaces the evidence file reference, clears the old rejection reason, updates `submitted_at`, and transitions verification status back to `proof_submitted`.

## BR-085 — Payment state progression invariant

1. Winner payment follows the PRD states: **Pending → Paid**.
2. **Server-Side Invariant:** `verification_status === 'approved'` must be satisfied before `payout_status` can transition to `paid`.
3. Payout progression is strictly prohibited if verification status is `pending`, `proof_submitted`, or `rejected`.
4. Only an authorized administrator can mark payout as Paid.
5. **Administrative Safety Constraint:** `Paid` represents an explicit administrative disbursement record. No automated bank/ACH transfer integration is claimed.

## BR-086 — Evidence confidentiality & Time-limited signed URL access

1. The `winner-proofs` bucket is strictly private (`public = false`). Direct public URL access is blocked.
2. Evidence is viewed exclusively through server-authorized, time-limited signed URLs (1-hour expiry).
3. Access is strictly scoped to the winning subscriber (`user_id = auth.uid()`) and authorized administrators. Any other user is denied access.

---

# 9. User Dashboard Rules

## BR-090 — Subscription information

The dashboard must expose:

- subscription status
- active/inactive state
- renewal date

## BR-091 — Score management

The dashboard must provide:

- score entry
- score editing

## BR-092 — Charity information

The dashboard must display:

- selected charity
- contribution percentage

## BR-093 — Participation

The dashboard must display:

- draws entered
- upcoming draws

## BR-094 — Winnings

The dashboard must display:

- total won
- current payment status

---

# 10. Administrator Rules

## BR-100 — User management

Administrators can:

- view/edit user profiles
- edit golf scores
- manage subscriptions

## BR-101 — Draw management

Administrators can:

- configure draw logic
- select random vs algorithmic logic
- run simulations
- publish results

## BR-102 — Charity management

Administrators can:

- add charities
- edit charities
- delete charities
- manage charity content
- manage charity media

## BR-103 — Winner management

Administrators can:

- view the full winners list
- verify submissions
- mark payouts as completed

## BR-104 — Executive Reporting & Analytics (PRD § 11.05 — Phase 7 Verified)

Administrators have exclusive access to the reporting control surface (`/admin/reports`):

1. **Subscriber Growth & Cohort Breakdown:**
   - Authoritative distinction: Current snapshot counts (active vs inactive/lapsed) are explicitly separated from historical registration trends.
   - Monthly trend: Aggregated by subscriber account creation timestamps within UTC boundaries.
2. **Monthly Draw History & Audit Ledger:**
   - Reports all published monthly draws with draw number, cycle month, mode (random vs algorithmic), participant count, winning 5 numbers, tier allocations (40%, 35%, 25%), winner counts, jackpot rollover in/out, and lower-tier unclaimed funds.
   - Unpublished drafts are excluded from general reports to preserve confidentiality.
3. **Charity Contribution Reporting:**
   - Partner directory breakdown with associated member counts and average contribution percentages.
   - **Accounting Separation Mandate:** Direct subscription charity donations (&ge;10% floor) and unclaimed prize dispositions (unwon 4/3-match funds under TA-006) are reported in independent columns and never blended into a single ambiguous figure.
4. **Financial Summary Ledger:**
   - Integer subunit precision (pence) preventing floating-point rounding errors.
   - Explicit currency designation: GBP (£).
   - Clear disclosure of temporary commercial parameters (A-020 / TA-001–TA-006).
   - Reconciled balance sheet covering subscription revenue basis, 30% MER prize pool contribution, gross draw pools, tier allocations, rollovers, pending winnings, paid winnings, and charity distributions.
5. **UTC Date Filtering:**
   - Bounded queries across Current Month, Previous Month, Last 3 Months, Last 6 Months, Last 12 Months, and All Time evaluated using UTC timestamps.
6. **Server-Side Authorization Barrier:**
   - Reporting queries and actions are strictly restricted to authenticated administrators (`auth.profile.role === 'admin'`). Unauthenticated users and normal subscribers receive access denied errors.

---

# 11. UI / UX Business Rules

## BR-110 — Charity-first positioning

The product experience must lead with charitable impact rather than sport.

## BR-111 — Avoid traditional golf visual language

The primary design language must not rely on:

- fairways
- plaid
- club imagery
- traditional golf clichés

## BR-112 — Homepage communication

The homepage must communicate:

- what users do
- how users win
- charity impact
- the call to action

## BR-113 — Motion

Use subtle transitions and micro-interactions throughout the experience.

## BR-114 — Subscription CTA

The subscription button and flow must be prominent and clear.

---

# 12. Mandatory Delivery Rules

## BR-120 — Live website

The completed platform must have a publicly accessible deployed URL.

## BR-121 — User panel

The user panel must support test credentials and functional:

- signup
- login
- score entry
- dashboard

## BR-122 — Admin panel

The admin panel must support credentials and functional:

- user management
- draw system
- charities
- winner verification
- reports and analytics
- subscription operations

## BR-105 — End-to-End System Integrity & Operational Hardening

All primary user journeys (visitor signup, subscriber score management, monthly draw matching, winner verification, administrative governance, and subscription billing) must function as a coherent, integrated platform. Cross-module invariants (statutory 10% charity floor, rolling-5 score pool, 40/35/25 tier allocations, private winner proof storage, integer pence arithmetic, and server-side RBAC) must be enforced across all UI routes and server actions.

## BR-123 — Database

The application must use a connected backend/database with a proper schema.

## BR-124 — Source code

The final source code must be:

- clean
- structured
- well-commented

## BR-125 — Deployment environment

The PRD requires:

- a new Vercel account rather than a personal/existing account;
- a new Supabase project rather than a personal/existing project;
- correctly configured environment variables.

---

# 13. Data Integrity Rules

## BR-130 — Historical draw data

Published draw outcomes must be retained for historical display and verification.

## BR-131 — Historical winner data

Winner and payout records should remain traceable to their corresponding draw.

## BR-132 — Historical charity contributions

Contribution records should remain traceable to the relevant charity and subscription/payment context.

## BR-133 — No silent historical mutation

Administrative edits must not silently rewrite historical financial, draw, winner, or contribution records in a way that destroys auditability.

> This is an implementation/data-integrity principle. The PRD requires reporting, prize calculations, winner verification, and payout tracking but does not define a complete audit-log specification.

---

# 14. Security & Authorization Rules

## BR-140 — Role boundaries

Public visitors, subscribers, and administrators must receive only the capabilities assigned to their role.

## BR-141 — Admin authorization

Admin capabilities must be protected by server-side authorization.

## BR-142 — User isolation

A subscriber must not be able to access or modify another subscriber's private account information through normal user operations.

## BR-143 — Sensitive operations

Operations involving:

- draw publication
- winner verification
- payout completion
- user administration
- subscription administration

must be protected by appropriate authorization.

---

# 15. Validation Rules

## BR-150 — Frontend validation

The UI should provide immediate feedback for invalid user input.

## BR-151 — Backend validation

The backend must independently validate business-critical input.

## BR-152 — Database constraints

Where appropriate, database-level constraints should enforce rules such as:

- score range
- one score per user/date
- valid relationships
- valid state transitions

---

# 16. State Transition Principles

The following state models are directly supported by the PRD or represent implementation structure around PRD requirements.

## Subscription

```text
Active
  ↓
Renewed
  ↓
Active

Active
  ↓
Cancelled
  ↓
Inactive/Lapsed
```

Exact provider-specific subscription states must follow the chosen payment provider.

## Winner payment

```text
Pending → Paid
```

## Winner verification

```text
Winner
  ↓
Proof submitted
  ↓
Admin review
  ↓
Approved / Rejected
```

The PRD explicitly requires approval/rejection but does not specify all intermediate states.

---

# 17. Open Business Decisions

The following are intentionally NOT treated as finalized PRD rules.

### OBR-001 — Exact prize-pool percentage of subscription

The PRD says a fixed portion of each subscription contributes to the prize pool but does not state the percentage.

### OBR-002 — Exact algorithmic draw formula

The PRD says weighting is based on score frequency but does not define the formula.

### OBR-003 — Draw eligibility cutoff

The PRD does not specify the exact time/date at which subscription and score eligibility is locked for a monthly draw.

### OBR-004 — Score eligibility relationship to draw

The PRD defines score entry and draw logic but does not fully specify how the five retained scores map mathematically to the three-number/four-number/five-number matching mechanism.

### OBR-005 — Winner proof rejection/resubmission policy

The PRD states approve/reject but does not specify whether or how rejected winners may resubmit proof.

### OBR-006 — Charity change timing

The PRD specifies charity selection at signup but does not define all rules for changing a selected charity after signup.

### OBR-007 — Payment failure behavior

The PRD requires subscription lifecycle handling but does not define every payment-failure state and grace period.

These decisions must be resolved/documented before the affected functionality is considered final.

---

# 18. Rule Implementation Standard

For every business rule:

1. Identify the rule ID.
2. Implement the rule in the appropriate application layer.
3. Enforce critical constraints server-side.
4. Add automated tests where practical.
5. Test relevant edge cases.
6. Record the implementation location in `traceability.md`.
7. Do not mark the rule verified until it has been validated.

---

# 19. Business Rule Completion Standard

A rule is complete only when:

- the expected behavior exists;
- invalid behavior is prevented;
- relevant error states are handled;
- relevant edge cases are tested;
- authorization is correct where applicable;
- the implementation is traceable to the PRD.

---

## End of Business Rules
