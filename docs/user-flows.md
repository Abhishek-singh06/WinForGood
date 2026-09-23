# Digital Heroes — User Flows

**Source of truth:** Digital Heroes PRD (Level 1), Version 1.0, March 2026.

This document defines the product journeys implied by the PRD. It describes what each role can do and the required sequence of interactions without inventing unspecified business rules.

---

# 1. Flow Architecture

Digital Heroes has three primary roles:

```text
PUBLIC VISITOR
      │
      └──→ SUBSCRIPTION / SIGNUP
                    │
                    ↓
              REGISTERED SUBSCRIBER
                    │
          ┌─────────┼──────────┐
          ↓         ↓          ↓
       SCORES    CHARITY     DRAWS
          │         │          │
          └─────────┼──────────┘
                    ↓
                 WINNER
                    │
                    ↓
              PROOF UPLOAD
                    │
                    ↓
              ADMIN REVIEW
                    │
              ┌─────┴─────┐
              ↓           ↓
           APPROVED     REJECTED
              │
              ↓
        PAYMENT PENDING
              │
              ↓
             PAID
```

The administrator operates the control layer across users, subscriptions, draws, charities, winners, payouts, and reporting.

---

# 2. Public Visitor Flow

## 2.1 Visitor Entry

```text
Landing Page
     ↓
Understand Platform
     ↓
Explore Charity
     ↓
Understand Draw
     ↓
View Subscription
     ↓
Initiate Signup
```

The visitor must be able to:

- view the platform concept;
- explore listed charities;
- understand draw mechanics;
- initiate a subscription.

---

# 3. Homepage Flow

## 3.1 Required communication sequence

The homepage should answer:

```text
What is Digital Heroes?
        ↓
What does the user do?
        ↓
How does the user participate?
        ↓
How can the user win?
        ↓
How does charity benefit?
        ↓
What should the user do next?
```

The PRD requires the homepage to communicate:

- what the user does;
- how the user wins;
- charity impact;
- the call to action.

The subscription CTA must be prominent.

---

# 4. Charity Discovery Flow

```text
Homepage / Charity Directory
          ↓
       Search
          ↓
       Filter
          ↓
    Charity Listing
          ↓
    Charity Profile
          ↓
Description / Images / Events
          ↓
   Selection / Signup
```

## Charity listing

The user can:

- browse charities;
- search charities;
- filter charities.

## Charity profile

The profile can contain:

- description;
- images;
- upcoming events such as golf days.

## Homepage

A featured charity section should provide a discovery entry point.

---

# 5. Subscription Flow

```text
Pricing
   ↓
Choose Monthly / Yearly
   ↓
Create Account
   ↓
Select Charity
   ↓
Choose Contribution %
   ↓
Payment
   ↓
Subscription Result
   ↓
Subscriber Experience
```

The PRD specifies monthly and yearly plans and requires charity selection at signup.

The minimum charity contribution is 10% of the subscription fee, with an option for the user to voluntarily increase it.

The exact payment-provider implementation follows the selected PCI-compliant provider.

---

# 6. Signup Flow

```text
Signup Form Submission
  ↓
Account Information & Charity Selection
  ↓
Server Action (signUpAction)
  ├── emailRedirectTo = ${NEXT_PUBLIC_APP_URL}/auth/callback
  ↓
Verification Email Sent (Supabase Auth)
  ↓
User Clicks Email Link
  ↓
GET /auth/callback?code=...
  ↓
exchangeCodeForSession(code) + Cookie Sync
  ↓
Safe Relative Redirect (Dashboard / Admin)
```

Do not add additional mandatory signup steps unless a later approved requirement requires them.

---

# 7. Subscriber Authentication Flow

```text
Login
  ↓
Authentication (Credentials / Session)
  ↓
Subscription Status Check
  ↓
Access Decision
  ├── Active / permitted → Subscriber Platform
  ├── Invalid / Expired Email Verification → /login?error=verification_failed
  └── Restricted / inactive → Restricted Experience
```

The PRD requires real-time subscription status checks on authenticated requests and restricted access for non-subscribers.

---

# 8. Subscriber Dashboard Flow

```text
Login
  ↓
Dashboard
  ├── Subscription
  ├── Scores
  ├── Charity
  ├── Participation
  └── Winnings
```

The dashboard must include:

### Subscription

- active/inactive status;
- renewal date.

### Scores

- score entry;
- score editing.

### Charity

- selected charity;
- contribution percentage.

### Participation

- draws entered;
- upcoming draws.

### Winnings

- total won;
- current payment status.

---

# 9. Score Entry Flow

```text
Dashboard
   ↓
Score Entry
   ↓
Enter Stableford Score
   ↓
Enter Date
   ↓
Validate
   ↓
Save
   ↓
Refresh Latest Five
```

Validation requirements:

```text
Score must be 1–45
Date is required
Only one score per date
```

If the date already has a score:

```text
Existing score
   ├── Edit
   └── Delete
```

Do not create a second score for the same date.

---

# 10. Five-Score Rolling Flow

```text
Existing scores
      ↓
Add new score
      ↓
Validate
      ↓
Would retained set exceed 5?
      │
   ┌──┴──┐
   │     │
  NO    YES
   │     │
   │     ↓
   │  Remove/replace
   │  oldest retained
   │     │
   └──┬──┘
      ↓
Retain latest 5
      ↓
Display newest first
```

The PRD requires only the latest five scores to be retained.

---

# 11. Score Edit Flow

```text
Dashboard
   ↓
Score History
   ↓
Select Existing Score
   ↓
Edit
   ↓
Validate
   ↓
Save
   ↓
Updated Score History
```

All normal score rules still apply during editing.

---

# 12. Score Delete Flow

```text
Dashboard
   ↓
Score History
   ↓
Select Score
   ↓
Delete
   ↓
Confirmation
   ↓
Remove Score
   ↓
Refresh History
```

The PRD allows an existing score to be deleted.

---

# 13. Charity Selection Flow

```text
Signup / Charity Area
        ↓
Browse Directory
        ↓
Search / Filter
        ↓
Open Charity Profile
        ↓
Select Charity
        ↓
Set Contribution %
        ↓
Validate Minimum
        ↓
Save Selection
```

Minimum contribution:

**10% of subscription fee**

The user may voluntarily increase the percentage.

---

# 14. Draw Participation Flow

The PRD defines monthly draws but does not fully specify every eligibility cutoff or entry-registration mechanism.

Therefore the high-level flow is:

```text
Active Subscriber
       ↓
Eligible Draw Population
       ↓
Monthly Draw
       ↓
5 / 4 / 3 Number Matching
       ↓
Result
       ↓
Participation / Winnings
```

The exact eligibility cutoff and score-to-number mapping must be resolved as documented assumptions before final implementation.

---

# 15. Draw Administration Flow

```text
Admin Dashboard
      ↓
Draw Management
      ↓
Configure Draw
      ↓
Select Draw Logic
 ┌────┴──────────┐
 ↓               ↓
Random       Algorithmic
 └────┬──────────┘
      ↓
Run Simulation
      ↓
Review Simulation
      ↓
Publish Result
      ↓
Published Draw
```

The PRD explicitly requires:

- random or algorithmic draw logic;
- monthly cadence;
- simulation before publishing;
- admin control over publishing.

---

# 16. Draw Result Flow

```text
Published Draw
      ↓
Determine Matches
      ↓
5-number tier
4-number tier
3-number tier
      ↓
Calculate Prize Tiers
      ↓
Identify Winners
      ↓
Display Results
```

Prize shares:

```text
5-number → 40%
4-number → 35%
3-number → 25%
```

If multiple winners exist in the same tier, that tier is split equally among them.

If the 5-number tier has no winner, the jackpot rolls forward.

---

# 17. Winner Flow

```text
Winner Identified
       ↓
Winner sees winnings
       ↓
Proof required
       ↓
Upload score screenshot
       ↓
Admin review
       ↓
Approve / Reject
```

Winner verification applies only to winners.

---

# 18. Winner Proof Upload Flow

```text
Winner Area
    ↓
Upload Proof
    ↓
Select Screenshot
    ↓
Upload
    ↓
Submission Recorded
    ↓
Pending Admin Review
```

The PRD specifically identifies the proof as a screenshot of scores from the golf platform.

---

# 19. Winner Verification & Resubmission Flow (Phase 6 Verified)

```text
Pending Proof (or Resubmitted)
      ↓
Winner Uploads Scorecard (PNG/JPG/PDF <= 20MB)
      ↓
Proof Submitted (Private Bucket Storage)
      ↓
Admin Opens Verification Studio (/admin/winners)
      ↓
Review Proof (Time-limited Signed URL)
      ↓
   ┌──┴─────────────────────────────┐
   ↓                                ↓
Approve Evidence             Reject Evidence (Mandatory Reason)
   │                                │
   │                                ↓
   │                         Subscriber Sees Rejection on Dashboard
   │                                ↓
   │                         Uploads Updated Scorecard Proof (A-014)
   │                                │
   │                         Old Reason Cleared, Status = proof_submitted
   │                                │
   │                                └───→ (Loops back to Admin Review)
   │
   ↓
Payment Pending (Strict Invariant: verification_status === 'approved')
   ↓
Admin Marks Disbursement Completed
   ↓
Paid (Administrative Ledger State)
```

The PRD specifies admin approval/rejection and the payment states **Pending → Paid**. The resubmission lifecycle is implemented under documented Assumption A-014, and payout gating is enforced server-side (BR-085).

---

# 20. Payout Flow

```text
Approved Winner (verification_status = 'approved')
      ↓
Payment Pending (payout_status = 'pending')
      ↓
Admin Disburses Funds & Confirms in /admin/winners
      ↓
Paid (payout_status = 'paid')
```
```

The administrator must be able to mark payouts as completed.

---

# 21. Administrator Entry Flow

```text
Admin Login
     ↓
Authorization
     ↓
Admin Dashboard
     ↓
Operational Modules
```

Modules:

```text
Users
Subscriptions
Draws
Charities
Winners
Payouts
Reports / Analytics
```

---

# 22. Admin User Management Flow

```text
Users
  ↓
User List
  ↓
Open User
  ↓
View / Edit Profile
  ↓
View / Edit Scores
  ↓
Manage Subscription
```

The PRD gives administrators user-profile editing, golf-score editing, and subscription management capabilities.

---

# 23. Admin Charity Management Flow

```text
Charities
    ↓
Charity List
    ↓
Add / Edit / Delete
    ↓
Manage Content
    ↓
Manage Media
    ↓
Published Directory
```

The PRD explicitly gives administrators control over charity listings and content/media.

---

# 24. Admin Winner Management Flow

```text
Winners
   ↓
Winner List
   ↓
Open Winner
   ↓
Review Submission
   ↓
Approve / Reject
   ↓
Track Payout
   ↓
Mark Completed
```

---

# 25. Admin Reporting & Analytics Flow (Phase 7 Verified)

```text
Admin Authenticated
        ↓
Navigates to /admin/reports
        ↓
Selects UTC Date Range Filter
(Current Month | Previous Month | Last 3M | Last 6M | Last 12M | All Time)
        ↓
Server-side Aggregation Engine executes
        ↓
┌───────────────────────────────────────────────────────────┐
│ 1. Executive KPI Summary Cards                             │
│    (Total Users, Active Cohort, Gross Prize, Paid Out)    │
├───────────────────────────────────────────────────────────┤
│ 2. Subscriber Growth Chart & Trajectory Table             │
│    (Current snapshot distinguished from registrations)    │
├───────────────────────────────────────────────────────────┤
│ 3. Published Monthly Draw History Table                   │
│    (Participants, Winning Balls, 40/35/25 Tiers, Rollover)│
├───────────────────────────────────────────────────────────┤
│ 4. Charity Partner Directory & Contribution Totals        │
│    (Subscription Donations strictly separated from Funds) │
├───────────────────────────────────────────────────────────┤
│ 5. Comprehensive Financial Summary Ledger (GBP £)         │
│    (Revenue Basis, 30% Pool, Rollovers, Subunit Pence)    │
└───────────────────────────────────────────────────────────┘
        │
        ├──→ Export Draws CSV
        └──→ Export Financials CSV
```

The reporting engine enforces strict server-side admin authentication and provides CSV audit export capability.

---

# 26. Role-Based Flow Boundaries

## Public Visitor

Can access:

```text
Platform concept
Charity discovery
Draw explanation
Subscription initiation
```

Cannot access subscriber-only platform functionality without the appropriate account/subscription state.

## Subscriber

Can access:

```text
Profile/settings
Scores
Charity
Participation
Winnings
Winner proof upload
```

## Administrator

Can access:

```text
User management
Subscription management
Draw management
Charity management
Winner verification
Payout management
Reports
```

---

# 27. Global Error Flow

Every major interaction should account for:

```text
User Action
    ↓
Loading
    ↓
Success ─────────→ Updated State
    │
    └─────────────→ Error
                       ↓
                  Explain Error
                       ↓
                  Recovery Action
```

The exact error messages should be designed during UX implementation.

---

# 28. Empty-State Flow

Where a required dataset is empty:

```text
No Data
   ↓
Explain what is missing
   ↓
Provide relevant next action
```

Examples:

### No scores

```text
No scores entered yet
      ↓
Add your first score
```

### No winnings

```text
No winnings yet
      ↓
View upcoming draw
```

### No charity search results

```text
No charities found
      ↓
Adjust search/filter
```

The exact copy is a design decision and should not alter the underlying PRD requirements.

---

# 29. Responsive Flow Principle

All primary flows must work across:

```text
Mobile
Tablet
Desktop
```

The PRD explicitly requires responsive design on mobile and desktop.

---

# 30. Accessibility Flow Principle

All critical flows must remain usable with:

- keyboard navigation;
- visible focus;
- accessible form labels;
- meaningful validation messages;
- appropriate semantic structure.

These are implementation/UX quality practices and should not alter the PRD business rules.

---

# 31. Admin User & Subscription Management Flow (Phase 8)

```text
Admin Authenticated
       ↓
/admin/users OR /admin/subscriptions
       ↓
Server Action Query (getAdminUsersList / getAdminSubscriptionsList)
       ↓
Filter / Search Toolbar (Role, Status, Plan, Search Query)
       ↓
Detailed Table View (User Roles, Charity % Floor, Renewal Dates)
```

---

# 33. Demo Mode & Payment Simulation Flow (Phase 9)

```text
Public Visitor or Reviewer at /login
       ↓
Clicks "Try Demo Mode (Instant Access)"
       ↓
Navigates to /demo (No credentials required, completely isolated)
       ↓
┌───────────────────────────────────────────────────────────┐
│ DEMO PORTAL (Persistent "DEMO MODE" Top Banner)           │
│ 1. Overview Dashboard: 5 simulated PRD module cards       │
│ 2. Golf Scores (/demo/scores): Rolling 5 scores (1-45 pts)│
│ 3. Charity (/demo/charity): Designated cause & 10% floor  │
│ 4. Monthly Draws (/demo/draws): Dynamic ticket & results  │
│ 5. Winnings (/demo/winnings): Verified payouts ledger     │
│ 6. Account (/demo/account): Profile & simulated plan      │
│ 7. Payment Simulation (/demo/payment)                     │
└───────────────────────────────────────────────────────────┘
       ↓
Open Payment Simulation Modal
       ↓
Select Channel: [Credit/Debit Card | UPI | Procedural QR | Bank Transfer]
       ↓
Simulate Checkout Action
       ↓
Processing State (Spinning indicator, zero external calls)
       ↓
Success State: "Demo Payment Successful"
       ↓
Explicit Disclosure: "Simulation only — no real payment was processed"
       ↓
Exit Demo → Returns to /login
```

---

# 34. Flow Completion Standard

A flow is complete when:

1. Every PRD-required user action is represented.
2. The appropriate role can access the flow.
3. Required validation exists.
4. Success state exists.
5. Error state exists.
6. Relevant empty/loading states exist.
7. The flow works on mobile and desktop.
8. The flow can be traced to a PRD requirement.

---

# 35. Flow-to-PRD Coverage

| PRD Section | Flow Coverage |
|---|---|
| § 01 Project overview | Public entry / product journey |
| § 02 Core objectives | Subscription, scores, draws, charity, admin, UX |
| § 03 User roles | Role-based flows |
| § 04 Subscription & payment | Signup/payment/subscription lifecycle |
| § 05 Score management | Score create/edit/delete/rolling flow |
| § 06 Draw & reward system | Draw participation/admin/result flows |
| § 07 Prize pool logic | Prize calculation/result flow |
| § 08 Charity system | Directory/selection/contribution flow |
| § 09 Winner verification | Proof/review/payout flow |
| § 10 User dashboard | Subscriber dashboard flow |
| § 11 Admin dashboard | Admin operational flows |
| § 12 UI / UX requirements | Homepage, responsive, error/empty/motion principles |
| § 13 Technical requirements | Authentication, authorization, state and validation boundaries |
| § 14 Scalability considerations | Modular flow architecture |
| § 15 Mandatory deliverables | End-to-end user/admin journeys |
| § 16 Evaluation criteria | Flow correctness, traceability, and validation |

---

## End of User Flows

