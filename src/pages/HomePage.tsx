import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DEPARTMENTS } from '../data/departments';
import { complaintService } from '../services/complaintService';

const STATS = [
  { label: 'Languages Supported', value: '8+', desc: 'Instant regional text & voice detection', color: 'from-blue-500 to-blue-600' },
  { label: 'Human Oversight', value: '100%', desc: 'Mandatory human-in-the-loop review', color: 'from-teal-500 to-teal-600' },
  { label: 'Target Resolution', value: '< 48h', desc: 'For critical grievances (demo target)', color: 'from-purple-500 to-purple-600' },
  { label: 'Availability', value: '24×7', desc: 'Digital grievance portal access', color: 'from-amber-500 to-amber-600' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🎙️', title: 'Submit in Any Medium', desc: 'Lodge complaints in your regional dialect through speech, photos, text, or the digital portal. No bureaucratic jargon needed.', tag: 'Real-time Transcription', color: 'bg-blue-50 border-blue-100' },
  { step: '02', icon: '🤖', title: 'AI Triage & Prioritization', desc: 'Algorithmic parsing classifies sentiment, detects duplicates, assigns urgency level (Critical/High/Medium/Low), and recommends the responsible department.', tag: 'Zero Jurisdiction Bounces', color: 'bg-purple-50 border-purple-100' },
  { step: '03', icon: '✅', title: 'Officer Verification & Dispatch', desc: 'A designated nodal officer audits the AI suggestion, affirms the SLA deadline, and assigns a field inspector to execute the resolution work.', tag: 'Human-in-the-Loop Sign-off', color: 'bg-teal-50 border-teal-100' },
  { step: '04', icon: '📸', title: 'Resolution with Proof', desc: 'Redressal is accompanied by geotagged photographic evidence and field notes. The citizen receives notification and can confirm closure or reopen.', tag: 'Auditable Photographic Proof', color: 'bg-emerald-50 border-emerald-100' },
];

const AI_FEATURES = [
  { icon: '🌐', title: 'Multilingual NLU', desc: 'Handles Hindi, Telugu, Tamil, English and more. Understands code-switching (Hinglish, Tanglish) and Romanized Indian languages.', tags: ['Dialect Resilience', 'Voice Ingest', 'Semantic Extraction'], badge: 'NLU Model v3.2' },
  { icon: '🚨', title: 'Contextual Priority Scoring', desc: 'The triage engine dynamically evaluates danger — a dangling live wire or contaminated water is immediately escalated to Critical, while routine issues follow normal schedules.', tags: ['Dynamic Escalation', 'Severity Matrix', 'Public Hazard Tagging'], badge: 'Risk Weighting Engine' },
  { icon: '🔀', title: 'Intelligent Department Routing', desc: 'Maps local jurisdiction laws to automatically identify the responsible agency on day one. Civic complaints never bounce between departments.', tags: ['Boundary Mapping', 'Ward Demarcation', 'Zero Re-filing'], badge: 'Taxonomy Router' },
  { icon: '⚖️', title: 'Algorithmic Accountability', desc: 'Every classification shows an explicit confidence rating. Below 75%, the grievance is flagged for manual triage to prevent false routing.', tags: ['Explainable AI', 'Low-Confidence Fallback', 'Fairness Audited'], badge: 'Confidence 75–98%' },
];

const FAQS = [
  { q: 'How does the AI categorize and prioritize my complaint?', a: 'Our natural language model analyzes text using sentiment analysis, public hazard keywords, and location data. Issues involving immediate physical hazards (exposed power cables, contaminated water) are immediately escalated to Critical (P1). All AI decisions are subject to mandatory human officer review.' },
  { q: 'Can I submit a grievance in my regional language?', a: 'Yes! You can write or speak in Hindi, Telugu, Tamil, or English. The platform automatically identifies the language, processes it accurately, and preserves your original statement. AI priority is never reduced because of the language used.' },
  { q: 'What happens if the department fails to resolve within the SLA?', a: 'When a configured SLA expires without resolution, the case is automatically escalated to the District Administrator. Continued delays trigger administrative audit flags on the department\'s compliance scorecard.' },
  { q: 'Is my personal identification data secure?', a: 'Citizen phone numbers and personal markers are protected. Field inspectors only receive the incident location and grievance description needed for inspection. Complaint map data is aggregated to protect individual privacy.' },
  { q: 'How do I escalate an unsatisfactory resolution?', a: 'Within 7 days of a resolution notification, you can press "Reopen Complaint" if the resolution does not match reality. Reopened grievances are routed to supervisory quality inspectors.' },
];

export default function HomePage() {
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleTrack = () => {
    if (!trackId.trim()) {
      setTrackResult({ type: 'error', message: 'Please enter a valid SGAI tracking ID (e.g., SGAI-2026-000001).' });
      return;
    }
    const complaint = complaintService.getByGrievanceNumber(trackId.trim());
    if (complaint) {
      setTrackResult({ type: 'success', message: `Found: ${complaint.grievance_number} — ${complaint.title}. Status: ${complaint.status.replace(/_/g, ' ')}` });
      setTimeout(() => navigate(`/track?id=${trackId.trim()}`), 1000);
    } else {
      setTrackResult({ type: 'error', message: `No complaint found with ID "${trackId}". Please verify the tracking number.` });
    }
  };

  const allComplaints = complaintService.getAll();
  const stats = complaintService.getStats(allComplaints);

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      {/* Demo Banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="text-xs text-amber-700 flex items-center gap-1.5">
            <span>⚗️</span>
            <strong>Hackathon Prototype:</strong> Fictional data, simulated AI — not affiliated with any government department.
          </p>
          <span className="text-xs font-mono bg-amber-100 px-2 py-0.5 rounded-full text-amber-700 shrink-0">SANDBOX v2.4.9</span>
        </div>
      </div>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#faf8ff] via-blue-50/30 to-[#f0fdfa]">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm text-sm font-medium text-[#0037b0] w-fit">
                <span className="w-2 h-2 rounded-full bg-[#0037b0] animate-pulse-dot" />
                Next-Generation Civic Intelligence Platform
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-[#006a61] uppercase tracking-wider">CIVIC REDRESSAL ENGINE</span>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight font-display">
                  Your Voice,{' '}
                  <span className="gradient-text">Our Priority</span>
                </h1>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                AI-powered multilingual grievance redressal. Submit complaints in Telugu, Hindi, Tamil, or English.
                Intelligent priority classification, transparent tracking, and human-verified resolution — all in one platform.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0037b0] text-white font-semibold shadow-lg hover:bg-[#001f6b] transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  📝 Register a Grievance
                </Link>
                <a
                  href="#track-section"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-gray-700 font-semibold shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  🔍 Track Your Complaint
                </a>
              </div>

              {/* Role quick access */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Explore Portals:</span>
                {[
                  { label: 'Citizen', path: '/citizen/login', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { label: 'Officer Desk', path: '/officer/login', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
                  { label: 'District Admin', path: '/district-admin/login', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                  { label: 'Super Admin', path: '/admin/login', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
                ].map(r => (
                  <Link key={r.path} to={r.path} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${r.color}`}>
                    {r.label}
                  </Link>
                ))}
              </div>

              {/* Quick Track */}
              <div className="mt-2 p-5 rounded-2xl bg-white shadow-md border border-gray-100" id="track-section">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📲</span> Have a Tracking ID?
                  <span className="ml-auto text-xs font-mono text-gray-400">e.g., SGAI-2026-000001</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackId}
                    onChange={e => setTrackId(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTrack()}
                    placeholder="Enter SGAI Tracking ID"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0037b0]/20 focus:border-[#0037b0]"
                  />
                  <button
                    onClick={handleTrack}
                    className="px-5 py-2.5 rounded-lg bg-[#006a61] text-white text-sm font-semibold hover:bg-[#004d46] transition-colors flex items-center gap-1.5"
                  >
                    🔍 Check Status
                  </button>
                </div>
                {trackResult && (
                  <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${
                    trackResult.type === 'success' ? 'bg-teal-50 text-teal-800' : 'bg-red-50 text-red-700'
                  }`}>
                    <span>{trackResult.type === 'success' ? '✅' : '❌'}</span>
                    {trackResult.message}
                  </div>
                )}
              </div>
            </div>

            {/* Right — AI Demo Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                  </div>
                  <span className="text-xs font-mono text-gray-400 ml-2">SIMULATED AI INGESTION</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-teal-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-dot" />
                    Live Stream
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Input (Hindi · Voice Ingest)</span>
                      <span className="text-xs font-mono bg-blue-100 text-blue-600 px-2 py-0.5 rounded">98.2% Auto-detected</span>
                    </div>
                    <p className="text-sm text-gray-800 italic">"हमारे वार्ड नं. 14 में 3 दिन से मुख्य पेयजल पाइपलाइन टूटी हुई है, सड़क पर पानी भर गया है।"</p>
                    <p className="text-xs text-teal-600 mt-2 flex items-center gap-1">
                      🌐 <em>Translated: "Ward 14 main drinking water pipeline damaged for 3 days, causing street flooding."</em>
                    </p>
                  </div>

                  <div className="bg-[#f8f7ff] rounded-xl p-4 border border-purple-100 ai-accent">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[#311fca] flex items-center gap-1.5">🧠 AI Triage Analysis</span>
                      <span className="text-xs font-semibold bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">94% High Confidence</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Detected Urgency</p>
                        <p className="text-sm font-bold text-amber-600 mt-0.5 flex items-center gap-1">🟠 P2 — High</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Recommended Dept</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">Water Supply</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🔒</span>
                        <span className="text-xs text-gray-700">Officer Approval Pending</span>
                      </div>
                      <button className="text-xs px-2.5 py-1 rounded bg-[#006a61] text-white font-semibold">Approve Route</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>⏱ SLA Auto-set: 24 Hours</span>
                    <span className="font-mono text-[#0037b0] font-bold">TICKET #SGAI-2026-000025</span>
                  </div>
                </div>
              </div>

              {/* Live stats from demo DB */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-[#0037b0]">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Demo Complaints</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                  <p className="text-2xl font-extrabold text-emerald-600">{stats.resolved}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Resolved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className={`text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-1">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#faf8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#0037b0] uppercase tracking-widest">PROCEDURAL LIFECYCLE</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 font-display">How SmartGrievance AI Works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">From citizen voice to verified on-ground resolution, every step is traceable and accountable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className={`relative p-6 rounded-2xl border ${step.color} flex flex-col gap-4 hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <span className="text-3xl font-extrabold text-gray-200">{step.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-auto pt-3 border-t border-white/60">
                  <span className="text-xs font-semibold text-gray-500">✓ {step.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Features ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
              <span className="text-xs font-bold text-[#006a61] uppercase tracking-widest">ETHICAL CIVIC ARCHITECTURE</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 font-display">Responsible Intelligence for Public Trust</h2>
              <p className="text-gray-500 mt-3 max-w-2xl">AI in public grievance redressal must never be an opaque black box. We prioritize fairness, linguistic equality, and absolute human oversight.</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
              <span className="text-2xl">⚖️</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Zero Autonomous Closure</p>
                <p className="text-xs text-gray-500">Only human officers can formally close a ticket</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AI_FEATURES.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl shadow-sm">
                    {f.icon}
                  </div>
                  <span className="text-xs font-mono bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-500">{f.badge}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  {f.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-500">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Department Directory Preview ─────────────────────────────────── */}
      <section className="py-20 bg-[#faf8ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold text-[#0037b0] uppercase tracking-widest">COVERAGE MATRIX</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 font-display">Participating Public Departments</h2>
              <p className="text-gray-500 mt-2">Live integration with 20 core municipal and state administration departments.</p>
            </div>
            <Link to="/departments" className="text-[#0037b0] font-semibold text-sm hover:underline shrink-0 flex items-center gap-1">
              View All 20 Departments →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEPARTMENTS.slice(0, 6).map(dept => (
              <div key={dept.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg shadow-sm">
                    {dept.id === 'dept-water-supply' ? '💧' :
                     dept.id === 'dept-electricity' ? '⚡' :
                     dept.id === 'dept-roads' ? '🛣️' :
                     dept.id === 'dept-health' ? '🏥' :
                     dept.id === 'dept-agriculture' ? '🌾' :
                     dept.id === 'dept-horticulture' ? '🌿' : '🏛️'}
                  </div>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                    {dept.sla_compliance}% SLA
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">{dept.department_name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{dept.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">Avg: {dept.avg_resolution_hours}h</span>
                  <Link to="/register" className="text-xs font-semibold text-[#0037b0] hover:underline group-hover:underline">
                    Register Issue →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold text-[#006a61] uppercase tracking-widest">CITIZEN ASSISTANCE</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 font-display mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">Everything about AI routing, data security, escalation, and multilingual support.</p>

              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#006a61] flex items-center justify-center text-white text-xl">💬</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Still Need Help?</p>
                    <p className="text-xs text-gray-500">Call our demo helpline</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-800">1800-000-DEMO</span>
                  <span className="text-xs font-semibold text-teal-600">Toll Free 24×7</span>
                </div>
                <Link to="/help" className="mt-4 block text-center text-sm text-[#0037b0] font-semibold hover:underline">
                  View Full Help Centre →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                  <button
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                    <span className={`text-gray-400 text-lg shrink-0 transition-transform ${faqOpen === i ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {faqOpen === i && (
                    <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Portal Matrix ────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-md p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-[#0037b0] uppercase tracking-widest">PORTAL MATRIX</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-1 font-display">Switch Between Governance Perspectives</h3>
                <p className="text-sm text-gray-500 mt-1">Test the system through the eyes of citizens, officers, and administrators.</p>
              </div>
              <span className="px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold shrink-0">Interactive Demo Mode</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '👤', title: 'Citizen Portal', desc: 'Lodge grievance, upload photos, track resolution.', color: 'hover:border-blue-200 hover:bg-blue-50', tag: 'Public Access', link: '/register' },
                { icon: '🏛️', title: 'Department Officer', desc: 'Review AI routes, verify priorities, update status.', color: 'hover:border-teal-200 hover:bg-teal-50', tag: 'Nodal Access', link: '/officer/login' },
                { icon: '📊', title: 'District Command', desc: 'SLA analytics, breach alerts, complaint hotspot maps.', color: 'hover:border-purple-200 hover:bg-purple-50', tag: 'Magistrate Level', link: '/district-admin/login' },
                { icon: '⚙️', title: 'Super Admin Console', desc: 'AI config, user management, system audit logs.', color: 'hover:border-red-200 hover:bg-red-50', tag: 'Root System', link: '/admin/login' },
              ].map(portal => (
                <Link
                  key={portal.link}
                  to={portal.link}
                  className={`p-5 rounded-xl border border-gray-100 bg-white transition-all flex flex-col gap-3 group ${portal.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{portal.icon}</span>
                    <span className="text-gray-300 group-hover:text-gray-600 transition-colors text-sm">↗</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{portal.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{portal.desc}</p>
                  </div>
                  <span className="mt-auto text-xs font-mono text-gray-400">{portal.tag}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-gray-100">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0037b0] to-[#311fca] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SG</span>
                </div>
                <span className="font-bold text-[#0037b0]">SmartGrievance AI</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">AI-powered civic intelligence engine for transparent, multilingual grievance redressal with human-in-the-loop oversight.</p>
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 max-w-xs">
                <span className="text-lg">🔒</span>
                <span className="text-xs text-gray-500">Simulated AI with mandatory human-in-the-loop oversight</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4 text-sm">Redressal Portals</p>
              <ul className="space-y-2.5">
                {[['Register Grievance', '/register'], ['Track Status', '/track'], ['Department Directory', '/departments'], ['Citizen Rights', '/about']].map(([l, p]) => (
                  <li key={p}><Link to={p} className="text-sm text-gray-500 hover:text-[#0037b0] transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4 text-sm">System & Support</p>
              <ul className="space-y-2.5 mb-6">
                {[['Help & FAQs', '/help'], ['Methodology', '/about'], ['SLA Standards', '/about']].map(([l, p]) => (
                  <li key={p}><Link to={p} className="text-sm text-gray-500 hover:text-[#0037b0] transition-colors">{l}</Link></li>
                ))}
              </ul>
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100">
                <p className="text-xs font-bold text-red-700 flex items-center gap-1">📞 Demo Helpline</p>
                <p className="font-mono font-bold text-red-600 text-sm mt-1">1800-000-DEMO</p>
                <p className="text-xs text-gray-500 mt-0.5">24×7 Demo Assistance</p>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 text-center md:text-left">
              SmartGrievance AI is a hackathon demonstration project and is not affiliated with any government department.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs font-mono text-gray-300">Open Civic Architecture</span>
              <span className="text-xs font-mono text-gray-300">WCAG 2.1 AA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
