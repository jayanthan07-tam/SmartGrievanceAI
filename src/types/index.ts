// ─── Core Enums & Types ───────────────────────────────────────────────────────

export type UserRole = 'citizen' | 'officer' | 'district_admin' | 'super_admin';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type ComplaintStatus =
  | 'submitted'
  | 'ai_analyzed'
  | 'pending_review'
  | 'assigned'
  | 'in_progress'
  | 'more_info_required'
  | 'reassigned'
  | 'escalated'
  | 'resolved'
  | 'reopened';

export type Language = 'en' | 'ta';

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string; // stored as plain text in demo
  role: UserRole;
  preferred_language: Language;
  created_at: string;
  is_active: boolean;
}

// ─── Departments ──────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  department_name: string;
  description: string;
  jurisdiction: string;
  icon: string;
  active_status: boolean;
  avg_resolution_hours: number;
  sla_compliance: number;
}

// ─── Officers ─────────────────────────────────────────────────────────────────

export interface Officer {
  id: string;
  user_id: string;
  department_id: string;
  district_id: string;
  designation: string;
  cases_assigned: number;
  cases_resolved: number;
}

// ─── Districts & Locations ────────────────────────────────────────────────────

export interface District {
  id: string;
  state: string;
  district_name: string;
  mandals: string[];
  lat: number;
  lng: number;
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export interface AIAnalysis {
  id: string;
  complaint_id: string;
  detected_language: Language;
  language_name: string;
  summary: string;
  recommended_category: string;
  recommended_priority: Priority;
  recommended_department_id: string;
  secondary_department_ids: string[];
  explanation: string;
  confidence: number; // 0-100
  uncertainty: boolean;
  review_required: boolean;
  keywords: string[];
  model_version: string;
  analyzed_at: string;
}

// ─── Complaints ───────────────────────────────────────────────────────────────

export interface Complaint {
  id: string;
  grievance_number: string;
  citizen_id: string;
  title: string;
  original_description: string;
  language: Language;
  district_id: string;
  mandal: string;
  village: string;
  category: string;
  suggested_priority: Priority;
  confirmed_priority: Priority;
  suggested_department_id: string;
  assigned_department_id: string;
  assigned_officer_id: string | null;
  status: ComplaintStatus;
  ai_analysis_id: string | null;
  attachments: string[];
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  is_duplicate_of: string | null;
}

// ─── Complaint History ────────────────────────────────────────────────────────

export interface ComplaintHistory {
  id: string;
  complaint_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  previous_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  remarks: string;
  timestamp: string;
}

// ─── Duplicate Matches ────────────────────────────────────────────────────────

export interface DuplicateMatch {
  id: string;
  complaint_id: string;
  similar_complaint_id: string;
  similarity_score: number;
  review_status: 'pending' | 'confirmed' | 'dismissed';
  created_at: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  complaint_id: string | null;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  read_status: boolean;
  created_at: string;
}

// ─── Escalations ─────────────────────────────────────────────────────────────

export interface Escalation {
  id: string;
  complaint_id: string;
  escalation_level: number;
  escalated_to: string;
  reason: string;
  timestamp: string;
}

// ─── Resolution Feedback ──────────────────────────────────────────────────────

export interface ResolutionFeedback {
  id: string;
  complaint_id: string;
  citizen_id: string;
  satisfaction_rating: number; // 1-5
  comments: string;
  created_at: string;
}

// ─── Auth Session ─────────────────────────────────────────────────────────────

export interface AuthSession {
  user: User;
  officer?: Officer;
  token: string;
  expires_at: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_complaints: number;
  pending_complaints: number;
  resolved_complaints: number;
  critical_complaints: number;
  escalated_complaints: number;
  in_progress_complaints: number;
  avg_resolution_hours: number;
  ai_accuracy_rate: number;
}

export interface ComplaintsByDepartment {
  department: string;
  count: number;
  resolved: number;
  pending: number;
}

export interface ComplaintsByPriority {
  priority: Priority;
  count: number;
  percentage: number;
}

export interface DailyTrend {
  date: string;
  submitted: number;
  resolved: number;
}
