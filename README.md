# WinForGood

> **Play. Win. Give Back.**

WinForGood is a charity-first subscription and monthly draw platform designed around a simple idea: participation can create impact.

Users can subscribe, enter their Stableford golf scores, support a charity of their choice, participate in monthly draws, and manage winnings through a structured digital experience.

The project was built as a full-stack product prototype with a strong focus on system design, security, traceability, and UI/UX.

---

## ✨ What is WinForGood?

WinForGood combines:

- Monthly and yearly subscriptions
- Stableford score management
- Monthly number draws
- Prize pool calculations
- Charity selection and contributions
- Winner verification
- Payout management
- Subscriber dashboards
- Administrative controls
- Reporting and financial summaries

The product is designed around the principle:

> **Feel, not fairway.**

Rather than using traditional golf or casino visual language, WinForGood focuses on a modern, premium, charity-first experience.

---

## 🚀 Key Features

### 🎯 Subscription

- Monthly and yearly subscription plans
- Subscription lifecycle management
- Renewal and cancellation handling
- Subscription status tracking
- Stripe-ready payment architecture
- Server-side payment integration

### ⛳ Stableford Score Management

Users can:

- Add Stableford scores from 1–45
- Record the score date
- Edit scores
- Delete scores
- Maintain a rolling history of the latest 5 scores

The score system automatically maintains the required rolling-five behavior.

### 🎲 Monthly Draw Engine

The draw engine supports:

- 3-number matches
- 4-number matches
- 5-number matches
- Random draw generation
- Algorithmic weighted draw generation
- Draw simulation
- Immutable draw snapshots
- Prize tier calculations
- Jackpot rollover
- Equal prize splitting between winners

Prize allocation:

| Match | Prize Share |
|---|---:|
| 5 numbers | 40% |
| 4 numbers | 35% |
| 3 numbers | 25% |

Only the 5-number jackpot rolls forward when unclaimed.

### ❤️ Charity System

Users can:

- Select a charity
- Choose their contribution percentage
- Search the charity directory
- View charity profiles
- View featured charities
- Support charitable causes through their subscription

The system maintains a minimum charity contribution while allowing users to contribute more.

### 🏆 Winner Verification

Winning users can:

- View winnings
- Submit proof
- Upload screenshots/evidence
- Track verification status
- Resubmit rejected evidence

Administrators can:

- Review evidence
- Approve winners
- Reject submissions with a reason
- Mark winnings as paid

### 📊 Admin Dashboard

Administrators have dedicated management areas for:

- Users
- Subscriptions
- Draws
- Charities
- Winners
- Reports

The reporting system includes:

- Subscriber growth
- Draw history
- Charity contribution totals
- Financial summaries
- Date filtering
- CSV export

---

# 🎮 Demo Mode

WinForGood includes a dedicated **Demo Mode** for presentations and product evaluation.

No account or credentials are required.

### Demo flow

```text
Login
  ↓
Try Demo Mode
  ↓
Dashboard
  ↓
Scores
  ↓
Charity
  ↓
Draws
  ↓
Winnings
  ↓
Payment Simulation
