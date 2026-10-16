import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Priority, ComplaintStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, includeTime = false): string {
  const d = new Date(dateStr);
  const opts: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };
  return d.toLocaleDateString('en-IN', opts);
}

export function timeAgo(dateStr: string): string {
  const now = new Date().getTime();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return formatDate(dateStr);
}

export function getPriorityConfig(priority: Priority) {
  const configs = {
    critical: {
      label: 'Critical',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'badge-critical',
      dot: 'bg-red-500',
      icon: '🔴',
    },
    high: {
      label: 'High',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'badge-high',
      dot: 'bg-amber-500',
      icon: '🟠',
    },
    medium: {
      label: 'Medium',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      badge: 'badge-medium',
      dot: 'bg-sky-500',
      icon: '🟡',
    },
    low: {
      label: 'Low',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'badge-low',
      dot: 'bg-emerald-500',
      icon: '🟢',
    },
  };
  return configs[priority];
}

export function getStatusConfig(status: ComplaintStatus) {
  const configs: Record<ComplaintStatus, { label: string; badge: string; icon: string }> = {
    submitted: { label: 'Submitted', badge: 'status-submitted', icon: '📥' },
    ai_analyzed: { label: 'AI Analyzed', badge: 'status-analyzed', icon: '🤖' },
    pending_review: { label: 'Pending Review', badge: 'status-pending', icon: '⏳' },
    assigned: { label: 'Assigned', badge: 'status-assigned', icon: '👤' },
    in_progress: { label: 'In Progress', badge: 'status-in-progress', icon: '⚙️' },
    more_info_required: { label: 'More Info Required', badge: 'status-more-info', icon: '❓' },
    reassigned: { label: 'Reassigned', badge: 'status-reassigned', icon: '🔄' },
    escalated: { label: 'Escalated', badge: 'status-escalated', icon: '⬆️' },
    resolved: { label: 'Resolved', badge: 'status-resolved', icon: '✅' },
    reopened: { label: 'Reopened', badge: 'status-reopened', icon: '🔁' },
  };
  return configs[status];
}

export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English',
    ta: 'Tamil',
  };
  return names[code] || code;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.substring(0, len).trim() + '...';
}

export function generateColor(str: string): string {
  const colors = [
    '#1d4ed8', '#0d9488', '#7c3aed', '#dc2626', '#d97706',
    '#059669', '#2563eb', '#9333ea', '#0891b2', '#65a30d',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getPriorityOrder(priority: Priority): number {
  const order = { critical: 4, high: 3, medium: 2, low: 1 };
  return order[priority];
}
