import { getSupabaseClient, isSupabaseActive } from './supabase';
import { generateUUID, isValidUUID } from './uuid';
import {
  Team,
  TeamMembership,
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
      const [teamsRes, configsRes, appsRes, answersRes, usersRes, logsRes] = await Promise.allSettled([
        client.from('teams').select('*'),
        client.from('form_configs').select('*'),
        client.from('applications').select('*').order('submitted_at', { ascending: false }),
        client.from('application_answers').select('*'),
        client.from('users').select('*'),
        client.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      let hasChanges = false;

      // 1. Hydrate Users and Passwords
      if (usersRes.status === 'fulfilled' && !usersRes.value.error && usersRes.value.data) {
        const cloudUsers: UserProfile[] = usersRes.value.data.map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          phone: u.phone || undefined,
          created_at: u.created_at,
        }));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cloudUsers));

        const passwords: Record<string, string> = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}'
        );
        usersRes.value.data.forEach((u: any) => {
          if (u.password) {
            passwords[u.email.toLowerCase().trim()] = u.password;
          }
        });
        localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
        hasChanges = true;
      }

      // Map team names for fast lookup
      const teamsList = teamsRes.status === 'fulfilled' && !teamsRes.value.error && teamsRes.value.data ? teamsRes.value.data : [];
      const teamNameMap = new Map<string, string>(teamsList.map((t: any) => [t.id, t.name]));

      // 2. Hydrate Teams and Leader Assignments
      if (teamsRes.status === 'fulfilled' && !teamsRes.value.error && teamsRes.value.data) {
        const currentTeams: any[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
        const localMap = new Map<string, any>(currentTeams.map((t) => [t.id, t]));

        const derivedMemberships: TeamMembership[] = [];

        const mergedTeams = teamsRes.value.data.map((t: any) => {
          const local = localMap.get(t.id);
          let cleanDesc = t.description || '';
          let leader_id = t.leader_id || local?.leader_id || undefined;
          let leader_name = t.leader_name || local?.leader_name || undefined;
          let leader_email = t.leader_email || local?.leader_email || undefined;

          // Check for embedded leader metadata in description
          const match = cleanDesc.match(/<!--__LEADER__:(.*?)-->/);
          if (match) {
            try {
              const meta = JSON.parse(match[1]);
              if (meta.leader_id) leader_id = meta.leader_id;
              if (meta.leader_name) leader_name = meta.leader_name;
              if (meta.leader_email) leader_email = meta.leader_email;
              cleanDesc = cleanDesc.replace(/<!--__LEADER__:(.*?)-->/, '').trim();
            } catch (e) {}
          }

          if (leader_id) {
            derivedMemberships.push({
              id: `mem_${t.id}_${leader_id}`,
              team_id: t.id,
              user_id: leader_id,
              created_at: t.created_at,
            });
          }

          return {
            ...t,
            description: cleanDesc,
            leader_id,
            leader_name,
            leader_email,
          };
        });

        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(mergedTeams));
        localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(derivedMemberships));
        hasChanges = true;
      }

      // 3. Hydrate Form Configs
      if (configsRes.status === 'fulfilled' && !configsRes.value.error && configsRes.value.data) {
        localStorage.setItem(STORAGE_KEYS.FORM_CONFIGS, JSON.stringify(configsRes.value.data));
        hasChanges = true;
      }

      // 4. Hydrate Applications, Answers, and Notes
      const answersList = answersRes.status === 'fulfilled' && !answersRes.value.error && answersRes.value.data ? answersRes.value.data : [];
      const answersByAppId = new Map<string, Record<string, any>>();
      const cloudNotes: ApplicationNote[] = [];

      answersList.forEach((ans: any) => {
        if (ans.field_key === '__note__' && ans.answer_json) {
          cloudNotes.push({
            id: ans.id,
            application_id: ans.application_id,
            user_id: ans.answer_json.user_id || 'admin',
            author_name: ans.answer_json.author_name || 'Admin',
            note: ans.answer_json.note || '',
            created_at: ans.created_at || ans.answer_json.created_at,
          });
        } else {
          if (!answersByAppId.has(ans.application_id)) {
            answersByAppId.set(ans.application_id, {});
          }
          answersByAppId.get(ans.application_id)![ans.field_key] = ans.answer_json;
        }
      });

      if (cloudNotes.length > 0) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(cloudNotes));
        hasChanges = true;
      }

      if (appsRes.status === 'fulfilled' && !appsRes.value.error && appsRes.value.data) {
        const currentApps: any[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
        const localAppMap = new Map<string, any>(currentApps.map((a) => [a.id, a]));
        const mergedApps = appsRes.value.data.map((a: any) => {
          const local = localAppMap.get(a.id);
          const cloudAnswers = answersByAppId.get(a.id);
          const appNotesCount = cloudNotes.filter((n) => n.application_id === a.id).length;
          return {
            ...a,
            team_name: teamNameMap.get(a.team_id) || local?.team_name || 'Recruitment Team',
            answers: cloudAnswers && Object.keys(cloudAnswers).length > 0 ? cloudAnswers : (local?.answers || {}),
            notes_count: appNotesCount > 0 ? appNotesCount : (local?.notes_count || 0),
          };
        });
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(mergedApps));
        hasChanges = true;
      }

      // 5. Hydrate Activity Logs
      if (logsRes.status === 'fulfilled' && !logsRes.value.error && logsRes.value.data) {
        const currentLogs = logsRes.value.data.map((l: any) => ({
          ...l,
          user_name: l.metadata?.user_name || l.user_name || 'User',
          team_name: l.metadata?.team_name || l.team_name,
        }));
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(currentLogs));
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
      const users: UserProfile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const passwords: Record<string, string> = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
      for (const u of users) {
        await this.pushUser(u, passwords[u.email.toLowerCase().trim()] || 'leader123');
      }

      const teams: Team[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
      for (const t of teams) {
        await this.pushTeam(t);
      }

      const apps: Application[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
      for (const a of apps) {
        await this.pushApplication(a);
      }
    } catch (err) {
      console.error('Failed pushing local to cloud:', err);
    }
  },

  // Start Realtime subscription and cross-tab event listeners across all relevant tables
  startRealtimeListener(): void {
    const client = getSupabaseClient();
    if (!client) return;

    if (!realtimeSubscription) {
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
    }

    // Auto-sync on window focus & visibility change across Chrome tabs
    if (typeof window !== 'undefined' && !(window as any).__mj_sync_listeners_attached) {
      (window as any).__mj_sync_listeners_attached = true;

      window.addEventListener('focus', () => {
        this.pullAllFromCloud();
      });

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.pullAllFromCloud();
        }
      });

      // Heartbeat sync every 10 seconds across active tabs
      setInterval(() => {
        this.pullAllFromCloud();
      }, 10000);
    }
  },

  // Push single team mutation to Supabase in background
  async pushTeam(team: Team, formConfig?: FormConfig): Promise<{ success: boolean; error?: any }> {
    const client = getSupabaseClient();
    if (!client) return { success: true };

    try {
      let descWithMeta = (team.description || '').replace(/<!--__LEADER__:(.*?)-->/g, '').trim();
      if (team.leader_id) {
        const leaderMeta = {
          leader_id: team.leader_id,
          leader_name: team.leader_name || '',
          leader_email: team.leader_email || '',
        };
        descWithMeta += `\n<!--__LEADER__:${JSON.stringify(leaderMeta)}-->`;
      }

      const cleanTeam = {
        id: isValidUUID(team.id) ? team.id : generateUUID(),
        name: team.name,
        description: descWithMeta,
        slug: team.slug,
        status: team.status || 'active',
        logo_url: team.logo_url || null,
        created_at: team.created_at || new Date().toISOString(),
        updated_at: team.updated_at || new Date().toISOString(),
      };
      const { error: tErr } = await client.from('teams').upsert(cleanTeam, { onConflict: 'id' });
      if (tErr) {
        console.error('Cloud team upsert error:', tErr);
        return { success: false, error: tErr };
      } else {
        console.log('Successfully posted team to Supabase:', team.name);
      }

      if (formConfig) {
        const cleanConfig = {
          id: isValidUUID(formConfig.id) ? formConfig.id : generateUUID(),
          team_id: cleanTeam.id,
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
      return { success: true };
    } catch (err) {
      console.error('Cloud team push failed:', err);
      return { success: false, error: err };
    }
  },

  async updateTeam(id: string, updates: Partial<Team>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const currentTeams: Team[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS) || '[]');
      const currentTeam = currentTeams.find((t) => t.id === id);

      const leader_id = updates.leader_id !== undefined ? updates.leader_id : currentTeam?.leader_id;
      const leader_name = updates.leader_name !== undefined ? updates.leader_name : currentTeam?.leader_name;
      const leader_email = updates.leader_email !== undefined ? updates.leader_email : currentTeam?.leader_email;

      let rawDesc = (updates.description !== undefined ? updates.description : currentTeam?.description) || '';
      rawDesc = rawDesc.replace(/<!--__LEADER__:(.*?)-->/g, '').trim();

      if (leader_id) {
        const leaderMeta = {
          leader_id,
          leader_name: leader_name || '',
          leader_email: leader_email || '',
        };
        rawDesc += `\n<!--__LEADER__:${JSON.stringify(leaderMeta)}-->`;
      }

      const cleanUpdates: Record<string, any> = {
        description: rawDesc,
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) cleanUpdates.name = updates.name;
      if (updates.slug !== undefined) cleanUpdates.slug = updates.slug;
      if (updates.status !== undefined) cleanUpdates.status = updates.status;
      if (updates.logo_url !== undefined) cleanUpdates.logo_url = updates.logo_url;

      const { error } = await client.from('teams').update(cleanUpdates).eq('id', id);
      if (error) {
        console.error('Cloud team update error:', error);
      } else {
        console.log('Successfully updated team in Supabase with leader info:', id);
      }
    } catch (err) {
      console.error('Cloud team update failed:', err);
    }
  },

  async deleteTeam(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { data: teamApps } = await client.from('applications').select('id').eq('team_id', id);
      if (teamApps && teamApps.length > 0) {
        const appIds = teamApps.map((a: any) => a.id);
        await client.from('application_answers').delete().in('application_id', appIds);
        await client.from('application_notes').delete().in('application_id', appIds);
        await client.from('applications').delete().eq('team_id', id);
      }
      await client.from('form_configs').delete().eq('team_id', id);
      await client.from('teams').delete().eq('id', id);
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

  async pushApplication(app: Application): Promise<{ success: boolean; error?: any }> {
    const client = getSupabaseClient();
    if (!client) return { success: true };

    try {
      const cleanApp = {
        id: isValidUUID(app.id) ? app.id : generateUUID(),
        reference_number: app.reference_number,
        team_id: app.team_id,
        form_version_id: isValidUUID(app.form_version_id || '') ? app.form_version_id : null,
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
        return { success: false, error: aErr };
      } else {
        console.log('Successfully posted application to Supabase:', app.reference_number);
      }

      // Save application answers in Supabase application_answers table
      if (app.answers && typeof app.answers === 'object') {
        const answersEntries = Object.entries(app.answers)
          .filter(([_, val]) => val !== undefined && val !== null && val !== '')
          .map(([key, val]) => ({
            id: generateUUID(),
            application_id: cleanApp.id,
            field_key: key,
            field_label: key,
            field_type: 'short_text',
            answer_json: val,
            created_at: new Date().toISOString(),
          }));

        if (answersEntries.length > 0) {
          const { error: ansErr } = await client.from('application_answers').insert(answersEntries);
          if (ansErr) console.error('Cloud application_answers insert error:', ansErr);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Cloud application push failed:', err);
      return { success: false, error: err };
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
      await client.from('application_answers').delete().eq('application_id', id);
      await client.from('application_notes').delete().eq('application_id', id);
      await client.from('applications').delete().eq('id', id);
    } catch (err) {
      console.error('Cloud application delete failed:', err);
    }
  },

  async pushNote(note: ApplicationNote): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      // Store note entry in application_answers so it syncs reliably across devices without profile foreign key barriers
      const noteEntry = {
        id: isValidUUID(note.id) ? note.id : generateUUID(),
        application_id: note.application_id,
        field_key: '__note__',
        field_label: 'Internal Evaluation Note',
        field_type: 'note',
        answer_json: {
          id: note.id,
          user_id: note.user_id,
          author_name: note.author_name,
          note: note.note,
          created_at: note.created_at,
        },
        created_at: note.created_at || new Date().toISOString(),
      };
      await client.from('application_answers').insert(noteEntry);
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
        { onConflict: 'email' }
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
      const cleanLog = {
        id: isValidUUID(activity.id) ? activity.id : generateUUID(),
        team_id: isValidUUID(activity.team_id || '') ? activity.team_id : null,
        user_id: isValidUUID(activity.user_id || '') ? activity.user_id : null,
        action: activity.action,
        entity_type: activity.entity_type,
        entity_id: isValidUUID(activity.entity_id || '') ? activity.entity_id : null,
        metadata: {
          ...activity.metadata,
          user_name: activity.user_name,
          team_name: activity.team_name,
        },
        created_at: activity.created_at || new Date().toISOString(),
      };
      await client.from('activity_logs').insert(cleanLog);
    } catch (err) {
      console.error('Cloud activity push failed:', err);
    }
  },
};
