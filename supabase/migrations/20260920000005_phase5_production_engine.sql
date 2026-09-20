-- =============================================================================
-- DIGITAL HEROES — Phase 5: Production Draw Engine & Accounting Migration
-- Migration: 20260920000005_phase5_production_engine.sql
-- PRD Reference: § 06 (Draw & Reward System), § 07 (Prize Pool Logic)
-- Temporary PO Assumptions: TA-006 (Lower-Tier Unclaimed Disposition)
-- =============================================================================

-- 1. Add accounting columns to draw_tier_allocations
ALTER TABLE public.draw_tier_allocations
  ADD COLUMN IF NOT EXISTS unclaimed_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS disposition TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS remainder_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00;

-- 2. Add constraint checking valid disposition values
ALTER TABLE public.draw_tier_allocations
  DROP CONSTRAINT IF EXISTS chk_tier_disposition;

ALTER TABLE public.draw_tier_allocations
  ADD CONSTRAINT chk_tier_disposition
  CHECK (disposition IS NULL OR disposition IN ('CHARITY', 'ROLLOVER', 'RESERVE'));

-- 3. Immutability trigger for draw_tier_allocations once parent draw is published
CREATE OR REPLACE FUNCTION public.enforce_published_tier_allocation_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draw_status public.draw_status;
BEGIN
  SELECT status INTO v_draw_status
  FROM public.draws
  WHERE id = OLD.draw_id;

  IF v_draw_status = 'published' THEN
    IF NEW.allocated_amount IS DISTINCT FROM OLD.allocated_amount OR
       NEW.winner_count IS DISTINCT FROM OLD.winner_count OR
       NEW.prize_per_winner IS DISTINCT FROM OLD.prize_per_winner OR
       NEW.unclaimed_amount IS DISTINCT FROM OLD.unclaimed_amount OR
       NEW.disposition IS DISTINCT FROM OLD.disposition OR
       NEW.remainder_amount IS DISTINCT FROM OLD.remainder_amount THEN
      RAISE EXCEPTION 'Tier allocations for published draws are immutable. Modifications are prohibited.';
    END IF;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_draw_tier_allocations_immutability ON public.draw_tier_allocations;

CREATE TRIGGER trg_draw_tier_allocations_immutability
  BEFORE UPDATE ON public.draw_tier_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_published_tier_allocation_immutability();

-- 4. DBA COMMENTS
COMMENT ON COLUMN public.draw_tier_allocations.unclaimed_amount IS
  'TA-006: Amount unallocated due to zero winners in this tier.';

COMMENT ON COLUMN public.draw_tier_allocations.disposition IS
  'TA-006: Destination for unclaimed funds (CHARITY for tiers 3 & 4, ROLLOVER for tier 5).';

COMMENT ON COLUMN public.draw_tier_allocations.remainder_amount IS
  'Integer subunit penny remainder left after even split among tier winners.';
