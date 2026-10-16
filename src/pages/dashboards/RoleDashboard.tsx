import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { complaintService } from '../../services/complaintService';
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
  const all = useMemo(() => complaintService.getAll(), []);
  const active = all.filter(c => c.status !== 'resolved');
  const critical = active.filter(c => c.confirmed_priority === 'critical');
  const pending = active.filter(c => ['submitted', 'ai_analyzed', 'pending_review'].includes(c.status));

  const stats = [
    { label: t('Total complaints'), value: all.length },
    { label: t('Active cases'), value: active.length },
    { label: t('Critical active'), value: critical.length },
    { label: t('Awaiting review'), value: pending.length },
  ];

  const info = roleInfo[role];

  return (
    <section className="min-h-[65vh] bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {t('Sign out')}
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-900">{t('Recent grievances')}</h2>
              <p className="mt-1 text-sm text-slate-500">{t('Demo records from the local browser store.')}</p>
            </div>
            <Link to="/track" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              {t('Open tracking →')}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">{t('Grievance')}</th>
                  <th className="px-5 py-3">{t('Category')}</th>
                  <th className="px-5 py-3">{t('Priority')}</th>
                  <th className="px-5 py-3">{t('Status')}</th>
                </tr>
              </thead>
              <tbody>
                {all.slice(0, 10).map(c => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{c.grievance_number}</div>
                      <div className="mt-1 max-w-sm truncate text-slate-500">{t(c.title)}</div>
                    </td>
                    <td className="px-5 py-4">{t(c.category)}</td>
                    <td className="px-5 py-4"><PriorityBadge priority={c.confirmed_priority} /></td>
                    <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {t('Prototype note: these role dashboards use local mock data and are not a production access-control boundary. Connect a secure backend before real-world use.')}
        </p>
      </div>
    </section>
  );
}
