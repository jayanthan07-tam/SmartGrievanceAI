import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AP_DISTRICTS } from '../data/districts';
import { DEPARTMENTS } from '../data/departments';
import { complaintService } from '../services/complaintService';
import { classifyComplaint, detectLanguage, detectDuplicates } from '../services/aiClassifier';
import { useAuth } from '../contexts/AuthContext';
import { PriorityBadge } from '../components/ui';
import type { Language, Priority } from '../types';

export default function RegisterGrievancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDept = searchParams.get('dept');

  // Step state: 1: Contact, 2: Location, 3: Grievance & AI, 4: Review, 5: Success
  const [step, setStep] = useState<number>(1);

  // Form State
  const [contact, setContact] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    preferredLanguage: (user?.preferred_language || 'en') as Language,
    isAnonymous: false,
  });

  const [location, setLocation] = useState({
    districtId: 'dist-guntur',
    mandal: 'Guntur',
    village: '',
    address: '',
    pincode: '',
    coords: null as { lat: number; lng: number } | null,
  });

  const [grievance, setGrievance] = useState({
    title: '',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    attachmentName: '',
    attachmentSize: '',
  });

  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingResult, setTrackingResult] = useState<{
    id: string;
    grievanceNumber: string;
    priority: Priority;
    department: string;
    confidence: number;
  } | null>(null);

  // Set default mandals for selected district
  const currentDistrict = useMemo(() => {
    return AP_DISTRICTS.find(d => d.id === location.districtId) || AP_DISTRICTS[6]; // Guntur fallback
  }, [location.districtId]);

  useEffect(() => {
    if (currentDistrict.mandals.length > 0 && !currentDistrict.mandals.includes(location.mandal)) {
      setLocation(l => ({ ...l, mandal: currentDistrict.mandals[0] }));
    }
  }, [currentDistrict, location.mandal]);

  // Pre-fill department if query param exists
  useEffect(() => {
    if (preselectedDept) {
      const d = DEPARTMENTS.find(dep => dep.id === preselectedDept);
      if (d && !grievance.title) {
        setGrievance(g => ({
          ...g,
          title: `Grievance regarding ${d.department_name}`,
        }));
      }
    }
  }, [preselectedDept, grievance.title]);

  // Real-time AI Classification preview
  const aiPreview = useMemo(() => {
    const text = `${grievance.title} ${grievance.description}`.trim();
    if (text.length < 5) return null;

    const langInfo = detectLanguage(text);
    const classification = classifyComplaint(grievance.title, grievance.description);
    const dept = DEPARTMENTS.find(d => d.id === classification.department_id);

    // Also check for duplicates in the local mock store
    const existing = complaintService.getAll().map(c => ({
      id: c.id,
      title: c.title,
      original_description: c.original_description,
      district_id: c.district_id,
      mandal: c.mandal,
    }));

    const duplicates = detectDuplicates(
      grievance.title,
      grievance.description,
      location.districtId,
      location.mandal,
      existing
    );

    return {
      langInfo,
      classification,
      departmentName: dept?.department_name || 'General Administration',
      departmentIcon: dept?.icon || 'building',
      duplicates,
    };
  }, [grievance.title, grievance.description, location.districtId, location.mandal]);

  // Voice input simulation
  const handleSimulateVoice = (sampleText: string, sampleTitle: string) => {
    setIsListening(true);
    setTimeout(() => {
      setGrievance(g => ({
        ...g,
        title: sampleTitle,
        description: sampleText,
      }));
      setIsListening(false);
    }, 1200);
  };

  // Simulated GPS fetch
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(l => ({
            ...l,
            coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          }));
        },
        () => {
          // Fallback to district center
          setLocation(l => ({
            ...l,
            coords: { lat: currentDistrict.lat, lng: currentDistrict.lng },
          }));
        }
      );
    }
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance.title.trim() || !grievance.description.trim()) {
      alert('Please provide a title and detailed description for your grievance.');
      return;
    }

    setSubmitting(true);

    try {
      // Determine citizen ID (logged in or temporary demo ID)
      const citizenId = user?.id || 'u-citizen-1';

      const result = await complaintService.submit({
        citizen_id: citizenId,
        title: grievance.title,
        description: grievance.description,
        language: aiPreview?.langInfo.language || contact.preferredLanguage,
        district_id: location.districtId,
        mandal: location.mandal,
        village: location.village || 'Ward 12',
        location_lat: location.coords?.lat,
        location_lng: location.coords?.lng,
      });

      setTrackingResult({
        id: result.complaint.id,
        grievanceNumber: result.complaint.grievance_number,
        priority: result.complaint.confirmed_priority,
        department: DEPARTMENTS.find(d => d.id === result.complaint.assigned_department_id)?.department_name || 'Assigned Department',
        confidence: result.analysis.confidence,
      });

      setStep(5); // Confirmation screen
    } catch (err) {
      console.error(err);
      alert('An error occurred during submission. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Sample scenarios for quick testing
  const SAMPLE_SCENARIOS = [
    {
      label: '⚡ Live Wire (Emergency - Critical)',
      lang: 'English',
      title: 'Dangling live 11kV electrical wire sparking near primary school',
      text: 'An 11kV overhead electric wire snapped and is dangling 3 feet from the road right outside ZP High School in Guntur. Sparks are flying and children walk here every afternoon. Immediate power isolation required to prevent fatal electrocution.',
    },
    {
      label: '💧 Contaminated Water (High)',
      lang: 'Telugu',
      title: 'గ్రామంలో మురుగు నీటితో కూడిన తాగునీరు సరఫరా (Sewage mixed drinking water)',
      text: 'మా వీధిలో గత 4 రోజుల నుండి తాగునీటి పైపు పగిలి మురుగు నీరు కలుస్తోంది. దుర్వాసన వస్తోంది. చాలామంది పిల్లలు మరియు పెద్దలు వాంతులు మరియు విరేచనాలతో ఆసుపత్రి పాలయ్యారు. దయచేసి వెంటనే పైపులైన్ మరమ్మతు చేయించండి.',
    },
    {
      label: '🛣️ Deep Potholes (Medium)',
      lang: 'Hindi',
      title: 'मुख्य बाजार मार्ग पर गहरे गड्ढे होने से दैनिक दुर्घटनाएं (Potholes on market road)',
      text: 'गांधी चौक से सब्जी मंडी तक मुख्य सड़क पर 2 फीट गहरे गड्ढे हो गए हैं। कल रात एक ऑटो रिक्शा पलट गया और यात्री घायल हो गए। तत्काल सड़क की मरम्मत और डामरीकरण की आवश्यकता है।',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Heading */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-slate-800">Public Grievance Registration</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Register a Public Grievance
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Lodge civic complaints in any regional language. Automated AI priority scoring & zero-bounce department dispatch.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium self-start sm:self-auto">
              <span>🤖</span> AI-Assisted Intake
            </div>
          </div>
        </div>

        {/* Demo banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-8 flex items-start gap-3 text-xs text-amber-900">
          <span className="text-base shrink-0">⚗️</span>
          <div>
            <strong className="font-semibold">Simulated Intake System:</strong> All submissions generate realistic demo tracking codes (e.g. <code>SGAI-2026-XXXXXX</code>) and persist in local sandbox storage for instant tracking and officer review. No official legal liabilities are created.
          </div>
        </div>

        {/* Multi-step progress bar */}
        {step < 5 && (
          <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between relative">
              {[
                { num: 1, label: 'Contact' },
                { num: 2, label: 'Location' },
                { num: 3, label: 'Grievance' },
                { num: 4, label: 'Review' },
              ].map((s, idx) => (
                <div key={s.num} className="flex-1 flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step === s.num
                        ? 'bg-[#1D4ED8] text-white ring-4 ring-blue-100 shadow-md'
                        : step > s.num
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`text-xs font-medium mt-1.5 hidden sm:block ${
                    step >= s.num ? 'text-slate-800 font-semibold' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                  {idx < 3 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 ${
                        step > s.num ? 'bg-teal-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORM STEPS CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {/* STEP 1: CONTACT DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>👤</span> Citizen Identification & Contact Details
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  We use your phone number and email to transmit real-time SMS/WhatsApp progress alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={contact.isAnonymous}
                    value={contact.isAnonymous ? 'Masked Citizen (Confidential)' : contact.name}
                    onChange={e => setContact({ ...contact, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={contact.phone}
                      onChange={e => setContact({ ...contact, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="98765 43210"
                      className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Status milestones are dispatched via automated SMS.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={e => setContact({ ...contact, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Preferred Communication Language
                  </label>
                  <select
                    value={contact.preferredLanguage}
                    onChange={e => setContact({ ...contact, preferredLanguage: e.target.value as Language })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] bg-white cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contact.isAnonymous}
                    onChange={e => setContact({ ...contact, isAnonymous: e.target.checked })}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      File with Masked Identity (Confidential Mode)
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your name will not be disclosed to departmental staff or field inspectors. Recommended for whistleblowing or sensitive community disputes.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!contact.phone || (!contact.name && !contact.isAnonymous)) {
                      alert('Please provide your name and phone number before proceeding.');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] text-white font-semibold hover:bg-blue-800 shadow-sm transition-all flex items-center gap-2"
                >
                  Continue to Incident Location →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION DETAILS */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📍</span> Geographic Demarcation & Incident Location
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Accurate location ensures the complaint is routed directly to the specific Mandal Parishad or Municipal Nodal Officer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={location.districtId}
                    onChange={e => setLocation({ ...location, districtId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] bg-white cursor-pointer"
                  >
                    {AP_DISTRICTS.map(d => (
                      <option key={d.id} value={d.id}>{d.district_name} District</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Mandal / Tehsil <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={location.mandal}
                    onChange={e => setLocation({ ...location, mandal: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] bg-white cursor-pointer"
                  >
                    {currentDistrict.mandals.map(m => (
                      <option key={m} value={m}>{m} Mandal</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Village / Town / Ward <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location.village}
                    onChange={e => setLocation({ ...location, village: e.target.value })}
                    placeholder="e.g. Lakshmipuram / Ward No. 14"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={location.pincode}
                    onChange={e => setLocation({ ...location, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 522007"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Detailed Landmark / Street Address
                </label>
                <textarea
                  rows={2}
                  value={location.address}
                  onChange={e => setLocation({ ...location, address: e.target.value })}
                  placeholder="e.g. Opposite Government Hospital gate, beside transformer #T-44"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] resize-none"
                />
              </div>

              {/* Geo location simulation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-blue-50/60 border border-blue-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1D4ED8] flex items-center justify-center text-lg">
                    🧭
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Geotagging & Incident Coordinates</p>
                    <p className="text-[11px] text-slate-500">
                      {location.coords
                        ? `Captured: Lat ${location.coords.lat.toFixed(4)}, Lng ${location.coords.lng.toFixed(4)}`
                        : 'Capture GPS pin to assist field inspection crews'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold shadow-sm transition-all shrink-0"
                >
                  {location.coords ? '✓ Coordinates Tagged' : '📍 Detect Current GPS'}
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm"
                >
                  ← Back to Contact
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!location.village.trim()) {
                      alert('Please provide your village, town, or ward.');
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] text-white font-semibold hover:bg-blue-800 shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                  Continue to Grievance Details →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GRIEVANCE DETAILS & AI TRIAGE PREVIEW */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>📝</span> Multilingual Grievance Description
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Write or speak in your own dialect. Our rule-based AI engine extracts urgency, severity, and department taxonomy.
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full self-start">
                    Live AI Parsing Active
                  </span>
                </div>
              </div>

              {/* Quick load sample scenarios */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <span>💡</span> Quick Sample Scenarios for Testing:
                  </span>
                  <span className="text-[11px] text-slate-400">Click to autofill</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_SCENARIOS.map((sc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGrievance(g => ({ ...g, title: sc.title, description: sc.text }))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-medium text-slate-700 transition-colors shadow-2xs text-left"
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Speech Ingestion */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Grievance Summary / Subject Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={grievance.title}
                  onChange={e => setGrievance({ ...grievance, title: e.target.value })}
                  placeholder="e.g. Fallen live wire sparking on main road"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                />
              </div>

              {/* Speech-to-text simulation bar */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-teal-50/70 border border-teal-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isListening}
                    onClick={() => handleSimulateVoice(
                      'మా వీధిలో విద్యుత్ స్తంభం విరిగి వైర్లు నేలపై పడి ఉన్నాయి. స్పార్క్స్ వస్తున్నాయి. దయచేసి వెంటనే సరిచేయండి.',
                      'విద్యుత్ వైర్లు నేలపై పడి ఉన్నాయి - అత్యవసర సమస్య (Fallen electric wire)'
                    )}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-[#0D9488] text-white hover:bg-teal-700'
                    }`}
                  >
                    <span>🎙️</span> {isListening ? 'Transcribing Speech...' : 'Simulate Voice Input'}
                  </button>
                  <span className="text-xs text-teal-800 hidden sm:inline">
                    Simulates speech recognition in Telugu, Tamil, Hindi, or English.
                  </span>
                </div>
                <span className="text-[11px] font-mono text-teal-600 bg-white px-2 py-0.5 rounded border border-teal-200">
                  Regional Voice Engine
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Detailed Complaint Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={grievance.description}
                  onChange={e => setGrievance({ ...grievance, description: e.target.value })}
                  placeholder="Describe what occurred, hazards involved, duration of problem, and how many households are affected..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] resize-none"
                />
              </div>

              {/* Attachment Simulation */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-1">📸</span>
                <p className="text-xs font-semibold text-slate-700">Attach Photographic or Document Evidence (Optional)</p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                  Attach geo-tagged site photographs, utility bills, or previous reference letters (JPG, PNG, PDF up to 10MB).
                </p>
                <label className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs">
                  <span>📎 Choose File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setGrievance(g => ({
                          ...g,
                          attachmentName: file.name,
                          attachmentSize: `${(file.size / 1024).toFixed(1)} KB`,
                        }));
                      }
                    }}
                  />
                </label>
                {grievance.attachmentName && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    <span>✓ Attached:</span>
                    <span className="font-mono">{grievance.attachmentName}</span>
                    <span className="text-slate-400">({grievance.attachmentSize})</span>
                  </div>
                )}
              </div>

              {/* LIVE AI TRIAGE CARD */}
              {aiPreview && (
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-teal-50/40 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Simulated AI Triage Analysis (Real-time Preview)
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded text-blue-700 border border-blue-200 font-semibold">
                      Model v2.4 (Confidence {aiPreview.classification.confidence}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Detected Language */}
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Detected Language</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {aiPreview.langInfo.name}
                      </p>
                      <span className="text-[10px] text-teal-600 font-medium">
                        {aiPreview.langInfo.confidence}% linguistic match
                      </span>
                    </div>

                    {/* Department Recommendation */}
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                        {aiPreview.departmentName}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        Category: {aiPreview.classification.category}
                      </span>
                    </div>

                    {/* Priority Recommendation */}
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">AI Priority Urgency</p>
                      <div className="mt-1">
                        <PriorityBadge priority={aiPreview.classification.priority} />
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {aiPreview.classification.review_required ? 'Flags human audit' : 'Standard triage queue'}
                      </span>
                    </div>
                  </div>

                  {/* AI Explanation Text */}
                  <div className="p-3 bg-white/80 rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">AI Reasoning: </strong>
                    {aiPreview.classification.explanation}
                  </div>

                  {/* Duplicate Detection Warning */}
                  {aiPreview.duplicates.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <span className="text-base shrink-0">⚠️</span>
                      <div>
                        <strong>Potential Duplicate Detected ({aiPreview.duplicates[0].similarity_score}% similarity):</strong>
                        <p className="mt-0.5 text-amber-800">
                          A similar complaint was recently filed in {location.mandal} Mandal. Your submission will be linked to prevent duplicated fieldwork and expedite combined resolution.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm"
                >
                  ← Back to Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!grievance.title.trim() || !grievance.description.trim()) {
                      alert('Please provide a title and detailed description for your complaint.');
                      return;
                    }
                    setStep(4);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] text-white font-semibold hover:bg-blue-800 shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                  Review Before Submit →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📋</span> Review & Confirm Grievance Submission
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please verify your particulars and complaint synopsis before generating an official tracking dossier.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Citizen Particulars</h3>
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {contact.isAnonymous ? 'Confidential Citizen' : contact.name}
                  </p>
                  <p className="text-xs text-slate-600">📱 +91 {contact.phone}</p>
                  {contact.email && <p className="text-xs text-slate-600">✉️ {contact.email}</p>}
                  <p className="text-xs text-slate-500">Language: {contact.preferredLanguage.toUpperCase()}</p>
                </div>

                {/* Location Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Incident Location</h3>
                    <button type="button" onClick={() => setStep(2)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {location.village}, {location.mandal} Mandal
                  </p>
                  <p className="text-xs text-slate-600">{currentDistrict.district_name} District, AP</p>
                  {location.address && <p className="text-xs text-slate-500">Landmark: {location.address}</p>}
                </div>
              </div>

              {/* Complaint Synopsis */}
              <div className="p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase">Complaint Summary</h3>
                  <button type="button" onClick={() => setStep(3)} className="text-xs text-blue-600 hover:underline">Edit</button>
                </div>
                <h4 className="text-base font-bold text-slate-900">{grievance.title}</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {grievance.description}
                </p>
                {grievance.attachmentName && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>📎 Attachment:</span>
                    <span className="font-mono">{grievance.attachmentName}</span>
                  </p>
                )}
              </div>

              {/* AI Dispatch Routing Preview */}
              {aiPreview && (
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Automated Dispatch Target</span>
                    <p className="text-sm font-bold text-teal-950 mt-0.5">
                      {aiPreview.departmentName} — {aiPreview.classification.category}
                    </p>
                    <p className="text-xs text-teal-800 mt-1">
                      Priority: {aiPreview.classification.priority.toUpperCase()} ({aiPreview.classification.confidence}% confidence)
                    </p>
                  </div>
                  <PriorityBadge priority={aiPreview.classification.priority} />
                </div>
              )}

              {/* Legal confirmation */}
              <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                By lodging this grievance, you affirm that the particulars stated are true to the best of your knowledge. All records are subject to officer audit.
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2 text-base disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Dispatching to Department...
                    </>
                  ) : (
                    <>🚀 Confirm & Submit Grievance</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION & RECEIPT SCREEN */}
          {step === 5 && trackingResult && (
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">
                ✓
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  Grievance Successfully Registered
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
                  Your Complaint Has Been Dispatched
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  A designated department nodal officer has been assigned to audit the AI recommendations and dispatch field personnel.
                </p>
              </div>

              {/* Tracking ID Badge */}
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 text-white shadow-xl space-y-3">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Official Tracking ID (Demo)</p>
                <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-teal-400">
                  {trackingResult.grievanceNumber}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(trackingResult.grievanceNumber);
                      alert('Tracking ID copied to clipboard!');
                    }}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>📋 Copy ID</span>
                  </button>
                </div>
              </div>

              {/* Summary Details Table */}
              <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Department:</span>
                  <span className="font-semibold text-slate-900">{trackingResult.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">AI Priority Level:</span>
                  <PriorityBadge priority={trackingResult.priority} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Citizen Mobile Notification:</span>
                  <span className="font-mono text-emerald-700">SMS queued to +91 {contact.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target SLA Response:</span>
                  <span className="font-semibold text-slate-900">Within 24 Hours</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/track?id=${trackingResult.grievanceNumber}`)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1D4ED8] text-white font-bold hover:bg-blue-800 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  🔍 Track This Complaint Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  🖨️ Print Acknowledgment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setGrievance({ title: '', description: '', incidentDate: new Date().toISOString().split('T')[0], attachmentName: '', attachmentSize: '' });
                    setTrackingResult(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all text-sm"
                >
                  Submit Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
