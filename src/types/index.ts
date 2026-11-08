export type UserRole = 'admin' | 'team_leader';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export type TeamStatus = 'active' | 'inactive';

export interface Team {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: TeamStatus;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  leader_id?: string;
  leader_name?: string;
  leader_email?: string;
}

export interface TeamMembership {
  id: string;
  team_id: string;
  user_id: string;
  created_at: string;
}

export type FormFieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'number'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'multiple_choice'
  | 'date'
  | 'file_upload';

export interface FormField {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  defaultValue?: string | string[] | boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedTypes?: string[];
    maxFileSizeMb?: number;
  };
}

export type FormStatus = 'draft' | 'published' | 'unpublished';

export interface FormConfig {
  id: string;
  team_id: string;
  title: string;
  description: string;
  welcome_message?: string;
  submit_button_text?: string;
  success_message?: string;
  slug: string;
  status: FormStatus;
  published_version: number;
  fields: FormField[];
  created_at: string;
  updated_at: string;
}

export interface FormVersion {
  id: string;
  form_config_id: string;
  version_number: number;
  schema_json: FormField[];
  published_at: string;
  created_by?: string;
}

export type ApplicationStatus =
  | 'new'
  | 'under_review'
  | 'contacted'
  | 'approved'
  | 'rejected'
  | 'on_hold';

export interface Application {
  id: string;
  reference_number: string;
  team_id: string;
  team_name?: string;
  form_version_id?: string;
  full_name: string;
  phone: string;
  email: string;
  status: ApplicationStatus;
  submitted_at: string;
  created_at: string;
  answers?: Record<string, any>;
  notes_count?: number;
}

export interface ApplicationAnswer {
  id: string;
  application_id: string;
  field_key: string;
  field_label: string;
  field_type: FormFieldType;
  answer_json: any;
  created_at: string;
}

export interface ApplicationNote {
  id: string;
  application_id: string;
  user_id: string;
  author_name: string;
  note: string;
  created_at: string;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  old_status: ApplicationStatus;
  new_status: ApplicationStatus;
  changed_by_name: string;
  changed_at: string;
}

export interface ActivityLog {
  id: string;
  team_id?: string;
  team_name?: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
