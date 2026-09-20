# Digital Heroes — Screen Inventory & UI Specifications

**Document:** `docs/screen-inventory.md`  
**Authoritative Hierarchy:**
1. `Digital Heroes PRD (Level 1).pdf` — **PRIMARY SOURCE OF TRUTH**
2. `DESIGN.md` (DESIGN(2).md) — Design & Execution Master Specification
3. `docs/requirements.md`
4. `docs/business-rules.md`
5. `docs/user-flows.md`
6. `docs/assumptions.md`
7. `docs/edge-cases.md`
8. `docs/traceability.md`

---

# 1. Overview & Inventory Summary

Every view in Digital Heroes corresponds directly to PRD-mandated user journeys across the three defined roles:
- **Public Visitor (8 screens):** Marketing, discovery, transparency, and subscriber onboarding.
- **Registered Subscriber (10 screens):** Self-service dashboard, rolling score management, charity allocation, draw participation, and winner verification.
- **Administrator (14 screens):** Comprehensive operational control across users, draws, simulations, charities, winner verifications, payouts, and reports.

---

# 2. Public Visitor Screens

---

### Screen ID: `SCR-PUB-01` — Homepage
- **Screen Name:** Editorial Impact & Platform Landing
- **User Role:** Public Visitor
- **Purpose:** Communicate what the user does, how they win, charity impact, and drive subscription conversion (`[PRD § 12]`).
- **Entry Point:** Base domain root (`/`).
- **Primary CTA:** "Subscribe & Play" / "Join the Draw" button directing to `/signup`.
- **Secondary Actions:** "Explore Causes" (links to `/charities`), "How It Works" (links to `/how-it-works`), "Sign In" (links to `/login`).
- **Required Data:** Active rollover jackpot counter, aggregate charity contribution total, featured spotlight charity profile, current draw date.
- **Components:** Editorial Hero Banner, Dynamic Rollover Ticker, 3-Step "How It Works" Interactive Cards, Charity Spotlight Showcase, Testimonial/Impact Carousel, Footer.
- **Loading State:** Editorial skeleton cards with shimmer pulse.
- **Empty State:** N/A (Static marketing with fallback data).
- **Error State:** Fallback banner if live prize pool counter API fails; displays baseline seasonal jackpot.
- **Success State:** N/A.
- **Mobile Behavior:** Single-column stacked story flow; sticky bottom CTA bar with "Subscribe" action.
- **Desktop Behavior:** Full-width editorial typography with floating dynamic metric cards.
- **Accessibility Considerations:** High contrast headings (> 4.5:1), ARIA labels on live jackpot ticker (`aria-live="polite"`), skip-to-content link.
- **Related PRD Section:** § 01, § 02, § 08.2, § 12.
- **Related Requirement IDs:** `TR-001`, `TR-020`, `TR-074`, `TR-110`, `TR-112`, `TR-113`, `TR-115`.
- **Related Business-Rule IDs:** `BR-110`, `BR-111`, `BR-112`, `BR-114`.
- **Related User-Flow IDs:** `UF-001`, `UF-002`, `UF-003`.
- **Related Edge-Case IDs:** `EC-001`, `EC-170`.

---

### Screen ID: `SCR-PUB-02` — How It Works
- **Screen Name:** Mechanics & Transparency Guide
- **User Role:** Public Visitor
- **Purpose:** Explain golf score tracking (Stableford format 1–45), charity allocation (>=10%), and monthly draw tiers (5-, 4-, 3-number matches) in clear non-gambling terms.
- **Entry Point:** Navigation bar link (`/how-it-works`).
- **Primary CTA:** "Choose Your Plan" (links to `/pricing`).
- **Secondary Actions:** "View Active Charities" (`/charities`).
- **Required Data:** Match tier distribution explanation (40%/35%/25%), Stableford rules overview.
- **Components:** Interactive Rule Step-Through, Draw Match Diagram, Rollover Explainer Card, FAQ Accordion.
- **Loading State:** Instant render (static SSR content).
- **Empty State:** N/A.
- **Error State:** N/A.
- **Success State:** N/A.
- **Mobile Behavior:** Vertical accordion cards with smooth expand/collapse.
- **Desktop Behavior:** Multi-column comparison grid with interactive tier toggle.
- **Accessibility Considerations:** Accordion buttons with `aria-expanded` attributes, accessible table semantics for tier distributions.
- **Related PRD Section:** § 01.1, § 05, § 06, § 07, § 12.
- **Related Requirement IDs:** `TR-002`, `TR-020`, `TR-041`, `TR-051`, `TR-061`.
- **Related Business-Rule IDs:** `BR-020`, `BR-041`, `BR-061`, `BR-112`.
- **Related User-Flow IDs:** `UF-002`.
- **Related Edge-Case IDs:** `EC-001`, `EC-180`.

---

### Screen ID: `SCR-PUB-03` — Charity Directory
- **Screen Name:** Charitable Causes Directory
- **User Role:** Public Visitor & Registered Subscriber
- **Purpose:** Search, filter, and discover partner charities eligible for subscription contributions and direct donations (`[PRD § 08.2]`).
- **Entry Point:** Main navigation link (`/charities`).
- **Primary CTA:** "Support This Cause" (on charity cards, links to `/signup?charity=[id]` or donate modal).
- **Secondary Actions:** Category filters, search input, "Make Direct Donation" button.
- **Required Data:** List of active charities (id, name, mission, logo, hero image, category, upcoming golf day events).
- **Components:** Search Bar, Category Pill Filter, Charity Card Grid, Event Badges, Direct Donation Modal Trigger.
- **Loading State:** 6-card grid skeleton placeholders.
- **Empty State:** "No charities match your search query — try clearing filters."
- **Error State:** "Unable to load charity directory. Please refresh." with retry button.
- **Success State:** Search results count displayed dynamically.
- **Mobile Behavior:** Single column card stack; sticky search filter drawer.
- **Desktop Behavior:** 3-column responsive card grid with persistent sidebar/top filters.
- **Accessibility Considerations:** `aria-live="polite"` on filtered card counts; accessible search input labels.
- **Related PRD Section:** § 08.2.
- **Related Requirement IDs:** `TR-074`.
- **Related Business-Rule IDs:** `BR-074`, `BR-075`.
- **Related User-Flow IDs:** `UF-004`.
- **Related Edge-Case IDs:** `EC-003`, `EC-004`, `EC-066`, `EC-171`.

---

### Screen ID: `SCR-PUB-04` — Charity Profile
- **Screen Name:** Cause Detail & Impact Profile
- **User Role:** Public Visitor & Registered Subscriber
- **Purpose:** Display in-depth narrative, imagery, and upcoming community events (golf days) for a specific charity (`[PRD § 08.2]`).
- **Entry Point:** Charity card click (`/charities/[slug]`).
- **Primary CTA:** "Select at Signup" (`/signup?charity=[id]`).
- **Secondary Actions:** "Donate Independently" (opens Stripe direct donation modal).
- **Required Data:** Detailed charity description, impact stats, upcoming golf day dates and locations, gallery media.
- **Components:** Cause Hero Header, Impact Story Section, Upcoming Golf Days Calendar Card, Direct Donation Action Box.
- **Loading State:** Full-page layout skeleton with shimmer media placeholder.
- **Empty State:** If charity has no scheduled events: "No upcoming golf days scheduled at this time."
- **Error State:** 404 page: "Charity not found or no longer active."
- **Success State:** N/A.
- **Mobile Behavior:** Stacked media and text; fixed bottom donation/signup action drawer.
- **Desktop Behavior:** Editorial 2-column layout (story on left, sticky donation card on right).
- **Accessibility Considerations:** All images have descriptive `alt` text; proper heading progression (h1 -> h2).
- **Related PRD Section:** § 08.2.
- **Related Requirement IDs:** `TR-074`.
- **Related Business-Rule IDs:** `BR-075`, `BR-076`.
- **Related User-Flow IDs:** `UF-004`.
- **Related Edge-Case IDs:** `EC-067`, `EC-171`.

---

### Screen ID: `SCR-PUB-05` — Pricing & Plans
- **Screen Name:** Subscription Plan Selection
- **User Role:** Public Visitor
- **Purpose:** Present monthly and discounted yearly membership options transparently (`[PRD § 04]`).
- **Entry Point:** Navigation link (`/pricing`).
- **Primary CTA:** "Get Started" on selected plan (links to `/signup?plan=[monthly|yearly]`).
- **Secondary Actions:** Toggle billing interval (Monthly vs. Annual).
- **Required Data:** Monthly price, yearly discounted price, plan feature list, charity share highlight.
- **Components:** Billing Interval Toggle, Plan Pricing Cards, Savings Callout Badge, FAQ Section.
- **Loading State:** Instant SSR render.
- **Empty State:** N/A.
- **Error State:** N/A.
- **Success State:** N/A.
- **Mobile Behavior:** Stacked vertical cards with toggle switcher on top.
- **Desktop Behavior:** Side-by-side comparative cards with recommended annual plan visually elevated.
- **Accessibility Considerations:** Accessible toggle switch with `aria-checked` role and keyboard support.
- **Related PRD Section:** § 04.
- **Related Requirement IDs:** `TR-030`.
- **Related Business-Rule IDs:** `BR-010`, `BR-114`.
- **Related User-Flow IDs:** `UF-005`.
- **Related Edge-Case IDs:** `EC-020`, `EC-021`.

---

### Screen ID: `SCR-PUB-06` — Login
- **Screen Name:** Member Authentication
- **User Role:** Public / Registered Member
- **Purpose:** Secure email/password authentication for subscribers and administrators.
- **Entry Point:** Top navigation link (`/login`).
- **Primary CTA:** "Sign In" button.
- **Secondary Actions:** "Don't have an account? Subscribe" (`/signup`), "Forgot Password?".
- **Required Data:** None (form inputs: email, password).
- **Components:** Auth Form Card, Email & Password Inputs, Inline Validation Prompts, Submit Button.
- **Loading State:** Button spinner with disabled inputs during authentication request.
- **Empty State:** Blank input fields with accessible placeholder and floating labels.
- **Error State:** Inline error banner: "Invalid email or password. Please try again."
- **Success State:** Redirect to `/dashboard` (subscriber) or `/admin` (administrator).
- **Mobile Behavior:** Centered card with full-screen mobile view, touch-friendly input fields (48px height).
- **Desktop Behavior:** Elegant split screen (brand impact photography on left, form on right).
- **Accessibility Considerations:** `autocomplete` attributes on inputs, visible focus rings, ARIA alerts for errors.
- **Related PRD Section:** § 03, § 15.
- **Related Requirement IDs:** `TR-021`, `TR-022`, `TR-141`.
- **Related Business-Rule IDs:** `BR-140`, `BR-150`.
- **Related User-Flow IDs:** `UF-007`.
- **Related Edge-Case IDs:** `EC-012`, `EC-013`.

---

### Screen ID: `SCR-PUB-07` — Signup & Charity Selection
- **Screen Name:** Account Registration & Cause Selection
- **User Role:** Public Visitor
- **Purpose:** Register subscriber account and select primary charity with contribution percentage (`[PRD § 08.1]`).
- **Entry Point:** "Subscribe" buttons throughout site (`/signup`).
- **Primary CTA:** "Continue to Payment" (navigates to Stripe Checkout or subscription payment screen).
- **Secondary Actions:** "Already a member? Sign in" (`/login`).
- **Required Data:** List of active charities for dropdown/picker, default minimum 10% contribution.
- **Components:** User Details Form, Charity Selector Dropdown/Cards, Contribution Percentage Slider (locked at >=10%).
- **Loading State:** Form disabled with loader while submitting registration.
- **Empty State:** Charity pre-selected if navigated from charity profile; otherwise prompts selection.
- **Error State:** Inline validation for password strength, existing email, or contribution < 10%.
- **Success State:** Moves to payment step.
- **Mobile Behavior:** Multi-step wizard layout with progress indicator.
- **Desktop Behavior:** Unified card layout with live contribution preview calculation.
- **Accessibility Considerations:** Slider has `aria-valuemin="10"`, `aria-valuemax="100"`, `aria-valuenow="10"`.
- **Related PRD Section:** § 04, § 08.1.
- **Related Requirement IDs:** `TR-021`, `TR-070`, `TR-071`.
- **Related Business-Rule IDs:** `BR-070`, `BR-071`, `BR-150`.
- **Related User-Flow IDs:** `UF-006`.
- **Related Edge-Case IDs:** `EC-010`, `EC-011`, `EC-060`, `EC-061`, `EC-062`.

---

### Screen ID: `SCR-PUB-08` — Subscription Payment & Confirmation
- **Screen Name:** Secure Stripe Payment Processing
- **User Role:** Authenticated New Subscriber
- **Purpose:** Finalize PCI-compliant monthly or yearly recurring billing (`[PRD § 04]`).
- **Entry Point:** Following registration (`/checkout`).
- **Primary CTA:** "Subscribe Now" (triggers Stripe session).
- **Secondary Actions:** "Back to Plan Selection".
- **Required Data:** Selected plan ID, selected charity ID, contribution percentage, user token.
- **Components:** Stripe Elements Container / Embedded Checkout, Order Summary Card.
- **Loading State:** Stripe secure iframe loading animation.
- **Empty State:** N/A.
- **Error State:** Stripe payment failure message (e.g. card declined, expired).
- **Success State:** Redirect to `/dashboard?welcome=true` with confirmation modal.
- **Mobile Behavior:** Mobile-optimized payment sheet (Apple Pay / Google Pay supported).
- **Desktop Behavior:** Split layout: order breakdown and charity allocation on left, card element on right.
- **Accessibility Considerations:** Handled via accessible Stripe Elements standards.
- **Related PRD Section:** § 04.
- **Related Requirement IDs:** `TR-030`, `TR-031`, `TR-033`.
- **Related Business-Rule IDs:** `BR-010`, `BR-011`, `BR-013`.
- **Related User-Flow IDs:** `UF-005`.
- **Related Edge-Case IDs:** `EC-020`, `EC-022`, `EC-027`.

---

# 3. Registered Subscriber Screens

---

### Screen ID: `SCR-SUB-01` — User Dashboard
- **Screen Name:** Member Command Center
- **User Role:** Registered Subscriber
- **Purpose:** Unified interface containing all 5 PRD-mandated user modules (`[PRD § 10]`).
- **Entry Point:** `/dashboard` (default member landing).
- **Primary CTA:** "Enter Latest Score" (opens score dialog).
- **Secondary Actions:** "View Past Draws", "Update Charity", "Upload Winner Proof" (if winning).
- **Required Data:**
  1. Subscription status (active/inactive/renewal date)
  2. Latest 5 scores in reverse chronological order
  3. Selected charity name, logo, and contribution percentage
  4. Participation summary (draws entered, upcoming draw date)
  5. Winnings overview (total won, pending payouts, verification status)
- **Components:**
  - `SubscriptionStatusBadge`
  - `FiveScoreCardGrid`
  - `CharityImpactWidget`
  - `DrawParticipationCard`
  - `WinningsSummaryCard` (with action banner if proof required)
- **Loading State:** Module card skeletons with shimmering placeholders.
- **Empty State:** If 0 scores entered: "No scores recorded yet. Add your first Stableford round to enter the draw."
- **Error State:** Alert notification if subscription is lapsed or payment failed.
- **Success State:** Confirmation toast on profile or score update.
- **Mobile Behavior:** Single-column modular feed; critical alerts pinned to top.
- **Desktop Behavior:** 12-column responsive dashboard grid with quick-action header.
- **Accessibility Considerations:** Landmark regions (`main`, `section`), ARIA live regions for winning alerts.
- **Related PRD Section:** § 04, § 05, § 08, § 09, § 10.
- **Related Requirement IDs:** `TR-090`, `TR-091`, `TR-092`, `TR-093`, `TR-094`.
- **Related Business-Rule IDs:** `BR-090`, `BR-091`, `BR-092`, `BR-093`, `BR-094`.
- **Related User-Flow IDs:** `UF-008`.
- **Related Edge-Case IDs:** `EC-120`, `EC-121`, `EC-122`, `EC-123`, `EC-124`.

---

### Screen ID: `SCR-SUB-02` — Scores Hub
- **Screen Name:** Golf Performance & Round History
- **User Role:** Registered Subscriber
- **Purpose:** Dedicated view of the 5 retained scores in reverse chronological order (`[PRD § 05]`).
- **Entry Point:** `/dashboard/scores`.
- **Primary CTA:** "Add New Score".
- **Secondary Actions:** "Edit Score", "Delete Score".
- **Required Data:** List of currently retained scores (up to 5) with score value (1–45) and round date.
- **Components:** Score Cards (1–5), Round Date Badge, Stableford Points Indicator, Rolling Replacement Notice.
- **Loading State:** 5 card skeletons.
- **Empty State:** Empty round prompt with visual guide on Stableford format.
- **Error State:** Network error alert with reload button.
- **Success State:** Score list updated smoothly with reordering animation.
- **Mobile Behavior:** Vertical cards with swipe or tap actions for edit/delete.
- **Desktop Behavior:** Horizontal score strip with historical trend indicators.
- **Accessibility Considerations:** Score values announced clearly with date (`aria-label="38 Stableford points on March 14, 2026"`).
- **Related PRD Section:** § 05.
- **Related Requirement IDs:** `TR-040`, `TR-045`.
- **Related Business-Rule IDs:** `BR-020`, `BR-024`, `BR-026`.
- **Related User-Flow IDs:** `UF-009`, `UF-010`.
- **Related Edge-Case IDs:** `EC-050`, `EC-051`, `EC-052`.

---

### Screen ID: `SCR-SUB-03` — Score Entry & Edit Modal / Form
- **Screen Name:** Score Submission Interface
- **User Role:** Registered Subscriber
- **Purpose:** Add a new score or edit an existing score with strict duplicate-date prevention (`[PRD § 05]`).
- **Entry Point:** Click "Add New Score" or "Edit" on score card (`/dashboard/scores/entry` or modal).
- **Primary CTA:** "Save Score".
- **Secondary Actions:** "Cancel", "Delete Entry" (when editing).
- **Required Data:** Selected round date, score integer (1–45).
- **Components:** Score Number Picker / Input (1–45), Date Picker, Duplicate Date Warning Message, Rolling FIFO Alert.
- **Loading State:** Button disabled with spinner during save.
- **Empty State:** Date defaults to today; score input blank.
- **Error State:** **Strict PRD error:** "A score for this date already exists. You may only edit or delete the existing score."
- **Success State:** Toast notification: "Score saved. Oldest score archived automatically."
- **Mobile Behavior:** Bottom slide-up drawer with large numeric keypad.
- **Desktop Behavior:** Centered modal dialog with keyboard navigation focus trap.
- **Accessibility Considerations:** Input has `min="1"` and `max="45"`, error messages linked via `aria-describedby`.
- **Related PRD Section:** § 05.
- **Related Requirement IDs:** `TR-041`, `TR-042`, `TR-043`, `TR-044`.
- **Related Business-Rule IDs:** `BR-021`, `BR-022`, `BR-023`, `BR-025`, `BR-027`.
- **Related User-Flow IDs:** `UF-009`, `UF-011`, `UF-012`.
- **Related Edge-Case IDs:** `EC-030`, `EC-031`, `EC-032`, `EC-033`, `EC-034`, `EC-035`, `EC-036`, `EC-037`.

---

### Screen ID: `SCR-SUB-04` — Subscriber Charity Preference
- **Screen Name:** Cause & Contribution Settings
- **User Role:** Registered Subscriber
- **Purpose:** View current charity recipient and adjust voluntary contribution percentage (`[PRD § 08.1, § 10]`).
- **Entry Point:** `/dashboard/charity`.
- **Primary CTA:** "Save Contribution Settings".
- **Secondary Actions:** "Change Charity Recipient", "Explore All Charities".
- **Required Data:** Current charity details, current percentage (>= 10%), cumulative personal contribution total.
- **Components:** Selected Cause Card, Contribution Slider (10%–100%), Monthly Impact Calculator, Change Cause Modal.
- **Loading State:** Shimmering impact cards.
- **Empty State:** N/A (Charity is selected at signup).
- **Error State:** Error banner if attempting to lower contribution below 10%.
- **Success State:** Toast: "Contribution preferences updated successfully."
- **Mobile Behavior:** Vertical slider with tactile percentage badges.
- **Desktop Behavior:** Side-by-side card with visual breakdown of subscription fee distribution.
- **Accessibility Considerations:** Slider keyboard increment controls (Arrow keys adjust by 1%, PageUp/Down by 5%).
- **Related PRD Section:** § 08.1, § 10.
- **Related Requirement IDs:** `TR-071`, `TR-072`, `TR-092`.
- **Related Business-Rule IDs:** `BR-071`, `BR-072`, `BR-092`.
- **Related User-Flow IDs:** `UF-013`.
- **Related Edge-Case IDs:** `EC-061`, `EC-063`, `EC-064`.

---

### Screen ID: `SCR-SUB-05` — Draws Hub
- **Screen Name:** Monthly Draw Participation
- **User Role:** Registered Subscriber
- **Purpose:** Track draw participation, view countdown to next monthly draw, and inspect entered scores (`[PRD § 06, § 10]`).
- **Entry Point:** `/dashboard/draws`.
- **Primary CTA:** "Check Your Entered Scores".
- **Secondary Actions:** "View Past Draw Archive".
- **Required Data:** Upcoming draw date, current active jackpot total, user's snapshot scores entered into the upcoming draw.
- **Components:** Next Draw Countdown Card, Estimated Prize Pool Card, My Entry Numbers Badge Row, Draw History Table.
- **Loading State:** Card pulse skeletons.
- **Empty State:** If user has fewer than 5 scores: Alert banner indicating eligibility status (`[OPEN-DECISION A-012]`).
- **Error State:** Error banner if draw service is unavailable.
- **Success State:** N/A.
- **Mobile Behavior:** Stacked countdown and entry number pill tags.
- **Desktop Behavior:** Wide banner countdown with interactive score preview.
- **Accessibility Considerations:** Countdown timer announces intervals without flooding screen readers (`aria-live="off"` on seconds).
- **Related PRD Section:** § 06, § 07, § 10.
- **Related Requirement IDs:** `TR-050`, `TR-093`.
- **Related Business-Rule IDs:** `BR-040`, `BR-093`.
- **Related User-Flow IDs:** `UF-014`.
- **Related Edge-Case IDs:** `EC-080`, `EC-084`, `EC-121`.

---

### Screen ID: `SCR-SUB-06` — Draw Result & Number Reveal
- **Screen Name:** Published Draw Results
- **User Role:** Registered Subscriber & Public Visitor
- **Purpose:** View published winning numbers and highlight user's matched scores (3-, 4-, or 5-number match) (`[PRD § 06, § 07]`).
- **Entry Point:** `/dashboard/draws/[draw_id]` or `/draws/[draw_id]`.
- **Primary CTA:** "Upload Winner Proof" (prominently displayed if user matched 3, 4, or 5 numbers).
- **Secondary Actions:** "Back to Draws Hub", "Share My Impact".
- **Required Data:** 5 winning numbers, user's matching score badges, total winners per tier, prize share per winner.
- **Components:** Animated Draw Balls Container, Match Highlights Card, Tier Payout Breakdown, Rollover Status Card.
- **Loading State:** Skeleton ball container.
- **Empty State:** N/A.
- **Error State:** "Draw details not found."
- **Success State:** Animated celebration banner for matching subscribers.
- **Mobile Behavior:** Centered vertical reveal sequence with tactile bounce animations.
- **Desktop Behavior:** Horizontal reveal stage with full winner tier table below.
- **Accessibility Considerations:** Winning numbers read sequentially with semantic list elements.
- **Related PRD Section:** § 06, § 07, § 10.
- **Related Requirement IDs:** `TR-051`, `TR-061`, `TR-094`.
- **Related Business-Rule IDs:** `BR-041`, `BR-061`, `BR-094`.
- **Related User-Flow IDs:** `UF-016`, `UF-017`.
- **Related Edge-Case IDs:** `EC-092`, `EC-093`, `EC-094`, `EC-095`.

---

### Screen ID: `SCR-SUB-07` — Winnings & Payouts Hub
- **Screen Name:** Prize Earnings & Verification Summary
- **User Role:** Registered Subscriber
- **Purpose:** Full overview of user's winnings, verification statuses, and current payment states (`[PRD § 09, § 10]`).
- **Entry Point:** `/dashboard/winnings`.
- **Primary CTA:** "Upload Proof for Pending Wins" (links to `/dashboard/winnings/proof`).
- **Secondary Actions:** "Download Earnings Statement".
- **Required Data:** Lifetime prize total, list of winning draws with tier, matched numbers, prize amount, verification status (`pending`, `proof_submitted`, `approved`, `rejected`), and payment status (`Pending`, `Paid`).
- **Components:** Winnings Metric Card, Verification Action Alert, Payout Status Table, Proof History Viewer.
- **Loading State:** Table skeleton with 3 rows.
- **Empty State:** "No winnings recorded yet. Keep entering your rounds to qualify for monthly prize pools."
- **Error State:** Network error toast with retry button.
- **Success State:** Status badge updates immediately when proof is uploaded.
- **Mobile Behavior:** Card-based list with status tags; action button pinned to winning cards.
- **Desktop Behavior:** Full data table with inline proof upload action buttons.
- **Accessibility Considerations:** Status badges have high contrast and icons + text (not color alone).
- **Related PRD Section:** § 09, § 10.
- **Related Requirement IDs:** `TR-082`, `TR-094`.
- **Related Business-Rule IDs:** `BR-080`, `BR-084`, `BR-094`.
- **Related User-Flow IDs:** `UF-017`, `UF-020`.
- **Related Edge-Case IDs:** `EC-110`, `EC-111`, `EC-122`.

---

### Screen ID: `SCR-SUB-08` — Winner Proof Upload
- **Screen Name:** Proof of Score Submission
- **User Role:** Registered Subscriber (Winner Only)
- **Purpose:** Upload official golf platform score screenshot to verify winning round (`[PRD § 09]`).
- **Entry Point:** Alert on dashboard or winnings page (`/dashboard/winnings/proof?winner_id=[id]`).
- **Primary CTA:** "Submit Proof for Verification".
- **Secondary Actions:** "Cancel / Return to Winnings".
- **Required Data:** Winning draw details, matched scores, current verification status, rejection reason (if resubmitting).
- **Components:** File Drag-and-Drop Zone, Screenshot Preview Container, Match Checklist Card, Guidelines Accordion.
- **Loading State:** Upload progress bar with percentage indicator.
- **Empty State:** Dropzone ready for file selection (PNG, JPG, PDF up to 10MB).
- **Error State:** Validation error: "Invalid file format" or "File exceeds 10MB limit."
- **Success State:** Success screen: "Proof submitted. Administrator review is underway."
- **Mobile Behavior:** Native camera / photo library picker trigger.
- **Desktop Behavior:** Drag-and-drop zone with instant thumbnail preview.
- **Accessibility Considerations:** File input accessible via keyboard; upload progress announced via `aria-live`.
- **Related PRD Section:** § 09.
- **Related Requirement IDs:** `TR-080`.
- **Related Business-Rule IDs:** `BR-080`, `BR-081`.
- **Related User-Flow IDs:** `UF-018`.
- **Related Edge-Case IDs:** `EC-100`, `EC-101`, `EC-102`, `EC-105`.

---

### Screen ID: `SCR-SUB-09` — Profile & Account Settings
- **Screen Name:** Subscriber Profile
- **User Role:** Registered Subscriber
- **Purpose:** Manage personal details, contact email, and password.
- **Entry Point:** `/dashboard/profile`.
- **Primary CTA:** "Save Profile Changes".
- **Secondary Actions:** "Change Password", "Log Out".
- **Required Data:** User profile record (full name, email, account created date).
- **Components:** Profile Form, Security Card, Account Metadata Badge.
- **Loading State:** Form disabled with loader.
- **Empty State:** N/A.
- **Error State:** Inline error if email format is invalid.
- **Success State:** Toast: "Profile updated successfully."
- **Mobile Behavior:** Single column form with sticky save button.
- **Desktop Behavior:** Standard settings card layout.
- **Accessibility Considerations:** All inputs clearly associated with label elements.
- **Related PRD Section:** § 03, § 10.
- **Related Requirement IDs:** `TR-021`.
- **Related Business-Rule IDs:** `BR-142`.
- **Related User-Flow IDs:** `UF-008`.
- **Related Edge-Case IDs:** `EC-181`.

---

### Screen ID: `SCR-SUB-10` — Subscription Management
- **Screen Name:** Membership & Billing Lifecycle
- **User Role:** Registered Subscriber
- **Purpose:** View subscription tier, renewal date, payment history, or manage cancellation (`[PRD § 04]`).
- **Entry Point:** `/dashboard/subscription`.
- **Primary CTA:** "Manage Billing in Stripe" (triggers customer portal).
- **Secondary Actions:** "Switch to Annual Plan" (if monthly), "Cancel Subscription".
- **Required Data:** Plan type (Monthly/Yearly), status (Active, Inactive, Lapsed, Cancelled), renewal date, Stripe customer ID.
- **Components:** Current Plan Card, Renewal Date Callout, Payment Method Card, Cancel Confirmation Modal.
- **Loading State:** Shimmering plan card.
- **Empty State:** N/A.
- **Error State:** Alert banner if card is expired or payment has lapsed.
- **Success State:** Updated subscription status reflected immediately.
- **Mobile Behavior:** Stacked card view with prominent billing portal button.
- **Desktop Behavior:** Two-column billing layout with invoice history list.
- **Accessibility Considerations:** Destructive cancellation action requires explicit two-step confirmation with dialog focus trap.
- **Related PRD Section:** § 04.
- **Related Requirement IDs:** `TR-030`, `TR-033`.
- **Related Business-Rule IDs:** `BR-013`, `BR-014`, `BR-015`.
- **Related User-Flow IDs:** `UF-005`.
- **Related Edge-Case IDs:** `EC-023`, `EC-024`, `EC-025`.

---

# 4. Administrator Control Screens

---

### Screen ID: `SCR-ADM-01` — Admin Overview
- **Screen Name:** Operations Command Hub
- **User Role:** Administrator
- **Purpose:** Executive summary of platform activity, pending actions, and quick links across all 5 admin surfaces (`[PRD § 11]`).
- **Entry Point:** `/admin`.
- **Primary CTA:** "Review Pending Winner Proofs" (if pending items exist).
- **Secondary Actions:** "Configure Next Draw", "Manage Users", "Export Reports".
- **Required Data:** Active subscriber count, pending proof verification count, current prize pool estimate, next draw countdown, quick-action alerts.
- **Components:** Operational KPI Cards, Pending Action Alert Bar, Quick Link Navigation Grid, System Status Indicator.
- **Loading State:** 4-card metric skeleton grid.
- **Empty State:** "No urgent administrative actions pending."
- **Error State:** Alert: "Unable to sync operational metrics."
- **Success State:** N/A.
- **Mobile Behavior:** Stacked KPI cards with collapsible admin navigation drawer.
- **Desktop Behavior:** High-density 12-column operational dashboard.
- **Accessibility Considerations:** Proper heading structure and ARIA live announcements on alert badges.
- **Related PRD Section:** § 11.
- **Related Requirement IDs:** `TR-100`, `TR-101`, `TR-102`, `TR-103`, `TR-104`.
- **Related Business-Rule IDs:** `BR-100`, `BR-101`, `BR-102`, `BR-103`, `BR-104`.
- **Related User-Flow IDs:** `UF-021`.
- **Related Edge-Case IDs:** `EC-130`, `EC-131`.

---

### Screen ID: `SCR-ADM-02` — User Management
- **Screen Name:** Subscriber Directory & Directory
- **User Role:** Administrator
- **Purpose:** Search, filter, and inspect registered subscribers and subscription states (`[PRD § 11]`).
- **Entry Point:** `/admin/users`.
- **Primary CTA:** "Inspect User Profile".
- **Secondary Actions:** Filter by subscription status (`active`, `lapsed`, `cancelled`), search by name/email.
- **Required Data:** Paginated subscriber list (id, full name, email, plan, status, retained score count, signup date).
- **Components:** Search & Filter Toolbar, Subscriber Data Table, Status Filter Pills, Pagination Controls.
- **Loading State:** Table skeleton with 10 rows.
- **Empty State:** "No users found matching query."
- **Error State:** Table error notice with retry button.
- **Success State:** N/A.
- **Mobile Behavior:** Responsive card list with tap-to-expand details.
- **Desktop Behavior:** Dense, sortable data table with sticky headers.
- **Accessibility Considerations:** Accessible table markup (`th`, `scope="col"`), keyboard pagination.
- **Related PRD Section:** § 11.
- **Related Requirement IDs:** `TR-100`.
- **Related Business-Rule IDs:** `BR-100`.
- **Related User-Flow IDs:** `UF-022`.
- **Related Edge-Case IDs:** `EC-132`.

---

### Screen ID: `SCR-ADM-03` — User Detail & Score Audit
- **Screen Name:** User Profile & Score Record
- **User Role:** Administrator
- **Purpose:** View full profile, subscription history, and perform administrative score edits/deletions (`[PRD § 11]`).
- **Entry Point:** `/admin/users/[id]`.
- **Primary CTA:** "Edit User Scores".
- **Secondary Actions:** "Manage Subscription", "View Draw Entries", "Back to User List".
- **Required Data:** Profile details, subscription lifecycle events, currently retained 5 scores with full dates and change history.
- **Components:** User Overview Header, Score Audit Table with Edit/Delete Triggers, Subscription History Card, Audit Log Timeline.
- **Loading State:** Full page layout skeleton.
- **Empty State:** "User has not submitted any golf scores."
- **Error State:** "User not found or deleted."
- **Success State:** Toast: "Score modified by administrator. Audit log created."
- **Mobile Behavior:** Single-column scrollable feed.
- **Desktop Behavior:** 2-column layout (user data left, score editor right).
- **Accessibility Considerations:** Admin score alteration dialog requires explicit confirmation reason.
- **Related PRD Section:** § 11.
- **Related Requirement IDs:** `TR-100`.
- **Related Business-Rule IDs:** `BR-027`, `BR-028`, `BR-100`.
- **Related User-Flow IDs:** `UF-022`.
- **Related Edge-Case IDs:** `EC-162`.

---

### Screen ID: `SCR-ADM-04` — Subscriptions Overview
- **Screen Name:** Subscription Operations
- **User Role:** Administrator
- **Purpose:** Monitor subscription health, payment event streams, renewal rates, and lapsed accounts (`[PRD § 04, § 11]`).
- **Entry Point:** `/admin/subscriptions`.
- **Primary CTA:** "Export Subscription Ledger".
- **Secondary Actions:** Filter by plan (`monthly`, `yearly`), filter by payment event status.
- **Required Data:** Subscription volume counts, monthly recurring revenue summary, recent payment events feed.
- **Components:** Subscription KPI Strip, Payment Event Log Table, Renewal Calendar Card.
- **Loading State:** Table skeleton.
- **Empty State:** "No subscription events recorded."
- **Error State:** "Unable to fetch payment events from gateway."
- **Success State:** N/A.
- **Mobile Behavior:** Stacked summary cards with event list below.
- **Desktop Behavior:** Full width dashboard with real-time event status tags.
- **Accessibility Considerations:** Event status icons accompanied by text equivalents.
- **Related PRD Section:** § 04, § 11.
- **Related Requirement IDs:** `TR-033`, `TR-100`.
- **Related Business-Rule IDs:** `BR-013`, `BR-100`.
- **Related User-Flow IDs:** `UF-022`.
- **Related Edge-Case IDs:** `EC-026`.

---

### Screen ID: `SCR-ADM-05` — Draw Management Hub
- **Screen Name:** Monthly Draw Control Center
- **User Role:** Administrator
- **Purpose:** Master view of all draw cycles, current draw status, past published results, and draw creation (`[PRD § 06, § 11]`).
- **Entry Point:** `/admin/draws`.
- **Primary CTA:** "Configure Next Monthly Draw" (links to `/admin/draws/new`).
- **Secondary Actions:** "Inspect Published Results", "View Rollover History".
- **Required Data:** List of draws (draw number, month/year, status: `draft`, `simulated`, `published`, total winners, prize pool).
- **Components:** Active Draw Banner, Historical Draws Table, Rollover Jackpot Tracker, Action Controls.
- **Loading State:** Table skeleton.
- **Empty State:** "No draws created yet. Create the inaugural monthly draw."
- **Error State:** Network error alert.
- **Success State:** Status tags update dynamically.
- **Mobile Behavior:** Card-based draw list.
- **Desktop Behavior:** Comprehensive operational table with state action buttons.
- **Accessibility Considerations:** Status pill colors meet contrast ratios; table headers fully accessible.
- **Related PRD Section:** § 06, § 11.
- **Related Requirement IDs:** `TR-050`, `TR-101`.
- **Related Business-Rule IDs:** `BR-040`, `BR-043`, `BR-101`.
- **Related User-Flow IDs:** `UF-015`.
- **Related Edge-Case IDs:** `EC-133`.

---

### Screen ID: `SCR-ADM-06` — Draw Configuration
- **Screen Name:** Draw Setup & Mode Selector
- **User Role:** Administrator
- **Purpose:** Configure parameters for an upcoming draw, selecting mode (`Random` vs. `Algorithmic`) (`[PRD § 06, § 11]`).
- **Entry Point:** `/admin/draws/new` or `/admin/draws/[id]/configure`.
- **Primary CTA:** "Proceed to Simulation".
- **Secondary Actions:** "Cancel Setup".
- **Required Data:** Next monthly draw schedule, eligible participant count preview, draw mode selection options.
- **Components:** Draw Mode Radio Cards (`Random lottery-style` vs. `Algorithmic weighted`), Rollover Jackpot Input/Display, Participant Snapshot Preview.
- **Loading State:** Form disabled with calculation spinner.
- **Empty State:** N/A.
- **Error State:** Validation notice if draw date conflicts with existing draw.
- **Success State:** Redirects to `/admin/draws/[id]/simulate`.
- **Mobile Behavior:** Vertical radio card selection.
- **Desktop Behavior:** Side-by-side mode comparison cards with detailed mechanics breakdown.
- **Accessibility Considerations:** Radio group with `role="radiogroup"` and keyboard arrow navigation.
- **Related PRD Section:** § 06, § 11.
- **Related Requirement IDs:** `TR-052`, `TR-053`, `TR-101`.
- **Related Business-Rule IDs:** `BR-042`, `BR-101`.
- **Related User-Flow IDs:** `UF-015`.
- **Related Edge-Case IDs:** `EC-073`, `EC-074`, `EC-075`.

---

### Screen ID: `SCR-ADM-07` — Draw Simulation Studio
- **Screen Name:** Draw Sandbox & Distribution Preview
- **User Role:** Administrator
- **Purpose:** Execute draw simulation before publishing, inspect prospective winning numbers, winner counts, and tier splits (`[PRD § 06, § 11]`).
- **Entry Point:** `/admin/draws/[id]/simulate`.
- **Primary CTA:** "Run Simulation" / "Publish Official Draw Results" (once simulated).
- **Secondary Actions:** "Re-run Simulation", "Adjust Configuration".
- **Required Data:** Candidate winning numbers, simulated winner list per tier (5-, 4-, 3-match), calculated prize splits, rollover forward estimate.
- **Components:** Simulation Engine Trigger, Candidate Numbers Ball Rack, Projected Winner Tier Cards (40%/35%/25%), Pre-Publish Confirmation Dialog.
- **Loading State:** Animated simulation lottery wheel with progress bar.
- **Empty State:** "Simulation has not been executed yet. Click 'Run Simulation' to preview results."
- **Error State:** Error banner if participant pool is empty or calculation fails.
- **Success State:** Full distribution simulation report revealed.
- **Mobile Behavior:** Stacked simulation metrics; modal publish confirmation.
- **Desktop Behavior:** Full-screen simulation dashboard with side-by-side distribution graphs.
- **Accessibility Considerations:** High-stakes publish action enclosed in accessible confirmation modal with double-confirmation step.
- **Related PRD Section:** § 06, § 07, § 11.
- **Related Requirement IDs:** `TR-054`, `TR-055`, `TR-061`, `TR-062`.
- **Related Business-Rule IDs:** `BR-044`, `BR-045`, `BR-062`, `BR-063`.
- **Related User-Flow IDs:** `UF-015`.
- **Related Edge-Case IDs:** `EC-076`, `EC-077`, `EC-078`, `EC-098`.

---

### Screen ID: `SCR-ADM-08` — Published Draw Detail
- **Screen Name:** Official Draw Record & Results
- **User Role:** Administrator
- **Purpose:** Immutable view of an officially published draw, showing winning numbers, locked prize pool, and generated winner records (`[PRD § 06, § 11]`).
- **Entry Point:** `/admin/draws/[id]`.
- **Primary CTA:** "View All Winners for This Draw" (links to `/admin/winners?draw_id=[id]`).
- **Secondary Actions:** "Export Draw Audit Report".
- **Required Data:** Winning numbers (5), final prize pool total, winner counts per tier, rollover amount carried forward, publishing timestamp.
- **Components:** Official Winning Numbers Banner, Prize Pool Allocation Summary Table, Winner Distribution Chart, Immutable Audit Stamp.
- **Loading State:** Detail skeleton.
- **Empty State:** N/A.
- **Error State:** 404: "Draw record not found."
- **Success State:** Published badge displayed with green lock icon.
- **Mobile Behavior:** Stacked summary cards.
- **Desktop Behavior:** Comprehensive 2-column official ledger view.
- **Accessibility Considerations:** Table data fully titled with explicit header scopes.
- **Related PRD Section:** § 06, § 07, § 11.
- **Related Requirement IDs:** `TR-055`, `TR-056`, `TR-101`.
- **Related Business-Rule IDs:** `BR-045`, `BR-046`, `BR-130`.
- **Related User-Flow IDs:** `UF-015`, `UF-016`.
- **Related Edge-Case IDs:** `EC-079`, `EC-162`.

---

### Screen ID: `SCR-ADM-09` — Charity Management Directory
- **Screen Name:** Partner Charities Hub
- **User Role:** Administrator
- **Purpose:** Manage listed charities, toggle active statuses, and access content editors (`[PRD § 08, § 11]`).
- **Entry Point:** `/admin/charities`.
- **Primary CTA:** "Add New Charity" (links to `/admin/charities/new`).
- **Secondary Actions:** "Edit Charity", "Archive / Delete Charity", "Feature on Homepage".
- **Required Data:** List of charities (id, name, slug, category, active status, featured status, total contributions received).
- **Components:** Charity Directory Table, Add Charity Button, Featured Toggle Switch, Status Badges.
- **Loading State:** Table skeleton.
- **Empty State:** "No charities in directory. Add your first partner charity."
- **Error State:** Alert banner on operation failure.
- **Success State:** Toast confirmation on status or featured toggle.
- **Mobile Behavior:** Card list with action menus.
- **Desktop Behavior:** Sortable data table with quick inline toggles.
- **Accessibility Considerations:** Toggle switches have explicit accessible names (`aria-label="Feature Cancer Research on homepage"`).
- **Related PRD Section:** § 08, § 11.
- **Related Requirement IDs:** `TR-102`.
- **Related Business-Rule IDs:** `BR-102`.
- **Related User-Flow IDs:** `UF-023`.
- **Related Edge-Case IDs:** `EC-134`.

---

### Screen ID: `SCR-ADM-10` — Charity Content & Event Editor
- **Screen Name:** Charity Profile & Event Form
- **User Role:** Administrator
- **Purpose:** Create or edit charity narrative, upload logos and hero banners, and schedule golf day events (`[PRD § 08.2, § 11]`).
- **Entry Point:** `/admin/charities/new` or `/admin/charities/[id]/edit`.
- **Primary CTA:** "Save Charity Profile".
- **Secondary Actions:** "Cancel", "Add Upcoming Golf Day Event", "Upload Media".
- **Required Data:** Charity form fields (name, slug, mission, description, category, logo URL, image URL, events JSON array).
- **Components:** Charity Details Form, Media Upload Dropzone, Dynamic Golf Day Events Builder (Date, Title, Location, URL).
- **Loading State:** Save button spinner with disabled inputs.
- **Empty State:** Blank form for new charity.
- **Error State:** Validation alerts for missing required fields or duplicate slugs.
- **Success State:** Toast: "Charity profile and events saved."
- **Mobile Behavior:** Stacked form inputs with touch-friendly date pickers.
- **Desktop Behavior:** Split editor: form inputs on left, real-time live profile preview on right.
- **Accessibility Considerations:** Dynamic event item addition notifies screen reader via `aria-live`.
- **Related PRD Section:** § 08.2, § 11.
- **Related Requirement IDs:** `TR-074`, `TR-102`.
- **Related Business-Rule IDs:** `BR-075`, `BR-102`.
- **Related User-Flow IDs:** `UF-023`.
- **Related Edge-Case IDs:** `EC-171`.

---

### Screen ID: `SCR-ADM-11` — Winners Management
- **Screen Name:** Master Winners Roster
- **User Role:** Administrator
- **Purpose:** Master view of all draw winners, filterable by verification status and payment status (`[PRD § 09, § 11]`).
- **Entry Point:** `/admin/winners`.
- **Primary CTA:** "Review Selected Proof" (links to `/admin/winners/[id]/verify`).
- **Secondary Actions:** Filter by Draw ID, Filter by Verification Status (`pending`, `proof_submitted`, `approved`, `rejected`), Filter by Payout Status (`pending`, `paid`).
- **Required Data:** Paginated list of winners (id, subscriber name, draw number, match tier, prize amount, verification status, payout status, proof submitted timestamp).
- **Components:** Filter & Search Bar, Winners Data Table, Status Filter Tabs, Payout Action Trigger.
- **Loading State:** Table skeleton with 10 rows.
- **Empty State:** "No winners match the selected criteria."
- **Error State:** Network error alert.
- **Success State:** Table reflects verified/paid statuses instantly.
- **Mobile Behavior:** Responsive winner card stack with prominent verification tags.
- **Desktop Behavior:** Comprehensive 8-column table with inline proof inspection triggers.
- **Accessibility Considerations:** Status columns use dual indicators (icons and text) with compliant color contrast.
- **Related PRD Section:** § 09, § 11.
- **Related Requirement IDs:** `TR-080`, `TR-103`.
- **Related Business-Rule IDs:** `BR-080`, `BR-082`, `BR-103`.
- **Related User-Flow IDs:** `UF-019`, `UF-024`.
- **Related Edge-Case IDs:** `EC-106`.

---

### Screen ID: `SCR-ADM-12` — Winner Verification Studio
- **Screen Name:** Proof Inspection & Review Studio
- **User Role:** Administrator
- **Purpose:** Inspect uploaded golf score screenshot against recorded Stableford scores, approve or reject proof (`[PRD § 09, § 11]`).
- **Entry Point:** `/admin/winners/[id]/verify`.
- **Primary CTA:** "Approve Proof & Authorize Payout".
- **Secondary Actions:** "Reject Submission" (opens rejection reason dialog), "Back to Winners".
- **Required Data:** Winner profile, draw number, match tier, recorded 5 scores, winning numbers matched, uploaded screenshot image URL, submission date.
- **Components:** High-Resolution Image Viewer with Zoom/Pan, Score Comparison Matrix, Approval Button, Rejection Modal with Feedback Textarea.
- **Loading State:** Image loader with skeleton matrix.
- **Empty State:** If proof not yet uploaded: "Winner has not uploaded score proof yet."
- **Error State:** Image load error alert: "Unable to load proof screenshot."
- **Success State:** Toast: "Proof approved. Winner is now eligible for payout."
- **Mobile Behavior:** Vertical layout with zoomable proof image on top and score comparison below.
- **Desktop Behavior:** Split screen: image inspection viewer on left (60%), score scorecard comparison and decision controls on right (40%).
- **Accessibility Considerations:** Zoom controls accessible via keyboard; rejection modal traps focus and requires explicit confirmation.
- **Related PRD Section:** § 09, § 11.
- **Related Requirement IDs:** `TR-081`, `TR-103`.
- **Related Business-Rule IDs:** `BR-081`, `BR-082`, `BR-083`, `BR-103`.
- **Related User-Flow IDs:** `UF-019`, `UF-024`.
- **Related Edge-Case IDs:** `EC-103`, `EC-104`, `EC-194`.

---

### Screen ID: `SCR-ADM-13` — Payout Management
- **Screen Name:** Prize Payout Ledger
- **User Role:** Administrator
- **Purpose:** Track authorized winner payouts and mark prizes as completed (`Pending → Paid`) (`[PRD § 09, § 11]`).
- **Entry Point:** `/admin/payouts`.
- **Primary CTA:** "Mark Payout as Completed".
- **Secondary Actions:** "Export Payout Batch", "Filter by Approved Verification".
- **Required Data:** List of approved winners (winner ID, name, payment details/reference, prize amount, payout status: `Pending` or `Paid`, payment timestamp).
- **Components:** Payout Queue Table, Mark Paid Action Modal, Completed Payouts Archive, Total Disbursed Summary Card.
- **Loading State:** Table skeleton.
- **Empty State:** "No pending payouts requiring processing."
- **Error State:** Error banner if transaction update fails.
- **Success State:** Toast: "Payout marked as Paid. Confirmation recorded."
- **Mobile Behavior:** Card list with confirmation drawer.
- **Desktop Behavior:** Data table with action buttons and summary metrics header.
- **Accessibility Considerations:** Confirmation dialog for marking payout paid to prevent accidental financial updates.
- **Related PRD Section:** § 09, § 11.
- **Related Requirement IDs:** `TR-082`, `TR-103`.
- **Related Business-Rule IDs:** `BR-084`, `BR-085`, `BR-103`.
- **Related User-Flow IDs:** `UF-020`, `UF-024`.
- **Related Edge-Case IDs:** `EC-111`, `EC-112`, `EC-113`.

---

### Screen ID: `SCR-ADM-14` — Reports & Operational Analytics
- **Screen Name:** Executive Intelligence & Audit Reports
- **User Role:** Administrator
- **Purpose:** In-depth metrics across the 4 PRD-mandated reporting areas (`[PRD § 11]`).
- **Entry Point:** `/admin/reports`.
- **Primary CTA:** "Export Analytics Summary (CSV/PDF)".
- **Secondary Actions:** Date range selector, category filter.
- **Required Data:**
  1. Total Users (active, lapsed, cancelled trends)
  2. Total Prize Pool (cumulative generated, disbursed, current rollover jackpot)
  3. Charity Contribution Totals (aggregate and per-charity breakdown)
  4. Draw Statistics (participant counts, match tier distributions, score frequencies)
- **Components:**
  - `UserGrowthChart`
  - `PrizePoolLedgerCard`
  - `CharityDistributionChart`
  - `DrawFrequencyBarChart`
  - `ExportToolbar`
- **Loading State:** Chart skeleton containers with pulse effect.
- **Empty State:** "Insufficient data to generate historical trend reports."
- **Error State:** "Failed to aggregate reporting metrics. Please refresh."
- **Success State:** N/A.
- **Mobile Behavior:** Stacked KPI summary cards with simplified data tables.
- **Desktop Behavior:** 4-quadrant interactive dashboard with responsive SVG charts.
- **Accessibility Considerations:** All charts have accessible data table fallbacks (`summary` and `table` views for screen readers).
- **Related PRD Section:** § 11.
- **Related Requirement IDs:** `TR-104`.
- **Related Business-Rule IDs:** `BR-104`.
- **Related User-Flow IDs:** `UF-025`.
- **Related Edge-Case IDs:** `EC-140`, `EC-141`, `EC-142`.

---

# 5. Screens That Must NOT Exist (Explicit Non-Requirements)

To maintain strict adherence to the PRD and prevent unauthorized scope creep, the following screens are explicitly prohibited from being created:

1. **Golf Tee-Time / Course Booking Screens:** Digital Heroes is a performance tracking and draw platform, not a tee-time booking software. Prohibited by § 01.
2. **Full Handicap Index / WHS Calculation Engine Screens:** The platform records 5 Stableford scores (1–45) solely for draw participation, not official club handicapping. Prohibited by § 05.
3. **E-Commerce / Merchandise Store:** Digital Heroes sells monthly/yearly subscriptions and collects charity donations; it does not operate a physical retail shop. Prohibited by § 04.
4. **Peer-to-Peer Betting / Wager Screens:** The platform operates a compliant monthly prize pool draw, not peer betting or head-to-head match wagering. Prohibited by § 06.
5. **Public Community Social Forums / Chat Rooms:** Social forum mechanics are not in the PRD and introduce moderation liabilities outside the Level 1 specification. Prohibited by § 03.
6. **Routine Scorecard Proof Screens for Non-Winners:** Verification applies exclusively to winners (`[PRD § 09]`). Requesting proof for general score entries violates PRD § 09.
