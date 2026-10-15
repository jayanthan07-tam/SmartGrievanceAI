import { DEPARTMENTS } from '../data/departments';

export default function DepartmentDirectoryPage() {
  return <section className="min-h-[65vh] bg-slate-50 py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6">
    <div className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-teal-700">SmartGrievance AI</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900">Department Directory</h1><p className="mt-3 max-w-2xl text-slate-600">Complaints are recommended to a responsible department based on their subject, location and urgency. Officers can correct every AI recommendation.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{DEPARTMENTS.map((d) => <article key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">🏛️</div><h2 className="font-bold text-slate-900">{d.department_name}</h2><p className="mt-2 text-sm text-slate-600">{d.description || 'Receives and reviews relevant public-service grievances.'}</p></article>)}</div>
  </div></section>;
}
