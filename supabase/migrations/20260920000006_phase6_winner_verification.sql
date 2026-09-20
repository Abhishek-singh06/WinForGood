-- =============================================================================
-- DIGITAL HEROES — Phase 6: Winner Verification & Payout Ledger Scaffolding
-- Migration: 20260920000006_phase6_winner_verification.sql
-- PRD Reference: § 09 (Winner Verification System), § 11.04 (Admin Winners)
-- =============================================================================

-- 1. Add audit and timestamp columns to public.winners
ALTER TABLE public.winners
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add performance indexes for verification queues and payout auditing
CREATE INDEX IF NOT EXISTS idx_winners_payout_status ON public.winners(payout_status);
CREATE INDEX IF NOT EXISTS idx_winners_submitted_at ON public.winners(submitted_at);
CREATE INDEX IF NOT EXISTS idx_winners_reviewed_at ON public.winners(reviewed_at);

-- 3. RLS update: allow winner to update their own row ONLY to submit proof
-- (Admin updates remain governed by admins_manage_winners policy)
CREATE POLICY "winners_update_own_proof"
  ON public.winners
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Subscriber cannot elevate verification_status to approved or change prize_amount or payout_status
    payout_status = 'pending' AND
    verification_status IN ('pending', 'proof_submitted')
  );

-- 4. DBA Comments
COMMENT ON COLUMN public.winners.submitted_at IS
  'Timestamp when winner uploaded scorecard/proof screenshot.';

COMMENT ON COLUMN public.winners.reviewed_at IS
  'Timestamp when admin approved or rejected winner evidence.';

COMMENT ON COLUMN public.winners.reviewed_by IS
  'Admin user ID who approved or rejected the submission.';

-- ---------------------------------------------------------------------------
-- 5. Private Storage Bucket & Policies for Scorecard Verification Proofs
-- ---------------------------------------------------------------------------

-- Create private bucket 'winner-proofs' (public = false ensures signed/authorized access only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'winner-proofs',
  'winner-proofs',
  false,
  20971520, -- 20 MB ceiling
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/bmp',
    'image/tiff',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy 1: Authenticated winner can upload proof into their own user folder
CREATE POLICY "winner_upload_own_proof_files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'winner-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage Policy 2: Authenticated winner can view their own files; Admins can view all
CREATE POLICY "winner_view_own_proof_files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'winner-proofs' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );

-- Storage Policy 3: Administrator full management on winner proofs
CREATE POLICY "admin_manage_winner_proof_files"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'winner-proofs' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

