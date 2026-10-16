import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { DEPARTMENTS } from '../data/departments';
import { TN_DISTRICTS } from '../data/districts';
import { PriorityBadge, StatusBadge } from '../components/ui';
import { formatDate, timeAgo } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import type { Complaint, AIAnalysis, ComplaintHistory } from '../types';

export default function TrackComplaintPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const [inputVal, setInputVal] = useState(queryId);
  const [currentId, setCurrentId] = useState(queryId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [history, setHistory] = useState<ComplaintHistory[]>([]);
  const [notFound, setNotFound] = useState(false);

  // Modal states for interactive actions
  const [reopenModal, setReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Sync when searchParams changes (e.g. from navigation)
  useEffect(() => {
    const q = searchParams.get('id');
    if (q && q.trim()) {
      setInputVal(q.trim());
      setCurrentId(q.trim());
    }
  }, [searchParams]);

  // Load complaint data
  useEffect(() => {
    if (!currentId.trim()) {
      setComplaint(null);
      setAnalysis(null);
      setHistory([]);
      setNotFound(false);
      return;
    }

    const record = complaintService.getByGrievanceNumber(currentId.trim());
    if (record) {
      setComplaint(record);
      setAnalysis(complaintService.getAnalysis(record.id));
      setHistory(complaintService.getHistory(record.id));
      setNotFound(false);
    } else {
      setComplaint(null);
      setAnalysis(null);
      setHistory([]);
      setNotFound(true);
    }
  }, [currentId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setCurrentId(inputVal.trim());
      setSearchParams({ id: inputVal.trim() });
    }
  };

  const handleSelectSample = (id: string) => {
    setInputVal(id);
    setCurrentId(id);
    setSearchParams({ id });
  };

  const handleReopen = () => {
    if (!complaint || !reopenReason.trim()) return;

    complaintService.updateStatus(
      complaint.id,
      'reopened',
      'u-citizen-1',
      'Citizen (Applicant)',
      'citizen',
      `Citizen reopened case: ${reopenReason}`
    );

    // Refresh state
    const updated = complaintService.getByGrievanceNumber(complaint.grievance_number);
    if (updated) {
      setComplaint(updated);
      setHistory(complaintService.getHistory(updated.id));
    }
    setReopenModal(false);
    setReopenReason('');
    alert(t('Grievance has been reopened. A supervisory officer will audit the case.', 'Grievance has been reopened. A supervisory officer will audit the case.'));
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      alert(t('Thank you! Your satisfaction feedback has been recorded on the departmental audit log.'));
    }, 400);
  };

  const dept = complaint ? DEPARTMENTS.find(d => d.id === complaint.assigned_department_id) : null;
  const district = complaint ? TN_DISTRICTS.find(d => d.id === complaint.district_id) : null;

  // Dynamically load recent complaints
  const recentComplaints = complaintService.getAll().slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <Link to="/" className="hover:text-blue-600">{t('Home')}</Link>
            <span>/</span>
            <span className="text-slate-800">{t('Track Grievance')}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('Grievance Tracking Dossier')}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {t('Real-time transparency on department assignment, field inspection notes, and SLA resolution milestones.')}
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-blue-800 transition-colors self-start sm:self-auto shadow-sm"
            >
              <span>+</span> {t('File New Grievance')}
            </Link>
          </div>
        </div>

        {/* Search Bar & Recent Grievance Pills */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-3 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={t('Enter SGAI Tracking ID (e.g. SGAI-2026-000001)')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
            >
              {t('Inspect Status')}
            </button>
          </form>

          {/* Recent Grievances Pills */}
          {recentComplaints.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('Recent Grievances:')}</span>
              {recentComplaints.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSample(s.grievance_number)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                    currentId === s.grievance_number
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.grievance_number} ({t(s.confirmed_priority)})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INITIAL EMPTY SEARCH STATE */}
        {!currentId && !complaint && !notFound && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-900">{t('Track Your Grievance')}</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {t('Enter your SGAI tracking ID above to inspect real-time AI triage, officer updates, and SLA resolution progress.')}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-xs font-bold hover:bg-blue-800 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>📝</span>
                <span>{t('Register Grievance')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* NOT FOUND STATE */}
        {notFound && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-900">{t('No Record Found')}</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {t('We could not locate any grievance registered with tracking ID')} &quot;{currentId}&quot;. {t('Please verify the tracking number and try again.')}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-xs font-bold hover:bg-blue-800 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>📝</span>
                <span>{t('Register Grievance')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* RECORD DETAILS */}
        {complaint && (
          <div className="space-y-6">
            {/* Demo Notice Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <span>⚗️</span>
                <span><strong>{t('Simulated Record:')}</strong> {t('All tracking timelines and officer remarks are fictional data generated for demonstration purposes.')}</span>
              </div>
              <span className="font-mono text-[11px] bg-amber-100 px-2 py-0.5 rounded text-amber-800 shrink-0">
                {t('SANDBOX DOSSIER')}
              </span>
            </div>

            {/* Main Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {complaint.grievance_number}
                    </span>
                    <PriorityBadge priority={complaint.confirmed_priority} />
                    <StatusBadge status={complaint.status} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                    {t(complaint.title)}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>{t('Filed:')} {formatDate(complaint.created_at, true)}</span>
                    <span>•</span>
                    <span>{t('Last Updated:')} {timeAgo(complaint.updated_at)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    🖨️ {t('Print Dossier')}
                  </button>
                  {complaint.status === 'resolved' && (
                    <button
                      onClick={() => setReopenModal(true)}
                      className="px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                    >
                      🔁 {t('Reopen Case')}
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">{t('Assigned Department')}</span>
                  <p className="font-bold text-slate-900 mt-0.5">{t(dept?.department_name || 'General Administration')}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">{t('Jurisdiction')}</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {complaint.mandal} Taluk, {district?.district_name || 'Chennai'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">{t('Village / Ward / Area')}</span>
                  <p className="font-bold text-slate-900 mt-0.5">{complaint.village}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">{t('Citizen Identity')}</span>
                  <p className="font-bold text-slate-900 mt-0.5">{t('Masked (Privacy Mode)')}</p>
                </div>
              </div>

              {/* Citizen Original Statement */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('Original Citizen Grievance Statement')}
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {complaint.original_description}
                </div>
              </div>

              {/* AI Triage & Analysis Card */}
              {analysis && (
                <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                        {t('AI Classification & Explainability Matrix')}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                      {t('Confidence Score')} {analysis.confidence}% • {analysis.model_version}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-teal-100">
                      <span className="text-slate-400 font-medium">{t('Preferred Language')}</span>
                      <p className="font-bold text-slate-800 mt-0.5">{analysis.language_name}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-teal-100">
                      <span className="text-slate-400 font-medium">{t('Category')}</span>
                      <p className="font-bold text-slate-800 mt-0.5">{t(analysis.recommended_category)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-teal-100">
                      <span className="text-slate-400 font-medium">{t('Human Oversight')}</span>
                      <p className="font-bold text-emerald-700 mt-0.5">
                        {analysis.review_required ? t('Audited by Officer') : t('Passed Algorithmic Threshold')}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-teal-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">{t('Algorithmic Reasoning: ')}</strong>
                    {t(analysis.explanation)}
                  </div>
                </div>
              )}
            </div>

            {/* STATUS TIMELINE SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>⏱️</span> {t('Verifiable Redressal Milestone Timeline')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('Chronological audit log of officer actions, dispatch updates, and status transitions.')}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                  {history.length} {history.length !== 1 ? t('Events') : t('Event')}
                </span>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                {history.map((event, idx) => (
                  <div key={event.id || idx} className="relative group">
                    {/* Circle icon */}
                    <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-sm ${
                      idx === history.length - 1
                        ? 'bg-[#1D4ED8] text-white ring-4 ring-blue-100'
                        : 'bg-teal-600 text-white'
                    }`}>
                      {idx === history.length - 1 ? '•' : '✓'}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{t(event.action)}</span>
                          <StatusBadge status={event.new_status} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDate(event.timestamp, true)}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{event.actor_name}</span>
                        <span>•</span>
                        <span className="capitalize text-slate-500">{t(event.actor_role.replace(/_/g, ' '))}</span>
                      </div>

                      {event.remarks && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-slate-800">{t('Officer Remarks')}: </strong>
                          {t(event.remarks)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CITIZEN SATISFACTION FEEDBACK (FOR RESOLVED COMPLAINTS) */}
            {complaint.status === 'resolved' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>⭐</span> {t('Citizen Satisfaction Feedback')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Rate the quality and promptness of the department\'s redressal. Ratings directly impact the department SLA compliance scorecard.')}
                </p>

                {feedbackSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <span>✓</span> {t('Thank you! Your satisfaction feedback has been recorded on the departmental audit log.')}
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= feedbackRating ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-slate-500 ml-2 font-medium">
                        {feedbackRating === 5 && t('Excellent Redressal')}
                        {feedbackRating === 4 && t('Good Work')}
                        {feedbackRating === 3 && t('Average')}
                        {feedbackRating <= 2 && t('Needs Improvement')}
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={e => setFeedbackComment(e.target.value)}
                      placeholder={t('Add any comments on field worker behavior, resolution quality, or remaining issues...')}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] resize-none"
                    />

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
                    >
                      {t('Submit Redressal Rating')}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* REOPEN MODAL */}
        {reopenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🔁</span> {t('Reopen Case')}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('If the on-ground resolution is incomplete or inaccurate, you can reopen this ticket within 7 days of closure. A supervisory inspection will be scheduled.')}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  {t('Reason for Reopening')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reopenReason}
                  onChange={e => setReopenReason(e.target.value)}
                  placeholder={t('Explain why the resolution was unsatisfactory (e.g. wire was only tied up with rope instead of being replaced)...')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReopenModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleReopen}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
                >
                  {t('Confirm Reopening')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
