-- =============================================================================
-- DIGITAL HEROES — Phase 5: Draw Engine & Prize Pool Foundation Scaffolding
-- Migration: 20260920000004_phase5_draws_foundation.sql
-- PRD Reference: § 06 (Draw & Reward System), § 07 (Prize Pool Logic)
-- Business Rules: BR-040 – BR-066
-- =============================================================================
-- NOTE: Exact score-to-draw mapping, algorithmic weighting formula, prize pool
--       percentage, eligibility for < 5 scores, and currency remain
--       STATUS: OPEN DECISION. This schema creates the structural foundation
--       without hardcoding unresolved business rules.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------

-- Lifecycle states for monthly draws (PRD § 06, § 11)
CREATE TYPE public.draw_status AS ENUM (
  'draft',
  'simulated',
  'published',
  'cancelled'
);

-- Supported draw modes (PRD § 06)
CREATE TYPE public.draw_mode AS ENUM (
  'random',
  'algorithmic'
);

-- Supported match tiers (PRD § 06 & § 07)
CREATE TYPE public.match_tier AS ENUM (
  '5_number',
  '4_number',
  '3_number'
);

-- Winner verification status (PRD § 09)
CREATE TYPE public.winner_verification_status AS ENUM (
  'pending',
  'proof_submitted',
  'approved',
  'rejected'
);

-- Winner payout status (PRD § 09)
CREATE TYPE public.winner_payout_status AS ENUM (
  'pending',
  'paid'
);

-- ---------------------------------------------------------------------------
-- TABLE: public.draws
-- Represents monthly draw cycles and their configuration/state.
-- ---------------------------------------------------------------------------
CREATE TABLE public.draws (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_number                 SERIAL UNIQUE,
  month                       DATE NOT NULL UNIQUE, -- 'YYYY-MM-01' representing the cycle
  draw_mode                   public.draw_mode NOT NULL DEFAULT 'random',
  status                      public.draw_status NOT NULL DEFAULT 'draft',
  winning_numbers             INT[] DEFAULT NULL,
  total_subscribers_snapshot  INT DEFAULT NULL,
  total_prize_pool            NUMERIC(12,2) DEFAULT NULL,
  jackpot_rollover_in         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  jackpot_rollover_out        NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  simulation_run_at           TIMESTAMPTZ DEFAULT NULL,
  published_at                TIMESTAMPTZ DEFAULT NULL,
  created_by                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TABLE: public.draw_tier_allocations
-- Predefined 40% / 35% / 25% pool share breakdown per PRD § 07.
-- ---------------------------------------------------------------------------
CREATE TABLE public.draw_tier_allocations (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id                     UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  tier                        public.match_tier NOT NULL,
  pool_percentage             NUMERIC(5,2) NOT NULL,
  allocated_amount            NUMERIC(12,2) DEFAULT NULL,
  winner_count                INT NOT NULL DEFAULT 0,
  prize_per_winner            NUMERIC(12,2) DEFAULT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_draw_tier UNIQUE (draw_id, tier),
  CONSTRAINT chk_pool_percentage CHECK (pool_percentage IN (40.00, 35.00, 25.00))
);

-- ---------------------------------------------------------------------------
-- TABLE: public.draw_entries
-- Immutable snapshot of eligible subscriber participation records.
-- ---------------------------------------------------------------------------
CREATE TABLE public.draw_entries (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id                     UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numbers                     INT[] NOT NULL,
  match_count                 INT DEFAULT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_draw_user_entry UNIQUE (draw_id, user_id)
);

-- ---------------------------------------------------------------------------
-- TABLE: public.winners
-- Ledger of verified winning matches across 5/4/3 tiers.
-- ---------------------------------------------------------------------------
CREATE TABLE public.winners (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id                     UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_tier                  public.match_tier NOT NULL,
  prize_amount                NUMERIC(12,2) DEFAULT NULL,
  verification_status         public.winner_verification_status NOT NULL DEFAULT 'pending',
  payout_status               public.winner_payout_status NOT NULL DEFAULT 'pending',
  proof_file_url              TEXT DEFAULT NULL,
  rejection_reason            TEXT DEFAULT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_winner_match UNIQUE (draw_id, user_id, match_tier)
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX idx_draws_status ON public.draws(status);
CREATE INDEX idx_draws_month ON public.draws(month);
CREATE INDEX idx_draw_entries_draw_id ON public.draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id ON public.draw_entries(user_id);
CREATE INDEX idx_winners_draw_id ON public.winners(draw_id);
CREATE INDEX idx_winners_user_id ON public.winners(user_id);
CREATE INDEX idx_winners_verification ON public.winners(verification_status);

-- ---------------------------------------------------------------------------
-- IMMUTABILITY & AUDIT TRIGGER
-- Once a draw status is 'published', its core numbers and pool are immutable.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_published_draw_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If existing row is already published, reject modifications to core fields
  IF OLD.status = 'published' THEN
    IF NEW.winning_numbers IS DISTINCT FROM OLD.winning_numbers OR
       NEW.draw_mode IS DISTINCT FROM OLD.draw_mode OR
       NEW.month IS DISTINCT FROM OLD.month OR
       NEW.total_prize_pool IS DISTINCT FROM OLD.total_prize_pool THEN
      RAISE EXCEPTION 'Published draws are immutable. Modification of winning numbers, mode, month, or prize pool is prohibited.';
    END IF;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_draws_immutability
  BEFORE UPDATE ON public.draws
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_published_draw_immutability();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------------
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_tier_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- 1. public.draws policies
-- Public visitors and subscribers can view published draws
CREATE POLICY "public_read_published_draws"
  ON public.draws
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admins have full access to view, configure, and simulate draws
CREATE POLICY "admins_manage_draws"
  ON public.draws
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. public.draw_tier_allocations policies
-- Anyone can view tier allocations for published draws
CREATE POLICY "public_read_published_tier_allocations"
  ON public.draw_tier_allocations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.draws
      WHERE public.draws.id = draw_tier_allocations.draw_id
        AND public.draws.status = 'published'
    )
  );

-- Admins manage tier allocations
CREATE POLICY "admins_manage_tier_allocations"
  ON public.draw_tier_allocations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. public.draw_entries policies
-- Subscribers can read their own participating entries
CREATE POLICY "subscribers_read_own_entries"
  ON public.draw_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all entries
CREATE POLICY "admins_read_all_entries"
  ON public.draw_entries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 4. public.winners policies
-- Winners can read their own winning records
CREATE POLICY "winners_read_own_records"
  ON public.winners
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins manage all winners
CREATE POLICY "admins_manage_winners"
  ON public.winners
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- DBA COMMENTS
-- ---------------------------------------------------------------------------
COMMENT ON TABLE public.draws IS
  'PRD § 06: Monthly draw cycle records with state machine draft -> simulated -> published.';

COMMENT ON TABLE public.draw_tier_allocations IS
  'PRD § 07: 40% (5-match), 35% (4-match), 25% (3-match) prize breakdown per draw.';

COMMENT ON TABLE public.draw_entries IS
  'PRD § 06 / § 10: Immutable subscriber participation tickets per draw.';

COMMENT ON TABLE public.winners IS
  'PRD § 07 / § 09: Master winner ledger for verification and payout tracking.';
