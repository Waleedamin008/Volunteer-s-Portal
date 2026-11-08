-- ====================================================================
-- MAQAM-E-JOUD Foundation — Volunteer Management System
-- Production Supabase Cloud Database Schema & Realtime Setup
-- Copy and paste this script directly into your Supabase SQL Editor:
-- (Supabase Dashboard -> Your Project -> SQL Editor -> New Query -> Run)
-- ====================================================================

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    logo_url TEXT,
    leader_id TEXT,
    leader_name TEXT,
    leader_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Form Configurations Table
CREATE TABLE IF NOT EXISTS public.form_configs (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    welcome_message TEXT,
    submit_button_text TEXT DEFAULT 'Submit Volunteer Application',
    success_message TEXT DEFAULT 'Thank you for your interest in joining MAQAM-E-JOUD Foundation.',
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    published_version INTEGER NOT NULL DEFAULT 1,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE,
    team_id TEXT NOT NULL,
    team_name TEXT,
    form_version_id TEXT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes_count INTEGER NOT NULL DEFAULT 0
);

-- 4. Application Notes Table
CREATE TABLE IF NOT EXISTS public.application_notes (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Application Status History Table
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by_name TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Users & Team Leaders Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'team_leader',
    phone TEXT,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. Team Memberships Table
CREATE TABLE IF NOT EXISTS public.team_memberships (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    team_id TEXT,
    team_name TEXT,
    user_id TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_form_configs_slug ON public.form_configs(slug);
CREATE INDEX IF NOT EXISTS idx_form_configs_team ON public.form_configs(team_id);
CREATE INDEX IF NOT EXISTS idx_applications_team ON public.applications(team_id);
CREATE INDEX IF NOT EXISTS idx_applications_ref ON public.applications(reference_number);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_notes_application ON public.application_notes(application_id);

-- Insert Default Foundation Administrator if not exists
INSERT INTO public.users (id, email, full_name, role, password, created_at)
VALUES ('user_admin_01', 'admin@maqamejoud.org', 'Foundation Administrator', 'admin', 'admin123', now())
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting existing policies
DROP POLICY IF EXISTS "Allow all for teams" ON public.teams;
DROP POLICY IF EXISTS "Allow all for form_configs" ON public.form_configs;
DROP POLICY IF EXISTS "Allow all for applications" ON public.applications;
DROP POLICY IF EXISTS "Allow all for application_notes" ON public.application_notes;
DROP POLICY IF EXISTS "Allow all for application_status_history" ON public.application_status_history;
DROP POLICY IF EXISTS "Allow all for users" ON public.users;
DROP POLICY IF EXISTS "Allow all for team_memberships" ON public.team_memberships;
DROP POLICY IF EXISTS "Allow all for activity_logs" ON public.activity_logs;

-- Permissive API policies for Portal operations via Anon key
CREATE POLICY "Allow all for teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for form_configs" ON public.form_configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for application_notes" ON public.application_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for application_status_history" ON public.application_status_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for team_memberships" ON public.team_memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime Broadcasts
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.form_configs;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.application_notes;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.application_status_history;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

