import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Disclaimer Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-300/90">
          <div className="flex items-center gap-2">
            <span className="text-base">⚖️</span>
            <span className="font-semibold">
              {t('SmartGrievance AI is a hackathon demonstration project and is not affiliated with any government department.')}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {t('DEMO SANDBOX v2.4')}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#0D9488] flex items-center justify-center text-white font-bold text-sm shadow-md">
                SG
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">SmartGrievance AI</span>
                <p className="text-xs text-teal-400 font-medium">{t('Civic Intelligence Redressal')}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {t('“Your Voice, Our Priority — Intelligent Grievance Redressal for Everyone.”')}{' '}
              {t('An AI-assisted civic grievance management platform ensuring rapid, transparent, and multilingual issue resolution.')}
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {t('System Operational')}
              </span>
              <span>•</span>
              <span>{t('AP Statewide Pilot')}</span>
            </div>
          </div>

          {/* Citizen Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">{t('Citizen Services')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/register" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>📝</span> {t('Register Grievance')}
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>🔍</span> {t('Track Complaint')}
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>🏛️</span> {t('Department Directory')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>❓</span> {t('Help & FAQs')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>ℹ️</span> {t('About System')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">{t('Role Portals')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/citizen/login" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span>👤</span> {t('Citizen Portal')}
                </Link>
              </li>
              <li>
                <Link to="/officer/login" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>📋</span> {t('Department Officer Desk')}
                </Link>
              </li>
              <li>
                <Link to="/district-admin/login" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <span>📊</span> {t('District Admin Console')}
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <span>⚙️</span> {t('Super Admin Center')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">{t('Emergency Helplines')}</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <p className="font-semibold text-slate-200">{t('24x7 Civic Call Center')}</p>
                <p className="font-mono text-teal-400 text-sm mt-0.5">{t('1800-425-0000 (Toll-Free)')}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <p className="font-semibold text-slate-200">{t('Live Wire / Power Hazard')}</p>
                <p className="font-mono text-amber-400 text-sm mt-0.5">{t('1912 (Disaster Line)')}</p>
              </div>
              <p className="text-[11px] text-slate-400">
                {t('Demo support lines are simulated for hackathon evaluation.')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {t('SmartGrievance AI Civic Redressal Engine. All rights reserved.', 'SmartGrievance AI. All rights reserved.')}</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-300">{t('Architecture & Privacy')}</Link>
            <Link to="/help" className="hover:text-slate-300">{t('Citizen Charter')}</Link>
            <Link to="/departments" className="hover:text-slate-300">{t('SLA Standards')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
