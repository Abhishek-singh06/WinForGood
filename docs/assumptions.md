# Digital Heroes — Assumptions & Open Decisions

**Source of truth:** Digital Heroes PRD (Level 1), Version 1.0, March 2026.

## Purpose

This document separates:

1. What the PRD explicitly specifies.
2. What can reasonably be treated as an implementation detail.
3. What remains ambiguous and must be decided/documented before implementation.

**Critical rule:** An assumption must never be presented as though it were explicitly required by the PRD.

---

# 1. Assumption Governance

## A-001 — PRD precedence

The PRD remains the single source of truth.

If an assumption conflicts with an explicit PRD requirement, the PRD wins.

## A-002 — Minimal assumption principle

When the PRD is silent, choose the smallest implementation decision necessary to make the specified feature work.

Do not add unrelated product behavior.

## A-003 — Document ambiguity

Any unresolved business ambiguity must be recorded here before the affected feature is considered final.

## A-004 — Reversible decisions

Where possible, architecture should allow an unresolved implementation decision to be changed without rewriting unrelated functionality.

---

# 2. Explicitly Specified — Not Assumptions

The following are directly specified by the PRD and must not be treated as optional assumptions:

- Three user roles: public visitor, registered subscriber, administrator.
- Monthly and yearly subscription plans.
- Yearly plan is discounted.
- Stripe or equivalent PCI-compliant payment provider.
- Non-subscribers have restricted access.
- Subscription lifecycle includes renewal, cancellation, and lapsed states.
- Real-time subscription status check on authenticated requests.
- Stableford scores from 1–45.
- Score requires a date.
- Only latest five scores are retained.
- One score per date.
- Existing scores can be edited/deleted.
- New score replaces the oldest retained score.
- Reverse chronological score display.
- Monthly draw cadence.
- 5-number, 4-number, and 3-number match tiers.
- Random and algorithmic draw modes.
- Algorithmic mode is weighted by score frequency.
- Admin-controlled publishing.
- Simulation before publishing.
- 5-number jackpot rollover when unclaimed.
- Prize pool shares of 40%, 35%, and 25% for the three tiers.
- Equal split among multiple winners in the same tier.
- Charity selection at signup.
- Minimum charity contribution of 10% of subscription fee.
- User may voluntarily increase charity percentage.
- Independent donation option.
- Charity directory with search/filtering.
- Charity profiles with description, images, and upcoming events.
- Featured charity on homepage.
- Winner proof upload using a golf-platform score screenshot.
- Admin approval/rejection.
- Payment states Pending → Paid.
- Required subscriber dashboard modules.
- Required admin dashboard control surfaces.
- Charity-first, modern, motion-enhanced UX.
- Avoidance of traditional golf visual clichés.
- Required live website, user panel, admin panel, database, and source code.
- New Vercel account and new Supabase project for deployment.
- Required testing areas and evaluation criteria.

---

# 3. Open Decision Register

## A-010 — Exact percentage of subscription allocated to prize pool

### PRD says

A fixed portion of each subscription contributes to the prize pool. Distribution within the prize pool is pre-defined: 5-number match (40%, rollover: yes), 4-number match (35%, rollover: no), 3-number match (25%, rollover: no).

### PRD does not say

The exact numerical percentage $P\%$ (or fixed monetary amount) of subscription revenue entering the prize pool.

### Decision status

**STRUCTURALLY SPECIFIED (BR-060) — REQUIRES PRODUCT OWNER INPUT FOR NUMERICAL PARAMETER $P\%$**

### Implementation rule

1. Do not hardcode an assumed numerical percentage in production logic until the Product Owner specifies the value $P\%$.
2. The mathematical calculation engine and interfaces (`IPrizePoolCalculator`) must support a configurable allocation parameter $P \in (0, 100 - C_{\min}]$, where $C_{\min} \ge 10\%$ is the statutory minimum charity allocation.
3. The structural formula is established:
   $$\text{Gross New Prize Pool} = \sum_{i \in \text{ActiveSubscribers}} \left( \text{MonthlyEquivalentRate}(i) \times P \right)$$
   $$\text{Total 5-Match Tier Amount} = (\text{Gross New Pool} \times 0.40) + \text{JackpotRolloverIn}$$
   $$\text{Total 4-Match Tier Amount} = \text{Gross New Pool} \times 0.35$$
   $$\text{Total 3-Match Tier Amount} = \text{Gross New Pool} \times 0.25$$
4. Yearly plans contribute $1/12$ of the annualized subscription list price per monthly draw cycle to avoid cash-flow distortion.
5. Voluntary charity increases beyond the 10% floor do not reduce the prize pool allocation (prize pool contribution is decoupled from charity variance).

---

# 4. Algorithmic Draw Formula

## A-011 — Exact algorithm

### PRD says

The algorithmic draw is weighted by score frequency.

### PRD does not define

- weighting formula;
- probability calculation;
- normalization;
- randomization method;
- seed handling;
- tie-breaking;
- treatment of historical draws;
- exact mapping from retained scores to draw numbers.

### Decision status

**RESOLVED (Decision #2 — Algorithmic Weighting Formula: RESOLVED)**

### Resolved Rule (BR-048)

1. **Population:** Frequency computed from all eligible participants' retained scores in the current draw cycle.
2. **Weight Formula:** Additive Laplace smoothing $W(n) = f(n) + 1$ for all integers $n \in \{1, 2, \dots, 45\}$.
3. **Weight Direction:** Higher frequency yields higher probability mass.
4. **Zero-Frequency Fallback:** Non-submitted scores receive baseline weight $W(n) = 1$, ensuring 5 distinct numbers can always be drawn without replacement even in sparse cohorts.
5. **Sampling Without Replacement:** Sequential weighted selection across 5 steps with dynamic probability re-normalization over remaining candidates.
6. **Reproducibility:** Accepts audited seed for verifiable replay in testing and compliance.

---

# 5. Draw Eligibility

## A-012 — Draw eligibility when fewer than 5 scores exist & cutoff timing

### PRD says

- Draws occur on a monthly cadence (PRD § 06).
- Users enter their latest 5 golf scores, with rolling retention of the latest 5 (PRD § 05).
- Draws support 5-number, 4-number, and 3-number matches (PRD § 06).
- The prize pool is auto-calculated based on active subscriber count (PRD § 07).

### PRD does not specify

- Whether draw eligibility requires exactly 5 scores, at least 1 score, at least 3 scores, or if any active subscriber enters.
- Whether an active subscriber with 0 scores receives an empty ticket or is excluded from `draw_entries`.
- Whether a subscriber excluded for having < 5 scores has their subscription fee included or excluded from the prize pool.
- The calendar cutoff timestamp and timezone for score entry relative to the monthly draw.

### Decision status

**OPEN (REQUIRES PRODUCT OWNER DECISION ON ELIGIBILITY THRESHOLD MODEL)**

### Implementation rule

1. Do not hardcode a score threshold in production draw execution logic until the Product Owner selects an eligibility policy.
2. The strategy interface `IDrawEligibilityResolver` (`src/lib/draws/types.ts`) decouples this rule:
   `isEligible(scoreCount: number, hasActiveSubscription: boolean): boolean`
3. Ticket construction and matching semantics under Decision #1 (`BR-047`) and Decision #2 (`BR-048`) naturally support partial tickets ($0 \le K \le 5$) without mathematical contradiction:
   - 0 scores $\rightarrow$ 0 matches.
   - 1–2 scores $\rightarrow$ max matches 1–2 (cannot reach 3-match tier).
   - 3 distinct scores $\rightarrow$ can match 3 numbers (eligible for 3-match tier).
   - 4 distinct scores $\rightarrow$ can match 3 or 4 numbers (eligible for 3-match and 4-match tiers).
   - 5 distinct scores $\rightarrow$ eligible for all tiers (3, 4, 5).
4. Snapshot timing: Scores are frozen at the moment draw simulation/publication is initiated by the administrator. Scores logged after snapshot do not alter the current draw.

---

# 6. Score-to-Draw Mapping

## A-013 — Relationship between five scores and three match tiers

### PRD says

Users retain their latest five Stableford scores and the draw supports 5-number, 4-number, and 3-number matches.

### PRD does not fully specify

- how the five scores become draw numbers;
- whether scores themselves are the five numbers;
- whether each score is transformed;
- whether ordering matters;
- how duplicate numbers are handled;
- exact matching semantics.

### Decision status

**RESOLVED (Decision #1 — Score-to-Draw Mapping: RESOLVED)**

### Resolved Rule (BR-047)

1. **Number Domain:** 1–45 (matches Stableford range). Winning numbers are 5 distinct integers drawn from 1–45.
2. **Ticket Construction:** Direct score identity. The participant's 5 retained scores form their draw ticket.
3. **Ordering:** Unordered / set-based intersection. Matching counts how many drawn numbers exist in the ticket.
4. **Duplicates:** Raw duplicates are preserved on ticket without synthetic modification. Since winning numbers are distinct, matching is computed against unique hits. Players with duplicates have fewer distinct numbers in play and cannot achieve 5 matches.
5. **Tickets per User:** Exactly one (1) ticket per active subscriber per draw cycle.
6. **Canonical Presentation:** Sorted ascending for deterministic display and matching.
7. **Snapshot:** Snapshotted into `draw_entries` at draw execution time.

---

# 7. Winner Proof Rejection & Resubmission

## A-014 — Resubmission after rejection (Documented Implementation Assumption)

### PRD says

Admin can approve or reject a winner proof (PRD § 09).

### PRD does not specify

- whether rejection allows resubmission;
- maximum number of attempts;
- rejection reason requirements;
- deadline for resubmission.

### Decision status

**IMPLEMENTATION ASSUMPTION (A-014 / A-023) — OPERATIONAL IN PHASE 6**

### Implementation Rule

1. When an administrator rejects a winner's evidence submission:
   - A clear, non-empty rejection reason must be recorded (`rejection_reason`).
   - The win is NOT forfeited or cancelled.
   - The subscriber sees the rejection reason on `/dashboard/winnings` alongside an option to upload updated evidence.
2. Resubmission flow:
   - Winner uploads updated evidence (`submitWinnerProofAction`).
   - The new file reference safely updates `proof_file_url`.
   - The previous `rejection_reason` is cleared (`null`).
   - `submitted_at` is updated to the current timestamp.
   - `verification_status` transitions from `rejected` back to `proof_submitted`.
3. No arbitrary deadlines or attempt limits are introduced without explicit Product Owner instruction.

---

## A-023 — Administrative Payout Progression & Disbursement Separation

### PRD says

Winner payment follows the states: **Pending → Paid** (PRD § 09).

### PRD does not specify

Automated bank transfer, payout gateway APIs, or disbursement webhooks.

### Implementation Rule

1. Payout status may only transition to `paid` once `verification_status === 'approved'`.
2. `Paid` is strictly an administrative disbursement ledger status set by an authorized administrator upon verifying payout execution outside the system.
3. No automated bank/ACH transfer integration is claimed.

---

# 8. Charity Changes After Signup

## A-015 — Changing selected charity

### PRD says

Users select a charity at signup.

### PRD does not specify

- whether charity can be changed later;
- how often it can be changed;
- when a change becomes effective;
- treatment of already-created contributions.

### Decision status

**OPEN**

### Implementation rule

Signup charity selection must be implemented.

Post-signup charity modification behavior is intentionally unspecified/pending the PRD decision. The implementation merely displays the user's verified signup selection and avoids assuming an arbitrary modification rule. Do NOT describe the behavior as "locked" unless the PRD explicitly requires that behavior.

---

# 9. Charity Contribution Calculation

## A-016 — Contribution calculation basis

### PRD says

Minimum contribution is 10% of subscription fee and users can increase the percentage.

### PRD does not specify

- whether the percentage applies before or after taxes;
- handling of discounts;
- handling of refunds;
- currency rounding;
- whether contribution is calculated per invoice or per subscription period.

### Decision status

**OPEN**

### Implementation rule

The final calculation convention must be documented before financial calculations are finalized.

---

# 10. Independent Donation

## A-017 — Independent donation mechanics

### PRD says

Independent donation is available and is not tied to gameplay.

### PRD does not specify

- donation page/flow;
- minimum donation;
- payment provider details beyond the general payment requirement;
- receipt behavior;
- whether independent donations affect reports.

### Decision status

**OPEN**

### Implementation rule

Do not invent detailed donation behavior beyond the PRD.

---

# 11. Subscription Payment Failure

## A-018 — Payment failure lifecycle

### PRD says

The platform handles renewal, cancellation, and lapsed-subscription states.

### PRD does not specify

- retry schedule;
- grace period;
- exact payment-failure states;
- draw eligibility during payment recovery;
- access during grace periods.

### Decision status

**OPEN**

### Implementation rule

Use the selected payment provider's documented lifecycle only after deciding how those states map to Digital Heroes product states.

---

# 12. Subscription Cancellation

## A-019 — Cancellation timing

### PRD says

Cancellation must be handled.

### PRD does not specify

- immediate cancellation vs end-of-period cancellation;
- whether access continues through paid period;
- effect on future draws;
- treatment of charity contributions.

### Decision status

**OPEN**

---

# 13. Currency & Subscription Pricing

## A-020 — Currency & commercial subscription pricing (Decision #5 Specification)

### PRD says

- Platform provides monthly and yearly subscription plans (PRD § 04).
- The yearly plan has a discounted rate (PRD § 04).
- Payments require a PCI-compliant payment provider such as Stripe (PRD § 04).
- Minimum charity contribution is 10% of subscription fee (PRD § 08.1).
- Prize pool is calculated from active subscriber subscription revenue (PRD § 07).

### PRD does not specify

- Currency: ISO 4217 currency code (e.g. GBP, USD, EUR).
- Nominal Monthly Price: exact numerical currency amount (e.g. £10.00, $15.00).
- Nominal Yearly Price: exact numerical currency amount.
- Yearly Discount Formula: whether percentage discount, flat deduction, or "X months free".
- Tax Treatment: tax-inclusive (e.g. UK/EU VAT) vs. tax-exclusive (e.g. US sales tax).
- Fee Treatment: whether charity and prize allocations are calculated on gross customer charge or net of Stripe payment processing fees.

### Decision status

**STRUCTURALLY SPECIFIED (BR-016) — REQUIRES PRODUCT OWNER INPUT FOR COMMERCIAL PRICING PARAMETERS**

### Implementation rule

1. Do not hardcode fictitious pricing or currency amounts in application code, UI cards, or database schema.
2. Pricing and Stripe price IDs must remain environment-driven and configuration-driven via `PricingConfig` (`src/lib/subscriptions/types.ts`).
3. Monthly Equivalent Rate (MER) established by Decision #3 ([BR-060](file:///E:/VS%20CODE%20MAIN/MINI%20PROJECTS/HERO%20HACKATHON/docs/business-rules.md#L214-L245)) governs accounting:
   $$\text{MER}_{\text{monthly}} = \text{MonthlyPrice}$$
   $$\text{MER}_{\text{yearly}} = \frac{\text{YearlyPrice}}{12}$$
4. When Stripe environment variables are absent, public pricing displays a configuration-required state rather than dummy amounts.
5. Exact commercial values (`CURRENCY`, `MONTHLY_PRICE_PENCE`, `YEARLY_PRICE_PENCE`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`) require formal Product Owner specification.

---

# 14. Prize Pool Funding

## A-021 — Funding amount

### PRD says

A fixed portion of each subscription contributes to the prize pool.

### PRD does not specify

- exact funding percentage;
- exact currency treatment;
- refund treatment;
- tax treatment.

### Decision status

**OPEN**

This must be resolved before real-money prize calculations are considered production-ready.

---

# 15. Unclaimed Lower-Tier Prizes

## A-022 — 4-number and 3-number no-winner treatment (Decision #8 Specification)

### PRD explicitly says

- 5-number match: 40% of prize pool. Rollover: **Yes — jackpot** carries forward if unclaimed (PRD § 07).
- 4-number match: 35% of prize pool. Rollover: **No** (PRD § 07).
- 3-number match: 25% of prize pool. Rollover: **No** (PRD § 07).

### PRD does not explain

The financial and accounting destination of the allocated funds when zero winners occur in the 4-number tier ($W_4 = 0$, 35%) or the 3-number tier ($W_3 = 0$, 25%).

### Decision status

**STRUCTURALLY SPECIFIED (BR-065) — REQUIRES PRODUCT OWNER INPUT FOR UNCLAIMED FUND DESTINATION**

### Implementation rule

1. The platform must never automatically roll over 3-number or 4-number funds to the same tiers in the next cycle, as this is strictly forbidden by PRD § 07 ("Rollover: No").
2. The platform must record the exact allocated amount, winner count, and unclaimed balance in `draw_tier_allocations` for auditability regardless of final accounting destination.
3. Candidate accounting destinations awaiting Product Owner selection:
   - **Model A (Retained Platform Operating Revenue):** Unclaimed lower-tier funds revert to platform operational margin.
   - **Model B (Charity Redistribution):** Unclaimed lower-tier funds are contributed to the platform's charity pool.
   - **Model C (Next-Month Gross Pool Boost):** Unclaimed funds are injected into the subsequent draw cycle's gross pool.
   - **Model D (Intra-Draw Cascade):** Unclaimed 4-match funds cascade to 3-match winners or 5-match jackpot within the same draw.
   - **Model E (Escrow Promotional Reserve):** Unclaimed funds accumulate in a designated reserve for special community events.
4. Production payout logic must not execute disposition until the Product Owner provides written policy.

---

# 16. Multiple Winner Rounding

## A-023 — Monetary rounding (Integer-cent remainders)

### PRD says

Prizes are split equally among multiple winners in the same tier (PRD § 07).

### PRD does not specify

How indivisible currency fractions (e.g. 1 penny/cent remainder when dividing £100 among 3 winners) are handled.

### Resolved Accounting Rule

Equal division uses integer-cent floor truncation (`floor(tier_amount / winner_count)`). The remaining indivisible cents (`tier_amount - (prize_per_winner * winner_count)`) are retained in the platform prize ledger to prevent currency creation or fraction loss.

### Decision status

**RESOLVED (Integer-Cent Floor Truncation with Ledger Retention BR-063)**

---

# 17. Draw Simulation

## A-024 — Simulation persistence

### PRD requires

Simulation before publishing.

### PRD does not specify

Whether simulations should be:

- saved permanently;
- saved temporarily;
- reproducible from a seed;
- compared against previous simulations.

### Decision status

**OPEN**

A reproducible simulation approach is preferable for testing, but this is an implementation recommendation, not a PRD requirement.

---

# 18. Published Draw Modification

## A-025 — Editing published draws

### PRD requires admin publishing and historical draw operation.

### PRD does not explicitly specify

Whether an already-published draw can ever be corrected.

### Decision status

**OPEN**

Normal user/admin workflows should not silently modify published historical results.

If a correction mechanism is required, it should be explicitly documented and auditable.

---

# 19. Charity Deletion

## A-026 — Historical charity records

### PRD gives administrators the ability to delete charities.

### PRD does not specify

How historical contributions should behave after deletion.

### Decision status

**OPEN**

The data model should preserve historical contribution references.

A soft-delete/archive approach may be considered, but it should be documented as an implementation decision rather than claimed as a PRD requirement.

---

# 20. Admin Auditability

## A-027 — Audit log scope

### PRD requires substantial administrative control.

### PRD does not explicitly require

A formal audit log.

### Decision status

**IMPLEMENTATION CONSIDERATION**

Auditability is strongly relevant to safe administrative operations, but a complete audit-log specification is not present in the PRD.

If implemented, define its scope separately.

---

# 21. Exact Pricing

## A-028 — Subscription prices

The PRD specifies plan types but does not provide exact prices.

### Decision status

**OPEN**

Do not invent production prices.

---

# 22. Currency

## A-029 — Currency

The PRD does not explicitly define the platform currency in the supplied requirements.

### Decision status

**OPEN**

Do not assume a currency solely from the document's origin.

---

# 23. Draw Display

## A-030 — Public draw presentation

The PRD requires users to understand draw mechanics and view participation/results, but it does not define the exact visual presentation.

### Decision status

**DESIGN DECISION**

UI can be designed freely as long as it communicates the required information and does not change the underlying business rules.

---

# 24. Notification System

## A-031 — Notifications

The supplied PRD does not explicitly define an email, SMS, push, or in-app notification system.

### Decision status

**NOT SPECIFIED**

Do not treat notifications as a mandatory feature unless a later requirement adds them.

Winner communication can be represented within the required user experience without assuming a particular external notification provider.

---

# 25. Exact Analytics

## A-032 — Analytics depth

The PRD explicitly requires:

- total users;
- total prize pool;
- charity contribution totals;
- draw statistics.

It does not define additional analytics metrics.

### Decision status

**REQUIRED CORE + OPTIONAL EXTENSION**

Implement the four required reporting areas first.

Additional metrics must not distract from or replace the required reports.

---

# 26. Technical Stack

## A-033 — Framework/library choice

The PRD does not fully prescribe a frontend framework, backend framework, or component library in the supplied requirements.

### Decision status

**IMPLEMENTATION DECISION**

The chosen stack must satisfy:

- required functionality;
- security;
- maintainability;
- scalability;
- deployment constraints;
- testing requirements.

Do not claim that a specific framework is required by the PRD unless separately instructed.

---

# 27. Database Technology

## A-034 — Supabase

The PRD identifies Supabase as an example for the backend/database.

It also explicitly requires a new Supabase project under the deployment constraints.

### Decision status

**DEPLOYMENT REQUIREMENT**

A new Supabase project is required by the supplied PRD deployment section.

The exact internal schema and supporting architecture remain implementation decisions.

---

# 28. Deployment

## A-035 — Vercel

The PRD requires deployment to a new Vercel account rather than a personal/existing account.

This is a concrete deployment requirement, not an assumption.

---

# 29. Visual Design

## A-036 — Exact palette

The PRD specifies the design direction but does not prescribe an exact color palette.

### Decision status

**DESIGN DECISION**

The palette must support:

- modernity;
- emotional engagement;
- charity-first storytelling;
- readability;
- accessibility.

Do not treat any sample color from the PRD document as a mandatory production token unless explicitly specified.

---

# 30. Typography

## A-037 — Exact fonts

The PRD does not specify production fonts.

### Decision status

**DESIGN DECISION**

Choose typography consistent with the required visual direction and accessibility goals.

---

# 31. Motion

## A-038 — Animation scope

The PRD requires subtle transitions and micro-interactions.

It does not prescribe exact animations.

### Decision status

**DESIGN DECISION**

Animations should communicate state and hierarchy without becoming distracting.

---

# 32. Assumption Approval Workflow

Before an open decision becomes implementation behavior:

```text
Open ambiguity
      ↓
Document in assumptions.md
      ↓
Identify affected requirements
      ↓
Choose / receive approved interpretation
      ↓
Document decision
      ↓
Update business-rules.md if needed
      ↓
Implement
      ↓
Test
      ↓
Update traceability.md
```

---

# 33. Assumption Status

Use these statuses:

- `OPEN`
- `PROPOSED`
- `APPROVED`
- `IMPLEMENTED`
- `VERIFIED`
- `REJECTED`

Do not treat `PROPOSED` as `APPROVED`.

---

# 34. Decision Documentation Standard

For every resolved assumption, record:

```text
Decision ID
Question
PRD requirement involved
Options considered
Chosen interpretation
Reason
Affected screens
Affected business logic
Affected data model
Tests required
Approval/status
```

---

# 35. Full PRD Section Coverage

| PRD Section | Assumption Coverage |
|---|---|
| § 01 Project overview | Product boundaries |
| § 02 Core objectives | Scope and decision boundaries |
| § 03 User roles | Role assumptions |
| § 04 Subscription & payment | Pricing, lifecycle, payment ambiguities |
| § 05 Score management | Score/draw relationship |
| § 06 Draw & reward system | Algorithm, eligibility, simulation |
| § 07 Prize pool logic | Funding, rounding, lower-tier treatment |
| § 08 Charity system | Contribution and charity lifecycle |
| § 09 Winner verification | Rejection/resubmission |
| § 10 User dashboard | Display decisions |
| § 11 Admin dashboard | Auditability and operational decisions |
| § 12 UI / UX requirements | Palette, typography, motion, presentation |
| § 13 Technical requirements | Stack and architecture boundaries |
| § 14 Scalability considerations | Reversible/extensible decisions |
| § 15 Mandatory deliverables | Deployment decisions |
| § 16 Evaluation criteria | Decision documentation and traceability |

---

# 36. Final Rule

**Never convert an unknown into a hidden requirement.**

If Antigravity encounters a question not answered by the PRD:

1. Stop the affected decision.
2. Record the question.
3. Identify whether it affects product, business logic, data, security, or UX.
4. Propose a minimal implementation interpretation if useful.
5. Mark it `PROPOSED`, not `APPROVED`.
6. Continue only where the ambiguity does not block the current work.

This keeps the implementation faithful to the PRD while making ambiguity visible and manageable.

---

# 37. Temporary Product Owner Assumptions (TA-001 — TA-006) — Phase 5 Production Draw Engine

The following values are **TEMPORARY PRODUCT OWNER IMPLEMENTATION ASSUMPTIONS**. They are NOT claimed to come from the Digital Heroes PRD (Level 1).pdf. They exist to unlock end-to-end execution, accounting, testing, and verification for the Phase 5 Draw Engine while formal commercial parameters are pending. All values are strictly isolated in `src/lib/draws/config.ts`.

| ID | Parameter | Temporary Value | Unit / Format | PRD Reference | Structural Governance |
|---|---|---|---|---|---|
| **TA-001** | Gross Prize Pool Percentage ($P\%$) | 30% | `PRIZE_POOL_PERCENTAGE = 30` | § 07 (Prize Pool Logic) | `BR-060`, `IPrizePoolCalculator` |
| **TA-002** | Draw Eligibility Model | Model B: Dynamic Partial Tickets | 0–5 retained scores enter | § 06 (Draw System) | `BR-049`, `IDrawEligibilityResolver` |
| **TA-003** | Platform Currency | GBP (£) | `'GBP'` | § 04, § 07 | `BR-016`, Integer Subunits (Pence) |
| **TA-004** | Monthly Subscription Price | 1000 pence (£10.00) | Integer pence | § 04 (Subscription) | `BR-016`, `TEMPORARY_ASSUMPTIONS` |
| **TA-005** | Yearly Subscription Price | 10000 pence (£100.00) | Integer pence (~16.67% discount) | § 04 (Subscription) | `BR-016`, `TEMPORARY_ASSUMPTIONS` |
| **TA-006** | Unclaimed Lower-Tier Disposition | Model B: Charity Disposition | Assigned to charity pool ledger | § 07 (Unclaimed Tiers) | `BR-065`, `draw_tier_allocations` |

---

## End of Assumptions & Open Decisions

