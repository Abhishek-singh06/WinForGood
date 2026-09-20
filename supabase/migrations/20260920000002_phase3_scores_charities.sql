-- ==============================================================================
-- DIGITAL HEROES — PHASE 3 DATABASE MIGRATION
-- Migration: 20260920000002_phase3_scores_charities.sql
-- PRD Traceability: § 05 (Scorecard & Score System), § 07 (Charity Choice), § 11 (Admin Control)
-- Business Rules: BR-020-029 (Stableford & Rolling 5), BR-030-039 (Charities), BR-140-142 (Isolation)
-- ==============================================================================

-- 1. Create the charities table
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tagline TEXT,
    mission TEXT NOT NULL,
    description TEXT NOT NULL,
    hero_image TEXT,
    logo TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    events JSONB NOT NULL DEFAULT '[]'::jsonb,
    impact_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for charity queries
CREATE INDEX IF NOT EXISTS idx_charities_slug ON public.charities(slug);
CREATE INDEX IF NOT EXISTS idx_charities_category ON public.charities(category);
CREATE INDEX IF NOT EXISTS idx_charities_active ON public.charities(is_active);
CREATE INDEX IF NOT EXISTS idx_charities_featured ON public.charities(is_featured);

-- 2. Update profiles table to reference charities
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS charity_percentage INTEGER NOT NULL DEFAULT 10;

-- Add constraint for charity percentage (PRD § 07: 10% minimum floor, up to 100%)
DO $$ BEGIN
    ALTER TABLE public.profiles
        ADD CONSTRAINT chk_profiles_charity_percentage
        CHECK (charity_percentage >= 10 AND charity_percentage <= 100);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Update handle_new_user trigger to populate charity preference while preserving role lock
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_charity_id UUID;
    v_charity_pct INTEGER;
BEGIN
    BEGIN
        v_charity_id := (NEW.raw_user_meta_data->>'charity_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_charity_id := NULL;
    END;

    v_charity_pct := COALESCE((NEW.raw_user_meta_data->>'charity_percentage')::INTEGER, 10);
    IF v_charity_pct < 10 THEN v_charity_pct := 10; END IF;
    IF v_charity_pct > 100 THEN v_charity_pct := 100; END IF;

    INSERT INTO public.profiles (id, full_name, email, role, charity_id, charity_percentage)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Subscriber'),
        NEW.email,
        'subscriber', -- Strictly forced: Client cannot specify 'admin' role
        v_charity_id,
        v_charity_pct
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;
    RETURN NEW;
END;
$$;

-- 3. Create the scores table
-- PRD § 05: Stableford scores between 1 and 45 inclusive, exactly 1 score per date per subscriber.
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    score_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_scores_stableford_range CHECK (score >= 1 AND score <= 45),
    CONSTRAINT uq_user_score_date UNIQUE (user_id, score_date)
);

-- Index for fast user-specific date-ordered lookups
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON public.scores(user_id, score_date DESC, created_at DESC);

-- 4. Concurrency-Safe Rolling-Five Score Retention Function & Trigger
-- PRD § 05 & BR-022: Only the latest 5 scores are retained.
-- When a 6th score is inserted or dates are edited, the oldest scores outside the top 5
-- (ordered strictly by score_date DESC, created_at DESC) are atomically pruned.
CREATE OR REPLACE FUNCTION public.enforce_rolling_five_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.scores
    WHERE user_id = NEW.user_id
      AND id NOT IN (
          SELECT id FROM public.scores
          WHERE user_id = NEW.user_id
          ORDER BY score_date DESC, created_at DESC
          LIMIT 5
      );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rolling_five_scores ON public.scores;
CREATE TRIGGER trg_rolling_five_scores
    AFTER INSERT OR UPDATE ON public.scores
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_rolling_five_scores();

-- Updated_at triggers for scores and charities
DROP TRIGGER IF EXISTS trg_scores_updated_at ON public.scores;
CREATE TRIGGER trg_scores_updated_at
    BEFORE UPDATE ON public.scores
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS trg_charities_updated_at ON public.charities;
CREATE TRIGGER trg_charities_updated_at
    BEFORE UPDATE ON public.charities
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on both tables
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Charities RLS Policies
-- ------------------------------------------------------------------------------

-- Policy 1: Public read access for directory (active and reference charities)
CREATE POLICY "charities_select_public"
    ON public.charities
    FOR SELECT
    USING (true);

-- Policy 2: Admin creation
CREATE POLICY "charities_insert_admin"
    ON public.charities
    FOR INSERT
    WITH CHECK (public.is_admin());

-- Policy 3: Admin update (management, active status, featured)
CREATE POLICY "charities_update_admin"
    ON public.charities
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy 4: Admin deletion
CREATE POLICY "charities_delete_admin"
    ON public.charities
    FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Scores RLS Policies
-- ------------------------------------------------------------------------------

-- Policy 1: Subscribers can view only their own scores
CREATE POLICY "scores_select_own"
    ON public.scores
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Admins can view all scores for operational audit
CREATE POLICY "scores_select_admin"
    ON public.scores
    FOR SELECT
    USING (public.is_admin());

-- Policy 3: Subscribers can insert their own scores
CREATE POLICY "scores_insert_own"
    ON public.scores
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Subscribers can update their own scores
CREATE POLICY "scores_update_own"
    ON public.scores
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 5: Subscribers can delete their own scores
CREATE POLICY "scores_delete_own"
    ON public.scores
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy 6: Admins can delete invalid scores if needed
CREATE POLICY "scores_delete_admin"
    ON public.scores
    FOR DELETE
    USING (public.is_admin());

-- ==============================================================================
-- 6. SEED INITIAL APPROVED CHARITIES
-- ==============================================================================
INSERT INTO public.charities (id, slug, name, category, tagline, mission, description, hero_image, logo, is_featured, is_active, events, impact_metrics)
VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'youth-horizon-initiative',
    'Youth Horizon Initiative',
    'Education & Youth Empowerment',
    'Unlocking potential through mentorship, academic access, and life skills for underserved youth.',
    'To break systemic cycles of educational inequality by providing long-term academic mentorship, digital literacy tools, and youth leadership retreats.',
    'Founded in 2018, the Youth Horizon Initiative pairs secondary school students from historically disadvantaged communities with dedicated professional mentors. Through after-school STEM academies, creative arts cohorts, and collegiate pathway counseling, we equip the next generation with the confidence and technical competencies required to thrive in a rapidly changing economy.',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    'YHI',
    true,
    true,
    '[{"id":"evt-1","title":"Annual Community Golf Day & Mentorship Cup","date":"October 18, 2026","location":"Metropolitan Country Links","description":"An annual charity golf day uniting business leaders, civic champions, and student fellows to raise scholarship funding."},{"id":"evt-2","title":"Winter Youth Tech Sprint","date":"December 5, 2026","location":"Urban Innovation Hub","description":"A 48-hour youth hackathon connecting high school apprentices with enterprise software mentors."}]'::jsonb,
    '[{"label":"Students Mentored","value":"4,200+"},{"label":"College Transition Rate","value":"94%"},{"label":"Active Regional Chapters","value":"18"}]'::jsonb
),
(
    'a1000000-0000-0000-0000-000000000002',
    'clean-water-allies',
    'Clean Water Allies',
    'Global Health & Water Security',
    'Sustainable clean drinking water infrastructure and sanitation for remote villages.',
    'Deploying solar-powered purification wells and community-managed water infrastructure across drought-vulnerable rural settlements.',
    'Clean Water Allies partners directly with indigenous village councils to design, drill, and sustain gravity-fed water purification infrastructure. By training local civil maintenance teams and establishing women-led water governance boards, we guarantee that clean drinking water remains permanently reliable and cost-free for families.',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    'CWA',
    true,
    true,
    '[{"id":"evt-3","title":"Spring Water Security Scramble","date":"November 12, 2026","location":"Pine Crest Championship Course","description":"A 4-player team charity golf tournament funding three permanent solar well systems in sub-Saharan districts."}]'::jsonb,
    '[{"label":"Wells Installed","value":"320+"},{"label":"Lives Impacted","value":"185,000+"},{"label":"Clean Water Uptime","value":"99.2%"}]'::jsonb
),
(
    'a1000000-0000-0000-0000-000000000003',
    'veterans-forward-project',
    'Veterans Forward Project',
    'Veteran Support & Mental Health',
    'Comprehensive career transition, trauma recovery, and peer support for military veterans.',
    'Providing compassionate, clinical mental health resources, adaptive sports recreation, and executive employment placement for military veterans.',
    'Veterans Forward Project bridges the gap between active duty military service and civilian prosperity. We offer specialized PTSD clinical therapy retreats, corporate career apprenticeships, and adaptive physical fitness programs that rebuild camaraderie, purpose, and financial independence for returning service members.',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    'VFP',
    true,
    true,
    '[{"id":"evt-4","title":"Honor & Service Memorial Golf Day","date":"November 28, 2026","location":"Bayside Heritage Greens","description":"A prestigious 18-hole charity event pairing wounded veterans with community sponsors to fund ongoing mental wellness programs."}]'::jsonb,
    '[{"label":"Veterans Re-Employed","value":"2,850+"},{"label":"Therapy Hours Provided","value":"48,000+"},{"label":"Peer Cohorts Nationwide","value":"42"}]'::jsonb
),
(
    'a1000000-0000-0000-0000-000000000004',
    'shelter-and-dignity-coalition',
    'Shelter & Dignity Coalition',
    'Housing & Community Resiliency',
    'Permanent supportive housing and rapid crisis response for vulnerable families.',
    'Transforming vacant urban properties into dignified, supportive permanent housing communities paired with holistic social services.',
    'The Shelter & Dignity Coalition believes that stable housing is the foundation of human survival and dignity. We provide emergency transitional shelter, construct micro-home villages for unhoused families, and provide on-site vocational training, childcare, and addiction counseling to ensure long-term stability.',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    'SDC',
    false,
    true,
    '[{"id":"evt-5","title":"Fairways for Families Charity Pro-Am","date":"December 14, 2026","location":"Oakridge Country Club","description":"A competitive pro-am tournament raising funds for emergency winter heating and transitional family apartments."}]'::jsonb,
    '[{"label":"Families Housed","value":"1,450"},{"label":"Meals Distributed","value":"320,000+"},{"label":"Housing Retention Rate","value":"91%"}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    tagline = EXCLUDED.tagline,
    mission = EXCLUDED.mission,
    description = EXCLUDED.description,
    hero_image = EXCLUDED.hero_image,
    logo = EXCLUDED.logo,
    is_featured = EXCLUDED.is_featured,
    is_active = EXCLUDED.is_active,
    events = EXCLUDED.events,
    impact_metrics = EXCLUDED.impact_metrics;
