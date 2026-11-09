import {
  Team,
  UserProfile,
  TeamMembership,
  FormConfig,
  FormVersion,
  Application,
  ApplicationAnswer,
  ApplicationNote,
  ApplicationStatusHistory,
  ActivityLog,
  ApplicationStatus,
  FormField,
} from '../types';
import { DEFAULT_FORM_FIELDS } from './constants';
import { CloudSyncService } from './cloudSync';
import { generateUUID, isValidUUID } from './uuid';

const STORAGE_KEYS = {
  TEAMS: 'mj_teams_prod_v2',
  USERS: 'mj_users_prod_v2',
  MEMBERSHIPS: 'mj_memberships_prod_v2',
  FORM_CONFIGS: 'mj_form_configs_prod_v2',
  FORM_VERSIONS: 'mj_form_versions_prod_v2',
  APPLICATIONS: 'mj_applications_prod_v2',
  ANSWERS: 'mj_answers_prod_v2',
  NOTES: 'mj_notes_prod_v2',
  HISTORY: 'mj_history_prod_v2',
  ACTIVITY: 'mj_activity_prod_v2',
  CURRENT_USER: 'mj_current_user_session_v3',
  PASSWORDS: 'mj_passwords_prod_v2',
};

// Automatic purge of legacy demo/temp data and stale auto-login sessions
if (typeof window !== 'undefined' && !localStorage.getItem('mj_clean_prod_initialized_v3')) {
  const legacyKeys = [
    'mj_teams_v1',
    'mj_users_v1',
    'mj_memberships_v1',
    'mj_form_configs_v1',
    'mj_form_versions_v1',
    'mj_applications_v1',
    'mj_answers_v1',
    'mj_notes_v1',
    'mj_history_v1',
    'mj_activity_v1',
    'mj_current_user_v1',
    'mj_current_user_id',
    'mj_current_user_prod_v2',
    'mj_session_user_v2',
  ];
  legacyKeys.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem('mj_clean_prod_initialized_v3', 'true');
}

// Only keep the official Admin login
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_admin_01',
    email: 'admin@maqamejoud.org',
    full_name: 'Foundation Administrator',
    role: 'admin',
    phone: '',
    created_at: new Date().toISOString(),
  },
];

// Clean initial empty state ready for production use
const INITIAL_TEAMS: Team[] = [];
const INITIAL_MEMBERSHIPS: TeamMembership[] = [];
const INITIAL_FORM_CONFIGS: FormConfig[] = [];
const INITIAL_FORM_VERSIONS: FormVersion[] = [];
const INITIAL_APPLICATIONS: Application[] = [];
const INITIAL_NOTES: ApplicationNote[] = [];
const INITIAL_HISTORY: ApplicationStatusHistory[] = [];
const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: 'act_init_1',
    user_name: 'Foundation Administrator',
    action: 'System Initialized for Production',
    entity_type: 'system',
    created_at: new Date().toISOString(),
    metadata: { note: 'Portal ready for team creation and recruitment' },
  },
];

const INITIAL_PASSWORDS: Record<string, string> = {
  'admin@maqamejoud.org': 'admin123',
};

// Helper to safely read and write JSON to localStorage
function getStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(val) as T;
  } catch (e) {
    console.error('Storage read error', key, e);
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error', key, e);
  }
}

export const StorageService = {
  // Clear and reset to clean production state (only admin)
  resetToCleanState(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(INITIAL_MEMBERSHIPS));
    localStorage.setItem(STORAGE_KEYS.FORM_CONFIGS, JSON.stringify(INITIAL_FORM_CONFIGS));
    localStorage.setItem(STORAGE_KEYS.FORM_VERSIONS, JSON.stringify(INITIAL_FORM_VERSIONS));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(INITIAL_HISTORY));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY));
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(INITIAL_PASSWORDS));
  },

  // Users & Authentication
  getUsers(): UserProfile[] {
    return getStored<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  getUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  verifyPassword(email: string, passwordAttempt: string): boolean {
    const passwords = getStored<Record<string, string>>(STORAGE_KEYS.PASSWORDS, INITIAL_PASSWORDS);
    const normalized = email.toLowerCase().trim();
    const storedPw = passwords[normalized];
    if (storedPw) {
      return storedPw === passwordAttempt;
    }
    // Default fallback for admin or newly created accounts
    if (normalized === 'admin@maqamejoud.org' && (passwordAttempt === 'admin123' || passwordAttempt === 'admin')) {
      return true;
    }
    return Boolean(passwordAttempt && passwordAttempt.length >= 4);
  },

  getUserPassword(email: string): string {
    const passwords = getStored<Record<string, string>>(STORAGE_KEYS.PASSWORDS, INITIAL_PASSWORDS);
    const normalized = email.toLowerCase().trim();
    return passwords[normalized] || 'leader123';
  },

  setUserPassword(email: string, newPassword: string): void {
    const passwords = getStored<Record<string, string>>(STORAGE_KEYS.PASSWORDS, INITIAL_PASSWORDS);
    passwords[email.toLowerCase().trim()] = newPassword;
    setStored(STORAGE_KEYS.PASSWORDS, passwords);
    CloudSyncService.updateUserPassword(email, newPassword);
  },

  changeLeaderPassword(
    userId: string,
    newPassword: string,
    adminName = 'Foundation Administrator'
  ): { success: boolean; user?: UserProfile } {
    const user = this.getUserById(userId);
    if (!user) return { success: false };
    this.setUserPassword(user.email, newPassword);
    this.logActivity({
      user_name: adminName,
      action: `Updated password for team leader ${user.full_name}`,
      entity_type: 'user',
      entity_id: user.id,
      metadata: { email: user.email },
    });
    return { success: true, user };
  },

  createUser(
    profile: Omit<UserProfile, 'id' | 'created_at'>,
    initialPassword = 'leader123'
  ): UserProfile {
    const users = this.getUsers();
    const newUser: UserProfile = {
      ...profile,
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    if (initialPassword) {
      this.setUserPassword(newUser.email, initialPassword);
    }

    this.logActivity({
      user_name: 'Admin',
      action: `Created user account for ${newUser.full_name} (${newUser.role})`,
      entity_type: 'user',
      entity_id: newUser.id,
    });
    CloudSyncService.pushUser(newUser, initialPassword);
    return newUser;
  },

  deleteUser(
    userId: string,
    adminName = 'Foundation Administrator'
  ): { success: boolean; error?: string } {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    if (
      user.role === 'admin' ||
      user.id === 'user_admin_01' ||
      user.email.toLowerCase() === 'admin@maqamejoud.org'
    ) {
      return { success: false, error: 'The Foundation Administrator account cannot be deleted.' };
    }

    // Remove user from storage
    const updatedUsers = users.filter((u) => u.id !== userId);
    setStored(STORAGE_KEYS.USERS, updatedUsers);

    // Remove password
    const passwords = getStored<Record<string, string>>(STORAGE_KEYS.PASSWORDS, INITIAL_PASSWORDS);
    delete passwords[user.email.toLowerCase().trim()];
    setStored(STORAGE_KEYS.PASSWORDS, passwords);

    // If assigned to any teams, unassign the leader
    const teams = this.getTeams();
    let teamsChanged = false;
    teams.forEach((t) => {
      if (t.leader_id === userId) {
        t.leader_id = undefined;
        t.leader_name = undefined;
        t.leader_email = undefined;
        teamsChanged = true;
      }
    });
    if (teamsChanged) {
      setStored(STORAGE_KEYS.TEAMS, teams);
    }

    // Remove team memberships
    const memberships = getStored<TeamMembership[]>(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS);
    const updatedMemberships = memberships.filter((m) => m.user_id !== userId);
    setStored(STORAGE_KEYS.MEMBERSHIPS, updatedMemberships);

    this.logActivity({
      user_name: adminName,
      action: `Deleted team leader account ${user.full_name} (${user.email})`,
      entity_type: 'user',
      entity_id: user.id,
      metadata: { email: user.email, name: user.full_name },
    });

    CloudSyncService.deleteUser(userId);
    return { success: true };
  },

  // Teams
  getTeams(): Team[] {
    const raw = getStored<Team[]>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
    return raw.map((t) => ({
      ...t,
      description: (t.description || '').replace(/<!--__LEADER__:(.*?)-->/g, '').trim(),
    }));
  },

  getTeamById(id: string): Team | undefined {
    return this.getTeams().find((t) => t.id === id);
  },

  getTeamBySlug(slug: string): Team | undefined {
    if (!slug) return undefined;
    const normalized = slug.toLowerCase().trim();
    return this.getTeams().find((t) => t.slug.toLowerCase() === normalized);
  },

  async createTeam(data: { name: string; description: string; slug: string; leader_id?: string }): Promise<Team> {
    const teams = this.getTeams();
    const leader = data.leader_id ? this.getUserById(data.leader_id) : undefined;
    const newTeam: Team = {
      id: generateUUID(),
      name: data.name,
      description: data.description,
      slug: data.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-'),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      leader_id: leader?.id,
      leader_name: leader?.full_name,
      leader_email: leader?.email,
    };
    teams.push(newTeam);
    setStored(STORAGE_KEYS.TEAMS, teams);

    if (leader) {
      this.assignLeaderToTeam(newTeam.id, leader.id);
    }

    // Auto-create initial default form config for this team
    const formConfig = this.createInitialFormForTeam(newTeam);

    this.logActivity({
      team_id: newTeam.id,
      team_name: newTeam.name,
      user_name: 'Admin',
      action: `Created new team: ${newTeam.name}`,
      entity_type: 'team',
      entity_id: newTeam.id,
    });

    await CloudSyncService.pushTeam(newTeam, formConfig);

    return newTeam;
  },

  updateTeam(id: string, updates: Partial<Team>): Team | undefined {
    const teams = this.getTeams();
    const idx = teams.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;

    if (updates.leader_id !== undefined && updates.leader_id !== teams[idx].leader_id) {
      const leader = updates.leader_id ? this.getUserById(updates.leader_id) : undefined;
      updates.leader_name = leader?.full_name;
      updates.leader_email = leader?.email;
      if (leader) {
        this.assignLeaderToTeam(id, leader.id);
      } else {
        updates.leader_id = undefined;
        updates.leader_name = undefined;
        updates.leader_email = undefined;
        const memberships = this.getMemberships().filter((m) => m.team_id !== id);
        setStored(STORAGE_KEYS.MEMBERSHIPS, memberships);
      }
    }

    teams[idx] = {
      ...teams[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.TEAMS, teams);

    this.logActivity({
      team_id: id,
      team_name: teams[idx].name,
      user_name: 'Admin',
      action: `Updated team details: ${teams[idx].name}`,
      entity_type: 'team',
      entity_id: id,
    });

    CloudSyncService.updateTeam(id, updates);

    return teams[idx];
  },

  toggleTeamStatus(id: string): Team | undefined {
    const team = this.getTeamById(id);
    if (!team) return undefined;
    const nextStatus = team.status === 'active' ? 'inactive' : 'active';
    return this.updateTeam(id, { status: nextStatus });
  },

  deleteTeam(id: string): { success: boolean; error?: string } {
    const teams = this.getTeams();
    const team = teams.find((t) => t.id === id);
    if (!team) return { success: false, error: 'Team not found.' };

    setStored(
      STORAGE_KEYS.TEAMS,
      teams.filter((t) => t.id !== id)
    );
    const memberships = this.getMemberships().filter((m) => m.team_id !== id);
    setStored(STORAGE_KEYS.MEMBERSHIPS, memberships);

    const formConfigs = this.getFormConfigs().filter((f) => f.team_id !== id);
    setStored(STORAGE_KEYS.FORM_CONFIGS, formConfigs);

    this.logActivity({
      team_id: id,
      team_name: team.name,
      user_name: 'Admin',
      action: `Deleted recruitment team: ${team.name}`,
      entity_type: 'team',
      entity_id: id,
    });

    CloudSyncService.deleteTeam(id);

    return { success: true };
  },

  // Team Memberships
  getMemberships(): TeamMembership[] {
    return getStored<TeamMembership[]>(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS);
  },

  assignLeaderToTeam(teamId: string, userId: string): void {
    const memberships = this.getMemberships().filter((m) => m.team_id !== teamId);
    memberships.push({
      id: `mem_${Date.now()}`,
      team_id: teamId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.MEMBERSHIPS, memberships);
  },

  getUserTeams(userId: string): Team[] {
    const user = this.getUserById(userId);
    if (!user) return [];
    if (user.role === 'admin') {
      return this.getTeams();
    }
    const memberships = this.getMemberships().filter((m) => m.user_id === userId);
    const teamIds = new Set(memberships.map((m) => m.team_id));
    return this.getTeams().filter((t) => teamIds.has(t.id) || t.leader_id === userId);
  },

  // Forms & Dynamic Builder
  getFormConfigs(): FormConfig[] {
    return getStored<FormConfig[]>(STORAGE_KEYS.FORM_CONFIGS, INITIAL_FORM_CONFIGS);
  },

  getFormConfigByTeamId(teamId: string): FormConfig | undefined {
    return this.getFormConfigs().find((f) => f.team_id === teamId);
  },

  getFormConfigBySlug(slug: string): FormConfig | undefined {
    return this.getFormConfigs().find((f) => f.slug.toLowerCase() === slug.toLowerCase());
  },

  createInitialFormForTeam(team: Team): FormConfig {
    const configs = this.getFormConfigs();
    const newConfig: FormConfig = {
      id: generateUUID(),
      team_id: team.id,
      title: `Maqam-e-Joud Foundation | Volunteer & Membership Registration`,
      description: 'Asslamualaikum💙 Thank you for your interest in joining Maqam-e-Joud Welfare. We believe that even small acts of kindness can create a huge impact in society.',
      submit_button_text: 'Submit Volunteer Application',
      success_message: 'Thank you for your interest in joining MAQAM-E-JOUD Foundation. Your application has been received successfully. Our team will contact you soon, in sha Allah.',
      slug: team.slug,
      status: 'published',
      published_version: 1,
      fields: DEFAULT_FORM_FIELDS.map((f) => ({ ...f })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    configs.push(newConfig);
    setStored(STORAGE_KEYS.FORM_CONFIGS, configs);

    // Save initial version
    const versions = this.getFormVersions();
    const newVersion: FormVersion = {
      id: `ver_1_${team.id}`,
      form_config_id: newConfig.id,
      version_number: 1,
      schema_json: newConfig.fields,
      published_at: new Date().toISOString(),
    };
    versions.push(newVersion);
    setStored(STORAGE_KEYS.FORM_VERSIONS, versions);

    return newConfig;
  },

  saveFormConfig(config: FormConfig): void {
    const configs = this.getFormConfigs();
    const idx = configs.findIndex((c) => c.id === config.id || c.team_id === config.team_id);
    if (idx !== -1) {
      configs[idx] = {
        ...config,
        updated_at: new Date().toISOString(),
      };
    } else {
      configs.push(config);
    }
    setStored(STORAGE_KEYS.FORM_CONFIGS, configs);
    const updated = idx !== -1 ? configs[idx] : config;
    CloudSyncService.pushFormConfig(updated);
  },

  publishFormConfig(configId: string, currentUserId?: string): { config: FormConfig; version: FormVersion } {
    const configs = this.getFormConfigs();
    const idx = configs.findIndex((c) => c.id === configId);
    if (idx === -1) throw new Error('Form configuration not found');

    const nextVersionNum = (configs[idx].published_version || 0) + 1;
    configs[idx].published_version = nextVersionNum;
    configs[idx].status = 'published';
    configs[idx].updated_at = new Date().toISOString();
    setStored(STORAGE_KEYS.FORM_CONFIGS, configs);

    const versions = this.getFormVersions();
    const newVersion: FormVersion = {
      id: generateUUID(),
      form_config_id: configs[idx].id,
      version_number: nextVersionNum,
      schema_json: JSON.parse(JSON.stringify(configs[idx].fields)),
      published_at: new Date().toISOString(),
      created_by: currentUserId,
    };
    versions.push(newVersion);
    setStored(STORAGE_KEYS.FORM_VERSIONS, versions);

    CloudSyncService.pushFormConfig(configs[idx]);

    const team = this.getTeamById(configs[idx].team_id);
    this.logActivity({
      team_id: configs[idx].team_id,
      team_name: team?.name,
      user_name: 'Admin',
      action: `Published Form Version ${nextVersionNum} for ${team?.name}`,
      entity_type: 'form',
      entity_id: configs[idx].id,
      metadata: { version: nextVersionNum },
    });

    return { config: configs[idx], version: newVersion };
  },

  getFormVersions(): FormVersion[] {
    return getStored<FormVersion[]>(STORAGE_KEYS.FORM_VERSIONS, INITIAL_FORM_VERSIONS);
  },

  getFormVersionById(id: string): FormVersion | undefined {
    return this.getFormVersions().find((v) => v.id === id);
  },

  getLatestPublishedVersion(configId: string): FormVersion | undefined {
    const versions = this.getFormVersions().filter((v) => v.form_config_id === configId);
    return versions.sort((a, b) => b.version_number - a.version_number)[0];
  },

  // Applications
  getApplications(filter?: { teamId?: string; status?: ApplicationStatus; search?: string }): Application[] {
    let list = getStored<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);

    if (filter?.teamId && filter.teamId !== 'all') {
      list = list.filter((a) => a.team_id === filter.teamId);
    }
    if (filter?.status && filter.status !== ('all' as any)) {
      list = list.filter((a) => a.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.reference_number.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  },

  getApplicationById(id: string): Application | undefined {
    return this.getApplications().find((a) => a.id === id);
  },

  async submitApplication(submission: {
    team_slug: string;
    answers: Record<string, any>;
  }): Promise<{ application: Application; team: Team }> {
    const team = this.getTeamBySlug(submission.team_slug);
    if (!team) throw new Error('Invalid or unknown recruitment team link.');
    if (team.status !== 'active') throw new Error('Recruitment for this team is currently closed.');

    let formConfig = this.getFormConfigByTeamId(team.id);
    if (!formConfig) {
      formConfig = this.createInitialFormForTeam(team);
    }

    const latestVersion = this.getLatestPublishedVersion(formConfig.id);

    const fullName = String(
      submission.answers['f_full_name'] ||
      submission.answers['name'] ||
      submission.answers['fullName'] ||
      'Anonymous Applicant'
    ).trim();

    const phone = String(
      submission.answers['f_phone'] || submission.answers['phone'] || submission.answers['whatsapp'] || ''
    ).trim();

    const email = String(submission.answers['f_email'] || submission.answers['email'] || '').trim();

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `MJV-${new Date().getFullYear()}-${randomCode}`;

    const newApp: Application = {
      id: generateUUID(),
      reference_number: referenceNumber,
      team_id: team.id,
      team_name: team.name,
      form_version_id: isValidUUID(latestVersion?.id || '') ? latestVersion?.id : undefined,
      full_name: fullName,
      phone: phone,
      email: email,
      status: 'new',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      answers: submission.answers,
      notes_count: 0,
    };

    const apps = this.getApplications();
    apps.unshift(newApp);
    setStored(STORAGE_KEYS.APPLICATIONS, apps);

    this.logActivity({
      team_id: team.id,
      team_name: team.name,
      user_name: fullName,
      action: 'Volunteer Application Submitted',
      entity_type: 'application',
      entity_id: newApp.id,
      metadata: { reference: referenceNumber },
    });

    const pushRes = await CloudSyncService.pushApplication(newApp);
    if (pushRes && !pushRes.success) {
      console.warn('Cloud sync error for new application, stored locally:', pushRes.error);
    }

    return { application: newApp, team };
  },

  updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    changedByName: string
  ): Application | undefined {
    const apps = this.getApplications();
    const idx = apps.findIndex((a) => a.id === applicationId);
    if (idx === -1) return undefined;

    const oldStatus = apps[idx].status;
    if (oldStatus === newStatus) return apps[idx];

    apps[idx].status = newStatus;
    setStored(STORAGE_KEYS.APPLICATIONS, apps);

    const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.HISTORY, INITIAL_HISTORY);
    allHistory.push({
      id: generateUUID(),
      application_id: applicationId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by_name: changedByName,
      changed_at: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.HISTORY, allHistory);

    this.logActivity({
      team_id: apps[idx].team_id,
      team_name: apps[idx].team_name,
      user_name: changedByName,
      action: `Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
      entity_type: 'application',
      entity_id: applicationId,
      metadata: { oldStatus, newStatus },
    });

    CloudSyncService.updateApplicationStatus(applicationId, newStatus, oldStatus, changedByName);

    return apps[idx];
  },

  deleteApplication(
    applicationId: string,
    adminName = 'Foundation Administrator'
  ): { success: boolean; application?: Application } {
    const apps = this.getApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) {
      return { success: false };
    }

    // Remove application
    const updatedApps = apps.filter((a) => a.id !== applicationId);
    setStored(STORAGE_KEYS.APPLICATIONS, updatedApps);

    // Clean up corresponding notes
    const notes = getStored<ApplicationNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const updatedNotes = notes.filter((n) => n.application_id !== applicationId);
    setStored(STORAGE_KEYS.NOTES, updatedNotes);

    // Clean up corresponding status history
    const history = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.HISTORY, INITIAL_HISTORY);
    const updatedHistory = history.filter((h) => h.application_id !== applicationId);
    setStored(STORAGE_KEYS.HISTORY, updatedHistory);

    this.logActivity({
      team_id: app.team_id,
      team_name: app.team_name,
      user_name: adminName,
      action: `Deleted application of ${app.full_name} (${app.reference_number})`,
      entity_type: 'application',
      entity_id: applicationId,
      metadata: { applicantName: app.full_name, reference: app.reference_number },
    });

    CloudSyncService.deleteApplication(applicationId);

    return { success: true, application: app };
  },

  // Notes
  getApplicationNotes(applicationId: string): ApplicationNote[] {
    const allNotes = getStored<ApplicationNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    return allNotes
      .filter((n) => n.application_id === applicationId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addApplicationNote(applicationId: string, authorId: string, authorName: string, noteText: string): ApplicationNote {
    const allNotes = getStored<ApplicationNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const newNote: ApplicationNote = {
      id: generateUUID(),
      application_id: applicationId,
      user_id: authorId,
      author_name: authorName,
      note: noteText.trim(),
      created_at: new Date().toISOString(),
    };
    allNotes.push(newNote);
    setStored(STORAGE_KEYS.NOTES, allNotes);

    const apps = this.getApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (app) {
      app.notes_count = (app.notes_count || 0) + 1;
      setStored(STORAGE_KEYS.APPLICATIONS, apps);
    }

    this.logActivity({
      team_id: app?.team_id,
      team_name: app?.team_name,
      user_name: authorName,
      action: 'Added internal evaluation note',
      entity_type: 'application',
      entity_id: applicationId,
    });

    CloudSyncService.pushNote(newNote);

    return newNote;
  },

  // Status History
  getApplicationHistory(applicationId: string): ApplicationStatusHistory[] {
    const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.HISTORY, INITIAL_HISTORY);
    return allHistory
      .filter((h) => h.application_id === applicationId)
      .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
  },

  // Activity Logs
  getActivityLogs(teamId?: string): ActivityLog[] {
    let logs = getStored<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY);
    if (teamId && teamId !== 'all') {
      logs = logs.filter((l) => l.team_id === teamId);
    }
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  logActivity(data: {
    team_id?: string;
    team_name?: string;
    user_id?: string;
    user_name?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    metadata?: Record<string, any>;
  }): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      ...data,
    };
    logs.unshift(newLog);
    setStored(STORAGE_KEYS.ACTIVITY, logs.slice(0, 100));
    CloudSyncService.pushActivity(newLog);
  },

  // Statistics calculation
  getAdminStats() {
    const teams = this.getTeams();
    const users = this.getUsers();
    const applications = this.getApplications();

    const activeTeams = teams.filter((t) => t.status === 'active');
    const leaders = users.filter((u) => u.role === 'team_leader');
    const newApps = applications.filter((a) => a.status === 'new');
    const approvedApps = applications.filter((a) => a.status === 'approved');
    const contactedApps = applications.filter((a) => a.status === 'contacted');

    return {
      totalTeams: teams.length,
      activeTeams: activeTeams.length,
      totalLeaders: leaders.length,
      totalApplications: applications.length,
      newApplications: newApps.length,
      approvedApplications: approvedApps.length,
      contactedApplications: contactedApps.length,
    };
  },

  getTeamStats(teamId: string) {
    const apps = this.getApplications({ teamId });
    return {
      total: apps.length,
      new: apps.filter((a) => a.status === 'new').length,
      under_review: apps.filter((a) => a.status === 'under_review').length,
      contacted: apps.filter((a) => a.status === 'contacted').length,
      approved: apps.filter((a) => a.status === 'approved').length,
      rejected: apps.filter((a) => a.status === 'rejected').length,
      on_hold: apps.filter((a) => a.status === 'on_hold').length,
    };
  },
};
