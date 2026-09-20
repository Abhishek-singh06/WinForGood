# Digital Heroes --- Design & Implementation Master Plan

**Document:** `DESIGN.md`\
**Source of truth:** Digital Heroes PRD (Level 1), Version 1.0, March
2026\
**Purpose:** Master execution specification for Antigravity\
**Rule:** The PRD takes precedence over assumptions, templates, trends,
or implementation convenience.

------------------------------------------------------------------------

# 0. MASTER DIRECTIVE

Build Digital Heroes as a polished, production-quality web platform that
combines:

-   golf performance tracking
-   charity contribution
-   monthly draw-based rewards
-   subscription/payment management
-   winner verification
-   administrative operations

The product must feel **emotion-driven and charity-first**, not like a
traditional golf website.

The PRD explicitly states that it is the single source of truth for
design, development, and evaluation.

## Non-negotiable principles

1.  Do not invent functionality that conflicts with the PRD.
2.  Do not remove mandatory PRD functionality.
3.  Do not silently resolve ambiguous business rules.
4.  Keep business logic authoritative on the server/backend.
5.  Make the interface responsive across mobile and desktop.
6.  Use reusable components rather than duplicated UI.
7.  Design before implementing complex screens.
8.  Validate each stage before proceeding.
9.  Prefer clear, intentional product decisions over generic templates.
10. Keep the codebase clean, structured, documented, and
    production-oriented.

------------------------------------------------------------------------

# 1. EXECUTION METHOD

Do not build the entire application in one uncontrolled pass.

Execute these ten stages in order:

1.  PRD decomposition
2.  Product architecture and user journeys
3.  Visual direction and design system
4.  Public website UX/UI
5.  Subscriber product UX/UI
6.  Draw and charity experiences
7.  Admin control center
8.  Backend and business logic
9.  Integration, validation, and security
10. QA, polish, deployment, and handoff

At every stage:

1.  Inspect the current repository.
2.  Read the relevant PRD requirements.
3.  Identify dependencies.
4.  State the intended changes.
5.  Implement only the current stage.
6.  Run appropriate validation.
7.  Check for regressions.
8.  Document important decisions.
9.  Do not proceed if a blocking ambiguity exists.
10. Preserve existing correct work.

------------------------------------------------------------------------

# 2. STAGE 1 --- PRD DECOMPOSITION

## Objective

Turn the PRD into an implementation-ready requirements map before
writing substantial code.

## Required output

Create:

``` text
docs/
├── requirements.md
├── business-rules.md
├── user-flows.md
├── assumptions.md
├── edge-cases.md
└── traceability.md
```

## Requirements inventory

### Public visitor

The public visitor can:

-   view the platform concept
-   explore listed charities
-   understand draw mechanics
-   initiate subscription

### Registered subscriber

The subscriber can:

-   manage profile and settings
-   enter golf scores
-   edit golf scores
-   select a charity
-   view participation
-   view winnings
-   upload winner proof

### Administrator

The administrator can:

-   manage users
-   manage subscriptions
-   edit user golf scores
-   configure draw logic
-   choose random or algorithmic draw mode
-   run draw simulations
-   publish draw results
-   manage charities
-   manage charity content/media
-   verify winner submissions
-   mark payouts as completed
-   access reports and analytics

------------------------------------------------------------------------

# 3. CORE BUSINESS REQUIREMENTS

## 3.1 Subscription

Plans:

-   monthly
-   yearly at a discounted rate

Payment provider:

-   Stripe or equivalent PCI-compliant provider

Required lifecycle states:

-   active
-   renewal
-   cancelled
-   lapsed/inactive

Authenticated access must verify subscription status in real time.

Non-subscribers have restricted access to platform features.

Do not expose payment secrets in client-side code.

------------------------------------------------------------------------

# 4. SCORE MANAGEMENT

## Required score rules

Each score:

-   uses Stableford format
-   must be between 1 and 45
-   requires a date
-   is associated with the subscriber

Only the latest five scores are retained.

When a sixth score is added:

``` text
new score
    ↓
store new score
    ↓
remove oldest retained score
    ↓
retain latest five
```

Scores must display:

``` text
most recent
     ↓
older
     ↓
oldest
```

## Duplicate date rule

Only one score may exist for a given date.

If a score already exists for that date:

-   do not create a duplicate
-   allow editing
-   allow deletion

This rule must be enforced both in the UI and backend/database layer.

------------------------------------------------------------------------

# 5. DRAW SYSTEM

## Draw types

The PRD defines:

-   5-number match
-   4-number match
-   3-number match

## Draw modes

The PRD allows:

-   random / standard lottery-style
-   algorithmic / weighted by score frequency

## Draw operations

The platform must support:

-   monthly cadence
-   admin-controlled publishing
-   simulation before publishing
-   jackpot rollover when unclaimed
-   automatic prize pool calculation based on active subscriber count

## Important ambiguity

The PRD mentions an algorithmic draw weighted by score frequency but
does not provide a complete mathematical specification.

Therefore:

-   do not invent a hidden algorithm
-   document the chosen interpretation
-   make the algorithm deterministic/testable where appropriate
-   keep the algorithm replaceable
-   clearly separate draw configuration from draw execution

Create:

``` text
docs/draw-algorithm.md
```

before implementing the algorithmic mode.

------------------------------------------------------------------------

# 6. PRIZE POOL LOGIC

The PRD defines:

  Match              Pool Share Rollover
  ---------------- ------------ -----------------
  5-number match            40% Yes --- jackpot
  4-number match            35% No
  3-number match            25% No

Rules:

1.  A fixed portion of subscriptions contributes to the prize pool.
2.  Prize pools are calculated automatically from active subscribers.
3.  Multiple winners in the same tier split that tier equally.
4.  The 5-number jackpot rolls forward when unclaimed.
5.  Prize calculations must be reproducible and testable.

Never perform prize calculations only in frontend JavaScript.

------------------------------------------------------------------------

# 7. CHARITY SYSTEM

Charity is a primary product experience, not an optional settings
feature.

## Contribution model

-   charity is selected at signup
-   minimum contribution is 10% of subscription fee
-   subscriber may voluntarily increase their charity percentage
-   independent donation is available separately from gameplay

## Charity directory

Required functionality:

-   search
-   filtering
-   charity listing
-   charity detail/profile
-   description
-   images
-   upcoming events such as golf days
-   featured charity section on homepage

## Design principle

Charity should communicate:

-   human impact
-   transparency
-   participation
-   purpose
-   emotional connection

Avoid reducing charity to a percentage label alone.

------------------------------------------------------------------------

# 8. WINNER VERIFICATION

Winner verification applies only to winners.

Flow:

``` text
Draw result
    ↓
Winner identified
    ↓
Winner notified
    ↓
Winner uploads proof
    ↓
Admin reviews proof
    ↓
Approved / Rejected
    ↓
Payment pending
    ↓
Paid
```

Payment states:

``` text
Pending → Paid
```

The proof is a screenshot of scores from the golf platform.

The admin must be able to approve or reject the submission.

------------------------------------------------------------------------

# 9. USER DASHBOARD

The dashboard must contain all required PRD modules.

## Subscription module

Display:

-   active/inactive status
-   renewal date
-   plan information where appropriate

## Score module

Display:

-   latest five scores
-   dates
-   add score
-   edit score
-   delete score
-   validation errors

## Charity module

Display:

-   selected charity
-   contribution percentage
-   ability to manage selection where permitted by product rules

## Participation module

Display:

-   draws entered
-   upcoming draws
-   relevant draw status

## Winnings module

Display:

-   total winnings
-   current winnings/payment status

------------------------------------------------------------------------

# 10. ADMIN DASHBOARD

The admin application should be a dedicated operational control center.

## Navigation

Recommended information architecture:

``` text
Overview
Users
Subscriptions
Scores
Draws
Charities
Winners
Payouts
Reports
```

Do not add unrelated business modules unless required by later project
requirements.

------------------------------------------------------------------------

# 11. ADMIN --- USER MANAGEMENT

Admin capabilities:

-   view users
-   edit user profiles
-   view/edit golf scores
-   manage subscriptions

Important:

-   destructive operations require confirmation
-   sensitive actions should be auditable
-   authorization must be enforced server-side

------------------------------------------------------------------------

# 12. ADMIN --- DRAW MANAGEMENT

Admin should be able to:

1.  configure draw mode
2.  configure relevant draw parameters
3.  inspect active subscriber population
4.  calculate projected prize pool
5.  run simulation
6.  inspect simulation result
7.  make corrections before publication where permitted
8.  publish final result
9.  preserve the published result as an immutable historical record

Do not allow an ordinary subscriber to access admin draw controls.

------------------------------------------------------------------------

# 13. ADMIN --- CHARITY MANAGEMENT

Admin can:

-   add charity
-   edit charity
-   delete/deactivate charity where appropriate
-   manage content
-   manage media
-   manage featured charity status

Do not permanently destroy historical charity references if doing so
would corrupt contribution history.

Prefer archival/deactivation where historical records depend on the
charity.

------------------------------------------------------------------------

# 14. ADMIN --- WINNER MANAGEMENT

Admin must be able to:

-   view winners
-   inspect proof submissions
-   approve submissions
-   reject submissions
-   track payment state
-   mark payouts completed

Recommended state model:

``` text
WINNER_IDENTIFIED
       ↓
PROOF_PENDING
       ↓
UNDER_REVIEW
       ↓
APPROVED / REJECTED
       ↓
PAYMENT_PENDING
       ↓
PAID
```

If the PRD does not define a specific intermediate state, treat it as an
implementation detail and document it.

------------------------------------------------------------------------

# 15. REPORTS & ANALYTICS

Required reporting areas:

-   total users
-   total prize pool
-   charity contribution totals
-   draw statistics

Use clear data visualizations only where they improve comprehension.

Do not create vanity charts that do not support an operational question.

------------------------------------------------------------------------

# 16. VISUAL DESIGN DIRECTION

## Core concept

# FEEL, NOT FAIRWAY.

The product must deliberately avoid looking like a traditional golf
website.

Avoid making these the primary visual language:

-   fairways
-   plaid
-   golf-club imagery
-   generic country-club styling
-   tournament-style golf branding

Instead prioritize:

-   charity
-   human impact
-   achievement
-   reward
-   community
-   trust
-   transparency
-   modern digital product aesthetics

------------------------------------------------------------------------

# 17. VISUAL PERSONALITY

The interface should feel:

-   premium
-   modern
-   optimistic
-   human
-   confident
-   emotionally engaging
-   trustworthy
-   clean

It should not feel:

-   corporate-heavy
-   old-fashioned
-   overly sporty
-   casino-like
-   cluttered
-   generic SaaS
-   template-generated

------------------------------------------------------------------------

# 18. DESIGN SYSTEM

Create a reusable design system before building all screens.

## Typography

Define tokens for:

``` text
Display
H1
H2
H3
Body Large
Body
Body Small
Caption
Label
Button
```

Typography must establish clear hierarchy.

## Spacing

Use a consistent spacing scale.

Example:

``` text
xs
sm
md
lg
xl
2xl
3xl
```

Do not manually invent spacing for every component.

## Color tokens

Use semantic tokens:

``` text
background
surface
surface-elevated
text-primary
text-secondary
text-muted
border
accent
success
warning
error
charity
reward
```

The exact final palette must be chosen deliberately during design
exploration.

## Components

Create reusable components for:

-   buttons
-   links
-   inputs
-   selects
-   cards
-   badges
-   alerts
-   modals
-   tables
-   tabs
-   navigation
-   progress indicators
-   stat cards
-   charts
-   empty states
-   loading states
-   error states
-   confirmation dialogs

------------------------------------------------------------------------

# 19. MOTION SYSTEM

The PRD explicitly requires subtle transitions and micro-interactions.

Use motion for:

-   page transitions
-   card entrances
-   hover states
-   button feedback
-   score submission feedback
-   draw countdown
-   prize pool changes
-   successful charity selection
-   proof upload
-   dashboard state changes

Rules:

1.  Motion must communicate state or hierarchy.
2.  Never animate everything.
3.  Avoid distracting loops.
4.  Respect reduced-motion accessibility preferences.
5.  Keep animation timing consistent.

------------------------------------------------------------------------

# 20. PUBLIC WEBSITE INFORMATION ARCHITECTURE

Required public areas:

``` text
/
 /how-it-works
 /charities
 /charities/:id
 /pricing
 /login
 /signup
```

The exact routing structure may adapt to the selected framework, but the
product capabilities must remain.

------------------------------------------------------------------------

# 21. HOMEPAGE STRUCTURE

Recommended structure based directly on the PRD:

``` text
1. Hero
2. What Digital Heroes is
3. How it works
4. Charity impact
5. How the draw works
6. Prize pool explanation
7. Featured charity
8. Pricing
9. Final CTA
10. Footer
```

The homepage must clearly answer:

-   What is this?
-   What does the user do?
-   How does the user participate?
-   How can the user win?
-   How does charity benefit?
-   What should the user do next?

The primary subscription CTA must be prominent.

------------------------------------------------------------------------

# 22. SIGNUP EXPERIENCE

The signup flow must support:

``` text
Account creation
    ↓
Plan selection
    ↓
Charity selection
    ↓
Contribution percentage
    ↓
Payment
    ↓
Subscription confirmation
    ↓
Dashboard
```

The charity choice should be integrated naturally into onboarding
because the PRD requires charity selection at signup.

------------------------------------------------------------------------

# 23. CHARITY DISCOVERY EXPERIENCE

Directory:

``` text
Search
Filters
Charity cards
```

Charity profile:

``` text
Hero/image
Name
Description
Impact information
Upcoming events
Contribution context
Selection CTA
```

The visual treatment should make charity discovery feel meaningful
rather than like a database table.

------------------------------------------------------------------------

# 24. PRICING EXPERIENCE

Clearly communicate:

-   monthly plan
-   yearly plan
-   yearly discount
-   charity contribution
-   what participation includes

Do not make unsupported claims about guaranteed returns, guaranteed
winnings, or charity impact.

------------------------------------------------------------------------

# 25. RESPONSIVE DESIGN

Design mobile-first, then expand to larger screens.

Required:

``` text
Mobile
Tablet
Desktop
Large desktop
```

Check:

-   navigation
-   forms
-   cards
-   tables
-   dashboards
-   charts
-   modals
-   draw results
-   charity directory
-   admin screens

Admin tables must have an intentional mobile strategy rather than simply
overflowing the viewport.

------------------------------------------------------------------------

# 26. ACCESSIBILITY

Implement:

-   semantic HTML
-   keyboard navigation
-   visible focus states
-   accessible form labels
-   sufficient contrast
-   meaningful error messages
-   accessible dialogs
-   appropriate ARIA only where needed
-   reduced-motion support
-   non-color-only status indicators

Accessibility must be considered during component creation, not added at
the end.

------------------------------------------------------------------------

# 27. TECHNICAL ARCHITECTURE

The implementation should separate:

``` text
Presentation
Business logic
Data access
Authentication
Authorization
External integrations
```

Suggested conceptual structure:

``` text
src/
├── components/
├── pages/
├── features/
│   ├── auth/
│   ├── subscriptions/
│   ├── scores/
│   ├── charities/
│   ├── draws/
│   ├── winnings/
│   └── admin/
├── services/
├── hooks/
├── utils/
└── types/
```

Adapt the structure to the actual selected framework rather than blindly
copying it.

------------------------------------------------------------------------

# 28. DATABASE MODEL

At minimum, reason about these domains:

``` text
users
profiles
subscriptions
subscription_events

scores

charities
charity_selections
charity_contributions

draws
draw_configurations
draw_entries
draw_results

prize_pools
prizes

winners
winner_proofs
winner_verifications
payouts

audit_logs
```

Do not implement a schema merely because the table names appear here.

Before migration:

1.  inspect actual requirements
2.  identify relationships
3.  identify lifecycle states
4.  identify historical data requirements
5.  identify constraints
6.  identify indexes
7.  identify authorization boundaries

------------------------------------------------------------------------

# 29. AUTHORIZATION

Use role-based authorization:

``` text
PUBLIC
SUBSCRIBER
ADMIN
```

Never trust a role supplied by the browser.

Every privileged operation must be authorized server-side.

Examples:

-   publishing draws
-   modifying prize calculations
-   editing other users
-   verifying winners
-   marking payouts paid
-   managing charities

------------------------------------------------------------------------

# 30. DATA INTEGRITY

Database constraints should support critical rules.

Examples:

-   one score per user/date
-   valid score range
-   valid subscription state
-   valid winner state
-   valid payout state
-   valid charity contribution percentage
-   valid draw lifecycle

Critical calculations should have automated tests.

------------------------------------------------------------------------

# 31. ERROR HANDLING

Every important operation needs:

### Loading state

``` text
Loading...
```

### Empty state

``` text
No results yet
```

### Error state

Explain:

-   what failed
-   what the user can do next

### Success state

Clearly confirm completed actions.

Avoid generic:

``` text
Something went wrong
```

when a useful explanation is available.

------------------------------------------------------------------------

# 32. SECURITY REQUIREMENTS

Protect:

-   authentication
-   authorization
-   payment information
-   winner proof uploads
-   admin operations
-   environment variables
-   API secrets

Do not expose:

-   secret API keys
-   payment secrets
-   privileged database credentials
-   internal admin endpoints without authorization

Validate uploaded proof files for appropriate:

-   file type
-   size
-   authorization
-   storage access

------------------------------------------------------------------------

# 33. TESTING STRATEGY

## Unit tests

Test:

-   score validation
-   rolling five-score logic
-   duplicate-date handling
-   prize pool calculations
-   tier distribution
-   jackpot rollover
-   winner allocation
-   contribution calculations
-   draw logic

## Integration tests

Test:

-   signup
-   subscription state
-   charity selection
-   score persistence
-   draw creation
-   winner verification
-   payout state

## E2E tests

At minimum:

``` text
Visitor → Signup → Subscription → Charity → Dashboard
Dashboard → Score Entry → Score History
Admin → Draw → Simulation → Publish
Winner → Proof Upload → Admin Review → Paid
```

------------------------------------------------------------------------

# 34. EDGE CASES

Explicitly test:

### Scores

-   score below 1
-   score above 45
-   duplicate date
-   deleting the only score
-   adding a sixth score
-   editing the oldest score
-   same score value on different dates

### Subscription

-   payment failure
-   cancelled subscription
-   expired subscription
-   renewal
-   inactive user accessing protected feature

### Draw

-   zero eligible participants
-   one eligible participant
-   no 5-match winner
-   multiple 5-match winners
-   multiple winners in same tier
-   jackpot rollover
-   simulation differs from published draw
-   repeated publish attempt

### Charity

-   no charities
-   charity search with no results
-   inactive charity
-   minimum contribution
-   increased contribution
-   historical contribution after charity deactivation

### Winner verification

-   missing proof
-   invalid proof
-   rejected proof
-   resubmission where permitted
-   approved proof
-   payment pending
-   paid payout
-   duplicate payout attempt

------------------------------------------------------------------------

# 35. DESIGN QUALITY GATE

Before moving from design to implementation, verify:

``` text
□ Product hierarchy is clear
□ Charity is central to the experience
□ Golf is represented without dominating the visual language
□ CTA hierarchy is clear
□ Mobile layouts are designed
□ Empty/loading/error states exist
□ Subscriber and admin experiences are distinct
□ Components are reusable
□ Typography is consistent
□ Spacing is consistent
□ Motion is intentional
```

------------------------------------------------------------------------

# 36. IMPLEMENTATION QUALITY GATE

Before declaring implementation complete:

``` text
□ No TypeScript/build errors
□ No console errors
□ No broken routes
□ No missing environment variables
□ No duplicated business logic
□ Authentication works
□ Authorization works
□ Database constraints work
□ Critical calculations have tests
□ Responsive layouts work
□ Accessibility checks pass
□ Error states work
```

------------------------------------------------------------------------

# 37. PRD TRACEABILITY

Every major implementation feature must be traceable to a PRD
requirement.

Use a table in:

``` text
docs/traceability.md
```

Format:

  ----------------------------------------------------------------------------
  PRD Requirement  Feature        Screen/API     Test           Status
  ---------------- -------------- -------------- -------------- --------------
  Monthly/yearly   Subscription   Pricing +      Subscription   Pending
  subscription     plans          Checkout       E2E            

  Latest 5 scores  Score manager  Dashboard      Score unit     Pending
                                                 tests          

  Charity minimum  Contribution   Signup +       Contribution   Pending
  10%              logic          Charity        tests          

  5/4/3 match      Draw engine    Admin +        Draw tests     Pending
                                  Results                       

  Winner proof     Verification   Winner/Admin   Verification   Pending
                                                 E2E            
  ----------------------------------------------------------------------------

Do not mark a requirement complete unless it has been implemented and
validated.

------------------------------------------------------------------------

# 38. FINAL DELIVERABLES

The PRD requires:

``` text
LIVE WEBSITE
USER PANEL
ADMIN PANEL
DATABASE
SOURCE CODE
```

Deployment constraints include:

-   new Vercel account
-   new Supabase project
-   correctly configured environment variables

The final project must provide test credentials for the user and admin
experiences.

------------------------------------------------------------------------

# 39. FINAL ACCEPTANCE CHECKLIST

## Product

``` text
□ Visitor experience complete
□ Subscriber experience complete
□ Admin experience complete
□ Subscription flow complete
□ Score management complete
□ Charity system complete
□ Draw system complete
□ Prize pool logic complete
□ Winner verification complete
□ Payout tracking complete
□ Reports complete
```

## Design

``` text
□ Modern
□ Emotion-driven
□ Charity-first
□ Distinctive
□ Responsive
□ Accessible
□ Motion-enhanced
□ Consistent design system
□ No traditional golf cliché dependency
```

## Engineering

``` text
□ Clean architecture
□ Secure authentication
□ Server-side authorization
□ Correct data constraints
□ Correct calculations
□ Automated tests
□ Error handling
□ Edge-case handling
□ Production build
□ Deployment ready
```

------------------------------------------------------------------------

# 40. ANTIGRAVITY OPERATING RULE

For every implementation task, follow this loop:

``` text
READ
  ↓
UNDERSTAND
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
TEST
  ↓
INSPECT
  ↓
POLISH
  ↓
DOCUMENT
```

Never:

``` text
PROMPT
  ↓
GENERATE EVERYTHING
  ↓
ASSUME IT WORKS
```

------------------------------------------------------------------------

# 41. DEFINITION OF DONE

Digital Heroes is complete only when:

1.  Every mandatory PRD requirement has a corresponding implementation.
2.  Every critical business rule is validated.
3.  The subscriber experience works end-to-end.
4.  The admin experience works end-to-end.
5.  Draw and prize calculations are testable and correct according to
    the documented interpretation.
6.  Charity contributions are correctly represented.
7.  Winner verification and payout tracking work.
8.  The UI is responsive.
9.  The interface follows the "Feel, not fairway" direction.
10. The application passes the final functional, visual, accessibility,
    and technical QA.
11. The application is deployable.
12. The documentation explains important architectural and
    ambiguous-requirement decisions.

------------------------------------------------------------------------

# 42. FINAL INSTRUCTION TO ANTIGRAVITY

**Do not optimize for speed at the expense of correctness or design
quality.**

This project is being evaluated as a full-stack development assignment.

The quality bar is therefore:

``` text
Requirements interpretation
        +
Product thinking
        +
UI/UX quality
        +
System design
        +
Data correctness
        +
Scalability
        +
Testing
        +
Polish
```

The PRD is the authority.

When the PRD specifies something, implement it.

When the PRD does not specify something, identify the ambiguity,
document the assumption, and choose the smallest defensible
implementation that preserves extensibility.

Do not silently invent business rules.

Do not sacrifice required functionality to make the UI simpler.

Do not turn the product into a generic golf website.

Do not turn the product into a generic SaaS dashboard.

Build **Digital Heroes** as a distinct, modern, charity-first digital
product.
