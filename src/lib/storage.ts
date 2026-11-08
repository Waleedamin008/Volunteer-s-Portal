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

const STORAGE_KEYS = {
  TEAMS: 'mj_teams_v1',
  USERS: 'mj_users_v1',
  MEMBERSHIPS: 'mj_memberships_v1',
  FORM_CONFIGS: 'mj_form_configs_v1',
  FORM_VERSIONS: 'mj_form_versions_v1',
  APPLICATIONS: 'mj_applications_v1',
  ANSWERS: 'mj_answers_v1',
  NOTES: 'mj_notes_v1',
  HISTORY: 'mj_history_v1',
  ACTIVITY: 'mj_activity_v1',
  CURRENT_USER: 'mj_current_user_v1',
};

// Seed Profiles
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_admin_01',
    email: 'admin@maqamejoud.org',
    full_name: 'Hafiz Muhammad Abdullah',
    role: 'admin',
    phone: '+92 300 1112233',
    created_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'user_leader_01',
    email: 'usman.leader@maqamejoud.org',
    full_name: 'Usman Tariq',
    role: 'team_leader',
    phone: '+92 321 4455667',
    created_at: '2026-10-05T11:30:00Z',
  },
  {
    id: 'user_leader_02',
    email: 'ayesha.leader@maqamejoud.org',
    full_name: 'Ayesha Siddiqua',
    role: 'team_leader',
    phone: '+92 333 9988776',
    created_at: '2026-10-06T14:15:00Z',
  },
  {
    id: 'user_leader_03',
    email: 'bilal.leader@maqamejoud.org',
    full_name: 'Bilal Ahmed Khan',
    role: 'team_leader',
    phone: '+92 345 5544332',
    created_at: '2026-10-08T09:20:00Z',
  },
];

// Seed Teams
const INITIAL_TEAMS: Team[] = [
  {
    id: 'team_donation',
    name: 'Donation & Welfare Team',
    description: 'Manages fundraising campaigns, donor relations, ration drives, and financial transparency for charitable initiatives.',
    slug: 'donation-team',
    status: 'active',
    created_at: '2026-10-05T12:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
    leader_id: 'user_leader_01',
    leader_name: 'Usman Tariq',
    leader_email: 'usman.leader@maqamejoud.org',
  },
  {
    id: 'team_social_media',
    name: 'Social Media & Communications',
    description: 'Coordinates social media outreach, campaigns, stories of impact, visual storytelling, and community engagement.',
    slug: 'social-media-team',
    status: 'active',
    created_at: '2026-10-06T14:30:00Z',
    updated_at: '2026-11-02T12:00:00Z',
    leader_id: 'user_leader_02',
    leader_name: 'Ayesha Siddiqua',
    leader_email: 'ayesha.leader@maqamejoud.org',
  },
  {
    id: 'team_graphic_design',
    name: 'Graphic Design & Media Team',
    description: 'Creates professional posters, video reels, brand assets, social carousels, and event collateral for the foundation.',
    slug: 'graphic-design-team',
    status: 'active',
    created_at: '2026-10-08T10:00:00Z',
    updated_at: '2026-11-03T15:00:00Z',
    leader_id: 'user_leader_03',
    leader_name: 'Bilal Ahmed Khan',
    leader_email: 'bilal.leader@maqamejoud.org',
  },
  {
    id: 'team_event_mgmt',
    name: 'Event Management & Logistics',
    description: 'Organizes on-ground volunteer distributions, medical camps, seminars, food drives, and emergency relief operations.',
    slug: 'event-management-team',
    status: 'active',
    created_at: '2026-10-10T09:00:00Z',
    updated_at: '2026-11-04T08:00:00Z',
  },
  {
    id: 'team_pr',
    name: 'Public Relations & Partnerships',
    description: 'Builds partnerships with universities, corporate CSR arms, local mosques, and community organizations.',
    slug: 'public-relations-team',
    status: 'active',
    created_at: '2026-10-12T11:00:00Z',
    updated_at: '2026-11-05T14:00:00Z',
  },
];

// Seed Memberships
const INITIAL_MEMBERSHIPS: TeamMembership[] = [
  { id: 'mem_01', team_id: 'team_donation', user_id: 'user_leader_01', created_at: '2026-10-05T12:00:00Z' },
  { id: 'mem_02', team_id: 'team_social_media', user_id: 'user_leader_02', created_at: '2026-10-06T14:30:00Z' },
  { id: 'mem_03', team_id: 'team_graphic_design', user_id: 'user_leader_03', created_at: '2026-10-08T10:00:00Z' },
];

// Initial Forms & Published Versions
const INITIAL_FORM_CONFIGS: FormConfig[] = INITIAL_TEAMS.map((team, idx) => ({
  id: `form_cfg_${team.id}`,
  team_id: team.id,
  title: `${team.name} — Volunteer Application`,
  description: `Join MAQAM-E-JOUD Foundation's ${team.name}. We look forward to welcoming passionate individuals dedicated to community welfare and service.`,
  welcome_message: 'Bismillah. Welcome to the MAQAM-E-JOUD Foundation volunteer recruitment portal. Please fill in the details below honestly and completely.',
  submit_button_text: 'Submit Volunteer Application',
  success_message: 'Thank you for your interest in joining MAQAM-E-JOUD Foundation. Your application has been received successfully. Our team will contact you soon, in sha Allah.',
  slug: team.slug,
  status: 'published',
  published_version: 1,
  fields: DEFAULT_FORM_FIELDS,
  created_at: '2026-10-15T10:00:00Z',
  updated_at: '2026-10-15T10:00:00Z',
}));

const INITIAL_FORM_VERSIONS: FormVersion[] = INITIAL_FORM_CONFIGS.map((cfg) => ({
  id: `ver_1_${cfg.team_id}`,
  form_config_id: cfg.id,
  version_number: 1,
  schema_json: cfg.fields,
  published_at: '2026-10-15T10:00:00Z',
  created_by: 'user_admin_01',
}));

// Initial realistic applications
const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_101',
    reference_number: 'MJV-2026-8912',
    team_id: 'team_donation',
    team_name: 'Donation & Welfare Team',
    form_version_id: 'ver_1_team_donation',
    full_name: 'Hamza Farooq',
    phone: '+92 301 2345678',
    email: 'hamza.farooq@gmail.com',
    status: 'approved',
    submitted_at: '2026-10-20T14:32:00Z',
    created_at: '2026-10-20T14:32:00Z',
    notes_count: 2,
    answers: {
      f_full_name: 'Hamza Farooq',
      f_father_name: 'Muhammad Farooq',
      f_gender: 'Male',
      f_phone: '+92 301 2345678',
      f_whatsapp: '+92 301 2345678',
      f_email: 'hamza.farooq@gmail.com',
      f_city: 'Lahore',
      f_education: 'Undergraduate / Bachelor’s Degree',
      f_institution: 'FAST-NUCES Lahore (BS Accounting & Finance)',
      f_skills: 'Financial record keeping, Excel spreadsheets, donor reporting, transparent audits.',
      f_interests: ['Donation Drives & Fundraising', 'Administration & Data Entry'],
      f_volunteer_experience: 'Led student blood donation society and managed winter clothes drive for flood relief in 2024.',
      f_available_days: ['Weekends (Sat-Sun)', 'Fridays'],
      f_available_time: '5 to 8 hours per week',
      f_motivation: 'I want to utilize my financial background to ensure donors have complete trust and that every single rupee reaches worthy families.',
      f_additional_info: 'Available immediately for orientation.',
    },
  },
  {
    id: 'app_102',
    reference_number: 'MJV-2026-9041',
    team_id: 'team_donation',
    team_name: 'Donation & Welfare Team',
    form_version_id: 'ver_1_team_donation',
    full_name: 'Zainab Noor',
    phone: '+92 333 4567890',
    email: 'zainab.noor@outlook.com',
    status: 'contacted',
    submitted_at: '2026-10-24T10:15:00Z',
    created_at: '2026-10-24T10:15:00Z',
    notes_count: 1,
    answers: {
      f_full_name: 'Zainab Noor',
      f_father_name: 'Noor ul Hassan',
      f_gender: 'Female',
      f_phone: '+92 333 4567890',
      f_whatsapp: '+92 333 4567890',
      f_email: 'zainab.noor@outlook.com',
      f_city: 'Lahore',
      f_education: 'Graduate / Master’s Degree',
      f_institution: 'Punjab University (M.Com)',
      f_skills: 'Donor relations, interpersonal communication, receipt verification, corporate CSR outreach.',
      f_interests: ['Donation Drives & Fundraising'],
      f_volunteer_experience: 'Volunteered with Akhuwat Foundation during Ramadan ration drives.',
      f_available_days: ['Weekdays (Mon-Thu)', 'Weekends (Sat-Sun)'],
      f_available_time: '9 to 15 hours per week',
      f_motivation: 'Seeking the pleasure of Allah through serving orphans and widows in our community.',
      f_additional_info: '',
    },
  },
  {
    id: 'app_103',
    reference_number: 'MJV-2026-9188',
    team_id: 'team_donation',
    team_name: 'Donation & Welfare Team',
    form_version_id: 'ver_1_team_donation',
    full_name: 'Abdul Rehman Qureshi',
    phone: '+92 321 8765432',
    email: 'abdulrehman.q@yahoo.com',
    status: 'new',
    submitted_at: '2026-11-06T18:40:00Z',
    created_at: '2026-11-06T18:40:00Z',
    notes_count: 0,
    answers: {
      f_full_name: 'Abdul Rehman Qureshi',
      f_father_name: 'Abdul Hameed',
      f_gender: 'Male',
      f_phone: '+92 321 8765432',
      f_whatsapp: '+92 321 8765432',
      f_email: 'abdulrehman.q@yahoo.com',
      f_city: 'Faisalabad',
      f_education: 'Intermediate / A-Levels / DAE',
      f_institution: 'Punjab College',
      f_skills: 'Field surveying, logistics, verified beneficiary home visits.',
      f_interests: ['Field Work & Ration Distribution', 'Donation Drives & Fundraising'],
      f_volunteer_experience: 'None yet, eager to start first journey with Maqam-e-Joud.',
      f_available_days: ['Weekends (Sat-Sun)'],
      f_available_time: '5 to 8 hours per week',
      f_motivation: 'To participate in charity distribution with integrity and sincerity.',
      f_additional_info: 'Have personal motorcycle for field verification.',
    },
  },
  {
    id: 'app_104',
    reference_number: 'MJV-2026-9233',
    team_id: 'team_social_media',
    team_name: 'Social Media & Communications',
    form_version_id: 'ver_1_team_social_media',
    full_name: 'Fatima Alvi',
    phone: '+92 344 1122334',
    email: 'fatima.alvi@gmail.com',
    status: 'approved',
    submitted_at: '2026-10-22T08:20:00Z',
    created_at: '2026-10-22T08:20:00Z',
    notes_count: 1,
    answers: {
      f_full_name: 'Fatima Alvi',
      f_father_name: 'Tariq Alvi',
      f_gender: 'Female',
      f_phone: '+92 344 1122334',
      f_whatsapp: '+92 344 1122334',
      f_email: 'fatima.alvi@gmail.com',
      f_city: 'Islamabad',
      f_education: 'Undergraduate / Bachelor’s Degree',
      f_institution: 'NUST (Mass Communication)',
      f_skills: 'Copywriting, Instagram reels, video scriptwriting, Urdu & English caption writing.',
      f_interests: ['Social Media Management & PR'],
      f_volunteer_experience: 'Managed social media handles for university welfare club with 15k followers.',
      f_available_days: ['Flexible / Project-Based'],
      f_available_time: '9 to 15 hours per week',
      f_motivation: 'Help amplify the righteous work of Maqam-e-Joud so more people get inspired to contribute.',
      f_additional_info: 'Portfolio link: behance.net/fatimaalvi',
    },
  },
  {
    id: 'app_105',
    reference_number: 'MJV-2026-9310',
    team_id: 'team_social_media',
    team_name: 'Social Media & Communications',
    form_version_id: 'ver_1_team_social_media',
    full_name: 'Omer Saeed',
    phone: '+92 312 9988112',
    email: 'omer.saeed99@gmail.com',
    status: 'under_review',
    submitted_at: '2026-11-04T12:00:00Z',
    created_at: '2026-11-04T12:00:00Z',
    notes_count: 0,
    answers: {
      f_full_name: 'Omer Saeed',
      f_father_name: 'Saeed Anwar',
      f_gender: 'Male',
      f_phone: '+92 312 9988112',
      f_whatsapp: '+92 312 9988112',
      f_email: 'omer.saeed99@gmail.com',
      f_city: 'Rawalpindi',
      f_education: 'Undergraduate / Bachelor’s Degree',
      f_institution: 'COMSATS Islamabad (Software Engineering)',
      f_skills: 'Meta business suite, analytics tracking, SEO, short video editing in CapCut & Premiere.',
      f_interests: ['Social Media Management & PR', 'Graphic Design & Video Editing'],
      f_volunteer_experience: 'Run personal tech channel with 30k subscribers.',
      f_available_days: ['Weekends (Sat-Sun)', 'Fridays'],
      f_available_time: '5 to 8 hours per week',
      f_motivation: 'I want to dedicate my digital skills to cause-driven campaigns.',
      f_additional_info: '',
    },
  },
  {
    id: 'app_106',
    reference_number: 'MJV-2026-9450',
    team_id: 'team_graphic_design',
    team_name: 'Graphic Design & Media Team',
    form_version_id: 'ver_1_team_graphic_design',
    full_name: 'Saad Bin Khalid',
    phone: '+92 300 7766554',
    email: 'saad.design@outlook.com',
    status: 'new',
    submitted_at: '2026-11-07T16:15:00Z',
    created_at: '2026-11-07T16:15:00Z',
    notes_count: 0,
    answers: {
      f_full_name: 'Saad Bin Khalid',
      f_father_name: 'Khalid Mehmood',
      f_gender: 'Male',
      f_phone: '+92 300 7766554',
      f_whatsapp: '+92 300 7766554',
      f_email: 'saad.design@outlook.com',
      f_city: 'Lahore',
      f_education: 'Undergraduate / Bachelor’s Degree',
      f_institution: 'National College of Arts (NCA)',
      f_skills: 'Adobe Photoshop, Illustrator, Brand identity, Typography, Islamic geometric art.',
      f_interests: ['Graphic Design & Video Editing'],
      f_volunteer_experience: 'Designed flyers and social graphics for community iftar drives in Ramadan.',
      f_available_days: ['Weekdays (Mon-Thu)', 'Weekends (Sat-Sun)'],
      f_available_time: '9 to 15 hours per week',
      f_motivation: 'Visuals speak louder than words. I want to produce high quality visual assets that represent the foundation with prestige.',
      f_additional_info: 'Ready to take a quick design assessment test.',
    },
  },
];

const INITIAL_NOTES: ApplicationNote[] = [
  {
    id: 'note_1',
    application_id: 'app_101',
    user_id: 'user_leader_01',
    author_name: 'Usman Tariq (Donation Leader)',
    note: 'Interviewed via phone on Oct 22. Highly articulate candidate with solid accounting ethics. Assigned to Ramadan audit sub-committee.',
    created_at: '2026-10-22T16:00:00Z',
  },
  {
    id: 'note_2',
    application_id: 'app_101',
    user_id: 'user_admin_01',
    author_name: 'Hafiz Muhammad Abdullah (Admin)',
    note: 'Approved induction. Welcomed to MAQAM-E-JOUD Foundation core volunteers roster.',
    created_at: '2026-10-23T11:00:00Z',
  },
  {
    id: 'note_3',
    application_id: 'app_102',
    user_id: 'user_leader_01',
    author_name: 'Usman Tariq (Donation Leader)',
    note: 'Sent WhatsApp intro and invited for team Google Meet orientation this Saturday.',
    created_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'note_4',
    application_id: 'app_104',
    user_id: 'user_leader_02',
    author_name: 'Ayesha Siddiqua (Media Leader)',
    note: 'Reviewed portfolio. Outstanding reel editing quality. Onboarded to Friday campaign series.',
    created_at: '2026-10-24T18:00:00Z',
  },
];

const INITIAL_HISTORY: ApplicationStatusHistory[] = [
  {
    id: 'hist_1',
    application_id: 'app_101',
    old_status: 'new',
    new_status: 'under_review',
    changed_by_name: 'Usman Tariq',
    changed_at: '2026-10-21T09:00:00Z',
  },
  {
    id: 'hist_2',
    application_id: 'app_101',
    old_status: 'under_review',
    new_status: 'contacted',
    changed_by_name: 'Usman Tariq',
    changed_at: '2026-10-22T16:00:00Z',
  },
  {
    id: 'hist_3',
    application_id: 'app_101',
    old_status: 'contacted',
    new_status: 'approved',
    changed_by_name: 'Hafiz Muhammad Abdullah',
    changed_at: '2026-10-23T11:00:00Z',
  },
  {
    id: 'hist_4',
    application_id: 'app_102',
    old_status: 'new',
    new_status: 'contacted',
    changed_by_name: 'Usman Tariq',
    changed_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'hist_5',
    application_id: 'app_104',
    old_status: 'new',
    new_status: 'approved',
    changed_by_name: 'Ayesha Siddiqua',
    changed_at: '2026-10-24T18:00:00Z',
  },
];

const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: 'act_1',
    team_id: 'team_donation',
    team_name: 'Donation & Welfare Team',
    user_name: 'Hafiz Muhammad Abdullah',
    action: 'Form Published',
    entity_type: 'form',
    created_at: '2026-10-15T10:00:00Z',
    metadata: { version: 1 },
  },
  {
    id: 'act_2',
    team_id: 'team_donation',
    team_name: 'Donation & Welfare Team',
    user_name: 'Hamza Farooq',
    action: 'Application Submitted',
    entity_type: 'application',
    entity_id: 'app_101',
    created_at: '2026-10-20T14:32:00Z',
  },
  {
    id: 'act_3',
    team_id: 'team_social_media',
    team_name: 'Social Media & Communications',
    user_name: 'Fatima Alvi',
    action: 'Application Submitted',
    entity_type: 'application',
    entity_id: 'app_104',
    created_at: '2026-10-22T08:20:00Z',
  },
  {
    id: 'act_4',
    team_id: 'team_donation',
    team_name: 'Donation & Welfare Team',
    user_name: 'Usman Tariq',
    action: 'Status Changed to Contacted',
    entity_type: 'application',
    entity_id: 'app_102',
    created_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'act_5',
    team_id: 'team_social_media',
    team_name: 'Social Media & Communications',
    user_name: 'Ayesha Siddiqua',
    action: 'Status Changed to Approved',
    entity_type: 'application',
    entity_id: 'app_104',
    created_at: '2026-10-24T18:00:00Z',
  },
  {
    id: 'act_6',
    team_id: 'team_graphic_design',
    team_name: 'Graphic Design & Media Team',
    user_name: 'Saad Bin Khalid',
    action: 'Application Submitted',
    entity_type: 'application',
    entity_id: 'app_106',
    created_at: '2026-11-07T16:15:00Z',
  },
];

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
  // Reset all to sample
  resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(INITIAL_MEMBERSHIPS));
    localStorage.setItem(STORAGE_KEYS.FORM_CONFIGS, JSON.stringify(INITIAL_FORM_CONFIGS));
    localStorage.setItem(STORAGE_KEYS.FORM_VERSIONS, JSON.stringify(INITIAL_FORM_VERSIONS));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(INITIAL_HISTORY));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY));
  },

  // Users / Auth
  getUsers(): UserProfile[] {
    return getStored<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  getUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser(profile: Omit<UserProfile, 'id' | 'created_at'>): UserProfile {
    const users = this.getUsers();
    const newUser: UserProfile = {
      ...profile,
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    this.logActivity({
      user_name: 'Admin',
      action: `Created user account for ${newUser.full_name} (${newUser.role})`,
      entity_type: 'user',
      entity_id: newUser.id,
    });
    return newUser;
  },

  // Teams
  getTeams(): Team[] {
    return getStored<Team[]>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  },

  getTeamById(id: string): Team | undefined {
    return this.getTeams().find((t) => t.id === id);
  },

  getTeamBySlug(slug: string): Team | undefined {
    return this.getTeams().find((t) => t.slug.toLowerCase() === slug.toLowerCase());
  },

  createTeam(data: { name: string; description: string; slug: string; leader_id?: string }): Team {
    const teams = this.getTeams();
    const leader = data.leader_id ? this.getUserById(data.leader_id) : undefined;
    const newTeam: Team = {
      id: `team_${Date.now()}`,
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

    // If leader assigned, create membership
    if (leader) {
      this.assignLeaderToTeam(newTeam.id, leader.id);
    }

    // Auto-create initial form config for this team
    this.createInitialFormForTeam(newTeam);

    this.logActivity({
      team_id: newTeam.id,
      team_name: newTeam.name,
      user_name: 'Admin',
      action: `Created new team: ${newTeam.name}`,
      entity_type: 'team',
      entity_id: newTeam.id,
    });

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

    return teams[idx];
  },

  toggleTeamStatus(id: string): Team | undefined {
    const team = this.getTeamById(id);
    if (!team) return undefined;
    const nextStatus = team.status === 'active' ? 'inactive' : 'active';
    return this.updateTeam(id, { status: nextStatus });
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
      id: `form_cfg_${team.id}`,
      team_id: team.id,
      title: `${team.name} — Volunteer Application`,
      description: `Join MAQAM-E-JOUD Foundation's ${team.name}. We look forward to welcoming passionate individuals dedicated to community welfare and service.`,
      welcome_message: 'Bismillah. Welcome to the MAQAM-E-JOUD Foundation volunteer recruitment portal. Please fill in the details below honestly and completely.',
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

    // Create immutable form version snapshot
    const versions = this.getFormVersions();
    const newVersion: FormVersion = {
      id: `ver_${nextVersionNum}_${configs[idx].team_id}_${Date.now()}`,
      form_config_id: configs[idx].id,
      version_number: nextVersionNum,
      schema_json: JSON.parse(JSON.stringify(configs[idx].fields)),
      published_at: new Date().toISOString(),
      created_by: currentUserId,
    };
    versions.push(newVersion);
    setStored(STORAGE_KEYS.FORM_VERSIONS, versions);

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

  submitApplication(submission: {
    team_slug: string;
    answers: Record<string, any>;
  }): { application: Application; team: Team } {
    const team = this.getTeamBySlug(submission.team_slug);
    if (!team) throw new Error('Invalid or unknown recruitment team link.');
    if (team.status !== 'active') throw new Error('Recruitment for this team is currently closed.');

    const formConfig = this.getFormConfigByTeamId(team.id);
    if (!formConfig || formConfig.status !== 'published') {
      throw new Error('This recruitment form is currently not open for new submissions.');
    }

    const latestVersion = this.getLatestPublishedVersion(formConfig.id);

    // Extract core identity fields safely from answers
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

    // Generate readable reference code: MJV-YYYY-XXXX
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `MJV-${new Date().getFullYear()}-${randomCode}`;

    const newApp: Application = {
      id: `app_${Date.now()}`,
      reference_number: referenceNumber,
      team_id: team.id,
      team_name: team.name,
      form_version_id: latestVersion?.id,
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

    // Record history
    const history = this.getApplicationHistory(applicationId);
    const allHistory = getStored<ApplicationStatusHistory[]>(STORAGE_KEYS.HISTORY, INITIAL_HISTORY);
    allHistory.push({
      id: `hist_${Date.now()}`,
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

    return apps[idx];
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
      id: `note_${Date.now()}`,
      application_id: applicationId,
      user_id: authorId,
      author_name: authorName,
      note: noteText.trim(),
      created_at: new Date().toISOString(),
    };
    allNotes.push(newNote);
    setStored(STORAGE_KEYS.NOTES, allNotes);

    // Update note count in application
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
    setStored(STORAGE_KEYS.ACTIVITY, logs.slice(0, 100)); // keep last 100
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
