import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { TN_DISTRICTS } from '../data/districts';
import { DEPARTMENTS } from '../data/departments';
import { complaintService } from '../services/complaintService';
import { classifyComplaint, detectLanguage, detectDuplicates } from '../services/aiClassifier';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PriorityBadge } from '../components/ui';
import type { Language, Priority } from '../types';

interface ReverseGeocodeAddress {
  state?: string;
  state_district?: string;
  district?: string;
  county?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  house_number?: string;
  road?: string;
  postcode?: string;
}

interface ReverseGeocodeResult {
  display_name?: string;
  address?: ReverseGeocodeAddress;
}

const DISTRICT_ALIASES: Record<string, string> = {
  kanniyakumari: 'dist-kanyakumari',
  kanchipuram: 'dist-kancheepuram',
  pudukkottai: 'dist-pudukkottai',
  nilgiris: 'dist-the-nilgiris',
  nilgiri: 'dist-the-nilgiris',
  tuticorin: 'dist-thoothukudi',
  trichy: 'dist-tiruchirappalli',
  trichirappalli: 'dist-tiruchirappalli',
  villupuram: 'dist-viluppuram',
  tirupattur: 'dist-tirupathur',
};

function normalizePlaceName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bdistrict\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function findTamilNaduDistrict(address: ReverseGeocodeAddress) {
  const candidates = [address.state_district, address.district, address.county, address.city_district]
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const normalized = normalizePlaceName(candidate);
    const aliasId = DISTRICT_ALIASES[normalized];
    const exact = TN_DISTRICTS.find(d => normalizePlaceName(d.district_name) === normalized);
    if (exact) return exact;
    if (aliasId) return TN_DISTRICTS.find(d => d.id === aliasId);

    const partial = TN_DISTRICTS.find(d => normalized.includes(normalizePlaceName(d.district_name)));
    if (partial) return partial;
  }

  return undefined;
}

function formatReverseGeocodedAddress(address: ReverseGeocodeAddress, fallback?: string): string {
  const parts = [
    address.house_number,
    address.road,
    address.neighbourhood,
    address.quarter,
    address.suburb,
    address.city_district,
    address.village || address.town || address.city || address.municipality,
  ].filter((value): value is string => Boolean(value?.trim()));
  const uniqueParts = parts.filter((part, index) =>
    parts.findIndex(candidate => candidate.toLowerCase() === part.toLowerCase()) === index
  );

  return uniqueParts.join(', ') || fallback || '';
}

export default function RegisterGrievancePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
    districtId: '',
    mandal: '',
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
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [trackingResult, setTrackingResult] = useState<{
    id: string;
    grievanceNumber: string;
    priority: Priority;
    department: string;
    confidence: number;
  } | null>(null);

  // Keep the selected district available for the review summary.
  const currentDistrict = useMemo(() => {
    return TN_DISTRICTS.find(d => d.id === location.districtId) || TN_DISTRICTS.find(d => d.id === 'dist-chennai')!;
  }, [location.districtId]);

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

  // Use device GPS, then reverse-geocode it into a Tamil Nadu address.
  const handleGetLocation = async () => {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError(t('Your browser does not support location access.'));
      return;
    }

    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      const query = new URLSearchParams({
        format: 'jsonv2',
        lat: String(lat),
        lon: String(lng),
        zoom: '18',
        addressdetails: '1',
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query.toString()}`, {
        headers: { 'Accept-Language': 'en,ta' },
      });
      if (!response.ok) throw new Error('Reverse geocoding request failed');

      const result = await response.json() as ReverseGeocodeResult;
      const address = result.address;
      if (!address) throw new Error('Reverse geocoding returned no address');
      if (!address.state) throw new Error('Reverse geocoding did not identify the state');
      const detectedState = normalizePlaceName(address.state);
      if (!detectedState.includes('tamilnadu') && !address.state.includes('தமிழ்நாடு')) {
        setLocationError(t('Your current location is outside Tamil Nadu. Choose a Tamil Nadu district manually.'));
        return;
      }

      const detectedDistrict = findTamilNaduDistrict(address);
      const detectedAddress = formatReverseGeocodedAddress(address, result.display_name);
      const locality = address.neighbourhood || address.quarter || address.suburb || address.village || address.town || address.city_district || address.city || address.municipality;
      const detectedTaluk = address.county && normalizePlaceName(address.county) !== normalizePlaceName(detectedDistrict?.district_name || '')
        ? address.county.replace(/\s+District$/i, '')
        : '';

      setLocation(previous => ({
        ...previous,
        ...(detectedDistrict ? { districtId: detectedDistrict.id } : {}),
        mandal: detectedTaluk || previous.mandal,
        village: locality || previous.village,
        address: detectedAddress || previous.address,
        pincode: address.postcode || previous.pincode,
        coords: { lat, lng },
      }));

      if (!detectedDistrict) {
        setLocationError(t('Address found in Tamil Nadu, but the district was not identified. Please choose it manually.'));
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const geoCode = (error as GeolocationPositionError).code;
        if (geoCode === 1) setLocationError(t('Location permission was denied. Allow location access and try again.'));
        else if (geoCode === 3) setLocationError(t('Location lookup timed out. Please try again.'));
        else setLocationError(t('Could not get your current location. Please try again.'));
      } else {
        setLocationError(t('Could not fetch the address. Choose a Tamil Nadu district and enter the address manually.'));
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance.title.trim() || !grievance.description.trim()) {
      alert(t('Please provide a title and detailed description for your grievance.'));
      return;
    }

    setSubmitting(true);

    try {
      const citizenId = user?.id || (contact.email ? `u-citizen-${contact.email.trim().toLowerCase()}` : 'u-citizen-1');

      const result = await complaintService.submit({
        citizen_id: citizenId,
        title: grievance.title,
        description: grievance.description,
        language: aiPreview?.langInfo.language || contact.preferredLanguage,
        district_id: location.districtId,
        mandal: location.mandal,
        village: location.village || 'Ward 12',
        address: location.address,
        pincode: location.pincode,
        location_lat: location.coords?.lat,
        location_lng: location.coords?.lng,
      });

      // Track newly created complaint in browser session list
      try {
        const sessionList = JSON.parse(localStorage.getItem('sgai_session_complaints') || '[]');
        if (Array.isArray(sessionList) && !sessionList.includes(result.complaint.id)) {
          sessionList.push(result.complaint.id);
          localStorage.setItem('sgai_session_complaints', JSON.stringify(sessionList));
        }
      } catch (e) {
        console.warn('Could not store session complaint id:', e);
      }

      setTrackingResult({
        id: result.complaint.id,
        grievanceNumber: result.complaint.grievance_number,
        priority: result.complaint.confirmed_priority,
        department: DEPARTMENTS.find(d => d.id === result.complaint.assigned_department_id)?.department_name || 'General Administration',
        confidence: result.analysis.confidence,
      });

      setStep(5); // Confirmation screen
    } catch (err) {
      console.error(err);
      alert(t('An error occurred during submission. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Sample scenarios for quick testing
  const SAMPLE_SCENARIOS = [
    {
      label: t('⚡ Live Wire (Critical/In Progress)'),
      lang: 'English',
      title: 'Dangling live 11kV electrical wire sparking near primary school',
      text: 'An 11kV overhead electric wire snapped and is dangling 3 feet from the road near a school in Chennai. Sparks are flying and children walk here every afternoon. Immediate power isolation required to prevent fatal electrocution.',
    },
    {
      label: t('💧 Water Contamination (High/Assigned)'),
      lang: 'Tamil',
      title: 'குடிநீரில் கழிவுநீர் கலப்பு (Sewage mixed drinking water)',
      text: 'எங்கள் தெருவில் கடந்த 4 நாட்களாக குடிநீர் குழாயில் கழிவுநீர் கலக்கிறது. துர்நாற்றம் வீசுகிறது. பல குழந்தைகளும் பெரியவர்களும் உடல்நலக்குறைவால் பாதிக்கப்பட்டுள்ளனர். உடனடியாக குழாயைச் சரிசெய்யவும்.',
    },
    {
      label: t('💡 Street Light (Medium/Pending)'),
      lang: 'English',
      title: 'Broken street lights on market road causing daily accidents',
      text: 'Streetlights have not been functioning for the past two weeks from Gandhi Chowk to Market road. Commuters and pedestrians face severe difficulties at night.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Heading */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <Link to="/" className="hover:text-blue-600">{t('Home')}</Link>
            <span>/</span>
            <span className="text-slate-800">{t('Register Grievance')}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('Register a Grievance')}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {t('AI-assisted intake with automatic language detection, priority assessment, and instant tracking number generation.')}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium self-start sm:self-auto">
              <span>🤖</span> {t('AI Triage & Prioritization')}
            </div>
          </div>
        </div>

        {/* Demo banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-8 flex items-start gap-3 text-xs text-amber-900">
          <span className="text-base shrink-0">⚗️</span>
          <div>
            <strong className="font-semibold">{t('Simulated Record:')}</strong> {t('All tracking timelines and officer remarks are fictional data generated for demonstration purposes.')}
          </div>
        </div>

        {/* Multi-step progress bar */}
        {step < 5 && (
          <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between relative">
              {[
                { num: 1, label: t('Contact') },
                { num: 2, label: t('Location') },
                { num: 3, label: t('Grievance') },
                { num: 4, label: t('Review') },
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
                  <span>👤</span> {t('Contact Details')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t('We use your phone number and email to transmit real-time SMS/WhatsApp progress alerts.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    {t('Complainant Name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={contact.isAnonymous}
                    value={contact.isAnonymous ? t('Masked (Privacy Mode)') : contact.name}
                    onChange={e => setContact({ ...contact, name: e.target.value })}
                    placeholder={t('Enter your full name')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    {t('Mobile Number')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={contact.phone}
                      onChange={e => setContact({ ...contact, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder={t('Enter 10-digit mobile number')}
                      className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{t('Status milestones are dispatched via automated SMS.')}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    {t('Email Address (Optional)')}
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={e => setContact({ ...contact, email: e.target.value })}
                    placeholder={t('Enter email address (optional)')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    {t('Preferred Language')}
                  </label>
                  <select
                    value={contact.preferredLanguage}
                    onChange={e => setContact({ ...contact, preferredLanguage: e.target.value as Language })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] bg-white cursor-pointer"
                  >
                    <option value="en">English</option>
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
                      {t('Keep my identity confidential (Anonymous Submission)')}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('Your name will not be disclosed to departmental staff or field inspectors. Recommended for whistleblowing or sensitive community disputes.')}
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!contact.phone || (!contact.name && !contact.isAnonymous)) {
                      alert(t('Please provide your name and phone number before proceeding.'));
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] text-white font-semibold hover:bg-blue-800 shadow-sm transition-all flex items-center gap-2"
                >
                  {t('Next: Location Details →')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION DETAILS */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📍</span> {t('Incident Location')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t('Accurate location helps route your grievance to the correct taluk and local office.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    {t('District')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={location.districtId}
                    onChange={e => {
                      setLocation(previous => ({ ...previous, districtId: e.target.value, mandal: '' }));
                      setLocationError('');
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] bg-white cursor-pointer"
                  >
                    <option value="" disabled>{t('Select District')}</option>
                    {TN_DISTRICTS.map(d => (
                      <option key={d.id} value={d.id}>{d.district_name} {t('District')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    {t('Taluk / Tehsil')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location.mandal}
                    onChange={e => setLocation(previous => ({ ...previous, mandal: e.target.value }))}
                    placeholder={t('e.g., Mylapore')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    {t('Village / Ward / Area')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location.village}
                    onChange={e => setLocation(previous => ({ ...previous, village: e.target.value }))}
                    placeholder={t('e.g., Lakshmipuram, Ward 12')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    {t('Pincode')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={location.pincode}
                    onChange={e => setLocation({ ...location, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder={t('6-digit postal code')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  {t('Specific Location / Street Address')}
                </label>
                <textarea
                  rows={2}
                  value={location.address}
                  onChange={e => setLocation(previous => ({ ...previous, address: e.target.value }))}
                  placeholder={t('Landmark, street, or house number')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] resize-none"
                />
              </div>

              {/* Current location lookup */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-blue-50/60 border border-blue-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1D4ED8] flex items-center justify-center text-lg">
                    🧭
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t('Current Location & Address')}</p>
                    <p className="text-[11px] text-slate-500">
                      {location.coords
                        ? `${t('Location detected')}: Lat ${location.coords.lat.toFixed(4)}, Lng ${location.coords.lng.toFixed(4)}`
                        : t('Use GPS to fill the address and select the Tamil Nadu district.')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold shadow-sm transition-all shrink-0"
                >
                  {isLocating ? `⏳ ${t('Finding your location…')}` : location.coords ? `✓ ${t('Location detected')}` : `📍 ${t('Fetch My Current Location')}`}
                </button>
              </div>
              <p className="-mt-4 text-[11px] text-slate-500">{t('Your coordinates are sent to OpenStreetMap to look up the address.')}</p>
              {locationError && (
                <p role="alert" className="-mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                  {locationError}
                </p>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm"
                >
                  {t('← Back: Contact')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!location.districtId) {
                      alert(t('Please select a Tamil Nadu district.'));
                      return;
                    }
                    if (!location.village.trim()) {
                      alert(t('Please provide your village, town, or ward.'));
                      return;
                    }
                    if (!location.mandal.trim()) {
                      alert(t('Please provide your taluk.'));
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] text-white font-semibold hover:bg-blue-800 shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                  {t('Next: Grievance Details →')}
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
                      <span>📝</span> {t('Grievance Details')}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('Write or speak in your own dialect. Our rule-based AI engine extracts urgency, severity, and department taxonomy.')}
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full self-start">
                    {t('Live Stream')}
                  </span>
                </div>
              </div>

              {/* Quick load sample scenarios */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <span>💡</span> {t('Quick Demo Cases:')}
                  </span>
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
                  {t('Grievance Subject / Title')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={grievance.title}
                  onChange={e => setGrievance({ ...grievance, title: e.target.value })}
                  placeholder={t('Briefly state the problem (e.g., Live wire dangling over school road)')}
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
                      'எங்கள் தெருவில் மின்கம்பம் சாய்ந்து கம்பிகள் சாலையில் அறுந்து கிடக்கின்றன. தீப்பொறி பறக்கிறது. தயவுசெய்து உடனடியாக சரிசெய்யவும்.',
                      'சாலையில் அறுந்து கிடக்கும் மின்கம்பி - அவசரப் பிரச்சனை (Fallen electric wire)'
                    )}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-[#0D9488] text-white hover:bg-teal-700'
                    }`}
                  >
                    <span>🎙️</span> {isListening ? t('Listening... Speak now') : t('Speak in Tamil / English (Voice Ingest)')}
                  </button>
                </div>
                <span className="text-[11px] font-mono text-teal-600 bg-white px-2 py-0.5 rounded border border-teal-200">
                  {t('Languages Supported')}
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  {t('Detailed Description')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={grievance.description}
                  onChange={e => setGrievance({ ...grievance, description: e.target.value })}
                  placeholder={t('Describe the issue in detail. You can write in Tamil or English.')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] resize-none"
                />
              </div>

              {/* Attachment Simulation */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-1">📸</span>
                <p className="text-xs font-semibold text-slate-700">{t('Attach Photographic or Document Evidence (Optional)')}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                  {t('Attach geo-tagged site photographs, utility bills, or previous reference letters (JPG, PNG, PDF up to 10MB).')}
                </p>
                <label className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs">
                  <span>📎 {t('Click to upload image (JPG, PNG) or PDF')}</span>
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
                    <span>✓ {t('File uploaded')}:</span>
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
                        {t('AI Triage Analysis')}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded text-blue-700 border border-blue-200 font-semibold">
                      {t('Confidence Score')} {aiPreview.classification.confidence}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Detected Language */}
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{t('Preferred Language')}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {aiPreview.langInfo.name}
                      </p>
                      <span className="text-[10px] text-teal-600 font-medium">
                        {aiPreview.langInfo.confidence}% {t('Confidence Score')}
                      </span>
                    </div>

                    {/* Department Recommendation */}
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{t('Assigned Department')}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                        {t(aiPreview.departmentName)}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {t('Category')}: {t(aiPreview.classification.category)}
                      </span>
                    </div>

                    {/* Priority Recommendation */}
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{t('AI Priority Recommendation')}</p>
                      <div className="mt-1">
                        <PriorityBadge priority={aiPreview.classification.priority} />
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {aiPreview.classification.review_required ? t('Audited by Officer') : t('Passed Algorithmic Threshold')}
                      </span>
                    </div>
                  </div>

                  {/* AI Explanation Text */}
                  <div className="p-3 bg-white/80 rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">{t('Algorithmic Reasoning: ')}</strong>
                    {t(aiPreview.classification.explanation)}
                  </div>

                  {/* Duplicate Detection Warning */}
                  {aiPreview.duplicates.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <span className="text-base shrink-0">⚠️</span>
                      <div>
                        <strong>{t('Potential Duplicate Grievance Detected')} ({aiPreview.duplicates[0].similarity_score}%):</strong>
                        <p className="mt-0.5 text-amber-800">
                          {t('A similar complaint has already been registered in this area.')}
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
                  {t('← Back: Location')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!grievance.title.trim() || !grievance.description.trim()) {
                      alert(t('Please provide a title and detailed description for your grievance.'));
                      return;
                    }
                    setStep(4);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#1D4ED8] text-white font-semibold hover:bg-blue-800 shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                  {t('Next: Review AI Analysis →')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📋</span> {t('AI Analysis & Review')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t('Please verify your particulars and complaint synopsis before generating an official tracking dossier.', 'Please verify your particulars and complaint synopsis before generating an official tracking dossier.')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">{t('Citizen Particulars')}</h3>
                    <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">{t('Edit')}</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {contact.isAnonymous ? t('Masked (Privacy Mode)') : contact.name}
                  </p>
                  <p className="text-xs text-slate-600">📱 +91 {contact.phone}</p>
                  {contact.email && <p className="text-xs text-slate-600">✉️ {contact.email}</p>}
                  <p className="text-xs text-slate-500">{t('Preferred Language')}: {contact.preferredLanguage.toUpperCase()}</p>
                </div>

                {/* Location Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">{t('Incident Location')}</h3>
                    <button type="button" onClick={() => setStep(2)} className="text-xs text-blue-600 hover:underline">{t('Edit')}</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {location.village}, {location.mandal} {t('Taluk / Tehsil')}
                  </p>
                  <p className="text-xs text-slate-600">{currentDistrict.district_name} {t('District')}</p>
                  {location.address && <p className="text-xs text-slate-500">{t('Specific Location / Street Address')}: {location.address}</p>}
                  {location.pincode && <p className="text-xs text-slate-500">{t('Pincode')}: {location.pincode}</p>}
                </div>
              </div>

              {/* Complaint Synopsis */}
              <div className="p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase">{t('Complaint Summary')}</h3>
                  <button type="button" onClick={() => setStep(3)} className="text-xs text-blue-600 hover:underline">{t('Edit')}</button>
                </div>
                <h4 className="text-base font-bold text-slate-900">{t(grievance.title)}</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {grievance.description}
                </p>
                {grievance.attachmentName && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>📎 {t('File uploaded')}:</span>
                    <span className="font-mono">{grievance.attachmentName}</span>
                  </p>
                )}
              </div>

              {/* AI Dispatch Routing Preview */}
              {aiPreview && (
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">{t('Automated Dispatch Target')}</span>
                    <p className="text-sm font-bold text-teal-950 mt-0.5">
                      {t(aiPreview.departmentName)} — {t(aiPreview.classification.category)}
                    </p>
                    <p className="text-xs text-teal-800 mt-1">
                      {t('Priority')}: <span className="uppercase">{t(aiPreview.classification.priority)}</span> ({aiPreview.classification.confidence}% {t('Confidence Score')})
                    </p>
                  </div>
                  <PriorityBadge priority={aiPreview.classification.priority} />
                </div>
              )}

              {/* Legal confirmation */}
              <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                {t('By lodging this grievance, you affirm that the particulars stated are true to the best of your knowledge. All records are subject to officer audit.')}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm"
                >
                  {t('← Back: Edit Grievance')}
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
                      {t('Submitting Grievance...')}
                    </>
                  ) : (
                    <>🚀 {t('Submit Grievance')}</>
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
                  {t('Grievance Registered Successfully!')}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
                  {t('Submission Complete')}
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  {t('A designated department nodal officer has been assigned to audit the AI recommendations and dispatch field personnel.')}
                </p>
              </div>

              {/* Tracking ID Badge */}
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-900 text-white shadow-xl space-y-3">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">{t('Your Unique Tracking ID')}</p>
                <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-teal-400">
                  {trackingResult.grievanceNumber}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(trackingResult.grievanceNumber);
                      alert(t('Tracking ID copied!'));
                    }}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>📋 {t('Copy Tracking ID')}</span>
                  </button>
                </div>
              </div>

              {/* Summary Details Table */}
              <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Assigned Department')}:</span>
                  <span className="font-semibold text-slate-900">{t(trackingResult.department)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{t('AI Priority Recommendation')}:</span>
                  <PriorityBadge priority={trackingResult.priority} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Mobile Number')}:</span>
                  <span className="font-mono text-emerald-700">SMS queued to +91 {contact.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('SLA Target Resolution Time')}:</span>
                  <span className="font-semibold text-slate-900">{t('Within 24 Hours')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/track?id=${trackingResult.grievanceNumber}`)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1D4ED8] text-white font-bold hover:bg-blue-800 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  🔍 {t('Track This Grievance')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  🖨️ {t('Print Dossier')}
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
                  {t('File Another Grievance')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
