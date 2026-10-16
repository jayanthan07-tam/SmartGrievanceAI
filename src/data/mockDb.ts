/**
 * SmartGrievance AI — Demo Database (localStorage-backed)
 * All sample complaints have been removed so the user starts with a clean slate.
 * Seed users and officers are preserved for authentication and role dispatch.
 */

import type {
  User, Complaint, AIAnalysis, ComplaintHistory,
  DuplicateMatch, Notification, Officer, Escalation,
  ResolutionFeedback
} from '../types';

// Export reference to archived seed dataset if needed for historical reference
export {
  SEED_COMPLAINTS as SAMPLE_COMPLAINTS_ARCHIVE,
  SEED_AI_ANALYSIS as SAMPLE_AI_ANALYSIS_ARCHIVE,
  SEED_COMPLAINT_HISTORY as SAMPLE_HISTORY_ARCHIVE,
  SEED_NOTIFICATIONS as SAMPLE_NOTIFICATIONS_ARCHIVE,
} from './sampleComplaintsBackup';

// ─── Seed Users (Preserved for Auth) ──────────────────────────────────────────

export const SEED_USERS: User[] = [
  // Citizens
  { id: 'u-citizen-1', name: 'Ravi Kumar', email: 'citizen@demo.com', phone: '9876543210', password_hash: 'demo123', role: 'citizen', preferred_language: 'ta', created_at: '2026-09-01T10:00:00Z', is_active: true },
  { id: 'u-citizen-2', name: 'Lakshmi Devi', email: 'lakshmi@demo.com', phone: '9876543211', password_hash: 'demo123', role: 'citizen', preferred_language: 'ta', created_at: '2026-09-05T09:30:00Z', is_active: true },
  { id: 'u-citizen-3', name: 'Suresh Babu', email: 'suresh@demo.com', phone: '9876543212', password_hash: 'demo123', role: 'citizen', preferred_language: 'en', created_at: '2026-09-10T11:00:00Z', is_active: true },
  { id: 'u-citizen-4', name: 'Priya Sharma', email: 'priya@demo.com', phone: '9876543213', password_hash: 'demo123', role: 'citizen', preferred_language: 'en', created_at: '2026-09-12T14:00:00Z', is_active: true },
  { id: 'u-citizen-5', name: 'Muthu Selvam', email: 'muthu@demo.com', phone: '9876543214', password_hash: 'demo123', role: 'citizen', preferred_language: 'ta', created_at: '2026-09-15T08:00:00Z', is_active: true },
  { id: 'u-citizen-6', name: 'Anitha Reddy', email: 'anitha@demo.com', phone: '9876543215', password_hash: 'demo123', role: 'citizen', preferred_language: 'ta', created_at: '2026-09-18T16:00:00Z', is_active: true },
  { id: 'u-citizen-7', name: 'Ramesh Naidu', email: 'ramesh@demo.com', phone: '9876543216', password_hash: 'demo123', role: 'citizen', preferred_language: 'ta', created_at: '2026-09-20T12:00:00Z', is_active: true },
  // Officers
  { id: 'u-officer-1', name: 'K. Venkatesh Rao', email: 'officer@demo.com', phone: '9876500001', password_hash: 'demo123', role: 'officer', preferred_language: 'en', created_at: '2026-08-01T09:00:00Z', is_active: true },
  { id: 'u-officer-2', name: 'Dr. Padma Priya', email: 'officer2@demo.com', phone: '9876500002', password_hash: 'demo123', role: 'officer', preferred_language: 'ta', created_at: '2026-08-01T09:00:00Z', is_active: true },
  { id: 'u-officer-3', name: 'Subrahmanyam J.', email: 'officer3@demo.com', phone: '9876500003', password_hash: 'demo123', role: 'officer', preferred_language: 'en', created_at: '2026-08-01T09:00:00Z', is_active: true },
  // District Admin
  { id: 'u-dadmin-1', name: 'Collector Srinivasa Murthy', email: 'districtadmin@demo.com', phone: '9876600001', password_hash: 'demo123', role: 'district_admin', preferred_language: 'en', created_at: '2026-07-01T09:00:00Z', is_active: true },
  // Super Admin
  { id: 'u-sadmin-1', name: 'System Administrator', email: 'admin@demo.com', phone: '9876700001', password_hash: 'demo123', role: 'super_admin', preferred_language: 'en', created_at: '2026-06-01T09:00:00Z', is_active: true },
];

export const SEED_OFFICERS: Officer[] = [
  { id: 'off-1', user_id: 'u-officer-1', department_id: 'dept-water-supply', district_id: 'dist-chennai', designation: 'Assistant Engineer', cases_assigned: 0, cases_resolved: 0 },
  { id: 'off-2', user_id: 'u-officer-2', department_id: 'dept-health', district_id: 'dist-chennai', designation: 'District Medical Officer', cases_assigned: 0, cases_resolved: 0 },
  { id: 'off-3', user_id: 'u-officer-3', department_id: 'dept-electricity', district_id: 'dist-coimbatore', designation: 'Electrical Supervisor', cases_assigned: 0, cases_resolved: 0 },
];

// ─── Active Demo Datasets (Starts Empty for Fresh Registration) ───────────────

export const SEED_COMPLAINTS: Complaint[] = [];
export const SEED_AI_ANALYSIS: AIAnalysis[] = [];
export const SEED_COMPLAINT_HISTORY: ComplaintHistory[] = [];
export const SEED_DUPLICATE_MATCHES: DuplicateMatch[] = [];
export const SEED_ESCALATIONS: Escalation[] = [];
export const SEED_NOTIFICATIONS: Notification[] = [];
export const SEED_RESOLUTION_FEEDBACK: ResolutionFeedback[] = [];

// ─── Database Keys ────────────────────────────────────────────────────────────

export const DB_KEYS = {
  USERS: 'sgai_users',
  COMPLAINTS: 'sgai_complaints',
  AI_ANALYSIS: 'sgai_ai_analysis',
  COMPLAINT_HISTORY: 'sgai_complaint_history',
  DUPLICATE_MATCHES: 'sgai_duplicate_matches',
  NOTIFICATIONS: 'sgai_notifications',
  ESCALATIONS: 'sgai_escalations',
  RESOLUTION_FEEDBACK: 'sgai_resolution_feedback',
  OFFICERS: 'sgai_officers',
  SESSION: 'sgai_session',
  INITIALIZED: 'sgai_initialized',
};

// ─── Database Initialization & Migration ─────────────────────────────────────

export function initializeDatabase(): void {
  try {
    // 1. Clean up known sample complaints while safely protecting any real user complaints
    const rawComplaints = localStorage.getItem(DB_KEYS.COMPLAINTS);
    const sampleIdSet = new Set(Array.from({ length: 32 }, (_, i) => `comp-${String(i + 1).padStart(3, '0')}`));

    if (rawComplaints) {
      try {
        const parsed = JSON.parse(rawComplaints) as Complaint[];
        if (Array.isArray(parsed)) {
          // Backup previous state if not already backed up
          if (!localStorage.getItem('sgai_complaints_backup_archive')) {
            localStorage.setItem('sgai_complaints_backup_archive', rawComplaints);
          }
          // Remove only known sample records (comp-001 through comp-032)
          const realComplaints = parsed.filter(c => !sampleIdSet.has(c.id));
          localStorage.setItem(DB_KEYS.COMPLAINTS, JSON.stringify(realComplaints));
          localStorage.setItem('sgai_complaints_backup', JSON.stringify(realComplaints));
        }
      } catch (err) {
        console.error('[SmartGrievance AI] Error cleaning up sample complaints:', err);
        localStorage.setItem(DB_KEYS.COMPLAINTS, JSON.stringify([]));
        localStorage.setItem('sgai_complaints_backup', JSON.stringify([]));
      }
    } else {
      localStorage.setItem(DB_KEYS.COMPLAINTS, JSON.stringify([]));
      localStorage.setItem('sgai_complaints_backup', JSON.stringify([]));
    }

    // Clean up sample notifications, analyses, history, duplicates, escalations, feedback
    const sampleNotifIds = new Set(['notif-001', 'notif-002', 'notif-003', 'notif-004', 'notif-005', 'notif-006']);
    const rawNotifs = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
    if (rawNotifs) {
      try {
        const notifs = JSON.parse(rawNotifs) as Notification[];
        if (Array.isArray(notifs)) {
          const realNotifs = notifs.filter(n => !sampleNotifIds.has(n.id) && !(n.complaint_id && sampleIdSet.has(n.complaint_id)));
          localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(realNotifs));
        }
      } catch {}
    } else {
      localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }

    const rawAi = localStorage.getItem(DB_KEYS.AI_ANALYSIS);
    if (rawAi) {
      try {
        const analyses = JSON.parse(rawAi) as AIAnalysis[];
        if (Array.isArray(analyses)) {
          const realAnalyses = analyses.filter(a => !sampleIdSet.has(a.complaint_id));
          localStorage.setItem(DB_KEYS.AI_ANALYSIS, JSON.stringify(realAnalyses));
        }
      } catch {}
    } else {
      localStorage.setItem(DB_KEYS.AI_ANALYSIS, JSON.stringify([]));
    }

    const rawHist = localStorage.getItem(DB_KEYS.COMPLAINT_HISTORY);
    if (rawHist) {
      try {
        const hist = JSON.parse(rawHist) as ComplaintHistory[];
        if (Array.isArray(hist)) {
          const realHist = hist.filter(h => !sampleIdSet.has(h.complaint_id));
          localStorage.setItem(DB_KEYS.COMPLAINT_HISTORY, JSON.stringify(realHist));
        }
      } catch {}
    } else {
      localStorage.setItem(DB_KEYS.COMPLAINT_HISTORY, JSON.stringify([]));
    }

    const rawDups = localStorage.getItem(DB_KEYS.DUPLICATE_MATCHES);
    if (rawDups) {
      try {
        const dups = JSON.parse(rawDups) as DuplicateMatch[];
        if (Array.isArray(dups)) {
          const realDups = dups.filter(d => !sampleIdSet.has(d.complaint_id) && !sampleIdSet.has(d.similar_complaint_id));
          localStorage.setItem(DB_KEYS.DUPLICATE_MATCHES, JSON.stringify(realDups));
        }
      } catch {}
    } else {
      localStorage.setItem(DB_KEYS.DUPLICATE_MATCHES, JSON.stringify([]));
    }

    const rawEsc = localStorage.getItem(DB_KEYS.ESCALATIONS);
    if (rawEsc) {
      try {
        const esc = JSON.parse(rawEsc) as Escalation[];
        if (Array.isArray(esc)) {
          const realEsc = esc.filter(e => !sampleIdSet.has(e.complaint_id));
          localStorage.setItem(DB_KEYS.ESCALATIONS, JSON.stringify(realEsc));
        }
      } catch {}
    } else {
      localStorage.setItem(DB_KEYS.ESCALATIONS, JSON.stringify([]));
    }

    const rawFb = localStorage.getItem(DB_KEYS.RESOLUTION_FEEDBACK);
    if (rawFb) {
      try {
        const fb = JSON.parse(rawFb) as ResolutionFeedback[];
        if (Array.isArray(fb)) {
          const realFb = fb.filter(f => !sampleIdSet.has(f.complaint_id));
          localStorage.setItem(DB_KEYS.RESOLUTION_FEEDBACK, JSON.stringify(realFb));
        }
      } catch {}
    } else {
      localStorage.setItem(DB_KEYS.RESOLUTION_FEEDBACK, JSON.stringify([]));
    }

    // Clean up session complaint IDs pointing to sample complaints
    const rawSession = localStorage.getItem('sgai_session_complaints');
    if (rawSession) {
      try {
        const sessionIds = JSON.parse(rawSession) as string[];
        if (Array.isArray(sessionIds)) {
          const realSessionIds = sessionIds.filter(id => !sampleIdSet.has(id));
          localStorage.setItem('sgai_session_complaints', JSON.stringify(realSessionIds));
        }
      } catch {}
    }

    // 2. Initialize USERS safely (preserve all user accounts)
    const rawUsers = localStorage.getItem(DB_KEYS.USERS);
    if (!rawUsers || rawUsers === '[]') {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_USERS));
    } else {
      try {
        const parsedUsers = JSON.parse(rawUsers);
        if (Array.isArray(parsedUsers)) {
          const userEmails = new Set(parsedUsers.map((u: any) => (u.email || '').toLowerCase()));
          const missingUsers = SEED_USERS.filter(s => !userEmails.has(s.email.toLowerCase()));
          if (missingUsers.length > 0) {
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify([...parsedUsers, ...missingUsers]));
          }
        }
      } catch (e) {
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_USERS));
      }
    }

    // 3. Initialize OFFICERS safely
    if (!localStorage.getItem(DB_KEYS.OFFICERS)) {
      localStorage.setItem(DB_KEYS.OFFICERS, JSON.stringify(SEED_OFFICERS));
    }

    localStorage.setItem(DB_KEYS.INITIALIZED, 'true');
  } catch (err) {
    console.error('[SmartGrievance AI] Storage initialization error:', err);
  }
}

export function resetDatabase(): void {
  Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('sgai_session_complaints');
  localStorage.removeItem('sgai_complaints_backup');
  initializeDatabase();
}

// ─── Generic CRUD helpers ──────────────────────────────────────────────────────

export function getAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {}
    }

    // If key is complaints, return empty list (never repopulate sample complaints)
    if (key === DB_KEYS.COMPLAINTS) {
      return [];
    }

    // If key is users and raw is empty, return default users
    if (key === DB_KEYS.USERS) {
      return (SEED_USERS as unknown as T[]);
    }

    // If key is officers and raw is empty, return default officers
    if (key === DB_KEYS.OFFICERS) {
      return (SEED_OFFICERS as unknown as T[]);
    }

    return [];
  } catch (err) {
    console.error(`[SmartGrievance AI] Error reading localStorage key: ${key}`, err);
    return [];
  }
}

export function getById<T extends { id: string }>(key: string, id: string): T | null {
  const items = getAll<T>(key);
  return items.find((item) => item.id === id) ?? null;
}

export function insert<T extends { id: string }>(key: string, item: T): T {
  const items = getAll<T>(key);
  const existingIdx = items.findIndex((i) => i.id === item.id);
  if (existingIdx !== -1) {
    items[existingIdx] = { ...items[existingIdx], ...item };
  } else {
    items.unshift(item); // Keep newest items first
  }
  localStorage.setItem(key, JSON.stringify(items));
  if (key === DB_KEYS.COMPLAINTS) {
    localStorage.setItem('sgai_complaints_backup', JSON.stringify(items));
  }
  return item;
}

export function updateById<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getAll<T>(key);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  localStorage.setItem(key, JSON.stringify(items));
  if (key === DB_KEYS.COMPLAINTS) {
    localStorage.setItem('sgai_complaints_backup', JSON.stringify(items));
  }
  return items[idx];
}

export function deleteById<T extends { id: string }>(key: string, id: string): boolean {
  const items = getAll<T>(key);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  localStorage.setItem(key, JSON.stringify(filtered));
  if (key === DB_KEYS.COMPLAINTS) {
    localStorage.setItem('sgai_complaints_backup', JSON.stringify(filtered));
  }
  return true;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function generateGrievanceNumber(): string {
  const complaints = getAll<Complaint>(DB_KEYS.COMPLAINTS);
  let maxNum = 0;
  for (const c of complaints) {
    const match = c.grievance_number.match(/SGAI-\d+-(\d+)/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    }
  }
  const nextNum = Math.max(maxNum + 1, complaints.length + 1);
  return `SGAI-2026-${String(nextNum).padStart(6, '0')}`;
}
