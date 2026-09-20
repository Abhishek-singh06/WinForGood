# Digital Heroes — Edge Cases

**Source of truth:** Digital Heroes PRD (Level 1), Version 1.0, March 2026.

This document defines boundary conditions, invalid states, failure scenarios, and operational edge cases that must be considered during implementation and testing.

**Important:** An edge case listed here does not automatically define a new product rule. Where the PRD does not specify the expected outcome, the case is marked as requiring a documented decision.

---

# 1. Edge-Case Handling Standard

Every major feature should account for:

```text
Normal input
Invalid input
Boundary input
Empty state
Duplicate input
Concurrent/repeated action
Authorization failure
External-service failure
Persistence failure
Recovery
```

For each edge case, Antigravity should determine:

1. What happened?
2. What state must remain unchanged?
3. What should the user see?
4. What should the backend return?
5. Should the operation be retryable?
6. Should the event be logged?
7. Does the PRD define the behavior?
8. If not, record the decision in `assumptions.md`.

---

# 2. Public Visitor Edge Cases

## EC-001 — Visitor opens platform

Expected:

- Public content remains accessible.
- Protected subscriber functionality remains restricted.

## EC-002 — Visitor attempts protected subscriber feature

Expected:

- Do not expose protected data.
- Present an appropriate authentication/subscription path.

The exact UX is an implementation decision.

## EC-003 — Visitor opens charity directory with no charities

PRD requires a charity directory.

If no active charities exist:

```text
Empty directory
    ↓
Clear empty state
    ↓
No broken layout
```

The exact recovery CTA is a design decision.

## EC-004 — Charity search returns no results

Display a clear no-results state.

Do not display unrelated charities as though they matched the query.

---

# 3. Signup & Authentication Edge Cases

## EC-010 — Invalid signup input

Examples:

- missing required fields;
- invalid email format;
- invalid password according to chosen authentication provider.

Expected:

- inline validation;
- no incomplete account state unless the provider requires it.

## EC-011 — Existing account

If the authentication provider indicates an existing account:

- do not silently create a duplicate account;
- provide a clear recovery path.

## EC-012 — Failed authentication

Do not expose sensitive authentication details.

Provide a clear, recoverable error.

## EC-013 — Session expires

When an authenticated session expires:

```text
Protected request
      ↓
Authentication failure
      ↓
Re-authentication
```

The exact session behavior depends on the selected authentication implementation.

## EC-014 — User is authenticated but subscription is inactive

The user may remain authenticated while protected subscriber features are restricted according to the subscription rules.

Do not confuse:

```text
authenticated
```

with:

```text
active subscriber
```

---

# 4. Subscription Edge Cases

## EC-020 — Monthly payment succeeds

Expected:

- subscription becomes active according to payment-provider confirmation;
- user receives appropriate platform access.

## EC-021 — Yearly payment succeeds

Expected:

- yearly subscription is recorded;
- yearly plan is treated according to its configured discounted price.

## EC-022 — Payment fails

The PRD requires lifecycle handling but does not specify the complete payment-failure/grace-period behavior.

Status:

**OPEN DECISION**

Do not invent a grace period.

## EC-023 — Subscription renewal fails

Potential sequence:

```text
Renewal attempt
      ↓
Payment failure
      ↓
Provider lifecycle state
      ↓
Digital Heroes subscription state
```

The exact mapping must be documented.

## EC-024 — Subscription cancelled

The PRD requires cancellation handling.

It does not specify whether cancellation is:

- immediate;
- end-of-period.

Status:

**OPEN DECISION**

## EC-025 — Subscription becomes lapsed

Expected:

- subscription state reflects lapsed/inactive status;
- protected functionality follows the final access rule.

## EC-026 — Repeated payment webhook/event

If the payment provider sends the same event more than once:

- do not duplicate subscription records;
- do not duplicate financial effects;
- process idempotently.

This is an implementation reliability requirement.

## EC-027 — Payment provider unavailable

Expected:

- do not falsely show a successful payment;
- preserve the user's current safe state;
- communicate that the operation could not be completed.

---

# 5. Score Input Edge Cases

## EC-030 — Score below minimum

Example:

```text
0
```

Expected:

- reject;
- explain valid range is 1–45.

## EC-031 — Score above maximum

Example:

```text
46
```

Expected:

- reject;
- explain valid range is 1–45.

## EC-032 — Non-integer score

Example:

```text
32.5
```

Expected:

- reject if the implementation requires integer Stableford scores.

The PRD describes scores as a 1–45 Stableford value but does not separately specify decimal behavior.

## EC-033 — Missing date

Expected:

- reject;
- require a date.

## EC-034 — Invalid date

Expected:

- reject malformed/unusable dates.

The exact date-format rule is an implementation decision.

## EC-035 — Duplicate date

Example:

```text
Existing: 2026-09-20 → 34
New:      2026-09-20 → 38
```

Expected:

- do not create a second score;
- allow the existing score to be edited or deleted.

## EC-036 — Sixth score

If five scores already exist:

```text
Five retained scores
       +
New score
       ↓
Oldest retained score removed/replaced
       ↓
Latest five remain
```

## EC-037 — Editing a score changes its date to an existing date

Example:

```text
Score A → 2026-09-20
Score B → 2026-09-21

Edit Score B date → 2026-09-20
```

Expected:

- reject the update;
- preserve one-score-per-date rule.

## EC-038 — Delete score

Expected:

- delete the selected score;
- remaining scores remain valid;
- no unrelated score is removed.

## EC-039 — Empty score history

Expected:

- clear empty state;
- score-entry CTA.

## EC-040 — Concurrent score creation

Two requests attempt to create a score for the same user/date.

Expected:

- database/business-rule enforcement prevents duplicate records;
- application handles the conflict cleanly.

---

# 6. Five-Score Rolling Edge Cases

## EC-050 — Fewer than five scores

Allowed.

The user can have fewer than five retained scores.

## EC-051 — Exactly five scores

Allowed.

No score should be removed until a new retained score is added.

## EC-052 — Sixth score is newest

Expected:

- newest score retained;
- oldest score removed.

## EC-053 — Score ordering after replacement

Expected:

```text
Newest
↓
...
↓
Oldest retained
```

No arbitrary ordering.

---

# 7. Charity Edge Cases

## EC-060 — No charities available during signup

The PRD requires charity selection at signup.

If no selectable charity exists:

**OPEN DECISION**

The product must not silently create an invalid charity selection.

## EC-061 — Contribution below 10%

Example:

```text
9%
```

Expected:

- reject;
- minimum is 10%.

## EC-062 — Contribution exactly 10%

Expected:

- accept.

## EC-063 — User increases contribution

Expected:

- accept a valid percentage above the minimum.

The maximum percentage is not specified by the PRD.

**OPEN DECISION**

## EC-064 — Invalid contribution percentage

Examples:

- negative percentage;
- malformed percentage;
- unsupported precision.

Expected:

- reject.

Exact precision is an implementation decision.

## EC-065 — Charity becomes unavailable

If a previously selected charity becomes inactive/deleted:

- preserve historical contribution references;
- do not silently rewrite historical records.

The user-facing replacement behavior is an open decision.

## EC-066 — Charity search with no results

Expected:

- explicit no-results state;
- ability to modify search/filter.

## EC-067 — Charity profile missing optional media

Expected:

- graceful fallback;
- layout must remain intact.

The PRD requires images as profile content but does not define missing-media behavior.

---

# 8. Draw Edge Cases

## EC-070 — No eligible participants

The PRD does not define the exact behavior.

**OPEN DECISION**

Do not fabricate a winner or prize distribution.

## EC-071 — One eligible participant

The draw must still follow the selected draw algorithm and documented eligibility rules.

## EC-072 — Multiple eligible participants

Expected:

- draw execution processes the eligible population;
- results are reproducible/testable according to the selected implementation.

## EC-073 — Random draw selected

Expected:

- random draw mode is used;
- result is recorded.

## EC-074 — Algorithmic draw selected

Expected:

- configured algorithmic logic is used;
- weighting follows the approved documented algorithm.

## EC-075 — Algorithmic formula missing

Do not implement an undocumented formula and call it PRD-compliant.

Stop the affected finalization step and resolve/document the ambiguity.

## EC-076 — Draw simulation produces result

Expected:

- simulation result is distinguishable from published result;
- simulation must not accidentally publish.

## EC-077 — Admin publishes without valid simulation

Whether publication requires a successfully completed simulation is not explicitly defined.

**OPEN DECISION**

## EC-078 — Repeated publish request

Expected:

- prevent accidental duplicate publication;
- preserve one authoritative published result.

## EC-079 — Draw execution interrupted

Expected:

- do not leave a partially calculated prize state;
- allow safe recovery/retry.

Implementation should use transactional/idempotent operations where appropriate.

---

# 9. Draw Eligibility Edge Cases

Draw eligibility is governed by BR-049 (Decision #4 Structural Specification):

## EC-080 — User subscribes shortly before draw

Expected:
- User is active (`subscriptions.status = 'active'`).
- If user activates before the administrator snapshot timestamp, they enter the draw cohort based on their scores at that moment.
- No arbitrary account-age waiting period exists.

## EC-081 — User becomes inactive shortly before draw

Expected:
- Active subscription is a mandatory prerequisite (BR-049).
- If status is `past_due`, `cancelled`, or `lapsed` at snapshot time, the user is excluded from `draw_entries`.

## EC-082 — User enters a score shortly before draw

Expected:
- Any valid score logged before the administrator initiates draw simulation/execution snapshot is included in the participant's retained score list.

## EC-083 — User enters score after eligibility cutoff

Expected:
- `draw_entries` are snapshotted immutably upon simulation/publication (BR-046, BR-049).
- Scores logged after this snapshot do not alter the current draw cycle and apply to subsequent monthly draws.

## EC-084 — User has fewer than five scores

Expected:
- Decision #4 establishes partial ticket mechanics: a ticket consists of retained scores ($0 \le K \le 5$).
- Set-intersection matching (BR-047) applies naturally without synthetic scores:
  - 0 scores: 0 matches.
  - 1–2 scores: max 1–2 matches (cannot reach 3-match tier).
  - 3 distinct scores: eligible for 3-match tier (25%).
  - 4 distinct scores: eligible for 3-match and 4-match tiers (25%, 35%).
  - 5 distinct scores: eligible for all tiers (3, 4, 5).
- Specific participation threshold (Model A: strict 5 vs Model B: dynamic partial vs Model C: $\ge 3$) is **STRUCTURALLY SPECIFIED (REQUIRES PRODUCT OWNER SELECTION)**.

---

# 10. Prize Pool Edge Cases

## EC-090 — Zero active subscribers

Expected:
- Gross new pool is 0.00 (BR-060).
- If an incoming jackpot rollover exists, it carries forward in the 5-number tier.

## EC-091 — Prize pool has fractional currency

Expected:
- **RESOLVED via BR-063 / A-023:** Equal division among winners uses integer-cent floor truncation (`floor(tier_amount / winner_count)`).
- Indivisible cent remainders stay in the platform prize ledger, preventing floating-point drift or synthetic money creation.

## EC-092 — Multiple 5-number winners

Expected:
- 5-number tier is divided equally among winners using integer-cent truncation.

## EC-093 — Multiple 4-number winners

Expected:
- 4-number tier is divided equally among winners using integer-cent truncation.

## EC-094 — Multiple 3-number winners

Expected:
- 3-number tier is divided equally among winners using integer-cent truncation.

## EC-095 — No 5-number winner

Expected:
- 5-number jackpot rolls forward to next month's Tier 1 pool (PRD § 07, BR-064).

## EC-096 — No 4-number winner

Expected:
- PRD mandates Rollover: No (BR-065).
- Allocation remains recorded in `draw_tier_allocations` with `winner_count = 0`.
- Unclaimed fund disposition (Model A: platform revenue, Model B: charity, Model C: next-month pool, Model D: cascade, Model E: escrow) is **STRUCTURALLY SPECIFIED (REQUIRES PRODUCT OWNER SELECTION)**.

## EC-097 — No 3-number winner

Expected:
- PRD mandates Rollover: No (BR-065).
- Allocation remains recorded in `draw_tier_allocations` with `winner_count = 0`.
- Unclaimed fund disposition is **STRUCTURALLY SPECIFIED (REQUIRES PRODUCT OWNER SELECTION)**.

## EC-098 — Prize pool changes between simulation and publication

The exact policy is not specified.

**OPEN DECISION**

Do not silently use stale calculations where financial correctness could be affected.

---

# 11. Winner Verification Edge Cases

## EC-100 — Winner has not uploaded proof

Expected:

- verification remains pending;
- payout must not be marked paid solely because the user is identified as a winner.

## EC-101 — Invalid proof file

Validation parameters (WINNER_PROOF_CONFIG):
- Maximum file size: 20 MB (20,971,520 bytes).
- Accepted formats: PNG, JPG, JPEG, WebP, GIF, HEIC, HEIF, BMP, TIFF, and PDF.

Expected:
- Reject empty (0-byte) files, oversized files (>20MB), and unsupported formats (executables, scripts).
- Inform subscriber with actionable feedback; do not create or alter verification state.
- Verified in `src/__tests__/winner_verification.test.ts`.

## EC-102 — Proof upload fails

Expected:
- User receives clear, recoverable error message.
- Transaction is aborted with no orphaned storage objects or false verification state.

## EC-103 — Admin rejects proof

Expected:
- Admin is required to provide a non-empty, clear rejection reason (`rejection_reason`).
- Status transitions to `rejected`, and audit columns `reviewed_at` and `reviewed_by` are recorded.
- Payout remains `pending` and cannot progress to `paid`.
- Resubmission lifecycle (Assumption A-014): Subscriber sees the rejection reason on `/dashboard/winnings` and is given an upload form to submit updated proof.

## EC-104 — Admin approves proof

Expected:

```text
Approved (reviewed_at, reviewed_by recorded)
   ↓
Payment Pending (Payout progression unlocked)
```

## EC-105 — Resubmission & Proof Replacement (Assumption A-014)

Expected:
- When a rejected winner uploads new proof, the new file replaces `proof_file_url`, the old rejection reason is cleared (`null`), `submitted_at` updates to the current timestamp, and `verification_status` returns to `proof_submitted`.
- Once verification is `approved`, further proof uploads are strictly blocked.

## EC-106 — Admin reviews same winner concurrently

Expected:
- Server-side atomic update ensures consistent final state and audit metadata.
- Payout gating strictly enforces `verification_status === 'approved'`.

Expected:

- prevent conflicting final states;
- preserve a single authoritative verification result.

---

# 12. Payout Edge Cases

## EC-110 — Payout is pending

Display:

```text
Pending
```

## EC-111 — Payout marked paid

Display:

```text
Paid
```

## EC-112 — Duplicate payout completion attempt

Expected:

- do not create a second payout;
- preserve already-paid state.

## EC-113 — Unauthorized payout update

Expected:

- reject server-side;
- do not modify payout state.

---

# 13. User Dashboard Edge Cases

## EC-120 — No scores

Show empty score state.

## EC-121 — No upcoming draw

Show a clear state without inventing a draw.

## EC-122 — No winnings

Show zero/empty winnings appropriately.

## EC-123 — Inactive subscription

Show subscription state clearly and restrict protected functionality according to the final access rule.

## EC-124 — Charity unavailable

Preserve historical context and present the approved recovery path.

---

# 14. Admin Dashboard Edge Cases

## EC-130 — Unauthorized user opens admin URL

Expected:

- server-side authorization prevents access.

## EC-131 — Admin list is empty

Expected:

- clear empty state;
- no broken tables.

## EC-132 — Large user list

Expected:

- pagination/filtering strategy;
- no assumption that all records fit into one client response.

## EC-133 — Large draw history

Expected:

- efficient querying;
- pagination/filtering as appropriate.

## EC-134 — Large charity directory

Expected:

- search/filtering;
- efficient loading.

---

# 15. Reporting & Analytics Edge Cases (Phase 7 Verified)

## EC-140 — Empty data periods

Expected:
- When no draws, subscriber registrations, or charity records fall within a selected date filter, the UI renders contextual, non-misleading empty states:
  - Draws: *"No published draws for this period."*
  - Subscriber Growth: *"Historical growth data is not available for this period."*
  - Charity: *"No charity contribution data for this period."*
- Does not render confusing zeroes or broken layout blocks.

## EC-141 — Scalable date-bounded server aggregation

Expected:
- Date bounds are passed directly to database aggregation queries (`gte('month', start)`, `lt('month', end)`) rather than fetching unbounded tables into client memory.
- Prevents client heap exhaustion as draw cycles and subscriber counts scale.

## EC-142 — Financial calculation consistency & Integer subunit precision

Expected:
- All monetary operations use integer currency subunits (pence). Floating-point arithmetic (`0.1 + 0.2`) is forbidden.
- Reconciled balance sheet ensures `grossPrizePool = tier5 + tier4 + tier3` and `totalWinnings = paid + pending`.
- Explicit separation between Direct Subscription Donations and Unclaimed Prize Dispositions guarantees no financial double-counting.

## EC-143 — UTC date boundary edge cases

Expected:
- Monthly boundaries use `[startDate, endDate)` semantics where `startDate` is inclusive (`00:00:00.000Z` on the 1st of the starting month) and `endDate` is exclusive (`00:00:00.000Z` on the 1st of the succeeding month).
- Eliminates off-by-one errors caused by local browser timezones or leap years.

## EC-144 — Unauthorized access to administrative reporting

Expected:
- Non-admin visitors (unauthenticated or subscribers) attempting to access `/admin/reports` or execute `getAdminReportsAction` are rejected server-side with an access denied response. Sensitive operational figures are never transmitted over the wire to unauthorized clients.

---

# 16. Role & Authorization Edge Cases

## EC-150 — Public user attempts subscriber operation

Reject.

## EC-151 — Subscriber attempts admin operation

Reject.

## EC-152 — Admin accesses subscriber information

Allow only according to defined admin capabilities.

## EC-153 — User changes role through client-side request

Reject unauthorized privilege escalation.

## EC-154 — Expired session attempts privileged operation

Reject.

---

# 17. Data Integrity Edge Cases

## EC-160 — Duplicate database request

Idempotency or database constraints should prevent duplicate business effects where appropriate.

## EC-161 — Partial transaction

If a multi-step business operation fails midway:

- do not leave inconsistent financial/draw state;
- use transaction boundaries where appropriate.

## EC-162 — Historical record modified accidentally

Historical draw, winner, payout, or contribution records should remain traceable.

## EC-163 — Missing related record

Example:

```text
Winner references draw that cannot be found
```

Expected:

- fail safely;
- surface data-integrity issue;
- do not fabricate replacement data.

---

# 18. External Service Edge Cases

Potential external dependencies include:

- payment provider;
- authentication provider;
- storage/file service;
- database/backend services.

For any external service:

```text
Success
Failure
Timeout
Retry
Duplicate callback
Malformed response
Unavailable service
```

must be considered.

The exact retry strategy depends on the selected provider and implementation.

---

# 19. Responsive Edge Cases

## EC-170 — Mobile navigation

Navigation must remain usable without horizontal overflow.

## EC-171 — Long charity name

Text must not break the layout.

## EC-172 — Large prize amount

Currency values must remain readable.

## EC-173 — Long error message

Error content must wrap without overlapping controls.

## EC-174 — Admin table on mobile

The interface needs an intentional mobile strategy rather than accidental viewport overflow.

---

# 20. Accessibility Edge Cases

## EC-180 — Keyboard-only navigation

All critical actions must remain reachable.

## EC-181 — Form error

Error must not rely only on color.

## EC-182 — Status indication

States such as:

```text
Active
Inactive
Pending
Paid
Rejected
```

must not be communicated by color alone.

## EC-183 — Reduced motion

Animations should respect reduced-motion preferences.

## EC-184 — Modal/dialog

Focus must be managed appropriately.

---

# 21. Loading & Error State Edge Cases

Every important async operation should support:

```text
Idle
Loading
Success
Error
```

Examples:

- payment;
- score save;
- charity selection;
- draw simulation;
- draw publishing;
- proof upload;
- admin verification;
- payout update.

---

# 22. Security Edge Cases

## EC-190 — Client modifies role

Reject server-side.

## EC-191 — Client modifies another user's ID

Verify ownership/authorization server-side.

## EC-192 — Client modifies prize calculation

Never trust client-provided prize values.

## EC-193 — Client submits invalid score

Backend validates independently.

## EC-194 — Unauthorized proof access

Winner proof files must not become publicly accessible merely because a URL exists.

## EC-195 — Exposed environment variable

Secrets must never be committed to source control or unnecessarily exposed to the browser.

---

# 23. Draw & Financial Safety

The highest-risk operations are:

```text
Prize calculation
Draw execution
Draw publication
Winner verification
Payout completion
```

These should receive stronger validation and testing than ordinary display features.

---

# 24. Edge-Case Test Matrix

| Area | Boundary | Failure | Duplicate | Authorization | External |
|---|---|---|---|---|---|
| Subscription | ✓ | ✓ | ✓ | ✓ | ✓ |
| Scores | ✓ | ✓ | ✓ | ✓ | — |
| Charity | ✓ | ✓ | ✓ | ✓ | — |
| Draw | ✓ | ✓ | ✓ | ✓ | — |
| Prize pool | ✓ | ✓ | ✓ | ✓ | — |
| Winner proof | ✓ | ✓ | ✓ | ✓ | ✓ |
| Payout | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | ✓ | — | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | — | ✓ | ✓ |

---

# 25. Edge-Case Status Convention

Use:

- `IDENTIFIED`
- `REQUIREMENT_DEFINED`
- `OPEN_DECISION`
- `IMPLEMENTED`
- `TESTED`
- `VERIFIED`

An edge case marked `OPEN_DECISION` must not be silently converted into a business rule.

---

# 26. Full PRD Section Coverage

| PRD Section | Edge-Case Coverage |
|---|---|
| § 01 Project overview | Public access and product boundary cases |
| § 02 Core objectives | Cross-feature failures |
| § 03 User roles | Role/authorization boundaries |
| § 04 Subscription & payment | Payment/lifecycle failures |
| § 05 Score management | Validation, duplicates, rolling history |
| § 06 Draw & reward system | Simulation, execution, eligibility |
| § 07 Prize pool logic | Winners, rollover, rounding |
| § 08 Charity system | Selection, contribution, availability |
| § 09 Winner verification | Proof/review/payout cases |
| § 10 User dashboard | Empty/error/inactive states |
| § 11 Admin dashboard | Authorization and large datasets |
| § 12 UI / UX requirements | Responsive/accessibility/loading states |
| § 13 Technical requirements | External service/data integrity/security |
| § 14 Scalability considerations | Large datasets and modular processing |
| § 15 Mandatory deliverables | Deployment/integration failure cases |
| § 16 Evaluation criteria | Validation and test coverage |

---

# 27. Final Edge-Case Rule

**Do not optimize only for the happy path.**

Before a feature is considered complete, Antigravity must ask:

```text
What if the input is invalid?
What if the input is at the boundary?
What if the data is empty?
What if the request happens twice?
What if two requests happen at once?
What if the user is unauthorized?
What if an external service fails?
What if the operation partially succeeds?
What if historical data is affected?
What does the PRD actually specify?
What remains an open decision?
```

If the PRD does not specify the correct outcome, record it in `assumptions.md` instead of inventing a hidden rule.

---

# 28. End-to-End System Integration Edge Cases (Phase 8)

## EC-160 — Cross-User Scorecard Proof Access
A subscriber must never be able to inspect, download, or alter another user's submitted scorecard screenshot. Storage paths are private and accessible only through server-authorized signed URLs (`auth.uid() = winner.user_id` OR `is_admin()`).

## EC-161 — Premature Payout Marking
An administrator cannot mark a payout as `paid` while the verification status remains `pending`, `proof_submitted`, or `rejected`. Payout can only progress when status is explicitly `approved`.

## EC-162 — Duplicate Stripe Webhook Replays
Network retries of Stripe webhook events are guarded by checking `stripe_event_id` or existing status so that subscription durations and payments are not credited multiple times.

## EC-163 — Duplicate Score Dates
Submitting multiple scores for the exact same date is rejected to preserve chronological round integrity.

---

# 29. Demo Mode & Payment Simulation Edge Cases (Phase 9)

## EC-170 — Demo Mode Accidental Production Data Exposure
Demo Mode routes (`/demo/*`) consume isolated in-memory datasets (`src/lib/demo/data.ts`). They must never connect to live Supabase database tables or return real subscriber emails, scores, or winner records.

## EC-171 — Demo Payment Triggering External Financial APIs
Payment simulations (Card, UPI, QR, Bank Transfer) must never invoke Stripe API keys, bank rails, or third-party webhooks. All state transitions (`selecting`, `processing`, `success`, `failure`, `cancelled`) occur entirely in client memory.

## EC-172 — Procedural Demo QR Leakage
The algorithmic QR pattern displayed in Demo Mode is dynamically rendered via vector SVG with an explicit `DEMO` watermark. It must never encode valid EMVCo payment payloads, real UPI handles, or live merchant bank account numbers.

## EC-173 — Reviewer Deception Prevention
Every demo view features unambiguous notices ("Demo Mode — Sample data only · No real account", "Simulation only — no real payment was processed"). The system never generates counterfeit receipts, fake Stripe payment intents, or false bank wire confirmations.

---

## End of Edge Cases

