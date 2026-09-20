# Digital Heroes — Requirements

**Source:** Digital Heroes PRD (Level 1), Version 1.0, March 2026  
**Purpose:** Authoritative functional and product requirements extracted from the PRD for implementation planning.

> **Source-of-truth rule:** The Digital Heroes PRD is the single source of truth for the design, development, and evaluation of this project. Requirements in this document are derived from the PRD and should not be silently changed during implementation.

---

# PRD Section Coverage Map

The requirements document follows the **16-section structure shown in the Digital Heroes PRD contents**:

| PRD Section | Requirement Area | Covered In This Document |
|---|---|---|
| § 01 | Project overview | § 1 |
| § 02 | Core objectives | § 3 |
| § 03 | User roles | § 2 |
| § 04 | Subscription & payment | § 4 |
| § 05 | Score management | § 5 |
| § 06 | Draw & reward system | § 6 |
| § 07 | Prize pool logic | § 7 |
| § 08 | Charity system | § 8–9 |
| § 09 | Winner verification | § 10 |
| § 10 | User dashboard | § 11 |
| § 11 | Admin dashboard | § 12 |
| § 12 | UI / UX requirements | § 13 |
| § 13 | Technical requirements | § 14 |
| § 14 | Scalability considerations | § 15 |
| § 15 | Mandatory deliverables | § 16 |
| § 16 | Evaluation criteria | § 17 |

**Important:** The PRD contents identify these sixteen sections as the complete product specification. No section should be omitted from the implementation plan.

## 1. Product Overview

Digital Heroes is a subscription-driven web application combining:

- Golf performance tracking
- Charity fundraising
- A monthly draw-based reward engine

The product is intended to feel emotionally engaging and modern and should deliberately avoid the aesthetics of a traditional golf website.

The core user activities are:

1. Subscribe to the platform through a monthly or yearly plan.
2. Enter the user's latest golf scores in Stableford format.
3. Participate in monthly draw-based prize pools.
4. Support a selected charity with a portion of the subscription.

---

# 2. User Roles

The platform has three defined roles.

## 2.1 Public Visitor

A public visitor can:

- View the platform concept.
- Explore listed charities.
- Understand the draw mechanics.
- Initiate a subscription.

## 2.2 Registered Subscriber

A registered subscriber can:

- Manage profile and settings.
- Enter golf scores.
- Edit golf scores.
- Select a charity recipient.
- View participation.
- View winnings.
- Upload winner proof.

## 2.3 Administrator

An administrator can:

- Manage users.
- Manage subscriptions.
- Configure and run draws.
- Manage charity listings.
- Verify winners.
- Manage payouts.
- Access reports and analytics.

---

# 3. Core Product Objectives

The platform must satisfy six core objectives.

## 3.1 Subscription

Build a robust subscription and payment system.

## 3.2 Score Entry

Provide a simple and engaging score-entry flow.

## 3.3 Custom Draw

Support monthly draws using either:

- Random / standard lottery-style logic
- Algorithmic logic weighted by score frequency

## 3.4 Charity

Provide seamless charity contribution logic.

## 3.5 Administration

Provide a comprehensive administrative dashboard and operational tools.

## 3.6 UI/UX

Provide an outstanding, distinctive UI/UX experience within the golf industry while avoiding traditional golf-site aesthetics.

---

# 4. Subscription & Payment Requirements

## 4.1 Plans

The platform must provide:

- Monthly subscription plan
- Yearly subscription plan at a discounted rate

## 4.2 Payment Provider

The PRD specifies:

- Stripe or an equivalent PCI-compliant payment provider

## 4.3 Access Control

Non-subscribers must receive restricted access to platform features.

## 4.4 Subscription Lifecycle

The system must handle:

- Renewal
- Cancellation
- Lapsed-subscription states

## 4.5 Subscription Validation

The authenticated platform must perform a real-time subscription-status check on authenticated requests.

---

# 5. Score Management Requirements

## 5.1 Score Format

Scores must use Stableford format.

## 5.2 Score Range

Valid score values are:

**1–45**

## 5.3 Score Date

Every score must include a date.

## 5.4 Latest Five Scores

Users must enter their latest five golf scores.

Only the latest five scores are retained at any time.

## 5.5 Rolling Score Behaviour

When a new score is added and more than five scores would exist:

- The newest score is retained.
- The oldest stored score is automatically replaced/removed.
- Exactly the latest five scores remain retained.

## 5.6 Score Ordering

Scores must be displayed in reverse chronological order:

**Most recent → oldest**

## 5.7 Duplicate Date Rule

Only one score entry is permitted per date.

Duplicate scores for the same date are not allowed.

An existing score for that date may instead be:

- Edited
- Deleted

---

# 6. Draw & Reward Requirements

## 6.1 Draw Match Types

The platform must support:

- 5-number match
- 4-number match
- 3-number match

## 6.2 Draw Modes

The platform must support:

### Random

Standard lottery-style draw logic.

### Algorithmic

Algorithmic draw logic weighted by score frequency.

> The PRD specifies the existence of the algorithmic mode but does not define its complete mathematical implementation. The exact implementation must therefore be documented separately rather than silently invented.

## 6.3 Draw Cadence

Draws operate on a:

**Monthly cadence**

## 6.4 Draw Administration

Administrators must be able to:

- Control publishing.
- Run simulations before publishing.
- Publish results.

## 6.5 Jackpot Rollover

The 5-number jackpot must roll over if it is unclaimed.

---

# 7. Prize Pool Requirements

A fixed portion of each subscription contributes to the prize pool.

The distribution is predefined and must be automatically enforced.

## 7.1 Prize Distribution

| Match Type | Pool Share | Rollover |
|---|---:|---|
| 5-number match | 40% | Yes — jackpot |
| 4-number match | 35% | No |
| 3-number match | 25% | No |

## 7.2 Automatic Pool Calculation

Prize pools must be automatically calculated based on the active subscriber count.

## 7.3 Multiple Winners

When multiple users win in the same prize tier:

- The prize for that tier is split equally among the winners.

## 7.4 Jackpot

The 5-number jackpot carries forward when unclaimed.

---

# 8. Charity Requirements

Charitable impact is a central part of the platform.

## 8.1 Charity Selection

Users select a charity at signup.

## 8.2 Minimum Contribution

The minimum charity contribution is:

**10% of the subscription fee**

## 8.3 Voluntary Increase

Users may voluntarily increase their charity contribution percentage.

## 8.4 Independent Donation

The platform provides an independent donation option that is not tied to gameplay.

---

# 9. Charity Directory Requirements

The charity directory must provide:

## Discovery

- Charity listing page
- Search
- Filtering

## Charity Profiles

Profiles must support:

- Description
- Images
- Upcoming events, such as golf days

## Homepage Spotlight

The homepage must include a featured charity section.

---

# 10. Winner Verification Requirements

Winner verification applies to winners only.

## 10.1 Proof

A winner must be able to upload proof in the form of a screenshot of scores from the golf platform.

## 10.2 Admin Review

Administrators must be able to:

- Review the proof submission.
- Approve the submission.
- Reject the submission.

## 10.3 Payment States

Winner payment must support:

**Pending → Paid**

---

# 11. User Dashboard Requirements

The user dashboard must include all of the following.

## Subscription

- Subscription status
- Active/inactive state
- Renewal date

## Scores

- Score entry interface
- Score editing interface

## Charity

- Selected charity
- Contribution percentage

## Participation

- Draws entered
- Upcoming draws

## Winnings

- Total won
- Current payment status

---

# 12. Admin Dashboard Requirements

The admin dashboard must provide five primary control surfaces.

## 12.1 User Management (PRD § 11.01 — VERIFIED PHASE 8)

Administrators can at `/admin/users`:

- View subscriber accounts and profiles
- Inspect roles (`subscriber` vs `admin`)
- Search by name, email, or charity
- Filter by role and subscription status
- Inspect designated cause and statutory contribution percentage

## 12.2 Draw Management (PRD § 11.02 — VERIFIED PHASE 5)

Administrators can at `/admin/draws`:

- Configure draw logic (Random vs Algorithmic with Laplace smoothing)
- Run simulations and view match counts
- Commit immutable published results
- View prize distribution breakdown

## 12.3 Charity Management (PRD § 11.03 — VERIFIED PHASE 3)

Administrators can at `/admin/charities`:

- Add charities
- Edit charities
- Toggle active/inactive status
- Manage charity mission and media

## 12.4 Winner Management (PRD § 11.04 — VERIFIED PHASE 6)

Administrators can at `/admin/winners`:

- View the full winners list
- Inspect submitted scorecard screenshots via private signed URLs
- Approve or reject submissions with mandatory reasons
- Mark verified payouts as Paid with payment reference

## 12.5 Reports & Analytics (PRD § 11.05 — VERIFIED PHASE 7)

Executive reports implemented at `/admin/reports`:

- **Subscriber Growth:** Current snapshot (active vs inactive) + monthly registration trend.
- **Total Prize Pool & Monthly Draw History:** Detailed ledger for published draws including winning numbers, participant counts, 40/35/25 tier allocations, winner counts, rollovers, and unclaimed dispositions.
- **Charity Contribution Totals:** Vetted partner directory with strict separation between direct subscription donations and unclaimed prize allocations.
- **Financial Summaries:** Integer subunit precision (pence), explicit GBP currency, 30% MER prize pool basis, and temporary commercial parameter disclosures.
- **Date Filtering:** Bounded queries across Current Month, Previous Month, Last 3/6/12 Months, and All Time (UTC).
- **Audit Export:** CSV export for draw history and financial summaries.

## 12.6 Subscription Operations (PRD § 04 / § 11 — VERIFIED PHASE 8)

Administrators can at `/admin/subscriptions`:

- Monitor active paying subscribers
- Inspect past-due grace period accounts (7-day grace period)
- Track cancellation requests (`cancel_at_period_end`)
- Filter subscriptions by status (`active`, `past_due`, `canceled`) and plan (`monthly`, `yearly`)
- Inspect Stripe customer and subscription IDs


---

# 13. UI / UX Requirements

## 13.1 Overall Feel

The platform must have a:

- Clean interface
- Modern interface
- Motion-enhanced interface
- Emotion-driven design

## 13.2 Avoid Traditional Golf Aesthetics

The design must avoid using these as the primary design language:

- Fairways
- Plaid
- Club imagery
- Traditional golf visual clichés

## 13.3 Charity-First Experience

The design must lead with:

**Charitable impact, not sport.**

## 13.4 Homepage

The homepage must clearly communicate:

- What the user does
- How the user wins
- Charity impact
- The primary call to action

## 13.5 Animation

Use:

- Subtle transitions
- Micro-interactions

throughout the product.

## 13.6 CTA

The subscription button and subscription flow must be:

- Prominent
- Clear
- Persuasive

---


# 14. Technical Requirements

The PRD identifies technical requirements as a dedicated section of the product specification. Implementation decisions must therefore explicitly account for the technical layer rather than treating the project as UI-only.

For implementation planning, Antigravity must maintain clear separation between:

- Frontend/UI
- Authentication and authorization
- Backend/application logic
- Database/data access
- Payment/subscription integration
- Draw and prize calculations
- File/proof handling
- Administrative operations

The PRD gives Supabase as an example of a backend/database choice and Stripe (or an equivalent PCI-compliant provider) for payments. These are examples in the PRD and should not be treated as an unexplained mandate if a later project instruction specifies an alternative compatible implementation.

Technical implementation must support:

- Correct authentication
- Correct authorization
- Secure environment-variable handling
- Reliable persistence
- Accurate business calculations
- Responsive UI
- Error handling
- Testing
- Production deployment

Do not allow frontend-only checks to be the sole enforcement mechanism for security-sensitive or business-critical rules.

---

# 15. Scalability Considerations

The PRD identifies scalability thinking as a dedicated evaluation area.

The implementation should therefore avoid designs that work only for a tiny demo dataset.

Antigravity must consider:

- Increasing subscriber counts
- Increasing score records
- Growing charity directory
- Increasing draw history
- Increasing winner records
- Growing reporting data
- Concurrent authenticated users
- Repeated monthly draw operations

The architecture should keep business logic modular so that future changes to:

- draw logic
- prize calculations
- subscription plans
- charity configuration
- reporting
- verification workflows

can be made without rewriting unrelated parts of the system.

Database queries should be designed around actual access patterns and indexed where appropriate.

Historical draw results, prize calculations, contributions, winners, and payouts should remain auditable rather than being overwritten by later operations.

Scalability does **not** mean adding unnecessary infrastructure. Prefer the simplest architecture that satisfies the current PRD while leaving sensible extension points for future growth.


# 16. Mandatory Deliverables

The final submission must include:

## 14.1 Live Website

A fully deployed, publicly accessible URL.

## 14.2 User Panel

Test credentials and functional:

- Signup
- Login
- Score entry
- Dashboard

## 14.3 Admin Panel

Admin credentials and functional:

- User management
- Draw system
- Charity management
- Winner verification

## 14.4 Database

A connected backend database with a proper schema.

The PRD gives Supabase as an example.

## 14.5 Source Code

The codebase must be:

- Clean
- Structured
- Well-commented

---

# 17. Deployment Requirements

The PRD specifies:

- Deploy to a new Vercel account, not a personal/existing account.
- Use a new Supabase project, not a personal/existing project.
- Configure environment variables properly.

---

# 18. Testing Requirements

The implementation must test:

- User signup and login
- Monthly subscription
- Yearly subscription
- Five-score rolling logic
- Draw system logic
- Draw simulation
- Charity selection
- Charity contribution calculation
- Winner verification
- Payout tracking
- User dashboard
- Admin panel
- Data accuracy across modules
- Responsive mobile design
- Responsive desktop design
- Error handling
- Edge cases

---

# 19. Evaluation Criteria

The PRD evaluates the project across:

1. **Requirements interpretation** — how accurately requirements are translated into features.
2. **System design** — quality of architecture decisions and data modelling.
3. **UI/UX creativity** — originality, polish, and emotional engagement.
4. **Data handling** — accuracy of score logic, draw engine, and prize calculations.
5. **Scalability thinking** — extensibility of the codebase and data structures.
6. **Problem-solving** — identification and resolution of ambiguous requirements.

Therefore implementation decisions should be traceable to explicit requirements or clearly documented assumptions.

---

# 20. Requirements Status Convention

Each requirement should eventually be tracked using:

- `NOT STARTED`
- `IN PROGRESS`
- `IMPLEMENTED`
- `TESTED`
- `VERIFIED`

A requirement should only be considered complete after implementation and validation.

---

# 21. Source Boundaries

This document intentionally does **not** invent:

- A specific technology stack
- A specific database schema
- A specific draw algorithm formula
- A specific visual color palette
- Additional product features
- Additional payment rules
- Additional eligibility rules

Those decisions belong in the appropriate architecture, assumptions, design, or implementation documents and must remain compatible with the PRD.

---

# 22. Requirement Completion Standard

A requirement is considered successfully implemented only when:

1. The user-facing or admin-facing functionality exists where applicable.
2. The relevant business rule is enforced.
3. The relevant backend/data behavior is correct.
4. Error and edge cases are handled.
5. The feature is responsive where applicable.
6. The feature has appropriate automated or manual validation.
7. The requirement can be traced back to the PRD.

---

## End of Requirements Document
