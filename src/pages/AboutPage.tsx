import { useLanguage } from '../contexts/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  const pillars = [
    [
      t('Human oversight'),
      t('AI suggests the category, priority and destination. Authorized officers can approve, correct or reassign each case.')
    ],
    [
      t('Fair across languages'),
      t('The original complaint is preserved. A regional language or informal spelling must never reduce a complaint’s urgency.')
    ],
    [
      t('Accountability and privacy'),
      t('Status changes should be traceable, personal data should be access-controlled, and uncertain cases should be reviewed by a person.')
    ],
  ];

  return (
    <section className="min-h-[65vh] bg-slate-50 py-14">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
          {t('About the project')}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">SmartGrievance AI</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          {t('A multilingual grievance-management prototype designed to understand complaints, recommend urgency and department routing, and keep complainants informed from submission to resolution.')}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pillars.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t('Demonstration only: this application is not affiliated with a government agency. Use fictional data for demonstrations.')}
        </p>
      </div>
    </section>
  );
}
