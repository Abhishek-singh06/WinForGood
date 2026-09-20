-- ==============================================================================
-- DIGITAL HEROES — DATABASE INITIAL MIGRATION
-- Migration: 20260920000001_initial_schema.sql
-- PRD Traceability: § 03 (User Roles), § 10 (User Dashboard), § 11 (Admin Control)
-- Business Rules: BR-140 (Role boundaries), BR-141 (Admin auth), BR-142 (User isolation)
-- Architecture Section: docs/architecture.md § 4 (Entity 1: profiles)
-- ==============================================================================

-- 1. Create custom types if needed
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('subscriber', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create the profiles table
-- Extends Supabase auth.users with application profile data, display name, and role.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'subscriber',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by role and email
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Security Definer function to check admin role without recursive RLS trigger
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 4. Enable Row Level Security (RLS) on profiles
-- MANDATE: Subscribers must only access their own profile; Admins have operational access.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles
CREATE POLICY "profiles_select_admin"
    ON public.profiles
    FOR SELECT
    USING (public.is_admin());

-- Policy 3: Users can update their own profile name and avatar (but NOT their role)
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    );

-- Policy 4: Admins can update any profile (including role management)
CREATE POLICY "profiles_update_admin"
    ON public.profiles
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy 5: Service role / triggers can insert profiles on user creation
CREATE POLICY "profiles_insert_service"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- 5. Automatic Profile Provisioning Trigger
-- When a user signs up via auth.users, automatically provision their public profile.
-- CRITICAL SECURITY RULE: Role is ALWAYS forced to 'subscriber' on signup.
-- Clients CANNOT escalate themselves to 'admin' via signup metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Subscriber'),
        NEW.email,
        'subscriber' -- Strictly forced: Client cannot specify 'admin' role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;
    RETURN NEW;
END;
$$;

-- Trigger firing on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
