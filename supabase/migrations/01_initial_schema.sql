-- ====================================================================
-- MAQAM-E-JOUD Foundation — Volunteer Management System
-- Database Schema & Row Level Security (RLS)
-- ====================================================================

-- 1. Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'team_leader');
CREATE TYPE team_status AS ENUM ('active', 'inactive');
CREATE TYPE form_status AS ENUM ('draft', 'published', 'unpublished');
CREATE TYPE application_status AS ENUM ('new', 'under_review', 'contacted', 'approved', 'rejected', 'on_hold');

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'team_leader',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    status team_status NOT NULL DEFAULT 'active',
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Team Memberships table
CREATE TABLE IF NOT EXISTS public.team_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(team_id, user_id)
);

-- 5. Form Configs table
CREATE TABLE IF NOT EXISTS public.form_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    welcome_message TEXT,
    submit_button_text TEXT DEFAULT 'Submit Volunteer Application',
    success_message TEXT DEFAULT 'Thank you for your interest in joining MAQAM-E-JOUD Foundation.',
    slug TEXT NOT NULL UNIQUE,
    status form_status NOT NULL DEFAULT 'draft',
    published_version INTEGER NOT NULL DEFAULT 0,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Form Versions table (immutable snapshots)
CREATE TABLE IF NOT EXISTS public.form_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_config_id UUID NOT NULL REFERENCES public.form_configs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    schema_json JSONB NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(form_config_id, version_number)
);

-- 7. Applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number TEXT NOT NULL UNIQUE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    form_version_id UUID REFERENCES public.form_versions(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    status application_status NOT NULL DEFAULT 'new',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. Application Answers table
CREATE TABLE IF NOT EXISTS public.application_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL,
    answer_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 9. Application Notes table
CREATE TABLE IF NOT EXISTS public.application_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. Application Status History table
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    old_status application_status NOT NULL,
    new_status application_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. Activity Logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ====================================================================
-- Indexes for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_form_configs_slug ON public.form_configs(slug);
CREATE INDEX IF NOT EXISTS idx_applications_team ON public.applications(team_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted ON public.applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_memberships_user ON public.team_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_team_leader_for(t_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_memberships
    WHERE user_id = auth.uid() AND team_id = t_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view own profile; Admins can view and create all
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view and manage all profiles" ON public.profiles
    FOR ALL USING (is_admin());

-- Teams: Public can view active teams; Leaders can view assigned teams; Admins can do all
CREATE POLICY "Public can view active teams" ON public.teams
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage teams" ON public.teams
    FOR ALL USING (is_admin());

-- Form Configs: Public can read published configs
CREATE POLICY "Public can read published form configs" ON public.form_configs
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage form configs" ON public.form_configs
    FOR ALL USING (is_admin());

-- Applications: Admins see all; Leaders see their team; Public can insert through RPC/Edge fn
CREATE POLICY "Admins full access to applications" ON public.applications
    FOR ALL USING (is_admin());

CREATE POLICY "Leaders view and edit their team applications" ON public.applications
    FOR SELECT USING (is_team_leader_for(team_id));

CREATE POLICY "Leaders update status on their team applications" ON public.applications
    FOR UPDATE USING (is_team_leader_for(team_id))
    WITH CHECK (is_team_leader_for(team_id));

-- Application Notes: Visible to admins and team leader of that application
CREATE POLICY "Admins access all notes" ON public.application_notes
    FOR ALL USING (is_admin());

CREATE POLICY "Leaders access team notes" ON public.application_notes
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.team_memberships tm ON tm.team_id = a.team_id
        WHERE a.id = application_notes.application_id AND tm.user_id = auth.uid()
      )
    );
