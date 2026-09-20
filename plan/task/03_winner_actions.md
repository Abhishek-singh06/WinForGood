# Task 03: Server-Authorized Winner Verification & Payout Actions

## Contexto
Implement secure, server-authorized actions for proof submission, admin approval, admin rejection, and payout progression.

## Subtareas
- [x] Create `src/lib/winners/actions.ts`:
  - `submitWinnerProofAction(winnerId: string, formData: FormData)`:
    - Enforces Winner Ownership: verifies `auth.user.id === winner.user_id`. Rejects if user does not own the win.
    - Validates file format and size (< 20MB).
    - Transitions verification status: `pending` -> `proof_submitted`, sets `submitted_at = now()`.
  - `approveWinnerVerificationAction(winnerId: string)`:
    - Enforces Admin Authorization: strictly validates `auth.profile.role === 'admin'`.
    - Updates `verification_status = 'approved'`, `reviewed_at = now()`, `reviewed_by = admin.id`, `rejection_reason = null`.
  - `rejectWinnerVerificationAction(winnerId: string, reason: string)`:
    - Enforces Admin Authorization: strictly validates `auth.profile.role === 'admin'`.
    - Requires non-empty reason field.
    - Updates `verification_status = 'rejected'`, `rejection_reason = reason`, `reviewed_at = now()`, `reviewed_by = admin.id`.
  - `markWinnerPayoutAction(winnerId: string)`:
    - Enforces Admin Authorization: strictly validates `auth.profile.role === 'admin'`.
    - Enforces Payment State Rule: only allowed when `verification_status === 'approved'`. Rejects payout progression if verification is pending, proof_submitted, or rejected.
    - Updates `payout_status = 'paid'`.
  - Query actions: `getAdminWinnersList()` and `getUserWinningsList(userId: string)`.
