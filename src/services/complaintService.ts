/**
 * Complaint Service — All complaint CRUD operations
 */

import type {
  Complaint, AIAnalysis, ComplaintHistory, ComplaintStatus,
  DuplicateMatch, Notification, Priority, Escalation
} from '../types';
import {
  DB_KEYS, getAll, getById, insert, updateById,
  generateId, generateGrievanceNumber
} from '../data/mockDb';
import { classifyComplaint, buildAIAnalysis, detectDuplicates } from './aiClassifier';

// ─── Complaint Queries ────────────────────────────────────────────────────────

export const complaintService = {
  // Get all complaints
  getAll(): Complaint[] {
    return getAll<Complaint>(DB_KEYS.COMPLAINTS);
  },

  // Get by ID
  getById(id: string): Complaint | null {
    return getById<Complaint>(DB_KEYS.COMPLAINTS, id);
  },

  // Get by grievance number (supports format with or without # and case-insensitively)
  getByGrievanceNumber(num: string): Complaint | null {
    if (!num) return null;
    const clean = num.replace(/^#/, '').trim().toUpperCase();
    const complaints = getAll<Complaint>(DB_KEYS.COMPLAINTS);
    const found = complaints.find(c => c.grievance_number.trim().toUpperCase() === clean);
    if (found) return found;

    // Check backup store
    try {
      const backupRaw = localStorage.getItem('sgai_complaints_backup');
      if (backupRaw) {
        const backupList = JSON.parse(backupRaw) as Complaint[];
        if (Array.isArray(backupList)) {
          const backupFound = backupList.find(c => c.grievance_number.trim().toUpperCase() === clean);
          if (backupFound) return backupFound;
        }
      }
    } catch {}

    return null;
  },

  // Get for citizen (matches by ID, email, or session-submitted complaint IDs)
  getForCitizen(citizenId: string, email?: string, sessionIds?: string[]): Complaint[] {
    const complaints = getAll<Complaint>(DB_KEYS.COMPLAINTS);
    const sIds = new Set(sessionIds || []);
    return complaints.filter(c => {
      if (c.citizen_id === citizenId) return true;
      if (email && c.citizen_id && c.citizen_id.toLowerCase() === email.toLowerCase()) return true;
      if (sIds.has(c.id) || sIds.has(c.grievance_number)) return true;
      return false;
    });
  },

  // Get for officer's department
  getForDepartment(departmentId: string, districtId?: string): Complaint[] {
    return getAll<Complaint>(DB_KEYS.COMPLAINTS).filter(c => {
      const deptMatch = c.assigned_department_id === departmentId;
      const districtMatch = districtId ? c.district_id === districtId : true;
      return deptMatch && districtMatch;
    });
  },

  // Get for district admin
  getForDistrict(districtId: string): Complaint[] {
    return getAll<Complaint>(DB_KEYS.COMPLAINTS).filter(c => c.district_id === districtId);
  },

  // Submit new complaint
  async submit(data: {
    citizen_id: string;
    title: string;
    description: string;
    language: string;
    district_id: string;
    mandal: string;
    village: string;
    preferred_language?: string;
    location_lat?: number;
    location_lng?: number;
  }): Promise<{ complaint: Complaint; analysis: AIAnalysis; duplicates: DuplicateMatch[] }> {
    const complaintId = generateId('comp');
    const grievanceNumber = generateGrievanceNumber();

    // Run AI Classification
    const classResult = classifyComplaint(data.title, data.description);
    const aiAnalysis = buildAIAnalysis(complaintId, classResult);

    // Create complaint
    const complaint: Complaint = {
      id: complaintId,
      grievance_number: grievanceNumber,
      citizen_id: data.citizen_id,
      title: data.title,
      original_description: data.description,
      language: (data.language as any) || 'en',
      district_id: data.district_id,
      mandal: data.mandal,
      village: data.village,
      category: classResult.category,
      suggested_priority: classResult.priority,
      confirmed_priority: classResult.priority,
      suggested_department_id: classResult.department_id,
      assigned_department_id: classResult.department_id,
      assigned_officer_id: null,
      status: 'ai_analyzed',
      ai_analysis_id: aiAnalysis.id,
      attachments: [],
      location_lat: data.location_lat ?? null,
      location_lng: data.location_lng ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: null,
      is_duplicate_of: null,
    };

    // Save to DB
    insert<AIAnalysis>(DB_KEYS.AI_ANALYSIS, aiAnalysis);
    insert<Complaint>(DB_KEYS.COMPLAINTS, complaint);

    // Add to history
    const historyEntry: ComplaintHistory = {
      id: generateId('hist'),
      complaint_id: complaintId,
      actor_id: 'system',
      actor_name: 'SmartGrievance AI',
      actor_role: 'super_admin',
      action: 'Complaint submitted and AI analyzed',
      previous_status: null,
      new_status: 'ai_analyzed',
      remarks: `Auto-classified: ${classResult.category}. Priority: ${classResult.priority.toUpperCase()}. Department: ${classResult.department_id}. Confidence: ${classResult.confidence}%.`,
      timestamp: new Date().toISOString(),
    };
    insert<ComplaintHistory>(DB_KEYS.COMPLAINT_HISTORY, historyEntry);

    // Duplicate detection
    const existingComplaints = getAll<Complaint>(DB_KEYS.COMPLAINTS)
      .filter(c => c.id !== complaintId)
      .map(c => ({
        id: c.id,
        title: c.title,
        original_description: c.original_description,
        district_id: c.district_id,
        mandal: c.mandal,
      }));

    const dupResults = detectDuplicates(
      data.title,
      data.description,
      data.district_id,
      data.mandal,
      existingComplaints
    );

    const savedDuplicates: DuplicateMatch[] = [];
    for (const dup of dupResults) {
      const dupMatch: DuplicateMatch = {
        id: generateId('dup'),
        complaint_id: complaintId,
        similar_complaint_id: dup.complaint_id,
        similarity_score: dup.similarity_score,
        review_status: 'pending',
        created_at: new Date().toISOString(),
      };
      insert<DuplicateMatch>(DB_KEYS.DUPLICATE_MATCHES, dupMatch);
      savedDuplicates.push(dupMatch);
    }

    // Send citizen notification
    const notification: Notification = {
      id: generateId('notif'),
      user_id: data.citizen_id,
      complaint_id: complaintId,
      message: `Your complaint ${grievanceNumber} has been received and AI-analyzed. Category: ${classResult.category}. Priority: ${classResult.priority.toUpperCase()}. We will update you as the case progresses.`,
      type: classResult.priority === 'critical' ? 'critical' : 'info',
      read_status: false,
      created_at: new Date().toISOString(),
    };
    insert<Notification>(DB_KEYS.NOTIFICATIONS, notification);

    return { complaint, analysis: aiAnalysis, duplicates: savedDuplicates };
  },

  // Update status (officer action)
  updateStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    actorId: string,
    actorName: string,
    actorRole: string,
    remarks: string
  ): Complaint | null {
    const complaint = getById<Complaint>(DB_KEYS.COMPLAINTS, complaintId);
    if (!complaint) return null;

    const previousStatus = complaint.status;
    const updates: Partial<Complaint> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const updated = updateById<Complaint>(DB_KEYS.COMPLAINTS, complaintId, updates);

    // Add history
    const historyEntry: ComplaintHistory = {
      id: generateId('hist'),
      complaint_id: complaintId,
      actor_id: actorId,
      actor_name: actorName,
      actor_role: actorRole as any,
      action: `Status updated to ${newStatus.replace(/_/g, ' ')}`,
      previous_status: previousStatus,
      new_status: newStatus,
      remarks,
      timestamp: new Date().toISOString(),
    };
    insert<ComplaintHistory>(DB_KEYS.COMPLAINT_HISTORY, historyEntry);

    // Notify citizen
    const citizenNotif: Notification = {
      id: generateId('notif'),
      user_id: complaint.citizen_id,
      complaint_id: complaintId,
      message: `Update on ${complaint.grievance_number}: Status changed to "${newStatus.replace(/_/g, ' ')}". ${remarks ? `Officer note: ${remarks}` : ''}`,
      type: newStatus === 'resolved' ? 'success' : newStatus === 'escalated' ? 'warning' : 'info',
      read_status: false,
      created_at: new Date().toISOString(),
    };
    insert<Notification>(DB_KEYS.NOTIFICATIONS, citizenNotif);

    return updated;
  },

  // Correct AI department routing (officer)
  correctDepartment(
    complaintId: string,
    newDepartmentId: string,
    actorId: string,
    actorName: string,
    reason: string
  ): Complaint | null {
    const complaint = getById<Complaint>(DB_KEYS.COMPLAINTS, complaintId);
    if (!complaint) return null;

    const updated = updateById<Complaint>(DB_KEYS.COMPLAINTS, complaintId, {
      assigned_department_id: newDepartmentId,
      updated_at: new Date().toISOString(),
    });

    const historyEntry: ComplaintHistory = {
      id: generateId('hist'),
      complaint_id: complaintId,
      actor_id: actorId,
      actor_name: actorName,
      actor_role: 'officer',
      action: 'AI department routing corrected by officer',
      previous_status: complaint.status,
      new_status: complaint.status,
      remarks: `Department changed. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
    };
    insert<ComplaintHistory>(DB_KEYS.COMPLAINT_HISTORY, historyEntry);

    return updated;
  },

  // Correct priority (officer)
  correctPriority(
    complaintId: string,
    newPriority: Priority,
    actorId: string,
    actorName: string,
    reason: string
  ): Complaint | null {
    const complaint = getById<Complaint>(DB_KEYS.COMPLAINTS, complaintId);
    if (!complaint) return null;

    const updated = updateById<Complaint>(DB_KEYS.COMPLAINTS, complaintId, {
      confirmed_priority: newPriority,
      updated_at: new Date().toISOString(),
    });

    const historyEntry: ComplaintHistory = {
      id: generateId('hist'),
      complaint_id: complaintId,
      actor_id: actorId,
      actor_name: actorName,
      actor_role: 'officer',
      action: `Priority corrected to ${newPriority.toUpperCase()}`,
      previous_status: complaint.status,
      new_status: complaint.status,
      remarks: `Priority changed from ${complaint.suggested_priority} to ${newPriority}. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
    };
    insert<ComplaintHistory>(DB_KEYS.COMPLAINT_HISTORY, historyEntry);

    return updated;
  },

  // Assign officer
  assignOfficer(complaintId: string, officerId: string, officerName: string): Complaint | null {
    const updated = updateById<Complaint>(DB_KEYS.COMPLAINTS, complaintId, {
      assigned_officer_id: officerId,
      status: 'assigned',
      updated_at: new Date().toISOString(),
    });

    const historyEntry: ComplaintHistory = {
      id: generateId('hist'),
      complaint_id: complaintId,
      actor_id: officerId,
      actor_name: officerName,
      actor_role: 'officer',
      action: 'Officer assigned',
      previous_status: 'pending_review',
      new_status: 'assigned',
      remarks: `Assigned to officer: ${officerName}`,
      timestamp: new Date().toISOString(),
    };
    insert<ComplaintHistory>(DB_KEYS.COMPLAINT_HISTORY, historyEntry);

    return updated;
  },

  // Escalate
  escalate(complaintId: string, reason: string, escalatedTo: string): boolean {
    const complaint = getById<Complaint>(DB_KEYS.COMPLAINTS, complaintId);
    if (!complaint) return false;

    updateById<Complaint>(DB_KEYS.COMPLAINTS, complaintId, {
      status: 'escalated',
      updated_at: new Date().toISOString(),
    });

    const escalation: Escalation = {
      id: generateId('esc'),
      complaint_id: complaintId,
      escalation_level: 1,
      escalated_to: escalatedTo,
      reason,
      timestamp: new Date().toISOString(),
    };
    insert<Escalation>(DB_KEYS.ESCALATIONS, escalation);

    const historyEntry: ComplaintHistory = {
      id: generateId('hist'),
      complaint_id: complaintId,
      actor_id: 'system',
      actor_name: 'Auto-Escalation Engine',
      actor_role: 'super_admin',
      action: 'Complaint escalated',
      previous_status: complaint.status,
      new_status: 'escalated',
      remarks: reason,
      timestamp: new Date().toISOString(),
    };
    insert<ComplaintHistory>(DB_KEYS.COMPLAINT_HISTORY, historyEntry);

    return true;
  },

  // Get history for a complaint
  getHistory(complaintId: string): ComplaintHistory[] {
    return getAll<ComplaintHistory>(DB_KEYS.COMPLAINT_HISTORY)
      .filter(h => h.complaint_id === complaintId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  // Get AI analysis for complaint
  getAnalysis(complaintId: string): AIAnalysis | null {
    return getAll<AIAnalysis>(DB_KEYS.AI_ANALYSIS)
      .find(a => a.complaint_id === complaintId) ?? null;
  },

  // Get duplicate matches for complaint
  getDuplicates(complaintId: string): DuplicateMatch[] {
    return getAll<DuplicateMatch>(DB_KEYS.DUPLICATE_MATCHES)
      .filter(d => d.complaint_id === complaintId);
  },

  // Get notifications for user
  getNotifications(userId: string): Notification[] {
    return getAll<Notification>(DB_KEYS.NOTIFICATIONS)
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Mark notification read
  markNotificationRead(notifId: string): void {
    updateById<Notification>(DB_KEYS.NOTIFICATIONS, notifId, { read_status: true });
  },

  // Get escalations for complaint
  getEscalations(complaintId: string): Escalation[] {
    return getAll<Escalation>(DB_KEYS.ESCALATIONS)
      .filter(e => e.complaint_id === complaintId);
  },

  // Analytics helpers
  getStats(complaints: Complaint[]) {
    const total = complaints.length;
    const pending = complaints.filter(c => ['submitted', 'ai_analyzed', 'pending_review'].includes(c.status)).length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const critical = complaints.filter(c => c.confirmed_priority === 'critical' && c.status !== 'resolved').length;
    const escalated = complaints.filter(c => c.status === 'escalated').length;
    const in_progress = complaints.filter(c => c.status === 'in_progress').length;

    const resolvedComplaints = complaints.filter(c => c.resolved_at && c.created_at);
    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((sum, c) => {
        const diff = new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime();
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedComplaints.length);
    }

    return { total, pending, resolved, critical, escalated, in_progress, avgResolutionHours };
  },
};
