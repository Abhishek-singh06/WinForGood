# Digital Heroes — Design System Specification

**Document:** `docs/design-system.md`  
**Visual Direction:** **"FEEL, NOT FAIRWAY"** (`[PRD § 12]`)  
**Design Foundation:** Editorial Luxury × Modern Technology × Charcoal/Silver Depth × Selective Red & Blue Accents  
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

# 1. Visual Philosophy & Design Language

Digital Heroes represents a union of:
$$\textbf{Luxury Editorial} \times \textbf{Modern Technology} \times \textbf{Charity Impact} \times \textbf{Anticipation}$$

The design deliberately avoids the aesthetic conventions of:
- A traditional golf club website (no fairways, plaid, crests, or country-club clichés).
- A gambling or casino website (no neon flashes, coins, or slot-machine tropes).
- A generic fintech dashboard or cookie-cutter AI SaaS template.

### 1.1 Emotional & Aesthetic Principles
- **Monochrome Mastery & Material Depth:** Dominated by a rigorous scale of Deep Black, Charcoal, Graphite, Silver, and Crisp White. Silver and nuanced greys carry the visual sophistication, tactile borders, and subtle gradient sheen.
- **Selective & Intentional Accents (Red & Blue):**
  - **Signal Red:** High-stakes urgency, critical alerts, live draw moments, and pivotal CTAs. Used sparingly with surgical precision.
  - **Electric / Professional Blue:** Technology, data integrity, verified credentials, subscription states, and interaction feedback.
  - Neither accent is ever used as a dominant wash or ambient background flood.
- **Human Impact Over Sport Equipment:** Visual storytelling centers on real people, community leaders, and charitable outcomes rather than golf balls, clubs, or grass turf.
- **Editorial Typography:** Distinctive, confident display headings paired with razor-sharp modern grotesk typography for interface readability. Never cursive across the UI; script is restricted to rare, subtle decorative flourishes if ever utilized.

---

# 2. Color System & Semantic Tokens

### 2.1 Complete Palette Tokens

```css
:root {
  /* ==========================================================================
     1. BACKGROUND TOKENS (Deep Black, Near Black, White, Light Grey)
     ========================================================================== */
  --bg-deep-black:          #050709; /* Deepest Void / Canvas Base */
  --bg-near-black:          #0A0E13; /* Near Black / Section Background */
  --bg-dark-alt:            #10151D; /* Alternate Dark Section */
  --bg-white:               #FFFFFF; /* Pure White (Light Mode / High-Contrast Editorial) */
  --bg-light-grey:          #F4F6F8; /* Light Grey Surface (Light Mode) */

  /* ==========================================================================
     2. SURFACE TOKENS (Charcoal, Graphite, Silver, Soft Grey)
     ========================================================================== */
  --surface-charcoal:       #151B23; /* Charcoal Base Card Surface */
  --surface-graphite:       #1E2631; /* Elevated Graphite Panel / Dropdowns */
  --surface-graphite-hover: #263140; /* Interactive Graphite Hover */
  --surface-silver:         #8F9CAE; /* Metallic Silver Tone for Icons & Rules */
  --surface-silver-subtle:  rgba(195, 207, 222, 0.08); /* Silver Glass / Sheen */
  --surface-soft-grey:      #E2E8F0; /* Soft Grey for Light Containers */

  /* ==========================================================================
     3. TEXT & TYPOGRAPHY TOKENS (Primary, Secondary, Muted)
     ========================================================================== */
  --text-primary:           #FFFFFF; /* High-Contrast Crisp White */
  --text-primary-dark:      #050709; /* Deep Black for White/Light Surfaces */
  --text-secondary:         #94A3B8; /* Cool Secondary Grey */
  --text-muted:             #64748B; /* Muted Slate / Captions */
  --text-silver:            #CBD5E1; /* Elevated Silver Text */

  /* ==========================================================================
     4. ACCENT TOKENS (Signal Red & Electric / Professional Blue)
     Strictly reserved for highlights, action states, and critical indicators.
     ========================================================================== */
  /* Signal Red (Anticipation, High-Stakes Draws, Critical CTAs, Errors) */
  --accent-red:             #E11D48; /* Core Signal Red */
  --accent-red-hover:       #F43F5E; /* Vibrant Red Hover */
  --accent-red-glow:        rgba(225, 29, 72, 0.18); /* Selective Pulse Glow */
  --accent-red-subtle:      rgba(225, 29, 72, 0.10); /* Subtle Alert Fill */

  /* Electric / Professional Blue (Tech, Verification, Selection, Active States) */
  --accent-blue:            #2563EB; /* Core Professional Blue */
  --accent-blue-electric:   #3B82F6; /* Bright Electric Blue */
  --accent-blue-glow:       rgba(37, 99, 235, 0.18); /* Active Focus Glow */
  --accent-blue-subtle:     rgba(37, 99, 235, 0.10); /* Selected Card Fill */

  /* ==========================================================================
     5. BORDERS & DIVIDERS (Restrained Metallic Silver & Charcoal Lines)
     ========================================================================== */
  --border-hairline:        rgba(255, 255, 255, 0.06); /* Invisible Grid Line */
  --border-subtle:          rgba(255, 255, 255, 0.12); /* Standard Card Edge */
  --border-silver:          rgba(195, 207, 222, 0.24); /* Metallic Sheen Edge */
  --border-silver-strong:   rgba(195, 207, 222, 0.45); /* Highlight Edge */
  --border-active-blue:     rgba(59, 130, 246, 0.60); /* Active Selection Edge */
  --border-alert-red:       rgba(225, 29, 72, 0.60);  /* Critical Alert Edge */

  /* ==========================================================================
     6. STATUS & SYSTEM TOKENS
     ========================================================================== */
  --status-active:          #3B82F6; /* Electric Blue (Active Subscription) */
  --status-verified:        #10B981; /* Restrained Forest Green (Payouts / Verifications Only) */
  --status-pending:         #F59E0B; /* Muted Amber (Pending Admin Review) */
  --status-rejected:        #E11D48; /* Signal Red (Proof Rejected / Lapsed) */
}
```

### 2.2 Palette Application Rules
- **70% Neutral Scale:** Canvas and structural layout built entirely of Deep Black (`#050709`), Near Black (`#0A0E13`), Charcoal (`#151B23`), and Crisp White (`#FFFFFF`).
- **20% Silver & Graphite Nuance:** Borders, dividers, metadata badges, scorecard containers, and table headers utilize Graphite (`#1E2631`) and Metallic Silver (`#8F9CAE`, `#CBD5E1`) for tactile editorial luxury.
- **10% Selective Accent (Red & Blue):**
  - **Signal Red:** Main subscription action button, live jackpot announcement badges, and countdown timer urgent pulses.
  - **Professional Blue:** Interactive slider thumbs, selected charity highlight ring, verified winner badges, and navigation active states.
  - Neither Red nor Blue may exceed 10% of total viewport area.
- **Explicit Color Exclusions:**
  - **No Golf Course Grass Green:** No bright greens or fairway grass textures.
  - **No Emerald Primary:** Deep green is restricted solely to small status pills for "Verified/Paid".
  - **No Ochre / Gold / Champagne Primary:** Rollover jackpots and draws are presented in high-contrast crisp white and silver on deep black with subtle electric red or blue accents.
  - **No Cream / Sand Wash:** Dominant backgrounds are high-contrast Deep Black and crisp editorial White.

---

# 3. Typography System

### 3.1 Type Families
- **Display Headings:** An architectural, high-contrast serif or sharp contemporary grotesque (e.g., `Instrument Serif` / `Fraunces` / `Cinzel` / `Cabinet Grotesk`). Carries bold editorial authority.
- **UI & Body Typography:** `Geist Sans` / `Inter` / `Plus Jakarta Sans`. Crisp, neutral, highly legible at small sizes across mobile and desktop.
- **Numeric & Scorecard Typography:** `Geist Mono` / `JetBrains Mono`. Monospace alignment ensures precision in Stableford scores, draw dates, financial amounts, and countdown clocks.
- **Cursive / Script Prohibition:** The entire interface is built on clean, modern typefaces. Cursive or script fonts are strictly forbidden for interface copy, buttons, labels, and forms.

### 3.2 Typographic Hierarchy
| Role | Family | Weight | Size (Desktop) | Size (Mobile) | Line Height | Tracking |
|---|---|---|---|---|---|---|
| **Display Hero** | Display Serif | 500 / Italic accent | 64px (4.0rem) | 38px (2.375rem) | 1.05 | -0.03em |
| **Section Title (H1)**| Display Serif | 500 | 42px (2.625rem) | 30px (1.875rem) | 1.15 | -0.02em |
| **Card Header (H2)** | Sans | 600 | 24px (1.5rem) | 20px (1.25rem) | 1.25 | -0.01em |
| **Subhead (H3)** | Sans | 600 | 18px (1.125rem) | 16px (1.0rem) | 1.30 | 0 |
| **Body Large** | Sans | 400 | 18px (1.125rem) | 16px (1.0rem) | 1.55 | 0 |
| **Body Base** | Sans | 400 | 15px (0.9375rem) | 14px (0.875rem) | 1.55 | 0 |
| **Body Small** | Sans | 400 | 13px (0.8125rem) | 12px (0.75rem) | 1.45 | +0.01em |
| **Score Number** | Mono | 700 | 32px (2.0rem) | 26px (1.625rem) | 1.0 | -0.02em |
| **Data / Date Label** | Mono | 500 | 12px (0.75rem) | 11px (0.6875rem) | 1.20 | +0.08em |

---

# 4. Spacing, Grid & Layout System

### 4.1 Spacing Scale
Built on an 8px grid with 4px sub-increments:
- `space-1`: 4px (micro gaps, badge padding)
- `space-2`: 8px (icon-to-label spacing, compact group)
- `space-3`: 12px (form input vertical padding)
- `space-4`: 16px (standard mobile container padding)
- `space-6`: 24px (card padding desktop)
- `space-8`: 32px (card grid gap)
- `space-12`: 48px (section sub-gap)
- `space-16`: 64px (major editorial section rhythm)
- `space-24`: 96px (hero top/bottom whitespace)

### 4.2 Grid & Breakpoints
- **Mobile (`sm`):** 360px – 639px (4-column grid, 16px margins, 16px gutters).
- **Tablet (`md`):** 640px – 1023px (8-column grid, 24px margins, 20px gutters).
- **Desktop (`lg`):** 1024px – 1279px (12-column grid, 32px margins, 24px gutters).
- **Wide (`xl`):** 1280px+ (12-column grid, max-width 1240px centered, 32px gutters).

---

# 5. Borders, Radii & Depth

- **Radii System:**
  - `radius-sm`: 4px (crisp, precise for buttons and inputs)
  - `radius-md`: 8px (cards, dropdown panels, badges)
  - `radius-lg`: 16px (modal dialogues, hero panels)
  - `radius-full`: 9999px (draw balls, circular avatars, pill tags)
- **Restrained Shadows & Gradients:**
  - `shadow-subtle`: `0 2px 4px rgba(0, 0, 0, 0.5)`
  - `shadow-panel`: `0 12px 30px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)`
  - `shadow-silver-glow`: `0 0 25px -5px rgba(195, 207, 222, 0.12)`
  - `shadow-red-glow`: `0 0 30px -5px rgba(225, 29, 72, 0.22)`
  - `shadow-blue-glow`: `0 0 30px -5px rgba(59, 130, 246, 0.22)`
  - `gradient-silver-sheen`: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 100%)`
  - `gradient-charcoal-card`: `linear-gradient(180deg, #18202B 0%, #111720 100%)`

---

# 6. Core Component Library

### 6.1 Buttons
- **Primary Hero Action (Signal Red):**
  - Background: `--accent-red` (`#E11D48`). Hover: `#F43F5E`.
  - Text: `#FFFFFF`, weight 600.
  - Border: None. Subtle glow: `box-shadow: 0 0 20px rgba(225, 29, 72, 0.35)`.
  - Padding: 12px 28px (desktop), 14px 20px (mobile full-width). Radius: `radius-sm` (4px).
- **Secondary Technology Action (Electric Blue Outline / Fill):**
  - Background: `rgba(37, 99, 235, 0.12)`. Border: 1px solid `rgba(59, 130, 246, 0.40)`.
  - Text: `#60A5FA`. Hover background: `rgba(37, 99, 235, 0.25)`.
- **Editorial Silver Button (Ghost / Outline):**
  - Background: Transparent. Border: 1px solid `--border-silver`.
  - Text: `#FFFFFF`. Hover background: `rgba(255, 255, 255, 0.06)`.
- **Destructive Action:**
  - Background: Transparent. Border: 1px solid rgba(225, 29, 72, 0.50). Text: `#F43F5E`.

### 6.2 Form Inputs & Controls
- **Inputs & Keypads:**
  - Height: 46px (48px mobile touch).
  - Background: `--surface-charcoal` (`#151B23`).
  - Border: 1px solid `--border-subtle`.
  - Focus Ring: 1.5px solid `--accent-blue` with `box-shadow: 0 0 10px rgba(59, 130, 246, 0.30)`.
  - Label: Uppercase monospace silver caption (`text-xs text-slate-400`).
- **Interactive Slider (Charity Percentage):**
  - Track: Graphite (`#1E2631`) with active fill in Electric Blue (`#2563EB`).
  - Thumb: Solid Silver with crisp white core, 20px diameter, focus ring on active drag.
  - Minimum Lock Indicator: Clear tick mark at 10.00% with tooltip: *"10% PRD Platform Floor"*.

### 6.3 Cards & Surfaces
- **Charcoal Luxury Card:**
  - Background: `linear-gradient(180deg, #18202B 0%, #111720 100%)`.
  - Border: 1px solid `--border-subtle`.
  - Radius: `radius-md` (8px).
  - Hover: Border brightens to `--border-silver`, translateY(-2px).

---

# 7. Domain-Specific Component Specifications

### 7.1 Score Tracking Components `[PRD § 05]`
- **`FiveScoreStrip`:**
  - 5 equal card blocks rendered in a horizontal sequence on desktop, vertical on mobile.
  - Background: `--surface-charcoal` with metallic silver border.
  - Points Display: Large monospace number (1–45) in crisp white.
  - Date Stamp: Monospace small label (`DD MMM YYYY`).
  - FIFO Badge: Oldest card displays a subtle silver border pulse with badge *"Oldest — replaced next"*.
- **`ScoreEntryDialog`:**
  - Numeric input restricted to integers 1–45.
  - Date picker blocking duplicate dates with instant validation notice: *"Only one score per date permitted (§ 05)"*.

### 7.2 Monthly Draw & Prize Pool Components `[PRD § 06, § 07]`
- **`DrawBall`:**
  - Geometry: 52px circular badge.
  - Background: Deep Black core with metallic silver rim (`border: 2px solid #8F9CAE`).
  - Typography: Centered bold monospace numeral in crisp white.
  - Matched State: If matched against user's score, rim transitions to Electric Blue or Signal Red with an active glow shadow.
- **`PrizePoolLedger`:**
  - Rolling mechanical odometer counter displaying total pool in crisp white on deep charcoal.
  - Three-tier breakdown card:
    - 5-Number Match: 40% Share | **Signal Red Rollover Tag: YES (Jackpot)**
    - 4-Number Match: 35% Share | Muted Silver Tag: NO Rollover
    - 3-Number Match: 25% Share | Muted Silver Tag: NO Rollover

### 7.3 Charity & Impact Components `[PRD § 08]`
- **`CharityDirectoryCard`:**
  - High-contrast black & white or rich documentary editorial imagery of real people and community initiatives.
  - Organization title in display serif; mission excerpt in clean sans.
  - Upcoming Golf Day Event tag in silver monospace.
  - Action buttons: "Support via Subscription" and "Direct Donation".
- **`CharitySpotlightBanner`:**
  - Full-width dark charcoal section on homepage with crisp white editorial typography.

### 7.4 Winner Verification & Payout Components `[PRD § 09]`
- **`ProofUploadCanvas`:**
  - High-density drag-and-drop zone with silver dashed border (`border-dashed border-slate-600`).
  - Instant image preview with zoom tool.
- **`AdminInspectionStudio`:**
  - Split view: uploaded scorecard screenshot on left (with zoom/pan); recorded subscriber scores and match numbers on right.
  - Decision buttons: Signal Red "Reject Submission" (opens reason modal) and Professional Blue "Approve Proof & Authorize Payout".

---

# 8. Motion Principles `[PRD § 12]`

Motion is **cinematic, restrained, and purposeful** — never chaotic or arcade-like.

- **Interaction Speeds:**
  - Buttons / Toggles: `150ms` ease-out.
  - Card Hovers & Modals: `250ms` cubic-bezier(0.16, 1, 0.3, 1).
  - Draw Reveal Sequence: `400ms` staggered interval per ball with subtle scale spring.
- **Reduced Motion Support:**
  - Automatically adheres to `prefers-reduced-motion: reduce`, replacing position transforms with instant opacity fades.

---

# 9. Accessibility (WCAG 2.1 AA) Standards

- **Contrast Ratios:**
  - Text on Deep Black: Crisp White (`#FFFFFF`) achieves 18.5:1 ratio (exceeds AAA).
  - Secondary Grey (`#94A3B8`) on Deep Black achieves 6.2:1 ratio (exceeds AA).
  - Signal Red (`#E11D48`) and Professional Blue (`#2563EB`) text always paired with high-contrast neutral backgrounds.
- **Focus Indicators:**
  - All interactive elements display a sharp 2px Electric Blue focus ring with a 2px offset.
- **Non-Color Reliance:**
  - Status badges always pair color with text labels and distinct icons (e.g. checkmark for paid, clock for pending, cross for rejected).
