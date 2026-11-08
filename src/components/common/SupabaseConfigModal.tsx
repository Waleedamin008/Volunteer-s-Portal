import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveLocalSupabaseCredentials,
  clearLocalSupabaseCredentials,
  isSupabaseActive,
} from '../../lib/supabase';
import { CloudSyncService } from '../../lib/cloudSync';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<{
    tested: boolean;
    success?: boolean;
    message?: string;
  }>({ tested: false });
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setKey(creds.key);
      setStatus({ tested: false });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const creds = getSupabaseCredentials();
  const isActive = isSupabaseActive();

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ tested: false });

    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();

    if (!trimmedUrl || !trimmedKey) {
      setStatus({
        tested: true,
        success: false,
        message: 'Please provide both Supabase Project URL and Anon Public Key.',
      });
      setIsLoading(false);
      return;
    }

    if (!trimmedUrl.startsWith('https://')) {
      setStatus({
        tested: true,
        success: false,
        message: 'Project URL must begin with https:// (e.g. https://your-ref.supabase.co)',
      });
      setIsLoading(false);
      return;
    }

    // Save locally
    saveLocalSupabaseCredentials(trimmedUrl, trimmedKey);

    // Test connection
    const result = await CloudSyncService.testConnection();
    if (result.success) {
      // Push any existing local data (teams, forms, users) to the cloud
      await CloudSyncService.pushAllLocalToCloud();
      // Pull all cloud data
      await CloudSyncService.pullAllFromCloud();
      CloudSyncService.startRealtimeListener();

      setStatus({
        tested: true,
        success: true,
        message: 'Connected to Supabase! All teams and applications are now syncing in real-time across devices.',
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setStatus({
        tested: true,
        success: false,
        message: result.message,
      });
    }
    setIsLoading(false);
  };

  const handleDisconnect = () => {
    clearLocalSupabaseCredentials();
    setUrl('');
    setKey('');
    setStatus({
      tested: true,
      success: false,
      message: 'Cloud database disconnected. System reverted to browser offline storage.',
    });
  };

  const handleCopySql = () => {
    const sql = `-- Run this in Supabase SQL Editor:
-- (Supabase Dashboard -> Your Project -> SQL Editor -> New Query -> Run)

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

CREATE TABLE IF NOT EXISTS public.application_notes (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.application_status_history (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by_name TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'team_leader',
    phone TEXT,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.team_memberships (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

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

INSERT INTO public.users (id, email, full_name, role, password, created_at)
VALUES ('user_admin_01', 'admin@maqamejoud.org', 'Foundation Administrator', 'admin', 'admin123', now())
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for form_configs" ON public.form_configs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for application_notes" ON public.application_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for application_status_history" ON public.application_status_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for team_memberships" ON public.team_memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-warmIvory/60 flex items-center justify-center text-brand-navy border border-brand-gold/30">
              <Database className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-navy">Supabase Cloud Database</h3>
              <p className="text-xs text-brand-mutedGray">
                Centralized real-time sync across all browsers, mobile devices, and leaders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status Banner */}
        <div className="mt-4">
          {isActive ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-emerald-900">Supabase Cloud Database Active</p>
                <p className="text-emerald-700 mt-0.5 font-mono text-[11px] truncate">
                  {creds.url}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">
                  Source: {creds.source === 'env' ? 'Environment Variables (Vercel / .env)' : 'Browser Local Config'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900">Offline / Local Browser Storage Mode</p>
                <p className="text-amber-700 mt-0.5 leading-relaxed">
                  Your data is currently only saved inside this single browser session. Enter your Supabase credentials below to connect cloud storage so applications and teams sync across all devices and Chrome profiles!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleTestAndSave} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-brand-navy mb-1">
              Supabase Project URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzprojectid.supabase.co"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-navy mb-1">
              Supabase Anon Public API Key <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold font-mono"
              required
            />
            <p className="text-[10px] text-brand-mutedGray mt-1">
              Find this in your Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API keys (anon public)
            </p>
          </div>

          {status.tested && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                status.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {status.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{status.message}</div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-2">
            {isActive && creds.source === 'local' && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Connect & Sync Cloud</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Step-by-step Setup Guide */}
        <div className="mt-5 pt-4 border-t border-gray-100 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-brand-navy flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              Step 1: Database Setup (1-Click SQL)
            </span>
            <button
              onClick={handleCopySql}
              className="px-2.5 py-1 text-[11px] font-semibold text-brand-navy bg-brand-warmIvory/60 hover:bg-brand-warmIvory rounded-lg border border-brand-gold/40 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>SQL Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-brand-gold" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-brand-mutedGray leading-relaxed">
            Open your Supabase project's <strong>SQL Editor</strong>, paste the copied script, and click <strong>Run</strong>. This creates all 8 tables and enables Realtime sync.
          </p>

          <div className="pt-2 border-t border-gray-100">
            <span className="font-bold text-brand-navy block mb-1">
              Step 2: Add to Vercel (For Permanent Cloud Hosting)
            </span>
            <p className="text-[11px] text-brand-mutedGray leading-relaxed">
              In your Vercel Dashboard &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>, add:
            </p>
            <div className="mt-1.5 p-2 rounded-lg bg-gray-50 border border-gray-200 font-mono text-[10px] text-brand-navy space-y-0.5">
              <div>VITE_SUPABASE_URL = {url || 'https://xyz.supabase.co'}</div>
              <div>VITE_SUPABASE_ANON_KEY = {key ? key.substring(0, 20) + '...' : 'your-anon-key'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

