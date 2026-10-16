import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function HelpPage() {
  const { t } = useLanguage();

  const faqs = [
    [
      t('How do I submit a complaint?'),
      t('Choose Register Grievance, enter the complaint and location details, review the AI recommendation, and submit to receive a tracking number.')
    ],
    [
      t('Can I write in a regional language?'),
      t('The prototype includes language detection and multilingual keyword rules. Results should be checked during testing, especially for mixed-language and Romanized text.')
    ],
    [
      t('What if the AI selects the wrong department?'),
      t('AI output is a recommendation. Authorized staff should review, correct and reassign the complaint when necessary.')
    ],
    [
      t('How do I check progress?'),
      t('Open Track Grievance and enter the grievance number generated after submission.')
    ],
  ];

  return (
    <section className="min-h-[65vh] bg-slate-50 py-14">
      <div className="mx-auto max-w-4xl px-4">
        <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
          {t('Help centre')}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{t('Help & Support')}</h1>
        <div className="mt-8 space-y-4">
          {faqs.map(([q, a]) => (
            <article key={q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">{q}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{a}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register" className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors">
            {t('Register a grievance')}
          </Link>
          <Link to="/track" className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
            {t('Track a complaint')}
          </Link>
        </div>
      </div>
    </section>
  );
}
