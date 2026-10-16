import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { complaintService } from '../../services/complaintService';
import { DEPARTMENTS } from '../../data/departments';
import { PriorityBadge, StatusBadge } from '../../components/ui';

type Role = 'officer' | 'district_admin' | 'super_admin';
const roleInfo: Record<Role, { title: string; subtitle: string }> = {
  officer: {
    title: 'Officer Desk',
    subtitle: 'Review assigned grievances, verify AI suggestions and update case status.'
  },
  district_admin: {
    title: 'District Administration',
    subtitle: 'Monitor district-wide cases, escalations and department response.'
  },
  super_admin: {
    title: 'System Administration',
    subtitle: 'Review overall grievance volume and operational status across the demo portal.'
  },
};

export default function RoleDashboard({ role }: { role: Role }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deptScope, setDeptScope] = useState<'all' | 'dept'>(role === 'officer' ? 'dept' : 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [refreshCount, setRefreshCount] = useState(0);

  // Re-read complaints from complaintService whenever refreshCount changes
  const allComplaints = useMemo(() => {
    return complaintService.getAll();
  }, [refreshCount]);

  // Officer department
  const officerDeptId = useMemo(() => {
    if (role === 'officer') {
      return 'dept-water-supply'; // Default demo officer department
    }
    return null;
  }, [role]);

  // Filter complaints
  const filtered = useMemo(() => {
    return allComplaints.filter(c => {
      // Department filter for officer desk
      if (role === 'officer' && deptScope === 'dept' && officerDeptId) {
        if (c.assigned_department_id !== officerDeptId) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && c.confirmed_priority !== priorityFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = c.grievance_number.toLowerCase().includes(q);
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesMandal = c.mandal.toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        if (!matchesNum && !matchesTitle && !matchesMandal && !matchesCat) return false;
      }

      return true;
    });
  }, [allComplaints, role, deptScope, officerDeptId, statusFilter, priorityFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, searchQuery, deptScope]);

  // Pagination slicing
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Metrics
  const active = allComplaints.filter(c => c.status !== 'resolved');
  const critical = active.filter(c => c.confirmed_priority === 'critical');
  const pending = active.filter(c => ['submitted', 'ai_analyzed', 'pending_review'].includes(c.status));

  const stats = [
    { label: t('Total complaints'), value: allComplaints.length },
    { label: t('Active cases'), value: active.length },
    { label: t('Critical active'), value: critical.length },
    { label: t('Awaiting review'), value: pending.length },
  ];

  const info = roleInfo[role];

  return (
    <section className="min-h-[70vh] bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
              {t('Operations portal')}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{t(info.title)}</h1>
            <p className="mt-2 text-slate-600">{t(info.subtitle)}</p>
            <p className="mt-2 text-xs text-slate-500">
              {t('Signed in as')} {user?.name || 'Demo operator'} · {t(role.replace('_', ' '))}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRefreshCount(c => c + 1)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              title={t('Refresh data')}
            >
              <span>🔄</span> {t('Refresh')}
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              {t('Sign out')}
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Complaints Table Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table Header & Controls */}
          <div className="border-b border-slate-100 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <span>📋</span> {t('Grievance Records')} ({filtered.length})
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {t('Showing live records from the local browser store. Click any grievance to inspect.')}
                </p>
              </div>
              <Link to="/track" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                {t('Open tracking →')}
              </Link>
            </div>

            {/* Officer Scope Toggle if Officer */}
            {role === 'officer' && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">{t('Scope:')}</span>
                <button
                  type="button"
                  onClick={() => setDeptScope('dept')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    deptScope === 'dept'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🏛️ {t('Water Supply Department')}
                </button>
                <button
                  type="button"
                  onClick={() => setDeptScope('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    deptScope === 'all'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🌐 {t('All District Grievances')} ({allComplaints.length})
                </button>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('Search by ID, keyword, or mandal...')}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
                >
                  <option value="all">{t('All Statuses')}</option>
                  <option value="in_progress">{t('In Progress')}</option>
                  <option value="assigned">{t('Assigned')}</option>
                  <option value="pending_review">{t('Pending Review')}</option>
                  <option value="resolved">{t('Resolved')}</option>
                  <option value="reopened">{t('Reopened')}</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
                >
                  <option value="all">{t('All Priorities')}</option>
                  <option value="critical">{t('Critical')}</option>
                  <option value="high">{t('High')}</option>
                  <option value="medium">{t('Medium')}</option>
                  <option value="low">{t('Low')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {paginatedComplaints.length === 0 ? (
              <div className="py-12 text-center text-slate-400 p-8">
                <p className="text-3xl mb-2">📂</p>
                <p className="text-sm font-semibold text-slate-700">{t('No complaints found')}</p>
                <p className="text-xs text-slate-500 mt-1">{t('Try adjusting your search query or filter options.')}</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">{t('Grievance')}</th>
                    <th className="px-5 py-3">{t('Department')}</th>
                    <th className="px-5 py-3">{t('Priority')}</th>
                    <th className="px-5 py-3">{t('Status')}</th>
                    <th className="px-5 py-3 text-right">{t('Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedComplaints.map(c => {
                    const dept = DEPARTMENTS.find(d => d.id === c.assigned_department_id);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <Link
                            to={`/track?id=${c.grievance_number}`}
                            className="font-bold text-blue-700 hover:underline flex items-center gap-1.5"
                          >
                            <span>{c.grievance_number}</span>
                          </Link>
                          <div className="mt-1 max-w-md truncate text-slate-600 text-xs">{t(c.title)}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{c.mandal}, {c.village}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-slate-700">
                          {dept ? t(dept.department_name) : t(c.category)}
                        </td>
                        <td className="px-5 py-4"><PriorityBadge priority={c.confirmed_priority} /></td>
                        <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/track?id=${c.grievance_number}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors inline-block"
                          >
                            {t('Inspect →')}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {filtered.length > pageSize && (
            <div className="border-t border-slate-100 px-5 py-3.5 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                {t('Showing')} <strong>{(currentPage - 1) * pageSize + 1}</strong> {t('to')}{' '}
                <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> {t('of')}{' '}
                <strong>{filtered.length}</strong> {t('grievances')}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  ← {t('Previous')}
                </button>
                <span className="px-2 font-mono font-semibold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {t('Next')} →
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {t('Prototype note: these role dashboards use local mock data and are not a production access-control boundary. Connect a secure backend before real-world use.')}
        </p>
      </div>
    </section>
  );
}
