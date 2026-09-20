# Task 06: Comprehensive Winner Verification & Payout Test Suite

## Contexto
Create exhaustive automated tests in `src/__tests__/winner_verification.test.ts` verifying file validation, ownership enforcement, state machine transitions, admin authorization barriers, and payout progression prerequisites.

## Subtareas
- [x] Test non-restrictive file format acceptance and file size ceiling (20MB).
- [x] Test winner ownership enforcement: rejecting proof uploads attempted by non-owners.
- [x] Test admin authorization enforcement: rejecting approve/reject/payout actions by non-admins.
- [x] Test verification state machine: `pending` -> `proof_submitted` -> `approved` / `rejected`.
- [x] Test mandatory rejection reason on rejection.
- [x] Test payment state progression constraint: payout transition to `paid` strictly blocked unless `verification_status === 'approved'`.
- [x] Test migration 6 schema invariants.
