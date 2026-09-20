# Digital Heroes — Design Direction

## 01. Design Intent

Digital Heroes should feel like a **premium editorial product with a sporting edge**, not like a traditional golf website and not like a generic AI-generated SaaS dashboard.

The PRD explicitly asks for a clean, modern, motion-enhanced interface that leads with **charitable impact and emotion**, while avoiding conventional golf clichés such as fairways, plaid, club imagery, and overly literal golf visuals. The homepage must clearly explain what users do, how they can win, the charity impact, and the subscription CTA. fileciteturn0file0L280-L289

### Core visual idea

**Human impact × performance × anticipation**

The interface should feel:

- confident
- sophisticated
- slightly experimental
- editorial
- tactile
- energetic without being loud
- trustworthy enough for payments and subscriptions
- emotional enough for charity
- distinctly designed rather than template-generated

Do **not** make every section look like a collection of rounded cards. Use typography, whitespace, lines, oversized numbers, editorial composition, image crops, and controlled motion as the primary design tools.

---

# 02. Visual Personality

### Keywords

`Editorial` · `Premium` · `Monochrome` · `Human` · `Precise` · `Sporting` · `Charitable` · `Modern`

### Avoid

- generic AI gradients
- purple/blue SaaS gradients
- excessive glassmorphism
- excessive rounded cards
- giant glowing blobs
- stock golf-course hero images
- golf-club clichés
- cartoon illustrations
- excessive shadows
- every element floating inside a card
- excessive animated particles
- over-designed dashboards
- unnecessary neon effects
- template-like "feature / feature / feature" layouts

The result should look as if a strong human design team made deliberate visual decisions.

---

# 03. Colour System

The primary palette is **grey / white / black / silver**, with **small controlled accents of red and blue**.

The base interface should remain mostly monochrome. Red and blue are signals, not decoration.

## Primary palette

| Token | Colour | Usage |
|---|---|---|
| `--black` | `#090909` | Main dark sections, navigation, footer |
| `--near-black` | `#111111` | Dark surfaces |
| `--charcoal` | `#1B1B1B` | Secondary dark surfaces |
| `--graphite` | `#2A2A2A` | Borders and dark UI |
| `--mid-grey` | `#6F6F6F` | Secondary text |
| `--silver` | `#B9BCC1` | Metadata, dividers, inactive states |
| `--light-silver` | `#D9DADC` | Borders and subtle surfaces |
| `--off-white` | `#F4F4F1` | Main page background |
| `--white` | `#FFFFFF` | Cards, text, contrast |
| `--red` | `#C62828` | Important actions, winner states, draw highlights |
| `--red-soft` | `#E7C8C8` | Soft red background |
| `--blue` | `#2457A6` | Links, information, secondary interactive states |
| `--blue-soft` | `#D7E1F1` | Soft informational background |

### Colour ratio

Use approximately:

- **70%** off-white / white
- **20%** black / charcoal / grey
- **7%** silver and muted grey
- **2%** red
- **1%** blue

Red and blue should feel rare.

### Accent rule

Never use red and blue together as a gradient.

Use:

- red → winning / draw / important action
- blue → information / navigation / system state

---

# 04. Typography

Typography should be one of the strongest parts of the identity.

The PRD's visual reference uses strong editorial typography and restrained layouts. The implementation should push this further while keeping the interface highly usable.

## Display / Hero heading

Use a **bold italic / cursive-inspired editorial typeface** for selected large headings.

Preferred direction:

- `DM Serif Display Italic`
- `Cormorant Garamond SemiBold Italic`
- `Playfair Display Black Italic`

The cursive/editorial face should be used for emphasis, not every heading.

Example:

> **Play.**
>
> **Win.**
>
> *Give back.*

or:

> Performance that  
> **means something.**

## UI / Body

Use a clean grotesk sans-serif:

- `Inter`
- `Manrope`
- `DM Sans`
- `Neue Montreal` if licensed/available

Use bold weights for navigation, labels, buttons, and important numbers.

### Type hierarchy

```text
Hero display       72–120px / tight
Section heading    48–72px
Subheading         22–30px
Large metric       48–80px
Card heading       20–28px
Body               16–18px
Small body         14px
Metadata           11–13px
```

Responsive typography must scale down naturally on mobile.

### Important rule

Do not use cursive typography for:

- long paragraphs
- forms
- navigation
- tables
- dashboard data
- error messages
- buttons

Cursive is an identity accent.

---

# 05. Layout System

Use a **12-column editorial grid** on desktop.

### Desktop

```text
Margin       5–7vw
Grid         12 columns
Gap          20–28px
Section gap  120–180px
```

### Tablet

Use 6 columns.

### Mobile

Use 4 columns with generous horizontal padding.

Do not make every section symmetrical.

Use controlled asymmetry:

- large heading on the left
- supporting copy offset on the right
- oversized statistics
- full-width visual interruptions
- narrow text columns
- occasional edge-to-edge sections

This should make the site feel art-directed rather than generated from a component library.

---

# 06. Navigation

The navigation should be minimal.

### Desktop

Left:

**DIGITAL.HEROES**

Center/right:

- How it works
- Charity
- Draw
- Prizes

Right:

**Sign in**  
**Subscribe**

### Behaviour

The navigation starts transparent over the hero.

After scrolling:

- background becomes off-white or near-black depending on section
- subtle blur
- 1px bottom border
- logo remains strong
- transition should be approximately 250–350ms

Do not use a giant navbar.

---

# 07. HERO — Homepage

The hero is the most important visual moment.

The PRD requires the homepage to communicate:

1. what the user does
2. how they win
3. charity impact
4. the primary subscription CTA

fileciteturn0file0L280-L289

## Hero concept

### Headline

Use a strong editorial statement such as:

> **Your game.**  
> **Someone else's tomorrow.**

Alternative:

> **Play for more than the score.**

Supporting line:

> Track your performance, enter monthly draws, and direct part of your subscription to a cause you choose.

Primary CTA:

**Subscribe**

Secondary CTA:

**See how it works**

### Hero composition

Avoid a conventional centered SaaS hero.

Use:

```text
--------------------------------------------------
DIGITAL.HEROES             HOW IT WORKS  SUBSCRIBE

          YOUR GAME.
       Someone else's
          tomorrow.

     [ Subscribe ]  [ See how it works ]

                         ┌─────────────────────┐
                         │                     │
                         │   LIVE / DRAW       │
                         │      04 : 28        │
                         │                     │
                         │   CHARITY  12%      │
                         └─────────────────────┘

              ↓ SCROLL TO DISCOVER
--------------------------------------------------
```

The hero can use an abstract photographic composition rather than a literal golf image.

### Recommended visual language

Use:

- monochrome close-up photography
- cropped human details
- hands
- scorecards
- textured paper
- subtle metallic surfaces
- abstract circular forms
- subtle red or blue marking

Do **not** use a stock photo of someone swinging a golf club as the main hero image.

---

# 08. Hero Animation

Animation should feel intentional and physical.

### On initial load

Sequence:

1. Logo appears
2. navigation fades in
3. headline reveals line-by-line
4. italic emphasis slides upward slightly
5. supporting copy fades in
6. CTA buttons enter
7. hero visual settles into position

Duration:

`0.7s – 1.2s`

Use staggered animation rather than everything appearing simultaneously.

### Scroll interaction

As the user scrolls:

- hero heading moves upward slowly
- visual moves at a slightly different rate
- small metadata stays anchored
- next section gradually enters

Use subtle parallax only.

### Micro-interaction

CTA:

```text
Subscribe →
```

On hover:

- arrow moves 5–8px
- underline expands
- button surface changes
- no excessive glow

---

# 09. Homepage Story Structure

The homepage should tell a story instead of presenting a feature list.

Recommended sequence:

## 01 — Hero

**Play. Win. Give back.**

Immediate explanation + CTA.

---

## 02 — How It Works

Use three large numbered moments:

### 01
**Subscribe**

Choose monthly or yearly membership.

### 02
**Score**

Enter your latest Stableford scores.

### 03
**Take part**

Your participation enters you into the monthly draw while part of your subscription supports your chosen charity.

The PRD specifies monthly/yearly subscription, Stableford score entry, monthly prize draws, and charity contribution. fileciteturn0file0L75-L78

Use oversized numbers rather than three generic feature cards.

---

# 10. Charity — Emotional Centre

Charity should be one of the most visually important sections.

The PRD states that charitable impact should lead the platform's story and that subscribers choose the cause receiving part of their subscription. The minimum contribution is 10%, with the option to increase it. fileciteturn0file0L174-L197

## Design direction

Use a large editorial section:

> **Your subscription can do more.**

Then show:

```text
10%
minimum
to charity
```

with a large visual story beside it.

### Charity selector

Make the interaction feel like browsing causes, not shopping.

Example:

```text
CHOOSE YOUR CAUSE

[ Search charities... ]

┌─────────────────────────────┐
│ IMAGE                       │
│                             │
│ Cancer Research             │
│ Supporting better outcomes  │
│                             │
│ 10% ──────────── 25%        │
│                             │
│ [ Choose this charity ]     │
└─────────────────────────────┘
```

Use photography carefully and respectfully.

---

# 11. Draw / Prize Experience

The draw is the excitement layer.

The PRD specifies 5-number, 4-number and 3-number match tiers, with pool shares of 40%, 35%, and 25%; the 5-number jackpot rolls over if unclaimed. fileciteturn0file0L147-L171

## Visual approach

Do not build a casino-looking interface.

Instead use:

- oversized numbers
- countdown typography
- thin rules
- restrained red accent
- subtle motion
- editorial statistics

Example:

```text
NEXT DRAW

04 DAYS
17 HOURS
28 MINUTES

PRIZE POOL
£XX,XXX

5 MATCH          40%
4 MATCH          35%
3 MATCH          25%

[ View draw rules ]
```

### Draw animation

Before the result:

- numbers pulse very subtly
- countdown ticks
- selected numbers animate individually

After the result:

- winning numbers appear one at a time
- use a restrained red highlight
- avoid slot-machine effects

---

# 12. Score Entry

The score-entry interface should feel extremely simple.

The PRD requires:

- last 5 scores
- Stableford range 1–45
- date on every score
- one score per date
- only the latest 5 retained
- oldest score automatically replaced
- newest score shown first

fileciteturn0file0L130-L142

## UI

```text
YOUR LAST 5 SCORES

┌───────────────────────────────┐
│ 38          18 SEP 2026       │
│ Stableford                   │
└───────────────────────────────┘

┌───────────────────────────────┐
│ 34          11 SEP 2026       │
│ Stableford                   │
└───────────────────────────────┘

[ + Add score ]
```

Avoid a complex form.

Use:

- large score input
- clear date selector
- inline validation
- immediate feedback

---

# 13. User Dashboard

The dashboard should feel like a **personal control room**, not an admin template.

The PRD requires subscription status, score management, charity selection, draw participation, and winnings/payment status. fileciteturn0file0L208-L214

## Dashboard hierarchy

Top:

```text
GOOD MORNING, [NAME]

YOUR MEMBERSHIP
ACTIVE
Renews 18 Oct 2026
```

Then:

### Performance

Large score statistic + last 5 scores.

### Your cause

Charity + contribution percentage.

### Next draw

Countdown + current pool.

### Your winnings

Total winnings + payment state.

Keep the dashboard visually calm.

---

# 14. Admin Dashboard

The admin area can be more utilitarian.

The PRD defines five control surfaces:

1. User management
2. Draw management
3. Charity management
4. Winner management
5. Reports & analytics

fileciteturn0file0L217-L276

## Design

Use a dark interface:

```text
------------------------------------------------
DIGITAL.HEROES ADMIN

USERS       DRAWS       CHARITIES
WINNERS     REPORTS

------------------------------------------------

TOTAL USERS
12,842

PRIZE POOL
£84,320

CHARITY CONTRIBUTIONS
£17,442

------------------------------------------------
```

Use tables where tables are actually useful.

Do not turn every piece of data into a card.

---

# 15. Winner Verification

The winner verification flow requires proof upload, admin review, and payment states from Pending → Paid. fileciteturn0file0L203-L207

Use a clear status timeline:

```text
WINNER VERIFICATION

✓ Winner selected
↓
✓ Proof uploaded
↓
● Admin review
↓
○ Payment
```

Status colours:

- neutral → pending
- blue → information / review
- red → issue / rejected
- black → completed

---

# 16. Subscription UI

Plans:

### Monthly

Flexible membership.

### Yearly

Discounted annual membership.

The PRD specifies monthly and yearly plans and a Stripe or equivalent PCI-compliant payment provider. fileciteturn0file0L124-L129

## Design

Do not use the typical SaaS comparison table.

Instead:

```text
CHOOSE YOUR MEMBERSHIP

MONTHLY
£XX / month

YEARLY
£XXX / year
SAVE XX%

Both include:
✓ Score tracking
✓ Monthly draw participation
✓ Charity contribution

[ Continue ]
```

Keep the decision simple.

---

# 17. Buttons

Buttons should be sharp and confident.

### Primary

Black background / white text.

Hover:

- slightly lighter black
- subtle translation
- arrow movement

### Secondary

Transparent / black border.

### Important CTA

Red may be used sparingly for:

- draw-related CTA
- winner state
- urgent action

Do not make every CTA red.

---

# 18. Cards

Cards should be used selectively.

### Preferred

- square or lightly rounded corners
- 1px border
- subtle background difference
- almost no shadow

Suggested radius:

`6px – 12px`

Avoid:

`24px – 32px` excessive SaaS-style rounding.

---

# 19. Borders & Dividers

Use borders as a major visual language.

Recommended:

```css
border: 1px solid rgba(0,0,0,0.12);
```

Dark mode:

```css
border: 1px solid rgba(255,255,255,0.12);
```

Use horizontal rules to separate editorial sections.

---

# 20. Photography

Photography should support **people and impact**, not golf clichés.

Good:

- human portraits
- charity volunteers
- community moments
- close-up hands
- real environments
- monochrome documentary photography
- subtle grain

Avoid:

- golf ball close-ups
- golf club hero shots
- generic golf-course panoramas
- fake corporate stock photography
- overly staged smiling groups

The sport should be present through context and product mechanics, not through cliché visual language.

---

# 21. Motion System

Motion should communicate hierarchy.

## Motion principles

### Fast

`150–250ms`

For:

- hover
- button states
- toggles

### Medium

`300–500ms`

For:

- cards
- navigation
- panels

### Slow

`700–1200ms`

For:

- hero
- section reveals
- large typography

### Easing

Prefer:

```text
cubic-bezier(0.22, 1, 0.36, 1)
```

Avoid constant bouncing.

---

# 22. Scroll Reveals

Sections should reveal as the user moves through the page.

Use:

- opacity
- translateY
- clip-path
- image mask reveals
- number counters

Example:

```text
opacity: 0 → 1
translateY: 30px → 0
duration: 700ms
```

Do not animate every paragraph independently.

Group related elements.

---

# 23. Signature Visual Detail

Create a recurring **red editorial mark**.

For example:

```text
01 /
02 /
03 /
```

or a thin red line next to important section labels.

This becomes a recognisable Digital Heroes visual language.

Use blue only for occasional informational system states.

---

# 24. Empty States

Never use generic:

> "No data found."

Instead make the interface useful.

Example:

> **Your story starts here.**
>
> Add your first Stableford score to begin tracking your performance.

CTA:

**Add first score →**

---

# 25. Loading States

Use skeletons sparingly.

Prefer simple editorial loading indicators:

```text
LOADING
───────
```

or a subtle animated line.

Avoid spinning loaders everywhere.

---

# 26. Error States

Errors should be calm and specific.

Example:

> **That date already has a score.**
>
> You can edit the existing score instead.

Use red only as a signal, not as a giant warning block.

---

# 27. Responsive Behaviour

The PRD requires responsive design across mobile and desktop. fileciteturn0file0L316-L327

### Mobile

Do not simply shrink desktop.

Recompose the layout.

Hero:

```text
YOUR GAME.
Someone else's
tomorrow.

[ Subscribe ]

[ See how it works ]
```

Then stack the visual.

Dashboard:

- one primary metric at a time
- horizontal score history
- sticky bottom CTA where appropriate
- simplified navigation

Tables should become:

- stacked rows
- horizontal scroll where necessary
- or mobile-specific list layouts

---

# 28. Accessibility

The visual design must remain accessible.

Requirements:

- strong text contrast
- keyboard navigation
- visible focus states
- semantic HTML
- buttons must look like buttons
- no information communicated by colour alone
- reduced-motion support
- readable body text
- touch targets at least approximately 44px

If the user enables reduced motion, disable parallax and major reveal animations.

---

# 29. Dark / Light Theme Strategy

Use both.

### Light

Primary marketing experience.

```text
OFF-WHITE
BLACK
SILVER
RED
BLUE
```

### Dark

Use for:

- draw experience
- admin
- selected dashboard sections
- footer

Dark mode should feel like a deliberate alternate environment, not an inverted light theme.

---

# 30. Footer

Minimal and editorial.

```text
DIGITAL.HEROES

Play for more.
Give back.

How it works
Charities
Draw
Prizes
Sign in
Subscribe

Privacy
Terms
Responsible participation

© 2026 Digital Heroes
```

Do not make the footer enormous.

---

# 31. Design Tokens

```css
:root {
  --black: #090909;
  --near-black: #111111;
  --charcoal: #1B1B1B;

  --grey-700: #4A4A4A;
  --grey-500: #6F6F6F;
  --silver: #B9BCC1;
  --silver-light: #D9DADC;

  --off-white: #F4F4F1;
  --white: #FFFFFF;

  --red: #C62828;
  --red-soft: #E7C8C8;

  --blue: #2457A6;
  --blue-soft: #D7E1F1;

  --radius-sm: 6px;
  --radius-md: 10px;

  --space-section: clamp(96px, 12vw, 180px);

  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

# 32. Component Philosophy

Build components around **behaviour and purpose**, not visual repetition.

Recommended components:

```text
Navbar
Hero
EditorialHeading
SectionLabel
PrimaryButton
SecondaryButton
ScoreEntry
ScoreHistory
DrawCountdown
PrizePool
CharityCard
CharitySelector
CharitySpotlight
SubscriptionSelector
WinnerStatus
DashboardMetric
AdminTable
StatusBadge
Timeline
Footer
```

Avoid creating dozens of nearly identical card components.

---

# 33. Homepage Content Priority

The visual hierarchy should be:

```text
1. WHY DIGITAL HEROES EXISTS
2. CHARITY IMPACT
3. HOW THE PLATFORM WORKS
4. MONTHLY DRAW
5. PRIZE POOL
6. SCORE TRACKING
7. SUBSCRIPTION
8. FINAL CTA
```

The PRD explicitly says the design should lead with charitable impact rather than sport. fileciteturn0file0L280-L289

---

# 34. Final CTA

End the homepage with a strong editorial moment.

Example:

> **Make your next round count.**

Supporting copy:

> Track your game. Enter the draw. Give something back.

CTA:

**Become a member →**

Keep the final section mostly monochrome with a controlled red accent.

---

# 35. Anti-AI Design Rules

These rules are mandatory for implementation.

### Do not:

- use purple gradients
- use excessive glassmorphism
- use glowing borders
- use random floating blobs
- use excessive rounded rectangles
- put every section in a card
- use generic dashboard templates
- use meaningless statistics
- animate everything
- use random decorative 3D objects
- use fake testimonials unless supplied by the product
- invent charity impact numbers
- invent prize values
- invent user counts
- invent golf performance claims
- use placeholder copy that remains in production

### Do:

- use whitespace intentionally
- use strong typography
- create visual rhythm
- use asymmetrical composition
- use real product information
- make charity visually important
- use motion sparingly
- use subtle texture
- create strong editorial hierarchy
- make every animation serve a purpose
- make mobile layouts intentionally designed

---

# 36. PRD Compliance Checklist

Before considering the design complete, verify that the interface supports every required product area.

### Public

- [ ] Platform concept
- [ ] Charity directory
- [ ] Draw mechanics
- [ ] Subscription CTA

### Subscriber

- [ ] Signup/login
- [ ] Monthly/yearly subscription
- [ ] Profile/settings
- [ ] Score entry/edit
- [ ] Latest 5 scores
- [ ] Charity selection
- [ ] Contribution percentage
- [ ] Draw participation
- [ ] Winnings
- [ ] Winner proof upload

### Admin

- [ ] User management
- [ ] Subscription management
- [ ] Draw configuration
- [ ] Draw simulation
- [ ] Draw publishing
- [ ] Charity CRUD
- [ ] Charity media/content
- [ ] Winner verification
- [ ] Payout status
- [ ] Reports
- [ ] Analytics

These requirements come directly from the PRD's role definitions and admin/dashboard sections. fileciteturn0file0L82-L118 fileciteturn0file0L217-L276

---

# 37. Quality Bar

The final design should feel like a **real product ready for public launch**, not a trainee demo.

A reviewer should immediately see:

- a coherent visual identity
- strong typography
- clear hierarchy
- thoughtful motion
- deliberate spacing
- accessible interactions
- a strong charity-first story
- a distinctive homepage
- professional dashboard UX
- responsive behaviour
- no unnecessary visual noise

The PRD evaluates requirements interpretation, system design, UI/UX creativity, data handling, scalability thinking, and problem solving. fileciteturn0file0L307-L327

The design should therefore communicate that the visual decisions are connected to the product requirements rather than being decoration added on top.

---

# 38. Implementation Instruction

**Treat this document as the visual design system for Digital Heroes.**

When implementing:

1. Follow the PRD as the functional source of truth.
2. Follow this document as the visual source of truth.
3. Do not invent product functionality not present in the PRD.
4. Do not replace the charity-first story with golf-first visuals.
5. Keep the colour palette predominantly monochrome.
6. Use red and blue as controlled functional accents.
7. Use bold editorial typography and restrained italic/cursive display typography.
8. Prioritise the homepage hero and first-scroll experience.
9. Use subtle, high-quality animation.
10. Keep the result human, editorial, and intentionally imperfect rather than visually repetitive.
11. Ensure every important interaction works on mobile and desktop.
12. Before finishing, compare every major screen against the PRD requirements and this design system.

**Target feeling:**

> **A modern membership club built around performance, anticipation, and giving back — not a golf website, not a lottery website, and not another generic SaaS dashboard.**
