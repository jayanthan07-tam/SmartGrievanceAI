import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { complaintService } from '../../services/complaintService';
import { DEPARTMENTS } from '../../data/departments';
import { PriorityBadge, StatusBadge } from '../../components/ui';
import { formatDate, timeAgo } from '../../lib/utils';
import type { ComplaintStatus, Priority } from '../../types';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // If user is not logged in, demo defaults to citizen-1
  const citizenId = user?.id || 'u-citizen-1';
  const citizenName = user?.name || 'Ravi Kumar';
  const citizenEmail = user?.email || 'citizen@demo.com';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'complaints' | 'notifications'>('complaints');

  // Load complaints and notifications from complaintService
  const allComplaints = complaintService.getForCitizen(citizenId);
  const notifications = complaintService.getNotifications(citizenId);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return allComplaints.filter(c => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || c.confirmed_priority === priorityFilter;
      const matchesSearch = !searchQuery ||
        c.grievance_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mandal.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [allComplaints, statusFilter, priorityFilter, searchQuery]);

  // Compute stats
  const stats = useMemo(() => {
    const total = allComplaints.length;
    const resolved = allComplaints.filter(c => c.status === 'resolved').length;
    const inProgress = allComplaints.filter(c => ['in_progress', 'assigned', 'reopened'].includes(c.status)).length;
    const pending = allComplaints.filter(c => ['submitted', 'ai_analyzed', 'pending_review'].includes(c.status)).length;
    const critical = allComplaints.filter(c => c.confirmed_priority === 'critical' && c.status !== 'resolved').length;
    return { total, resolved, inProgress, pending, critical };
  }, [allComplaints]);

  const handleMarkNotification = (notifId: string) => {
    complaintService.markNotificationRead(notifId);
    setActiveTab(t => t);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Welcome & Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#0D9488] text-white flex items-center justify-center text-xl font-bold shadow-md">
                {citizenName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {citizenName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {t('Citizen Account')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>✉️ {citizenEmail}</span>
                  <span>•</span>
                  <span>{t('Preferred Dialect: Tamil / English')}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">✓ {t('Verified Phone')}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/register"
                className="px-4 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-xs font-bold hover:bg-blue-800 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>📝 {t('Register Grievance')}</span>
              </Link>
              <Link
                to="/track"
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all shadow-2xs"
              >
                🔍 {t('Track Any ID')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all"
                title={t('Sign out')}
              >
                {t('Sign out')}
              </button>
            </div>
          </div>
        </div>

        {/* Demo notification banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span>⚗️</span>
            <span><strong>{t('Citizen Workspace (Demo):')}</strong> {t('Displaying sample grievances filed under this test citizen account. Submissions update the local store in real time.')}</span>
          </div>
          <span className="font-mono text-[11px] bg-amber-100 px-2 py-0.5 rounded text-amber-800 font-semibold shrink-0">
            {t('LOCAL SANDBOX')}
          </span>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('Total Filed')}</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{t('Lifetime complaints')}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">{t('In Progress')}</span>
            <p className="text-2xl font-extrabold text-blue-700 mt-1">{stats.inProgress}</p>
            <span className="text-[11px] text-blue-600 mt-0.5 block">{t('Active field teams')}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{t('Pending Review')}</span>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.pending}</p>
            <span className="text-[11px] text-amber-600 mt-0.5 block">{t('AI triage audit')}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">{t('Resolved')}</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.resolved}</p>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">{t('Closed with proof')}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-2xs bg-rose-50/20 col-span-2 lg:col-span-1">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">{t('Critical Cases')}</span>
            <p className="text-2xl font-extrabold text-rose-700 mt-1">{stats.critical}</p>
            <span className="text-[11px] text-rose-600 mt-0.5 block">{t('Emergency priority')}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('complaints')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'complaints'
                  ? 'border-[#1D4ED8] text-[#1D4ED8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📋 {t('My Grievances')}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                {allComplaints.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'border-[#1D4ED8] text-[#1D4ED8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🔔 {t('Notifications & Alerts')}</span>
              {notifications.filter(n => !n.read_status).length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold animate-pulse">
                  {notifications.filter(n => !n.read_status).length} {t('new')}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: MY GRIEVANCES */}
          {activeTab === 'complaints' && (
            <div className="p-6 space-y-5">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('Search by ID, keyword, or mandal...')}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
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

              {/* Complaints List Table / Cards */}
              {filteredComplaints.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-3xl mb-2">📂</p>
                  <p className="text-sm font-semibold text-slate-700">{t('No complaints found')}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('Try adjusting your filters or file a new grievance.')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredComplaints.map(comp => {
                    const dept = DEPARTMENTS.find(d => d.id === comp.assigned_department_id);
                    return (
                      <div
                        key={comp.id}
                        className="py-4 hover:bg-slate-50/80 rounded-xl transition-colors px-3 -mx-3 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {comp.grievance_number}
                            </span>
                            <PriorityBadge priority={comp.confirmed_priority as Priority} />
                            <StatusBadge status={comp.status as ComplaintStatus} />
                            <span className="text-[11px] text-slate-400">
                              {t('Filed:')} {timeAgo(comp.created_at)}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {t(comp.title)}
                          </h3>

                          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                            <span>🏛️ {t(dept?.department_name || 'Department')}</span>
                            <span>•</span>
                            <span>📍 {comp.mandal} ({comp.village})</span>
                            <span>•</span>
                            <span>{t('Category')}: {t(comp.category)}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <Link
                            to={`/track?id=${comp.grievance_number}`}
                            className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <span>🔍 {t('Track Complaint')}</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="p-6 space-y-3">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-3xl mb-2">🔔</p>
                  <p className="text-sm font-semibold text-slate-700">{t('No notifications yet', 'No notifications yet')}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('You will receive automated updates when officers update your cases.', 'You will receive automated updates when officers update your cases.')}</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                      notif.read_status
                        ? 'bg-white border-slate-200'
                        : 'bg-blue-50/60 border-blue-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {notif.type === 'critical' ? '🚨' : notif.type === 'success' ? '✅' : '📢'}
                      </span>
                      <div>
                        <p className={`text-xs leading-relaxed ${notif.read_status ? 'text-slate-700' : 'text-slate-900 font-semibold'}`}>
                          {t(notif.message)}
                        </p>
                        <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                          {formatDate(notif.created_at, true)}
                        </span>
                      </div>
                    </div>

                    {!notif.read_status && (
                      <button
                        onClick={() => handleMarkNotification(notif.id)}
                        className="text-[11px] text-blue-600 hover:underline shrink-0 font-medium"
                      >
                        {t('Mark as Read')}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
