# Task 05: Subscriber Winnings & Proof Upload UI (`/dashboard/winnings`)

## Contexto
Implement the subscriber winnings tracking and proof upload interface in `src/app/dashboard/winnings/page.tsx` and `src/components/winnings/SubscriberWinningsManager.tsx`.

## Subtareas
- [x] Implement `SubscriberWinningsManager`:
  - List of subscriber's winning records across monthly draws.
  - Distinct status badges for `pending`, `proof_submitted`, `approved`, `rejected`, and `paid`.
  - Non-restrictive proof upload dropzone supporting images and PDFs up to 20MB.
  - Display admin rejection reason clearly with resubmission capability.
  - Payout status tracker (`Pending` -> `Paid`).
- [x] Connect `src/app/dashboard/winnings/page.tsx` with authenticated user session.
