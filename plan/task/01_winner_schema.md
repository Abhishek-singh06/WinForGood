# Task 01: Database Migration for Winner Verification Timestamps & Review Tracking

## Contexto
The `public.winners` table created in Phase 5 foundation needs columns to track submission timestamp, review timestamp, and reviewing admin ID to fulfill PRD § 09 / § 11.04 audit requirements.

## Subtareas
- [x] Create `supabase/migrations/20260920000006_phase6_winner_verification.sql`:
  - Add `submitted_at TIMESTAMPTZ DEFAULT NULL`
  - Add `reviewed_at TIMESTAMPTZ DEFAULT NULL`
  - Add `reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL`
  - Add index on `winners(payout_status)` and `winners(submitted_at)`
- [x] Update `docs/migrations.md` to document migration 000006.
