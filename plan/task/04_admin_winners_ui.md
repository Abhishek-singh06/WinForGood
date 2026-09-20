# Task 04: Admin Verification Studio UI (`/admin/winners`)

## Contexto
Implement the full admin verification interface in `src/app/admin/winners/page.tsx` and `src/components/admin/AdminWinnerVerificationManager.tsx`.

## Subtareas
- [x] Implement `AdminWinnerVerificationManager`:
  - View all winners with: winner name/email, draw number/month, winning tier, prize amount, verification state, submitted evidence thumbnail/link, submission timestamp, reviewer info & timestamp.
  - Interactive Review Studio / Modal:
    - Evidence preview (image/PDF modal view).
    - Approve button with confirmation.
    - Reject button with required reason input.
    - Payout status control: "Mark Payout Completed" button (only enabled when verification status is 'approved').
  - Role-based server-action integration with optimistic updates or toast feedback.
- [x] Connect `src/app/admin/winners/page.tsx` with server-side data fetching.
