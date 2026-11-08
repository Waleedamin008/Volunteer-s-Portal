import { getSupabaseClient, isSupabaseActive } from './supabase';
import {
  Team,
  FormConfig,
  Application,
  ApplicationNote,
  ApplicationStatusHistory,
  UserProfile,
  ActivityLog,
  ApplicationStatus,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'mj_users_prod_v2',
  TEAMS: 'mj_teams_prod_v2',
  MEMBERSHIPS: 'mj_memberships_prod_v2',
  FORM_CONFIGS: 'mj_form_configs_prod_v2',
  FORM_VERSIONS: 'mj_form_versions_prod_v2',
  APPLICATIONS: 'mj_applications_prod_v2',
  NOTES: 'mj_notes_prod_v2',
  HISTORY: 'mj_history_prod_v2',
  ACTIVITY: 'mj_activity_prod_v2',
  PASSWORDS: 'mj_passwords_prod_v2',
};

let realtimeSubscription: any = null;
let isSyncing = false;

export const CloudSyncService = {
  // Test connection to Supabase
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }

    try {
      const { data, error } = await client.from('teams').select('id').limit(1);
      if (error) {
        return {
          success: false,
          message: `Database error: ${error.message}. Please make sure you have executed supabase/schema.sql in your Supabase SQL Editor.`,
        };
      }
      return { success: true, message: 'Successfully connected to Supabase cloud database!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Connection failed' };
    }
  },

  // Pull all cloud records and update local storage cache
  async pullAllFromCloud(): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || isSyncing) return false;

    isSyncing = true;
    try {
      const [
        teamsRes,
        configsRes,
        appsRes,
        notesRes,
        historyRes,
        usersRes,
        activityRes,
      ] = await Promise.allSettled([
        client.from('teams').select('*'),
        client.from('form_configs').select('*'),
        client.from('applications').select('*').order('submitted_at', { ascending: false }),
        client.from('application_notes').select('*'),
        client.from('application_status_history').select('*'),
        client.from('users').select('*'),
        client.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      let hasChanges = false;

      // Hydrate Teams
      if (teamsRes.status === 'fulfilled' && !teamsRes.value.error && teamsRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teamsRes.value.data));
        hasChanges = true;
      }

      // Hydrate Form Configs
      if (configsRes.status === 'fulfilled' && !configsRes.value.error && configsRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.FORM_CONFIGS, JSON.stringify(configsRes.value.data));
        hasChanges = true;
      }

      // Hydrate Applications
      if (appsRes.status === 'fulfilled' && !appsRes.value.error && appsRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(appsRes.value.data));
        hasChanges = true;
      }

      // Hydrate Notes
      if (notesRes.status === 'fulfilled' && !notesRes.value.error && notesRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notesRes.value.data));
        hasChanges = true;
      }

      // Hydrate Status History
      if (historyRes.status === 'fulfilled' && !historyRes.value.error && historyRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyRes.value.data));
        hasChanges = true;
      }

      // Hydrate Users & Passwords
      if (usersRes.status === 'fulfilled' && !usersRes.value.error && usersRes.value.data) {
        const usersData = usersRes.value.data;
        const profiles: UserProfile[] = usersData.map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          phone: u.phone,
          created_at: u.created_at,
        }));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(profiles));

        // Build password lookup
        const passwords: Record<string, string> = {};
        usersData.forEach((u: any) => {
          if (u.email && u.password) {
            passwords[u.email.toLowerCase().trim()] = u.password;
          }
        });
        localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
        hasChanges = true;
      }

      // Hydrate Activity Logs
      if (activityRes.status === 'fulfilled' && !activityRes.value.error && activityRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activityRes.value.data));
        hasChanges = true;
      }

      if (hasChanges && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mj_data_synced', { detail: { source: 'cloud' } }));
      }

      return true;
    } catch (err) {
      console.error('Cloud pull failed:', err);
      return false;
    } finally {
      isSyncing = false;
    }
  },

  // Push local records to Supabase (e.g. migration of data created offline/locally)
  async pushAllLocalToCloud(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const teams = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
      const configs = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORM_CONFIGS) || '[]');
      const apps = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
      const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');

      if (teams.length > 0) {
        await client.from('teams').upsert(teams, { onConflict: 'id' });
      }
      if (configs.length > 0) {
        await client.from('form_configs').upsert(configs, { onConflict: 'id' });
      }
      if (apps.length > 0) {
        await client.from('applications').upsert(apps, { onConflict: 'id' });
      }
      if (notes.length > 0) {
        await client.from('application_notes').upsert(notes, { onConflict: 'id' });
      }

      if (users.length > 0) {
        const usersToUpsert = users.map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          phone: u.phone || '',
          password: passwords[u.email.toLowerCase().trim()] || 'admin123',
          created_at: u.created_at || new Date().toISOString(),
        }));
        await client.from('users').upsert(usersToUpsert, { onConflict: 'id' });
      }
    } catch (err) {
      console.error('Failed pushing local cache to cloud:', err);
    }
  },

  // Start Realtime subscription across all relevant tables
  startRealtimeListener(): void {
    const client = getSupabaseClient();
    if (!client || realtimeSubscription) return;

    try {
      realtimeSubscription = client
        .channel('portal-sync-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            console.log('Realtime cloud change received:', payload.table, payload.eventType);
            this.pullAllFromCloud();
          }
        )
        .subscribe();
    } catch (err) {
      console.error('Failed to initialize Realtime listener:', err);
    }
  },

  // Push single mutations to Supabase in background
  async pushTeam(team: Team, formConfig?: FormConfig): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('teams').upsert(team, { onConflict: 'id' });
      if (formConfig) {
        await client.from('form_configs').upsert(formConfig, { onConflict: 'id' });
      }
    } catch (err) {
      console.error('Cloud team push failed:', err);
    }
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('teams').update(updates).eq('id', id);
    } catch (err) {
      console.error('Cloud team update failed:', err);
    }
  },

  async deleteTeam(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('teams').delete().eq('id', id);
      await client.from('form_configs').delete().eq('team_id', id);
    } catch (err) {
      console.error('Cloud team delete failed:', err);
    }
  },

  async pushFormConfig(config: FormConfig): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('form_configs').upsert(config, { onConflict: 'id' });
    } catch (err) {
      console.error('Cloud form config push failed:', err);
    }
  },

  async pushApplication(app: Application): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('applications').insert(app);
    } catch (err) {
      console.error('Cloud application push failed:', err);
    }
  },

  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    oldStatus: ApplicationStatus,
    changedByName: string
  ): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('applications').update({ status }).eq('id', id);
      await client.from('application_status_history').insert({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        application_id: id,
        old_status: oldStatus,
        new_status: status,
        changed_by_name: changedByName,
        changed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Cloud application status update failed:', err);
    }
  },

  async deleteApplication(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('applications').delete().eq('id', id);
      await client.from('application_notes').delete().eq('application_id', id);
      await client.from('application_status_history').delete().eq('application_id', id);
    } catch (err) {
      console.error('Cloud application delete failed:', err);
    }
  },

  async pushNote(note: ApplicationNote): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('application_notes').insert(note);
    } catch (err) {
      console.error('Cloud note push failed:', err);
    }
  },

  async pushUser(user: UserProfile, password = 'password123'): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('users').upsert(
        {
          id: user.id,
          email: user.email.toLowerCase().trim(),
          full_name: user.full_name,
          role: user.role,
          phone: user.phone || '',
          password,
          created_at: user.created_at,
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.error('Cloud user push failed:', err);
    }
  },

  async updateUserPassword(email: string, newPassword: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client
        .from('users')
        .update({ password: newPassword })
        .eq('email', email.toLowerCase().trim());
    } catch (err) {
      console.error('Cloud password update failed:', err);
    }
  },

  async deleteUser(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('users').delete().eq('id', id);
    } catch (err) {
      console.error('Cloud user delete failed:', err);
    }
  },

  async pushActivity(activity: ActivityLog): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('activity_logs').insert(activity);
    } catch (err) {
      console.error('Cloud activity push failed:', err);
    }
  },
};
