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
          message: `Database error: ${error.message}.`,
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
      const [teamsRes, configsRes, appsRes] = await Promise.allSettled([
        client.from('teams').select('*'),
        client.from('form_configs').select('*'),
        client.from('applications').select('*').order('submitted_at', { ascending: false }),
      ]);

      let hasChanges = false;

      // Hydrate Teams (preserving local leader assignment metadata)
      if (teamsRes.status === 'fulfilled' && !teamsRes.value.error && teamsRes.value.data) {
        const currentTeams: any[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
        const localMap = new Map<string, any>(currentTeams.map((t) => [t.id, t]));
        const mergedTeams = teamsRes.value.data.map((t: any) => {
          const local = localMap.get(t.id);
          return {
            ...t,
            leader_id: local?.leader_id,
            leader_name: local?.leader_name,
            leader_email: local?.leader_email,
          };
        });
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(mergedTeams));
        hasChanges = true;
      }

      // Hydrate Form Configs
      if (configsRes.status === 'fulfilled' && !configsRes.value.error && configsRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.FORM_CONFIGS, JSON.stringify(configsRes.value.data));
        hasChanges = true;
      }

      // Hydrate Applications
      if (appsRes.status === 'fulfilled' && !appsRes.value.error && appsRes.value.data) {
        const currentApps: any[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
        const localAppMap = new Map<string, any>(currentApps.map((a) => [a.id, a]));
        const mergedApps = appsRes.value.data.map((a: any) => {
          const local = localAppMap.get(a.id);
          return {
            ...a,
            answers: local?.answers || {},
            notes_count: local?.notes_count || 0,
          };
        });
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(mergedApps));
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

  async pushAllLocalToCloud(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const teams: Team[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
      for (const t of teams) {
        await this.pushTeam(t);
      }
    } catch (err) {
      console.error('Failed pushing local to cloud:', err);
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

  // Push single team mutation to Supabase in background
  async pushTeam(team: Team, formConfig?: FormConfig): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const cleanTeam = {
        id: team.id,
        name: team.name,
        description: team.description || '',
        slug: team.slug,
        status: team.status || 'active',
        logo_url: team.logo_url || null,
        created_at: team.created_at || new Date().toISOString(),
        updated_at: team.updated_at || new Date().toISOString(),
      };
      const { error: tErr } = await client.from('teams').upsert(cleanTeam, { onConflict: 'id' });
      if (tErr) {
        console.error('Cloud team upsert error:', tErr);
      } else {
        console.log('Successfully posted team to Supabase:', team.name);
      }

      if (formConfig) {
        const cleanConfig = {
          id: formConfig.id,
          team_id: formConfig.team_id,
          title: formConfig.title,
          description: formConfig.description || '',
          welcome_message: formConfig.welcome_message || '',
          submit_button_text: formConfig.submit_button_text || 'Submit Volunteer Application',
          success_message:
            formConfig.success_message ||
            'Thank you for your interest in joining MAQAM-E-JOUD Foundation.',
          slug: formConfig.slug,
          status: formConfig.status || 'published',
          published_version: formConfig.published_version || 1,
          fields: formConfig.fields || [],
          created_at: formConfig.created_at || new Date().toISOString(),
          updated_at: formConfig.updated_at || new Date().toISOString(),
        };
        const { error: cErr } = await client
          .from('form_configs')
          .upsert(cleanConfig, { onConflict: 'id' });
        if (cErr) console.error('Cloud form config upsert error:', cErr);
      }
    } catch (err) {
      console.error('Cloud team push failed:', err);
    }
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const allowedKeys = ['name', 'description', 'slug', 'status', 'logo_url'];
      const cleanUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      allowedKeys.forEach((k) => {
        if ((updates as any)[k] !== undefined) {
          cleanUpdates[k] = (updates as any)[k];
        }
      });
      const { error } = await client.from('teams').update(cleanUpdates).eq('id', id);
      if (error) console.error('Cloud team update error:', error);
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
      const cleanConfig = {
        id: config.id,
        team_id: config.team_id,
        title: config.title,
        description: config.description || '',
        welcome_message: config.welcome_message || '',
        submit_button_text: config.submit_button_text || 'Submit Volunteer Application',
        success_message:
          config.success_message ||
          'Thank you for your interest in joining MAQAM-E-JOUD Foundation.',
        slug: config.slug,
        status: config.status || 'published',
        published_version: config.published_version || 1,
        fields: config.fields || [],
        created_at: config.created_at || new Date().toISOString(),
        updated_at: config.updated_at || new Date().toISOString(),
      };
      const { error } = await client
        .from('form_configs')
        .upsert(cleanConfig, { onConflict: 'id' });
      if (error) console.error('Cloud form config push error:', error);
    } catch (err) {
      console.error('Cloud form config push failed:', err);
    }
  },

  async pushApplication(app: Application): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const cleanApp = {
        id: app.id,
        reference_number: app.reference_number,
        team_id: app.team_id,
        form_version_id: app.form_version_id || null,
        full_name: app.full_name,
        phone: app.phone,
        email: app.email,
        status: app.status || 'new',
        submitted_at: app.submitted_at || new Date().toISOString(),
        created_at: app.created_at || new Date().toISOString(),
      };
      const { error: aErr } = await client.from('applications').insert(cleanApp);
      if (aErr) {
        console.error('Cloud application insert error:', aErr);
      } else {
        console.log('Successfully posted application to Supabase:', app.reference_number);
      }
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
    } catch (err) {
      console.error('Cloud application status update failed:', err);
    }
  },

  async deleteApplication(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      await client.from('applications').delete().eq('id', id);
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
