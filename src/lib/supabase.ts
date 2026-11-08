import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export function getSupabaseCredentials(): { url: string; key: string; source: 'env' | 'local' | 'none' } {
  if (
    envUrl &&
    envUrl !== 'https://your-project.supabase.co' &&
    !envUrl.includes('your-project') &&
    envKey &&
    envKey !== 'your-anon-key-here'
  ) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  if (typeof window !== 'undefined') {
    const localUrl = (localStorage.getItem('mj_supabase_url') || '').trim();
    const localKey = (localStorage.getItem('mj_supabase_anon_key') || '').trim();
    if (localUrl && localKey && localUrl.startsWith('https://')) {
      return { url: localUrl, key: localKey, source: 'local' };
    }
  }

  return { url: '', key: '', source: 'none' };
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export function isSupabaseActive(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('https://'));
}

export function saveLocalSupabaseCredentials(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mj_supabase_url', url.trim());
    localStorage.setItem('mj_supabase_anon_key', key.trim());
    cachedClient = null;
    lastUrl = '';
    lastKey = '';
  }
}

export function clearLocalSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mj_supabase_url');
    localStorage.removeItem('mj_supabase_anon_key');
    cachedClient = null;
    lastUrl = '';
    lastKey = '';
  }
}

// Backward-compatible exports
export const isSupabaseConfigured = isSupabaseActive();
export const supabase = getSupabaseClient();
