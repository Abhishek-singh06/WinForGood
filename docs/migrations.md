# Digital Heroes — Database Migration Ledger

**Document:** `docs/migrations.md`  
**Standard:** Deterministic, Idempotent, and Traceable Database Changes  
**Hierarchy:** Derived from `Digital Heroes PRD (Level 1).pdf` and `docs/architecture.md`

---

## Migration Index

| Migration File | Primary Tables | PRD Section | Business Rules | Purpose |
|---|---|---|---|---|
| `20260920000001_initial_schema.sql` | `public.profiles` | § 03, § 10, § 11 | `BR-140`, `BR-141`, `BR-142` | Provisions user identity, server-controlled roles, least-privilege RLS, and secure signup trigger. |
| `20260920000002_phase3_scores_charities.sql` | `public.charities`, `public.scores`, `public.profiles` | § 05, § 07, § 08, § 11 | `BR-020`–`BR-028`, `BR-070`–`BR-076`, `BR-102` | Provisions real charity directory, Stableford score system (1–45), unique date constraint, and atomic rolling-5 trigger. |
| `20260920000003_phase4_subscriptions.sql` | `public.subscriptions` | § 04, § 10, § 11 | `BR-010`–`BR-019` | Provisions subscriptions table, plan/status enums, RLS, active sub check function. |
| `20260920000004_phase5_draws_foundation.sql` | `public.draws`, `public.draw_tier_allocations`, `public.draw_entries`, `public.winners` | § 06, § 07, § 11 | `BR-040`–`BR-066` | Scaffolds draw lifecycle, tiers, entry snapshots, winner ledgers, and published draw immutability trigger. |
| `20260920000005_phase5_production_engine.sql` | `public.draw_tier_allocations` | § 06, § 07 | `BR-065`, `TA-006` | Adds unclaimed_amount, disposition, and remainder_amount tracking plus allocation immutability trigger. |
| `20260920000006_phase6_winner_verification.sql` | `public.winners` | § 09, § 11.04 | `BR-080`–`BR-084` | Adds submitted_at, reviewed_at, reviewed_by audit columns, performance indexes, and owner proof upload RLS. |

---

## Migration 20260920000001_initial_schema.sql — Technical Specification

### 1. Table: `public.profiles`
- **PRD Requirement:** § 03 (User Roles: Public, Subscriber, Administrator); § 10 (User Dashboard profile identification); § 11 (Admin User Management).
- **Requirement IDs:** `TR-021` (Registered Subscriber), `TR-022` (Administrator), `TR-100` (User Management).
- **Business Rules:** `BR-140` (Role boundaries), `BR-141` (Admin authorization), `BR-142` (User isolation).
- **Architecture Section:** `docs/architecture.md` § 4 (Entity 1: `profiles`).
- **Columns:**
  - `id` (UUID, PRIMARY KEY, references `auth.users(id)` ON DELETE CASCADE)
  - `role` (`user_role` ENUM `'subscriber' | 'admin'`, NOT NULL DEFAULT `'subscriber'`)
  - `full_name` (TEXT, NOT NULL)
  - `email` (TEXT, NOT NULL)
  - `avatar_url` (TEXT, NULLABLE)
  - `created_at` (TIMESTAMPTZ, NOT NULL DEFAULT `now()`)
  - `updated_at` (TIMESTAMPTZ, NOT NULL DEFAULT `now()`)
- **Constraints & Indexes:**
  - Index on `profiles(role)` for rapid administrative filtering.
  - Index on `profiles(email)` for unique user identity resolution.
  - Foreign key constraint to Supabase `auth.users` with cascading deletion.

### 2. Row Level Security (RLS) Policies
- **`profiles_select_own`**: `USING (auth.uid() = id)`. Ensures subscribers can only query their own private profile record.
- **`profiles_select_admin`**: `USING (public.is_admin())`. Enables verified administrators to list and inspect all platform user profiles.
- **`profiles_update_own`**: `USING (auth.uid() = id) WITH CHECK (role = own_current_role)`. Prevents subscribers from modifying their role from `subscriber` to `admin` during profile edits.
- **`profiles_update_admin`**: `USING (public.is_admin()) WITH CHECK (public.is_admin())`. Grants role elevation and profile update authority strictly to existing administrators.
- **`profiles_insert_service`**: Allows the internal database trigger to insert rows upon user registration.

### 3. Server-Side Security Functions & Triggers
- **`public.is_admin()`**: Evaluates if the executing JWT (`auth.uid()`) holds `role = 'admin'` with `SECURITY DEFINER` semantics, preventing recursive RLS loops.
- **`public.handle_new_user()`**: Trigger on `auth.users AFTER INSERT`. Extracts user metadata and strictly inserts `role = 'subscriber'`, completely ignoring any client attempts to pass `'admin'` in user metadata.
- **`public.update_timestamp()`**: Automatically updates `updated_at` to current UTC time on row updates.

---

## Migration 20260920000002_phase3_scores_charities.sql — Technical Specification

### 1. Table: `public.charities`
- **PRD Requirement:** § 07 (Charity Selection); § 08 (Charity System); § 11.03 (Admin Charity Management).
- **Columns:** `id` (UUID PRIMARY KEY), `slug` (TEXT UNIQUE), `name` (TEXT), `category` (TEXT), `tagline` (TEXT), `mission` (TEXT), `description` (TEXT), `hero_image` (TEXT), `logo` (TEXT), `is_featured` (BOOLEAN), `is_active` (BOOLEAN), `events` (JSONB), `impact_metrics` (JSONB), `created_at`, `updated_at`.
- **Indexes:** `idx_charities_slug`, `idx_charities_category`, `idx_charities_active`, `idx_charities_featured`.
- **RLS Policies:**
  - `charities_select_public`: Public read access (`USING (true)`).
  - `charities_insert_admin`, `charities_update_admin`, `charities_delete_admin`: Restricted strictly to verified administrators via `public.is_admin()`.

### 2. Table: `public.scores`
- **PRD Requirement:** § 05 (Scorecard & Score System); BR-020 to BR-028.
- **Columns:** `id` (UUID PRIMARY KEY), `user_id` (UUID REFERENCES `auth.users(id)` ON DELETE CASCADE), `score` (INTEGER CHECK `1 <= score <= 45`), `score_date` (DATE NOT NULL), `created_at`, `updated_at`.
- **Constraints:**
  - `chk_scores_stableford_range`: Enforces Stableford points between 1 and 45 inclusive.
  - `uq_user_score_date`: `UNIQUE(user_id, score_date)` guarantees exactly one round per date per subscriber.
- **Index:** `idx_scores_user_date` on `(user_id, score_date DESC, created_at DESC)`.
- **Atomic Rolling-Five Retention Trigger:**
  - `public.enforce_rolling_five_scores()`: Executes `AFTER INSERT OR UPDATE ON public.scores`. Automatically deletes any rows for that `user_id` outside the top 5 ordered strictly by `score_date DESC, created_at DESC`. Ensures concurrency safety at the database engine level.
- **RLS Policies:**
  - `scores_select_own`, `scores_insert_own`, `scores_update_own`, `scores_delete_own`: Restricted strictly to row owner (`auth.uid() = user_id`).
  - `scores_select_admin`: Allows administrators to audit scores (`public.is_admin()`).

### 3. Profile Schema Update
- Columns added to `public.profiles`:
  - `charity_id` (UUID REFERENCES `public.charities(id)` ON DELETE SET NULL).
  - `charity_percentage` (INTEGER NOT NULL DEFAULT 10, CHECK `charity_percentage >= 10 AND charity_percentage <= 100`).
- Updated `public.handle_new_user()` to parse selected charity and contribution percentage with 10% floor on account creation.

---

## Migration 20260920000006_phase6_winner_verification.sql — Technical Specification

### 1. Table Alteration: `public.winners`
- **PRD Reference:** § 09 (Winner Verification System); § 11.04 (Admin Winners).
- **Columns Added:**
  - `submitted_at` (`TIMESTAMPTZ DEFAULT NULL`): Records timestamp when subscriber uploads scorecard evidence.
  - `reviewed_at` (`TIMESTAMPTZ DEFAULT NULL`): Records timestamp when administrator approves or rejects submission.
  - `reviewed_by` (`UUID REFERENCES auth.users(id) ON DELETE SET NULL`): Identifies administrator performing review.
- **Indexes:**
  - `idx_winners_payout_status` on `public.winners(payout_status)`.
  - `idx_winners_submitted_at` on `public.winners(submitted_at)`.
  - `idx_winners_reviewed_at` on `public.winners(reviewed_at)`.
- **Row-Level Security (RLS) Policy:**
  - `winners_update_own_proof`: Allows authenticated winners (`auth.uid() = user_id`) to update their own winner row strictly to submit proof, with check constraint enforcing that `payout_status = 'pending'` and `verification_status IN ('pending', 'proof_submitted')`.

### 2. Supabase Storage: Private Bucket `winner-proofs`
- **Configuration:**
  - Bucket ID: `'winner-proofs'`
  - `public`: `false` (Strictly private bucket; unauthenticated and public URL requests blocked).
  - `file_size_limit`: `20971520` (20 MB ceiling).
  - `allowed_mime_types`: `ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/bmp', 'image/tiff', 'application/pdf']`.
- **Storage RLS Policies on `storage.objects`:**
  - `winner_upload_own_proof_files`: Authenticated winner can only upload files to their own subfolder (`(storage.foldername(name))[1] = auth.uid()::text`).
  - `winner_view_own_proof_files`: Authenticated winner can view their own files, or administrator can view all files.
  - `admin_manage_winner_proof_files`: Authorized administrators have full access to manage winner proof files.

