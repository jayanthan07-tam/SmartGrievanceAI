/**
 * SmartGrievance AI — Demo Database (localStorage-backed)
 * All data is fictional and used for hackathon demonstration only.
 */

import type {
  User, Complaint, AIAnalysis, ComplaintHistory,
  DuplicateMatch, Notification, Officer, Escalation,
  ResolutionFeedback
} from '../types';

// ─── Seed Users ───────────────────────────────────────────────────────────────

export const SEED_USERS: User[] = [
  // Citizens
  { id: 'u-citizen-1', name: 'Ravi Kumar', email: 'citizen@demo.com', phone: '9876543210', password_hash: 'demo123', role: 'citizen', preferred_language: 'te', created_at: '2026-09-01T10:00:00Z', is_active: true },
  { id: 'u-citizen-2', name: 'Lakshmi Devi', email: 'lakshmi@demo.com', phone: '9876543211', password_hash: 'demo123', role: 'citizen', preferred_language: 'te', created_at: '2026-09-05T09:30:00Z', is_active: true },
  { id: 'u-citizen-3', name: 'Suresh Babu', email: 'suresh@demo.com', phone: '9876543212', password_hash: 'demo123', role: 'citizen', preferred_language: 'en', created_at: '2026-09-10T11:00:00Z', is_active: true },
  { id: 'u-citizen-4', name: 'Priya Sharma', email: 'priya@demo.com', phone: '9876543213', password_hash: 'demo123', role: 'citizen', preferred_language: 'hi', created_at: '2026-09-12T14:00:00Z', is_active: true },
  { id: 'u-citizen-5', name: 'Muthu Selvam', email: 'muthu@demo.com', phone: '9876543214', password_hash: 'demo123', role: 'citizen', preferred_language: 'ta', created_at: '2026-09-15T08:00:00Z', is_active: true },
  { id: 'u-citizen-6', name: 'Anitha Reddy', email: 'anitha@demo.com', phone: '9876543215', password_hash: 'demo123', role: 'citizen', preferred_language: 'te', created_at: '2026-09-18T16:00:00Z', is_active: true },
  { id: 'u-citizen-7', name: 'Ramesh Naidu', email: 'ramesh@demo.com', phone: '9876543216', password_hash: 'demo123', role: 'citizen', preferred_language: 'te', created_at: '2026-09-20T12:00:00Z', is_active: true },
  // Officers
  { id: 'u-officer-1', name: 'K. Venkatesh Rao', email: 'officer@demo.com', phone: '9876500001', password_hash: 'demo123', role: 'officer', preferred_language: 'en', created_at: '2026-08-01T09:00:00Z', is_active: true },
  { id: 'u-officer-2', name: 'Dr. Padma Priya', email: 'officer2@demo.com', phone: '9876500002', password_hash: 'demo123', role: 'officer', preferred_language: 'te', created_at: '2026-08-01T09:00:00Z', is_active: true },
  { id: 'u-officer-3', name: 'Subrahmanyam J.', email: 'officer3@demo.com', phone: '9876500003', password_hash: 'demo123', role: 'officer', preferred_language: 'en', created_at: '2026-08-01T09:00:00Z', is_active: true },
  // District Admin
  { id: 'u-dadmin-1', name: 'Collector Srinivasa Murthy', email: 'districtadmin@demo.com', phone: '9876600001', password_hash: 'demo123', role: 'district_admin', preferred_language: 'en', created_at: '2026-07-01T09:00:00Z', is_active: true },
  // Super Admin
  { id: 'u-sadmin-1', name: 'System Administrator', email: 'admin@demo.com', phone: '9876700001', password_hash: 'demo123', role: 'super_admin', preferred_language: 'en', created_at: '2026-06-01T09:00:00Z', is_active: true },
];

export const SEED_OFFICERS: Officer[] = [
  { id: 'off-1', user_id: 'u-officer-1', department_id: 'dept-water-supply', district_id: 'dist-guntur', designation: 'Assistant Engineer', cases_assigned: 12, cases_resolved: 8 },
  { id: 'off-2', user_id: 'u-officer-2', department_id: 'dept-health', district_id: 'dist-guntur', designation: 'District Medical Officer', cases_assigned: 9, cases_resolved: 7 },
  { id: 'off-3', user_id: 'u-officer-3', department_id: 'dept-electricity', district_id: 'dist-visakhapatnam', designation: 'Electrical Supervisor', cases_assigned: 15, cases_resolved: 13 },
];

// ─── Seed Complaints (30+) ────────────────────────────────────────────────────

export const SEED_COMPLAINTS: Complaint[] = [
  // Demo 1: Critical Emergency - Live Wire
  {
    id: 'comp-001',
    grievance_number: 'SGAI-2026-000001',
    citizen_id: 'u-citizen-1',
    title: 'Fallen live electric wire on main road - Emergency',
    original_description: 'A high-tension electric wire has fallen on the main road near Lakshmipuram junction. The wire is still live and sparking. Children are passing this route to school. Immediate attention is needed to prevent accidents.',
    language: 'en',
    district_id: 'dist-guntur',
    mandal: 'Guntur',
    village: 'Lakshmipuram',
    category: 'Live Wire Hazard',
    suggested_priority: 'critical',
    confirmed_priority: 'critical',
    suggested_department_id: 'dept-electricity',
    assigned_department_id: 'dept-electricity',
    assigned_officer_id: 'off-3',
    status: 'in_progress',
    ai_analysis_id: 'ai-001',
    attachments: [],
    location_lat: 16.3107,
    location_lng: 80.4385,
    created_at: '2026-10-14T08:30:00Z',
    updated_at: '2026-10-14T09:15:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  // Demo 2: Telugu Water Complaint
  {
    id: 'comp-002',
    grievance_number: 'SGAI-2026-000002',
    citizen_id: 'u-citizen-2',
    title: 'మూడు రోజులుగా తాగు నీరు లేదు - నల్లా పైపు పగిలింది',
    original_description: 'మా గ్రామంలో మూడు రోజుల నుండి తాగు నీళ్ళు రావడం లేదు. నల్లా పైపు పగిలి నీళ్ళు రోడ్డుపైన పారుతున్నాయి. పిల్లలకు, పెద్దలకు తాగు నీళ్ళు లేక చాలా కష్టంగా ఉంది. వెంటనే మరమ్మత్తు చేయాలని విన్నవించుకుంటున్నాము.',
    language: 'te',
    district_id: 'dist-guntur',
    mandal: 'Tenali',
    village: 'Kollipara',
    category: 'Drinking Water Shortage',
    suggested_priority: 'high',
    confirmed_priority: 'high',
    suggested_department_id: 'dept-water-supply',
    assigned_department_id: 'dept-water-supply',
    assigned_officer_id: 'off-1',
    status: 'in_progress',
    ai_analysis_id: 'ai-002',
    attachments: [],
    location_lat: 16.2407,
    location_lng: 80.6285,
    created_at: '2026-10-13T10:00:00Z',
    updated_at: '2026-10-13T14:30:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  // Demo 3: Agricultural - Coconut Production Decline
  {
    id: 'comp-003',
    grievance_number: 'SGAI-2026-000003',
    citizen_id: 'u-citizen-3',
    title: 'Coconut production declining - Suspected saline water intrusion in agricultural land',
    original_description: 'Our coconut plantation in Nallapadu village has been experiencing significant decline in production over the past 3 months. The leaves are yellowing and the nuts are falling prematurely. We suspect the irrigation canal water may be contaminated with saltwater as it is close to the backwaters. The entire 50-acre coconut farming cooperative is affected. Our livelihoods depend on this crop.',
    language: 'en',
    district_id: 'dist-guntur',
    mandal: 'Tadepalle',
    village: 'Nallapadu',
    category: 'Crop Damage',
    suggested_priority: 'high',
    confirmed_priority: 'high',
    suggested_department_id: 'dept-horticulture',
    assigned_department_id: 'dept-horticulture',
    assigned_officer_id: null,
    status: 'pending_review',
    ai_analysis_id: 'ai-003',
    attachments: [],
    location_lat: 16.3507,
    location_lng: 80.5285,
    created_at: '2026-10-12T09:00:00Z',
    updated_at: '2026-10-12T09:45:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  // Demo 4a: Road damage - duplicate pair
  {
    id: 'comp-004',
    grievance_number: 'SGAI-2026-000004',
    citizen_id: 'u-citizen-4',
    title: 'Main village road has many dangerous potholes',
    original_description: 'The main road connecting our village to the highway has numerous large potholes. Vehicles are getting damaged and two-wheelers have skidded and caused injuries to commuters. Rain water is also collecting in these potholes making it worse. The condition has been like this for over 6 months.',
    language: 'en',
    district_id: 'dist-krishna',
    mandal: 'Gudivada',
    village: 'Kanchikacherla',
    category: 'Road Damage / Potholes',
    suggested_priority: 'medium',
    confirmed_priority: 'medium',
    suggested_department_id: 'dept-roads',
    assigned_department_id: 'dept-roads',
    assigned_officer_id: null,
    status: 'assigned',
    ai_analysis_id: 'ai-004',
    attachments: [],
    location_lat: 16.5407,
    location_lng: 80.9085,
    created_at: '2026-10-10T11:00:00Z',
    updated_at: '2026-10-11T08:30:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  // Demo 4b: Road damage duplicate
  {
    id: 'comp-005',
    grievance_number: 'SGAI-2026-000005',
    citizen_id: 'u-citizen-5',
    title: 'Our village main road is badly damaged and causing accidents',
    original_description: 'The road in our village, Kanchikacherla, is in very poor condition with big holes everywhere. Last week a two-wheeler rider fell into a pothole and broke his leg. The road needs urgent repair. We have been requesting for months but nothing has been done.',
    language: 'en',
    district_id: 'dist-krishna',
    mandal: 'Gudivada',
    village: 'Kanchikacherla',
    category: 'Road Damage / Potholes',
    suggested_priority: 'medium',
    confirmed_priority: 'medium',
    suggested_department_id: 'dept-roads',
    assigned_department_id: 'dept-roads',
    assigned_officer_id: null,
    status: 'assigned',
    ai_analysis_id: 'ai-005',
    attachments: [],
    location_lat: 16.5407,
    location_lng: 80.9085,
    created_at: '2026-10-11T14:00:00Z',
    updated_at: '2026-10-11T15:00:00Z',
    resolved_at: null,
    is_duplicate_of: 'comp-004',
  },
  // Hindi complaint
  {
    id: 'comp-006',
    grievance_number: 'SGAI-2026-000006',
    citizen_id: 'u-citizen-4',
    title: 'सरकारी अस्पताल में दवाइयां उपलब्ध नहीं हैं',
    original_description: 'हमारे क्षेत्र के सरकारी अस्पताल में पिछले 2 सप्ताह से बुनियादी दवाइयां उपलब्ध नहीं हैं। बुजुर्ग मरीजों को निजी दवाखाने से महंगी दवाइयां खरीदनी पड़ रही हैं। सरकारी डॉक्टर भी लापता रहते हैं। कृपया तुरंत कार्रवाई की जाए।',
    language: 'hi',
    district_id: 'dist-kurnool',
    mandal: 'Nandyal',
    village: 'Srisailam',
    category: 'Hospital / Medical Services',
    suggested_priority: 'high',
    confirmed_priority: 'high',
    suggested_department_id: 'dept-health',
    assigned_department_id: 'dept-health',
    assigned_officer_id: 'off-2',
    status: 'in_progress',
    ai_analysis_id: 'ai-006',
    attachments: [],
    location_lat: 16.0800,
    location_lng: 78.8715,
    created_at: '2026-10-09T08:00:00Z',
    updated_at: '2026-10-10T10:00:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  // Tamil complaint
  {
    id: 'comp-007',
    grievance_number: 'SGAI-2026-000007',
    citizen_id: 'u-citizen-5',
    title: 'தெருவில் குப்பை கொட்டுவதால் நோய்கள் பரவுகின்றன',
    original_description: 'எங்கள் தெருவில் ஒரு வாரமாக குப்பை கொட்டப்படாமல் தேங்கி நிற்கிறது. கொசுக்கள் மிகுதியாக உள்ளன. குழந்தைகளுக்கு டெங்கு காய்ச்சல் வருகிறது. நகராட்சி அதிகாரிகள் கவனிக்கவில்லை. உடனடி நடவடிக்கை எடுக்கவும்.',
    language: 'ta',
    district_id: 'dist-chittoor',
    mandal: 'Tirupati',
    village: 'Renigunta',
    category: 'Garbage / Sanitation',
    suggested_priority: 'high',
    confirmed_priority: 'high',
    suggested_department_id: 'dept-municipal',
    assigned_department_id: 'dept-municipal',
    assigned_officer_id: null,
    status: 'pending_review',
    ai_analysis_id: 'ai-007',
    attachments: [],
    location_lat: 13.6537,
    location_lng: 79.5110,
    created_at: '2026-10-13T12:00:00Z',
    updated_at: '2026-10-13T12:30:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  // Resolved complaint
  {
    id: 'comp-008',
    grievance_number: 'SGAI-2026-000008',
    citizen_id: 'u-citizen-6',
    title: 'Street light not working near school for 2 weeks',
    original_description: 'The street light near ZPHS Government School junction has not been working for the past 2 weeks. Students leave school after dark and it is unsafe without lighting. Multiple vehicles have had near-miss accidents.',
    language: 'en',
    district_id: 'dist-east-godavari',
    mandal: 'Kakinada',
    village: 'Kakinada',
    category: 'Street Light Failure',
    suggested_priority: 'medium',
    confirmed_priority: 'medium',
    suggested_department_id: 'dept-electricity',
    assigned_department_id: 'dept-electricity',
    assigned_officer_id: 'off-3',
    status: 'resolved',
    ai_analysis_id: 'ai-008',
    attachments: [],
    location_lat: 16.9891,
    location_lng: 82.2475,
    created_at: '2026-10-01T09:00:00Z',
    updated_at: '2026-10-05T14:00:00Z',
    resolved_at: '2026-10-05T14:00:00Z',
    is_duplicate_of: null,
  },
  // Escalated complaint
  {
    id: 'comp-009',
    grievance_number: 'SGAI-2026-000009',
    citizen_id: 'u-citizen-7',
    title: 'Pension not received for 3 months - Old age widow',
    original_description: 'My mother is 78 years old widow. She has not received her old age pension for the last 3 months. She visited the Panchayat office multiple times but was told the records are being updated. She has no other income source. We need immediate resolution.',
    language: 'en',
    district_id: 'dist-vizianagaram',
    mandal: 'Bobbili',
    village: 'Therlam',
    category: 'Pension / Welfare Benefits',
    suggested_priority: 'high',
    confirmed_priority: 'high',
    suggested_department_id: 'dept-social-welfare',
    assigned_department_id: 'dept-social-welfare',
    assigned_officer_id: null,
    status: 'escalated',
    ai_analysis_id: 'ai-009',
    attachments: [],
    location_lat: 18.5400,
    location_lng: 83.3600,
    created_at: '2026-10-05T10:00:00Z',
    updated_at: '2026-10-12T09:00:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  // More complaints to reach 30+
  {
    id: 'comp-010',
    grievance_number: 'SGAI-2026-000010',
    citizen_id: 'u-citizen-1',
    title: 'Irrigation canal blocked causing crop damage in paddy fields',
    original_description: 'The main irrigation canal in our mandal has been blocked with silt and debris for the past month. Paddy crops in 200+ acres are not getting water. Farmers are losing their crops. The Irrigation Department has not responded to our repeated requests.',
    language: 'en',
    district_id: 'dist-east-godavari',
    mandal: 'Ramachandrapuram',
    village: 'Mandapeta',
    category: 'Irrigation Water Shortage',
    suggested_priority: 'high',
    confirmed_priority: 'high',
    suggested_department_id: 'dept-irrigation',
    assigned_department_id: 'dept-irrigation',
    assigned_officer_id: null,
    status: 'pending_review',
    ai_analysis_id: 'ai-010',
    attachments: [],
    location_lat: 16.8700,
    location_lng: 81.9200,
    created_at: '2026-10-11T08:00:00Z',
    updated_at: '2026-10-11T08:30:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  {
    id: 'comp-011',
    grievance_number: 'SGAI-2026-000011',
    citizen_id: 'u-citizen-2',
    title: 'రేషన్ దుకాణంలో బియ్యం నాణ్యత చాలా పేలవంగా ఉంది',
    original_description: 'మా గ్రామంలో ఉన్న రేషన్ దుకాణం నుండి ఇస్తున్న బియ్యం నాణ్యత చాలా పేలవంగా ఉంది. బియ్యంలో రాళ్ళు, దుమ్ము ఎక్కువగా ఉన్నాయి. రేషన్ కార్డు ఉన్నా సరైన అందుకోవడం లేదు.',
    language: 'te',
    district_id: 'dist-west-godavari',
    mandal: 'Tanuku',
    village: 'Palakollu',
    category: 'Fair Price Shop Issues',
    suggested_priority: 'medium',
    confirmed_priority: 'medium',
    suggested_department_id: 'dept-food',
    assigned_department_id: 'dept-food',
    assigned_officer_id: null,
    status: 'submitted',
    ai_analysis_id: 'ai-011',
    attachments: [],
    location_lat: 16.5100,
    location_lng: 81.7300,
    created_at: '2026-10-14T15:00:00Z',
    updated_at: '2026-10-14T15:30:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  {
    id: 'comp-012',
    grievance_number: 'SGAI-2026-000012',
    citizen_id: 'u-citizen-3',
    title: 'Factory discharging chemical effluents into Krishna river',
    original_description: 'A chemical factory near Vijayawada is illegally discharging industrial effluents into the Krishna river. The water has turned dark and has a foul smell. Fish are dying in large numbers. Local fishermen are losing their livelihood. This poses a serious public health threat.',
    language: 'en',
    district_id: 'dist-krishna',
    mandal: 'Vijayawada',
    village: 'Gannavaram',
    category: 'Environmental Pollution',
    suggested_priority: 'critical',
    confirmed_priority: 'critical',
    suggested_department_id: 'dept-environment',
    assigned_department_id: 'dept-environment',
    assigned_officer_id: null,
    status: 'escalated',
    ai_analysis_id: 'ai-012',
    attachments: [],
    location_lat: 16.5407,
    location_lng: 80.6485,
    created_at: '2026-10-08T07:00:00Z',
    updated_at: '2026-10-10T11:00:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  {
    id: 'comp-013',
    grievance_number: 'SGAI-2026-000013',
    citizen_id: 'u-citizen-6',
    title: 'School teachers absent for 15 days continuously',
    original_description: 'The government primary school in our village has 3 teacher vacancies that have not been filled for over a year. The remaining 2 teachers have been absent for the past 15 days without replacement. Over 120 students are being left without education.',
    language: 'en',
    district_id: 'dist-anantapur',
    mandal: 'Kadiri',
    village: 'Tanakal',
    category: 'School Infrastructure',
    suggested_priority: 'medium',
    confirmed_priority: 'medium',
    suggested_department_id: 'dept-education',
    assigned_department_id: 'dept-education',
    assigned_officer_id: null,
    status: 'assigned',
    ai_analysis_id: 'ai-013',
    attachments: [],
    location_lat: 14.1100,
    location_lng: 78.1600,
    created_at: '2026-10-10T10:00:00Z',
    updated_at: '2026-10-11T09:00:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  {
    id: 'comp-014',
    grievance_number: 'SGAI-2026-000014',
    citizen_id: 'u-citizen-7',
    title: 'भूमि अभिलेखों में गड़बड़ी - अवैध कब्जा',
    original_description: 'हमारी पैतृक जमीन पर पड़ोसी ने अवैध रूप से कब्जा कर लिया है। राजस्व विभाग में कई बार शिकायत की लेकिन कोई सुनवाई नहीं हुई। पटवारी भी सही रिकॉर्ड नहीं दे रहा। न्याय मिलना जरूरी है।',
    language: 'hi',
    district_id: 'dist-kadapa',
    mandal: 'Pulivendla',
    village: 'Brahmamgari Matham',
    category: 'Land Dispute',
    suggested_priority: 'medium',
    confirmed_priority: 'medium',
    suggested_department_id: 'dept-revenue',
    assigned_department_id: 'dept-revenue',
    assigned_officer_id: null,
    status: 'more_info_required',
    ai_analysis_id: 'ai-014',
    attachments: [],
    location_lat: 14.4200,
    location_lng: 78.2300,
    created_at: '2026-10-09T13:00:00Z',
    updated_at: '2026-10-12T10:00:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  {
    id: 'comp-015',
    grievance_number: 'SGAI-2026-000015',
    citizen_id: 'u-citizen-1',
    title: 'Cyclone damaged homes - relief not received',
    original_description: 'Our village was severely affected by the recent cyclone. More than 40 houses were completely destroyed. We submitted relief applications 3 weeks ago but have not received any compensation or support from the government. Many families are living in temporary shelters in dire conditions.',
    language: 'en',
    district_id: 'dist-srikakulam',
    mandal: 'Sompeta',
    village: 'Kaviti',
    category: 'Flood Relief',
    suggested_priority: 'critical',
    confirmed_priority: 'critical',
    suggested_department_id: 'dept-disaster',
    assigned_department_id: 'dept-disaster',
    assigned_officer_id: null,
    status: 'escalated',
    ai_analysis_id: 'ai-015',
    attachments: [],
    location_lat: 18.9200,
    location_lng: 84.4800,
    created_at: '2026-10-07T11:00:00Z',
    updated_at: '2026-10-10T14:00:00Z',
    resolved_at: null,
    is_duplicate_of: null,
  },
  // Additional complaints for analytics
  {
    id: 'comp-016', grievance_number: 'SGAI-2026-000016', citizen_id: 'u-citizen-2', title: 'Bus service discontinued to our village', original_description: 'The only government bus connecting our village to the town has been discontinued without notice for the past 10 days. Over 500 residents are affected. Students cannot reach their college. Old people cannot visit hospital.', language: 'en', district_id: 'dist-prakasam', mandal: 'Markapuram', village: 'Podili', category: 'Public Transport', suggested_priority: 'medium', confirmed_priority: 'medium', suggested_department_id: 'dept-transport', assigned_department_id: 'dept-transport', assigned_officer_id: null, status: 'submitted', ai_analysis_id: 'ai-016', attachments: [], location_lat: 15.2700, location_lng: 79.5100, created_at: '2026-10-14T07:00:00Z', updated_at: '2026-10-14T07:30:00Z', resolved_at: null, is_duplicate_of: null,
  },
  {
    id: 'comp-017', grievance_number: 'SGAI-2026-000017', citizen_id: 'u-citizen-3', title: 'Child labour in local brick kiln', original_description: 'Several children below age 14 are being made to work in the brick kiln near our village. They work long hours in hazardous conditions. We have reported to local police but no action has been taken.', language: 'en', district_id: 'dist-nellore', mandal: 'Gudur', village: 'Pellakuru', category: 'Child Labour', suggested_priority: 'critical', confirmed_priority: 'critical', suggested_department_id: 'dept-labour', assigned_department_id: 'dept-labour', assigned_officer_id: null, status: 'pending_review', ai_analysis_id: 'ai-017', attachments: [], location_lat: 14.1500, location_lng: 79.8500, created_at: '2026-10-13T16:00:00Z', updated_at: '2026-10-13T16:30:00Z', resolved_at: null, is_duplicate_of: null,
  },
  {
    id: 'comp-018', grievance_number: 'SGAI-2026-000018', citizen_id: 'u-citizen-4', title: 'Drinking water contaminated with sewage overflow', original_description: 'The drinking water supply in Ward 5 has been contaminated due to a sewage pipe leak mixing with the water main. Several families have fallen ill with stomach infections. Water quality testing is urgently required.', language: 'en', district_id: 'dist-visakhapatnam', mandal: 'Visakhapatnam', village: 'Gajuwaka', category: 'Water Pipeline Damage', suggested_priority: 'critical', confirmed_priority: 'critical', suggested_department_id: 'dept-water-supply', assigned_department_id: 'dept-water-supply', assigned_officer_id: 'off-1', status: 'in_progress', ai_analysis_id: 'ai-018', attachments: [], location_lat: 17.6868, location_lng: 83.2185, created_at: '2026-10-12T06:00:00Z', updated_at: '2026-10-12T08:00:00Z', resolved_at: null, is_duplicate_of: null,
  },
  {
    id: 'comp-019', grievance_number: 'SGAI-2026-000019', citizen_id: 'u-citizen-5', title: 'தமிழ்நாடு எல்லை பகுதியில் விவசாயிகளுக்கு பாசன நீர் வரவில்லை', original_description: 'கடந்த 15 நாட்களாக பாசன கால்வாயில் தண்ணீர் வரவில்லை. நெல் பயிர்கள் வாடுகின்றன. ஆயிரக்கணக்கான ஏக்கர் விவசாய நிலங்கள் பாதிக்கப்படும் அபாயம் உள்ளது. உடனடி நடவடிக்கை தேவை.', language: 'ta', district_id: 'dist-chittoor', mandal: 'Nagari', village: 'Puttur', category: 'Irrigation Water Shortage', suggested_priority: 'high', confirmed_priority: 'high', suggested_department_id: 'dept-irrigation', assigned_department_id: 'dept-irrigation', assigned_officer_id: null, status: 'assigned', ai_analysis_id: 'ai-019', attachments: [], location_lat: 13.4400, location_lng: 79.5500, created_at: '2026-10-10T14:00:00Z', updated_at: '2026-10-11T10:00:00Z', resolved_at: null, is_duplicate_of: null,
  },
  {
    id: 'comp-020', grievance_number: 'SGAI-2026-000020', citizen_id: 'u-citizen-6', title: 'Dilapidated government hospital building - patient safety risk', original_description: 'The roof of the government hospital in Proddatur has developed major cracks. During the last rain, parts of the ceiling collapsed in the maternity ward. Fortunately nobody was injured but it is a serious safety hazard for patients and staff.', language: 'en', district_id: 'dist-kadapa', mandal: 'Proddatur', village: 'Proddatur', category: 'Hospital / Medical Services', suggested_priority: 'critical', confirmed_priority: 'critical', suggested_department_id: 'dept-health', assigned_department_id: 'dept-health', assigned_officer_id: 'off-2', status: 'in_progress', ai_analysis_id: 'ai-020', attachments: [], location_lat: 14.7500, location_lng: 78.5500, created_at: '2026-10-11T09:00:00Z', updated_at: '2026-10-11T12:00:00Z', resolved_at: null, is_duplicate_of: null,
  },
  { id: 'comp-021', grievance_number: 'SGAI-2026-000021', citizen_id: 'u-citizen-7', title: 'Dangerous bridge needs urgent repair', original_description: 'The bridge connecting two villages in our mandal has developed large cracks. One side of the railing has fallen off. Heavy vehicles cross daily. Risk of major accident is very high.', language: 'en', district_id: 'dist-vizianagaram', mandal: 'Srungavarapukota', village: 'Gajapathinagaram', category: 'Road Damage / Potholes', suggested_priority: 'critical', confirmed_priority: 'critical', suggested_department_id: 'dept-roads', assigned_department_id: 'dept-roads', assigned_officer_id: null, status: 'escalated', ai_analysis_id: 'ai-021', attachments: [], location_lat: 18.0500, location_lng: 83.4000, created_at: '2026-10-06T08:00:00Z', updated_at: '2026-10-08T09:00:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-022', grievance_number: 'SGAI-2026-000022', citizen_id: 'u-citizen-1', title: 'Open drainage causing mosquito breeding', original_description: 'The open drain near the market has been overflowing for weeks. Stagnant water is causing mosquito infestation. Cases of malaria have been reported in nearby households. Needs immediate closure and cleaning.', language: 'en', district_id: 'dist-guntur', mandal: 'Narasaraopet', village: 'Narasaraopet', category: 'Drainage / Sewage Issue', suggested_priority: 'high', confirmed_priority: 'high', suggested_department_id: 'dept-municipal', assigned_department_id: 'dept-municipal', assigned_officer_id: null, status: 'submitted', ai_analysis_id: 'ai-022', attachments: [], location_lat: 16.2300, location_lng: 80.0500, created_at: '2026-10-15T07:30:00Z', updated_at: '2026-10-15T07:45:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-023', grievance_number: 'SGAI-2026-000023', citizen_id: 'u-citizen-2', title: 'PMAY house construction quality very poor', original_description: 'The house built under PMAY scheme in 2025 is already showing cracks in walls and roof leakage. Only inferior quality materials were used. The contractor did not follow specifications. We need inspection and proper repair.', language: 'en', district_id: 'dist-kurnool', mandal: 'Adoni', village: 'Alur', category: 'Housing Scheme Issues', suggested_priority: 'medium', confirmed_priority: 'medium', suggested_department_id: 'dept-housing', assigned_department_id: 'dept-housing', assigned_officer_id: null, status: 'pending_review', ai_analysis_id: 'ai-023', attachments: [], location_lat: 15.6200, location_lng: 77.2800, created_at: '2026-10-13T11:00:00Z', updated_at: '2026-10-13T11:30:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-024', grievance_number: 'SGAI-2026-000024', citizen_id: 'u-citizen-3', title: 'Aquaculture shrimp disease outbreak - need government assistance', original_description: 'White spot disease has wiped out over 60% of shrimp production in our ponds. About 30 aquaculture farmers are affected in our area. We need government support for disease testing, treatment, and crop insurance claims.', language: 'en', district_id: 'dist-east-godavari', mandal: 'Amalapuram', village: 'Amalapuram', category: 'Agricultural Input Issues', suggested_priority: 'high', confirmed_priority: 'high', suggested_department_id: 'dept-fisheries', assigned_department_id: 'dept-fisheries', assigned_officer_id: null, status: 'assigned', ai_analysis_id: 'ai-024', attachments: [], location_lat: 16.5700, location_lng: 82.0000, created_at: '2026-10-09T10:00:00Z', updated_at: '2026-10-10T09:00:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-025', grievance_number: 'SGAI-2026-000025', citizen_id: 'u-citizen-4', title: 'हमारे वार्ड में 3 दिन से पीने का पानी नहीं - पाइपलाइन टूटी है', original_description: 'हमारे वार्ड नंबर 14 में 3 दिन से मुख्य पेयजल पाइपलाइन टूटी हुई है, सड़क पर पानी भर गया है। बच्चों को पानी नहीं मिल रहा। कृपया तुरंत मरम्मत कराएं।', language: 'hi', district_id: 'dist-guntur', mandal: 'Guntur', village: 'Arundelpet', category: 'Drinking Water Shortage', suggested_priority: 'high', confirmed_priority: 'high', suggested_department_id: 'dept-water-supply', assigned_department_id: 'dept-water-supply', assigned_officer_id: 'off-1', status: 'in_progress', ai_analysis_id: 'ai-025', attachments: [], location_lat: 16.3007, location_lng: 80.4450, created_at: '2026-10-12T07:00:00Z', updated_at: '2026-10-12T09:00:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-026', grievance_number: 'SGAI-2026-000026', citizen_id: 'u-citizen-5', title: 'Transformer burned down - village without power for 5 days', original_description: 'The distribution transformer serving our village burned down 5 days ago. Around 200 households including the health subcentre are without power. Perishable goods in shops are being lost. Cold storage for vaccines is failing.', language: 'en', district_id: 'dist-west-godavari', mandal: 'Kovvur', village: 'Unguturu', category: 'Power Outage', suggested_priority: 'critical', confirmed_priority: 'critical', suggested_department_id: 'dept-electricity', assigned_department_id: 'dept-electricity', assigned_officer_id: 'off-3', status: 'in_progress', ai_analysis_id: 'ai-026', attachments: [], location_lat: 17.0000, location_lng: 81.3000, created_at: '2026-10-10T06:00:00Z', updated_at: '2026-10-10T10:00:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-027', grievance_number: 'SGAI-2026-000027', citizen_id: 'u-citizen-6', title: 'Borewell water quality degraded - excess fluoride suspected', original_description: 'The borewell water in our village has changed colour to yellowish and leaves residue. Several elderly residents are showing symptoms of dental fluorosis. Water quality testing reveals very high fluoride levels. Safe drinking water alternatives are urgently needed.', language: 'en', district_id: 'dist-anantapur', mandal: 'Tadipatri', village: 'Singanamala', category: 'Drinking Water Shortage', suggested_priority: 'high', confirmed_priority: 'high', suggested_department_id: 'dept-water-supply', assigned_department_id: 'dept-water-supply', assigned_officer_id: null, status: 'pending_review', ai_analysis_id: 'ai-027', attachments: [], location_lat: 14.9200, location_lng: 77.9600, created_at: '2026-10-14T09:00:00Z', updated_at: '2026-10-14T09:30:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-028', grievance_number: 'SGAI-2026-000028', citizen_id: 'u-citizen-7', title: 'Workplace accident - no safety equipment provided by employer', original_description: 'Workers at the granite quarry near our village are not provided any safety equipment like helmets or gloves. Last week one worker was seriously injured by a falling boulder. The owner refuses to provide safety gear citing costs. Labour department needs to inspect immediately.', language: 'en', district_id: 'dist-kadapa', mandal: 'Rajampet', village: 'Rajampet', category: 'Workplace Safety', suggested_priority: 'high', confirmed_priority: 'high', suggested_department_id: 'dept-labour', assigned_department_id: 'dept-labour', assigned_officer_id: null, status: 'assigned', ai_analysis_id: 'ai-028', attachments: [], location_lat: 14.1800, location_lng: 79.1600, created_at: '2026-10-08T14:00:00Z', updated_at: '2026-10-09T09:00:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-029', grievance_number: 'SGAI-2026-000029', citizen_id: 'u-citizen-1', title: 'Resolved: Public park cleaned and maintained', original_description: 'The public park near our community was in very poor condition with broken benches, overgrown grass and garbage. We requested maintenance a month ago.', language: 'en', district_id: 'dist-visakhapatnam', mandal: 'Visakhapatnam', village: 'Rushikonda', category: 'Garbage / Sanitation', suggested_priority: 'low', confirmed_priority: 'low', suggested_department_id: 'dept-municipal', assigned_department_id: 'dept-municipal', assigned_officer_id: null, status: 'resolved', ai_analysis_id: 'ai-029', attachments: [], location_lat: 17.7800, location_lng: 83.3700, created_at: '2026-09-15T10:00:00Z', updated_at: '2026-09-25T14:00:00Z', resolved_at: '2026-09-25T14:00:00Z', is_duplicate_of: null },
  { id: 'comp-030', grievance_number: 'SGAI-2026-000030', citizen_id: 'u-citizen-2', title: 'Forest land encroached by private construction', original_description: 'A private builder has started construction on forest land near the reserve forest boundary. Large trees are being felled illegally. We request immediate enforcement action and stopping of construction.', language: 'en', district_id: 'dist-east-godavari', mandal: 'Maredumilli', village: 'Maredumilli', category: 'Environmental Pollution', suggested_priority: 'high', confirmed_priority: 'high', suggested_department_id: 'dept-environment', assigned_department_id: 'dept-environment', assigned_officer_id: null, status: 'in_progress', ai_analysis_id: 'ai-030', attachments: [], location_lat: 17.5700, location_lng: 81.6800, created_at: '2026-10-07T15:00:00Z', updated_at: '2026-10-09T11:00:00Z', resolved_at: null, is_duplicate_of: null },
  { id: 'comp-031', grievance_number: 'SGAI-2026-000031', citizen_id: 'u-citizen-3', title: 'Coconut yield dropping - saline water in irrigation channel (duplicate area)', original_description: 'The coconut trees in our adjoining farm are also showing yellowing. We are in the same mandal as the other coconut farm complaint. The irrigation water smells brackish and fish cannot survive in it. Urgent investigation needed.', language: 'en', district_id: 'dist-guntur', mandal: 'Tadepalle', village: 'Nallapadu', category: 'Crop Damage', suggested_priority: 'high', confirmed_priority: 'high', suggested_department_id: 'dept-horticulture', assigned_department_id: 'dept-horticulture', assigned_officer_id: null, status: 'pending_review', ai_analysis_id: 'ai-031', attachments: [], location_lat: 16.3607, location_lng: 80.5385, created_at: '2026-10-14T11:00:00Z', updated_at: '2026-10-14T11:30:00Z', resolved_at: null, is_duplicate_of: 'comp-003' },
  { id: 'comp-032', grievance_number: 'SGAI-2026-000032', citizen_id: 'u-citizen-4', title: 'Minor pothole near school gate needs filling', original_description: 'There is a small pothole near the school gate that fills with water during rain. Children get wet. Minor repair needed.', language: 'en', district_id: 'dist-prakasam', mandal: 'Ongole', village: 'Ongole', category: 'Road Damage / Potholes', suggested_priority: 'low', confirmed_priority: 'low', suggested_department_id: 'dept-roads', assigned_department_id: 'dept-roads', assigned_officer_id: null, status: 'resolved', ai_analysis_id: 'ai-032', attachments: [], location_lat: 15.5057, location_lng: 80.0499, created_at: '2026-09-20T10:00:00Z', updated_at: '2026-09-28T15:00:00Z', resolved_at: '2026-09-28T15:00:00Z', is_duplicate_of: null },
];

// ─── AI Analysis Records ──────────────────────────────────────────────────────

export const SEED_AI_ANALYSIS: AIAnalysis[] = [
  { id: 'ai-001', complaint_id: 'comp-001', detected_language: 'en', language_name: 'English', summary: 'Live high-tension electric wire has fallen on a public road near a school with sparking. Poses immediate risk to life, especially children.', recommended_category: 'Live Wire Hazard', recommended_priority: 'critical', recommended_department_id: 'dept-electricity', secondary_department_ids: ['dept-disaster', 'dept-police'], explanation: 'Keywords: "live wire", "sparking", "children", "school route" indicate immediate danger to life. Safety emergency protocols trigger Critical (P1) priority. Primary department: Electricity. Police and Disaster Management notified for cordoning.', confidence: 97, uncertainty: false, review_required: true, keywords: ['live wire', 'sparking', 'children', 'school', 'high-tension', 'emergency'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-14T08:31:00Z' },
  { id: 'ai-002', complaint_id: 'comp-002', detected_language: 'te', language_name: 'Telugu', summary: 'Drinking water pipeline burst in village, no water supply for 3 days. Affects all residents including children and elderly.', recommended_category: 'Drinking Water Shortage', recommended_priority: 'high', recommended_department_id: 'dept-water-supply', secondary_department_ids: ['dept-municipal'], explanation: 'Telugu text detected with 94% confidence. Duration: 3 days. Keywords: "పైపు పగిలి" (pipe burst), "తాగు నీళ్ళు లేక" (no drinking water), "పిల్లలకు" (children affected). High priority due to essential service disruption affecting community health.', confidence: 94, uncertainty: false, review_required: false, keywords: ['pipe burst', 'no water', 'drinking water', 'children', '3 days', 'village'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-13T10:01:00Z' },
  { id: 'ai-003', complaint_id: 'comp-003', detected_language: 'en', language_name: 'English', summary: 'Coconut plantation showing declining yield with yellowing leaves and premature nut fall over 3 months. Suspected saline water contamination in irrigation canal near backwaters. 50-acre cooperative affected.', recommended_category: 'Crop Damage', recommended_priority: 'high', recommended_department_id: 'dept-horticulture', secondary_department_ids: ['dept-agriculture', 'dept-fisheries', 'dept-irrigation', 'dept-environment'], explanation: 'Complex multi-department complaint. Primary: Horticulture (coconut crop management). Secondary: Agriculture (crop damage assessment), Fisheries (saltwater intrusion from backwaters), Irrigation (canal water quality), Environment (potential contamination). Suspected salinity is unverified and requires field investigation.', confidence: 88, uncertainty: true, review_required: true, keywords: ['coconut', 'yield decline', 'yellow leaves', 'saline water', 'irrigation canal', 'backwaters', 'contamination'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-12T09:01:00Z' },
  { id: 'ai-004', complaint_id: 'comp-004', detected_language: 'en', language_name: 'English', summary: 'Village main road has numerous large potholes causing vehicle damage and injuries. Problem persisting for 6 months.', recommended_category: 'Road Damage / Potholes', recommended_priority: 'medium', recommended_department_id: 'dept-roads', secondary_department_ids: [], explanation: 'Road damage complaint with documented injury incidents. Duration 6 months indicates infrastructure neglect. Injury risk elevates from Low to Medium priority. Location: Gudivada mandal, Krishna district.', confidence: 96, uncertainty: false, review_required: false, keywords: ['potholes', 'road damage', 'vehicle damage', 'injuries', '6 months'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-10T11:01:00Z' },
  { id: 'ai-005', complaint_id: 'comp-005', detected_language: 'en', language_name: 'English', summary: 'Village main road damaged with potholes causing accidents. Same location as complaint comp-004 - potential duplicate.', recommended_category: 'Road Damage / Potholes', recommended_priority: 'medium', recommended_department_id: 'dept-roads', secondary_department_ids: [], explanation: 'High similarity (87%) detected with complaint SGAI-2026-000004 (same location: Kanchikacherla, Gudivada). Both describe road potholes and accidents. Flagged as potential duplicate while preserving individual citizen record.', confidence: 91, uncertainty: false, review_required: true, keywords: ['road damaged', 'potholes', 'accidents', 'two-wheeler', 'months'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-11T14:01:00Z' },
  { id: 'ai-006', complaint_id: 'comp-006', detected_language: 'hi', language_name: 'Hindi', summary: 'Government hospital in Nandyal mandal without basic medicines for 2 weeks. Doctor absenteeism also reported. Affects elderly patients.', recommended_category: 'Hospital / Medical Services', recommended_priority: 'high', recommended_department_id: 'dept-health', secondary_department_ids: [], explanation: 'Hindi complaint detected. "बुनियादी दवाइयां उपलब्ध नहीं" = basic medicines unavailable. Duration: 2 weeks. Elderly patients forced to buy expensive private medicines. Doctor absenteeism compounds the issue. High priority due to essential healthcare access disruption.', confidence: 93, uncertainty: false, review_required: false, keywords: ['medicines unavailable', 'doctors absent', 'government hospital', 'elderly patients', '2 weeks'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-09T08:01:00Z' },
  { id: 'ai-007', complaint_id: 'comp-007', detected_language: 'ta', language_name: 'Tamil', summary: 'Week-long garbage accumulation causing mosquito infestation and dengue cases in children. Municipal failure.', recommended_category: 'Garbage / Sanitation', recommended_priority: 'high', recommended_department_id: 'dept-municipal', secondary_department_ids: ['dept-health'], explanation: 'Tamil complaint detected. "குப்பை கொட்டப்படாமல்" = garbage not collected. "டெங்கு காய்ச்சல்" = dengue fever. Disease outbreak risk elevates this to High priority. Secondary: Health department for disease surveillance.', confidence: 92, uncertainty: false, review_required: false, keywords: ['garbage', 'mosquitoes', 'dengue fever', 'children', 'municipal', '1 week'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-13T12:01:00Z' },
  { id: 'ai-008', complaint_id: 'comp-008', detected_language: 'en', language_name: 'English', summary: 'Street light non-functional near school for 2 weeks causing safety risk for students and near-miss accidents.', recommended_category: 'Street Light Failure', recommended_priority: 'medium', recommended_department_id: 'dept-electricity', secondary_department_ids: [], explanation: 'Street light failure near educational institution with reported near-accidents. Medium priority due to public safety impact on students. Resolved on 05-Oct-2026.', confidence: 98, uncertainty: false, review_required: false, keywords: ['street light', 'school', 'dark', 'students', 'accidents', '2 weeks'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-01T09:01:00Z' },
  { id: 'ai-009', complaint_id: 'comp-009', detected_language: 'en', language_name: 'English', summary: '78-year-old widow has not received old age pension for 3 months despite multiple visits to Panchayat. No other income source.', recommended_category: 'Pension / Welfare Benefits', recommended_priority: 'high', recommended_department_id: 'dept-social-welfare', secondary_department_ids: [], explanation: 'Vulnerable citizen welfare case. Elderly widow without pension for 3 months constitutes serious welfare deprivation. Panchayat unresponsive. High priority due to age, vulnerability and financial hardship.', confidence: 95, uncertainty: false, review_required: false, keywords: ['pension', 'widow', 'elderly', '78 years', '3 months', 'panchayat', 'unresponsive'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-05T10:01:00Z' },
  { id: 'ai-010', complaint_id: 'comp-010', detected_language: 'en', language_name: 'English', summary: 'Main irrigation canal blocked with silt for 1 month. 200+ acres of paddy crops without water.', recommended_category: 'Irrigation Water Shortage', recommended_priority: 'high', recommended_department_id: 'dept-irrigation', secondary_department_ids: ['dept-agriculture'], explanation: 'Large-scale irrigation failure affecting 200+ acres of paddy. Duration: 1 month. Crop loss risk is high as paddy requires consistent water. Irrigation Department unresponsive. Agriculture department secondary for crop damage assessment.', confidence: 94, uncertainty: false, review_required: false, keywords: ['irrigation canal', 'blocked', 'silt', '200 acres', 'paddy', '1 month'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-11T08:01:00Z' },
  { id: 'ai-011', complaint_id: 'comp-011', detected_language: 'te', language_name: 'Telugu', summary: 'Poor quality rice in ration shop with stones and dust. Fair price distribution issue.', recommended_category: 'Fair Price Shop Issues', recommended_priority: 'medium', recommended_department_id: 'dept-food', secondary_department_ids: [], explanation: 'Telugu complaint about ration shop quality. "రాళ్ళు, దుమ్ము" = stones and dust in rice. Food quality violation requires Civil Supplies inspection. Medium priority.', confidence: 91, uncertainty: false, review_required: false, keywords: ['ration shop', 'rice quality', 'stones', 'dust', 'ration card'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-14T15:01:00Z' },
  { id: 'ai-012', complaint_id: 'comp-012', detected_language: 'en', language_name: 'English', summary: 'Factory illegally discharging chemical effluents into Krishna river. Dark water, foul smell, mass fish death. Fisherman livelihood and public health at risk.', recommended_category: 'Environmental Pollution', recommended_priority: 'critical', recommended_department_id: 'dept-environment', secondary_department_ids: ['dept-fisheries', 'dept-health', 'dept-police'], explanation: 'Industrial water pollution affecting a major river. "Chemical effluents", "dark water", "fish dying in large numbers", "public health threat" indicate Critical environmental and public health emergency. Police for illegal activity enforcement.', confidence: 96, uncertainty: false, review_required: true, keywords: ['chemical effluents', 'Krishna river', 'pollution', 'fish dying', 'public health', 'illegal discharge'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-08T07:01:00Z' },
  { id: 'ai-013', complaint_id: 'comp-013', detected_language: 'en', language_name: 'English', summary: 'Government school with unfilled vacancies; 2 remaining teachers absent 15 days. 120 students without education.', recommended_category: 'School Infrastructure', recommended_priority: 'medium', recommended_department_id: 'dept-education', secondary_department_ids: [], explanation: 'Teacher shortage affecting 120 students for 15+ days. Long-term vacancy combined with absenteeism. Medium priority as education disruption without immediate physical danger.', confidence: 97, uncertainty: false, review_required: false, keywords: ['teacher absent', 'school', '15 days', '120 students', 'vacancies'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-10T10:01:00Z' },
  { id: 'ai-014', complaint_id: 'comp-014', detected_language: 'hi', language_name: 'Hindi', summary: 'Land encroachment on ancestral property. Revenue department and Patwari unresponsive.', recommended_category: 'Land Dispute', recommended_priority: 'medium', recommended_department_id: 'dept-revenue', secondary_department_ids: ['dept-police'], explanation: 'Hindi land dispute complaint. "अवैध कब्जा" = illegal occupation. Revenue department and Patwari not cooperating. More information required for documentation. Secondary: Police for enforcement if needed.', confidence: 89, uncertainty: true, review_required: true, keywords: ['land encroachment', 'ancestral property', 'revenue department', 'Patwari', 'illegal occupation'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-09T13:01:00Z' },
  { id: 'ai-015', complaint_id: 'comp-015', detected_language: 'en', language_name: 'English', summary: 'Cyclone destroyed 40+ homes, families in temporary shelters, relief applications pending 3 weeks without compensation.', recommended_category: 'Flood Relief', recommended_priority: 'critical', recommended_department_id: 'dept-disaster', secondary_department_ids: ['dept-revenue', 'dept-housing'], explanation: 'Post-cyclone relief delay. 40+ homes destroyed, families in temporary shelters for 3+ weeks without government response. Critical humanitarian emergency. Disaster Management, Revenue (compensation), Housing (temporary shelter).', confidence: 98, uncertainty: false, review_required: true, keywords: ['cyclone', 'homes destroyed', 'relief', 'no compensation', '3 weeks', 'temporary shelter'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-07T11:01:00Z' },
  { id: 'ai-016', complaint_id: 'comp-016', detected_language: 'en', language_name: 'English', summary: 'Government bus discontinued for 10 days. 500+ residents, students and elderly cut off from essential services.', recommended_category: 'Public Transport', recommended_priority: 'medium', recommended_department_id: 'dept-transport', secondary_department_ids: [], explanation: 'Bus service discontinuation affecting 500+ residents including students and hospital-dependent elderly. No advance notice given. Medium priority.', confidence: 95, uncertainty: false, review_required: false, keywords: ['bus discontinued', '500 residents', 'students', 'hospital', '10 days'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-14T07:01:00Z' },
  { id: 'ai-017', complaint_id: 'comp-017', detected_language: 'en', language_name: 'English', summary: 'Child labour in brick kiln - multiple children under 14 working in hazardous conditions. Police inaction.', recommended_category: 'Child Labour', recommended_priority: 'critical', recommended_department_id: 'dept-labour', secondary_department_ids: ['dept-police', 'dept-social-welfare'], explanation: 'Child labour is a fundamental rights violation. Multiple children under 14 in hazardous conditions. Police failure to act adds urgency. Critical priority. Labour Department for enforcement, Police (accountability), Social Welfare for child protection.', confidence: 97, uncertainty: false, review_required: true, keywords: ['child labour', 'brick kiln', 'under 14', 'hazardous', 'police inaction'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-13T16:01:00Z' },
  { id: 'ai-018', complaint_id: 'comp-018', detected_language: 'en', language_name: 'English', summary: 'Drinking water contaminated with sewage in Ward 5, Gajuwaka. Multiple illness cases reported.', recommended_category: 'Water Pipeline Damage', recommended_priority: 'critical', recommended_department_id: 'dept-water-supply', secondary_department_ids: ['dept-health', 'dept-municipal'], explanation: 'Sewage contamination of drinking water supply is a Critical public health emergency. Illness cases already reported. Immediate testing and alternate water supply needed. Health department for medical intervention.', confidence: 96, uncertainty: false, review_required: true, keywords: ['sewage contamination', 'drinking water', 'illness', 'Ward 5', 'pipe leak'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-12T06:01:00Z' },
  { id: 'ai-019', complaint_id: 'comp-019', detected_language: 'ta', language_name: 'Tamil', summary: 'Irrigation canal without water for 15 days. Paddy crops wilting. Thousands of acres at risk.', recommended_category: 'Irrigation Water Shortage', recommended_priority: 'high', recommended_department_id: 'dept-irrigation', secondary_department_ids: ['dept-agriculture'], explanation: 'Tamil complaint. "பாசன கால்வாயில் தண்ணீர் வரவில்லை" = no water in irrigation canal. "நெல் பயிர்கள் வாடுகின்றன" = paddy crops wilting. 15 days without irrigation. High priority.', confidence: 93, uncertainty: false, review_required: false, keywords: ['irrigation', 'canal', 'paddy', 'wilting', '15 days', 'acres'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-10T14:01:00Z' },
  { id: 'ai-020', complaint_id: 'comp-020', detected_language: 'en', language_name: 'English', summary: 'Government hospital ceiling collapsed in maternity ward due to structural failure. Patient safety at immediate risk.', recommended_category: 'Hospital / Medical Services', recommended_priority: 'critical', recommended_department_id: 'dept-health', secondary_department_ids: ['dept-housing'], explanation: 'Hospital building structural failure with collapsed ceiling in maternity ward. Critical priority due to risk to vulnerable patients (maternity). Housing/PWD for structural assessment needed.', confidence: 98, uncertainty: false, review_required: true, keywords: ['ceiling collapsed', 'maternity ward', 'hospital', 'structural failure', 'patient safety'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-11T09:01:00Z' },
  { id: 'ai-021', complaint_id: 'comp-021', detected_language: 'en', language_name: 'English', summary: 'Bridge with cracks and fallen railing. Heavy vehicles crossing daily. High accident risk.', recommended_category: 'Road Damage / Potholes', recommended_priority: 'critical', recommended_department_id: 'dept-roads', secondary_department_ids: ['dept-disaster'], explanation: 'Bridge structural failure is a Critical public safety emergency. Cracks + missing railing + heavy vehicles = high risk of catastrophic collapse. Immediate closure and repair required.', confidence: 97, uncertainty: false, review_required: true, keywords: ['bridge', 'cracks', 'railing', 'heavy vehicles', 'accident risk'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-06T08:01:00Z' },
  { id: 'ai-022', complaint_id: 'comp-022', detected_language: 'en', language_name: 'English', summary: 'Overflowing open drain near market causing mosquito infestation and malaria cases.', recommended_category: 'Drainage / Sewage Issue', recommended_priority: 'high', recommended_department_id: 'dept-municipal', secondary_department_ids: ['dept-health'], explanation: 'Open drainage overflow with active malaria transmission. Public health risk elevates priority to High. Municipal Administration for drainage, Health for disease control.', confidence: 94, uncertainty: false, review_required: false, keywords: ['open drain', 'overflow', 'mosquito', 'malaria', 'market'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-15T07:31:00Z' },
  { id: 'ai-023', complaint_id: 'comp-023', detected_language: 'en', language_name: 'English', summary: 'PMAY house with structural cracks and roof leakage within 1 year of construction. Poor quality materials used.', recommended_category: 'Housing Scheme Issues', recommended_priority: 'medium', recommended_department_id: 'dept-housing', secondary_department_ids: [], explanation: 'Government housing scheme quality complaint. PMAY house deteriorating within 1 year indicates sub-standard construction. Medium priority for investigation and contractor accountability.', confidence: 91, uncertainty: false, review_required: false, keywords: ['PMAY', 'cracks', 'roof leakage', 'poor quality', 'contractor'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-13T11:01:00Z' },
  { id: 'ai-024', complaint_id: 'comp-024', detected_language: 'en', language_name: 'English', summary: 'White spot disease outbreak in shrimp aquaculture ponds. 30 farmers affected, 60% production lost.', recommended_category: 'Agricultural Input Issues', recommended_priority: 'high', recommended_department_id: 'dept-fisheries', secondary_department_ids: ['dept-agriculture'], explanation: 'Disease outbreak affecting multiple aquaculture farmers. White spot virus is highly contagious. 60% crop loss for 30 farmers. Needs veterinary intervention, disease containment, and crop insurance support. High priority.', confidence: 93, uncertainty: false, review_required: false, keywords: ['white spot disease', 'shrimp', 'aquaculture', '30 farmers', '60% loss', 'insurance'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-09T10:01:00Z' },
  { id: 'ai-025', complaint_id: 'comp-025', detected_language: 'hi', language_name: 'Hindi', summary: 'Ward 14 drinking water pipeline broken for 3 days causing street flooding and water shortage.', recommended_category: 'Drinking Water Shortage', recommended_priority: 'high', recommended_department_id: 'dept-water-supply', secondary_department_ids: ['dept-roads'], explanation: 'Hindi complaint. "पेयजल पाइपलाइन टूटी" = water pipeline broken. "सड़क पर पानी भर" = road flooding. 3 days without water in entire ward. High priority for essential service restoration.', confidence: 95, uncertainty: false, review_required: false, keywords: ['pipeline broken', 'water shortage', 'Ward 14', '3 days', 'road flooding', 'children'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-12T07:01:00Z' },
  { id: 'ai-026', complaint_id: 'comp-026', detected_language: 'en', language_name: 'English', summary: 'Village transformer burned 5 days ago. 200 households without power including health subcentre and vaccine cold storage.', recommended_category: 'Power Outage', recommended_priority: 'critical', recommended_department_id: 'dept-electricity', secondary_department_ids: ['dept-health'], explanation: 'Transformer failure affecting 200 households including health infrastructure (vaccine cold chain). Vaccine spoilage risk creates Critical priority beyond normal power outage. Electricity + Health department coordination needed.', confidence: 97, uncertainty: false, review_required: true, keywords: ['transformer', 'burned', '200 households', 'health subcentre', 'vaccine', 'cold storage', '5 days'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-10T06:01:00Z' },
  { id: 'ai-027', complaint_id: 'comp-027', detected_language: 'en', language_name: 'English', summary: 'Borewell water with yellowish colour and high fluoride. Dental fluorosis symptoms in elderly. Village water supply at risk.', recommended_category: 'Drinking Water Shortage', recommended_priority: 'high', recommended_department_id: 'dept-water-supply', secondary_department_ids: ['dept-health'], explanation: 'Water quality emergency with confirmed health impacts (dental fluorosis). High fluoride in drinking water is a serious public health concern. Alternate safe water supply needed urgently. Health department for medical screening.', confidence: 92, uncertainty: false, review_required: false, keywords: ['borewell', 'fluoride', 'yellow water', 'dental fluorosis', 'elderly'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-14T09:01:00Z' },
  { id: 'ai-028', complaint_id: 'comp-028', detected_language: 'en', language_name: 'English', summary: 'Quarry workers without safety equipment. Recent serious injury. Employer non-compliant with safety regulations.', recommended_category: 'Workplace Safety', recommended_priority: 'high', recommended_department_id: 'dept-labour', secondary_department_ids: ['dept-police'], explanation: 'Workplace safety violation with documented injury. Granite quarry is high-risk environment. Employer refusing safety measures. Labour Department for inspection and enforcement. Police for potential violation of Factories Act.', confidence: 94, uncertainty: false, review_required: false, keywords: ['granite quarry', 'safety equipment', 'injury', 'employer', 'Labour Department'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-08T14:01:00Z' },
  { id: 'ai-029', complaint_id: 'comp-029', detected_language: 'en', language_name: 'English', summary: 'Public park in poor condition with broken benches, overgrown grass and garbage accumulation.', recommended_category: 'Garbage / Sanitation', recommended_priority: 'low', recommended_department_id: 'dept-municipal', secondary_department_ids: [], explanation: 'Routine park maintenance request. No immediate safety hazard. Low priority. Resolved successfully.', confidence: 99, uncertainty: false, review_required: false, keywords: ['park', 'broken benches', 'overgrown', 'garbage'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-09-15T10:01:00Z' },
  { id: 'ai-030', complaint_id: 'comp-030', detected_language: 'en', language_name: 'English', summary: 'Illegal construction on forest reserve land with tree felling. Environmental enforcement needed.', recommended_category: 'Environmental Pollution', recommended_priority: 'high', recommended_department_id: 'dept-environment', secondary_department_ids: ['dept-police', 'dept-revenue'], explanation: 'Illegal forest land encroachment with active tree felling. Forest conservation violation. High priority for enforcement. Police for illegal activity; Revenue for land records verification.', confidence: 95, uncertainty: false, review_required: false, keywords: ['forest encroachment', 'construction', 'illegal', 'tree felling', 'reserve forest'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-07T15:01:00Z' },
  { id: 'ai-031', complaint_id: 'comp-031', detected_language: 'en', language_name: 'English', summary: 'Adjacent coconut farm also showing saline water symptoms in same mandal. Confirms area-wide contamination pattern.', recommended_category: 'Crop Damage', recommended_priority: 'high', recommended_department_id: 'dept-horticulture', secondary_department_ids: ['dept-agriculture', 'dept-irrigation', 'dept-environment'], explanation: 'Second complaint from same village (Nallapadu, Tadepalle). Similarity score 91% with SGAI-2026-000003. Corroborates area-wide saline water contamination. Escalates urgency for joint departmental investigation.', confidence: 90, uncertainty: true, review_required: true, keywords: ['coconut', 'saline water', 'irrigation channel', 'yellow leaves', 'fish dead'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-10-14T11:01:00Z' },
  { id: 'ai-032', complaint_id: 'comp-032', detected_language: 'en', language_name: 'English', summary: 'Small pothole near school gate filling with water during rain. Minor maintenance required.', recommended_category: 'Road Damage / Potholes', recommended_priority: 'low', recommended_department_id: 'dept-roads', secondary_department_ids: [], explanation: 'Minor pothole causing puddle. Low priority routine maintenance. No injury reported. Resolved.', confidence: 98, uncertainty: false, review_required: false, keywords: ['pothole', 'school gate', 'rain', 'minor repair'], model_version: 'SmartGrievance-AI Demo v2.4', analyzed_at: '2026-09-20T10:01:00Z' },
];

// ─── Complaint History Records ────────────────────────────────────────────────

export const SEED_COMPLAINT_HISTORY: ComplaintHistory[] = [
  { id: 'hist-001a', complaint_id: 'comp-001', actor_id: 'system', actor_name: 'SmartGrievance AI', actor_role: 'super_admin', action: 'Complaint submitted and AI analyzed', previous_status: null, new_status: 'submitted', remarks: 'Auto-classified as Critical. Emergency alert sent to Electricity Department.', timestamp: '2026-10-14T08:30:00Z' },
  { id: 'hist-001b', complaint_id: 'comp-001', actor_id: 'u-officer-3', actor_name: 'Subrahmanyam J.', actor_role: 'officer', action: 'Officer assigned and work order issued', previous_status: 'submitted', new_status: 'in_progress', remarks: 'Field team dispatched. Power isolated in affected area. Wire removal in progress.', timestamp: '2026-10-14T09:15:00Z' },
  { id: 'hist-002a', complaint_id: 'comp-002', actor_id: 'system', actor_name: 'SmartGrievance AI', actor_role: 'super_admin', action: 'Telugu complaint received and analyzed', previous_status: null, new_status: 'submitted', remarks: 'Language: Telugu. Category: Drinking Water Shortage. Priority: High. Routed to Water Supply Department.', timestamp: '2026-10-13T10:00:00Z' },
  { id: 'hist-002b', complaint_id: 'comp-002', actor_id: 'u-officer-1', actor_name: 'K. Venkatesh Rao', actor_role: 'officer', action: 'Complaint assigned for field inspection', previous_status: 'submitted', new_status: 'in_progress', remarks: 'Pipeline repair team deployed to Kollipara village. Estimated repair completion: 6 hours.', timestamp: '2026-10-13T14:30:00Z' },
  { id: 'hist-008a', complaint_id: 'comp-008', actor_id: 'system', actor_name: 'SmartGrievance AI', actor_role: 'super_admin', action: 'Complaint submitted and analyzed', previous_status: null, new_status: 'submitted', remarks: 'Street light failure near school. Medium priority.', timestamp: '2026-10-01T09:00:00Z' },
  { id: 'hist-008b', complaint_id: 'comp-008', actor_id: 'u-officer-3', actor_name: 'Subrahmanyam J.', actor_role: 'officer', action: 'Issue resolved - light restored', previous_status: 'in_progress', new_status: 'resolved', remarks: 'Street light fuse replaced and restored to full operation. Photo proof uploaded.', timestamp: '2026-10-05T14:00:00Z' },
  { id: 'hist-009a', complaint_id: 'comp-009', actor_id: 'system', actor_name: 'SmartGrievance AI', actor_role: 'super_admin', action: 'Complaint submitted and analyzed', previous_status: null, new_status: 'submitted', remarks: 'Pension complaint for elderly widow. High priority.', timestamp: '2026-10-05T10:00:00Z' },
  { id: 'hist-009b', complaint_id: 'comp-009', actor_id: 'system', actor_name: 'Auto-Escalation Engine', actor_role: 'super_admin', action: 'SLA deadline exceeded - auto-escalated', previous_status: 'pending_review', new_status: 'escalated', remarks: 'Complaint overdue by 7 days without review. Escalated to District Administrator per SLA rules.', timestamp: '2026-10-12T09:00:00Z' },
];

// ─── Duplicate Matches ────────────────────────────────────────────────────────

export const SEED_DUPLICATE_MATCHES: DuplicateMatch[] = [
  { id: 'dup-001', complaint_id: 'comp-005', similar_complaint_id: 'comp-004', similarity_score: 87, review_status: 'pending', created_at: '2026-10-11T14:02:00Z' },
  { id: 'dup-002', complaint_id: 'comp-031', similar_complaint_id: 'comp-003', similarity_score: 91, review_status: 'pending', created_at: '2026-10-14T11:02:00Z' },
];

// ─── Escalations ─────────────────────────────────────────────────────────────

export const SEED_ESCALATIONS: Escalation[] = [
  { id: 'esc-001', complaint_id: 'comp-009', escalation_level: 1, escalated_to: 'u-dadmin-1', reason: 'SLA exceeded: Pension complaint unreviewed for 7 days. Auto-escalated to District Administrator.', timestamp: '2026-10-12T09:00:00Z' },
  { id: 'esc-002', complaint_id: 'comp-012', escalation_level: 1, escalated_to: 'u-dadmin-1', reason: 'Critical environmental complaint - river pollution. Escalated due to public health urgency.', timestamp: '2026-10-10T11:00:00Z' },
  { id: 'esc-003', complaint_id: 'comp-015', escalation_level: 1, escalated_to: 'u-dadmin-1', reason: 'Critical disaster relief not provided for 3 weeks. Escalated to District Admin.', timestamp: '2026-10-10T14:00:00Z' },
  { id: 'esc-004', complaint_id: 'comp-021', escalation_level: 1, escalated_to: 'u-dadmin-1', reason: 'Critical bridge safety emergency unresolved after 2 days. Escalated to District Admin.', timestamp: '2026-10-08T09:00:00Z' },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', user_id: 'u-citizen-1', complaint_id: 'comp-001', message: 'Your complaint SGAI-2026-000001 has been received. AI Classification: Critical - Live Wire Hazard. Emergency response initiated.', type: 'critical', read_status: false, created_at: '2026-10-14T08:31:00Z' },
  { id: 'notif-002', user_id: 'u-officer-3', complaint_id: 'comp-001', message: '🚨 CRITICAL: New complaint assigned - Live electric wire fallen on public road. Immediate action required.', type: 'critical', read_status: false, created_at: '2026-10-14T08:31:00Z' },
  { id: 'notif-003', user_id: 'u-citizen-2', complaint_id: 'comp-002', message: 'Your water supply complaint SGAI-2026-000002 has been assigned to Water Supply Department. Officer: K. Venkatesh Rao.', type: 'info', read_status: true, created_at: '2026-10-13T14:31:00Z' },
  { id: 'notif-004', user_id: 'u-citizen-6', complaint_id: 'comp-008', message: 'Great news! Your complaint SGAI-2026-000008 has been resolved. Street light repaired. Please rate your experience.', type: 'success', read_status: false, created_at: '2026-10-05T14:01:00Z' },
  { id: 'notif-005', user_id: 'u-dadmin-1', complaint_id: 'comp-009', message: 'ESCALATION: Complaint SGAI-2026-000009 (Pension issue, elderly widow) escalated. SLA exceeded. Requires immediate attention.', type: 'warning', read_status: false, created_at: '2026-10-12T09:01:00Z' },
  { id: 'notif-006', user_id: 'u-officer-1', complaint_id: 'comp-025', message: 'New complaint assigned: SGAI-2026-000025 - Drinking water pipeline broken, Ward 14. High priority.', type: 'warning', read_status: false, created_at: '2026-10-12T07:01:00Z' },
];

// ─── Resolution Feedback ──────────────────────────────────────────────────────

export const SEED_RESOLUTION_FEEDBACK: ResolutionFeedback[] = [
  { id: 'fb-001', complaint_id: 'comp-008', citizen_id: 'u-citizen-6', satisfaction_rating: 4, comments: 'Light was repaired within 5 days. Good response time. Thank you!', created_at: '2026-10-06T10:00:00Z' },
  { id: 'fb-002', complaint_id: 'comp-032', citizen_id: 'u-citizen-4', satisfaction_rating: 5, comments: 'Quick response. Pothole filled within a week. Very happy with service.', created_at: '2026-09-29T11:00:00Z' },
];

// ─── Database Keys ────────────────────────────────────────────────────────────

export const DB_KEYS = {
  USERS: 'sgai_users',
  COMPLAINTS: 'sgai_complaints',
  AI_ANALYSIS: 'sgai_ai_analysis',
  COMPLAINT_HISTORY: 'sgai_complaint_history',
  DUPLICATE_MATCHES: 'sgai_duplicate_matches',
  NOTIFICATIONS: 'sgai_notifications',
  ESCALATIONS: 'sgai_escalations',
  RESOLUTION_FEEDBACK: 'sgai_resolution_feedback',
  OFFICERS: 'sgai_officers',
  SESSION: 'sgai_session',
  INITIALIZED: 'sgai_initialized',
};

// ─── Database Initialization ──────────────────────────────────────────────────

export function initializeDatabase(): void {
  if (localStorage.getItem(DB_KEYS.INITIALIZED) === 'true') return;

  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_USERS));
  localStorage.setItem(DB_KEYS.COMPLAINTS, JSON.stringify(SEED_COMPLAINTS));
  localStorage.setItem(DB_KEYS.AI_ANALYSIS, JSON.stringify(SEED_AI_ANALYSIS));
  localStorage.setItem(DB_KEYS.COMPLAINT_HISTORY, JSON.stringify(SEED_COMPLAINT_HISTORY));
  localStorage.setItem(DB_KEYS.DUPLICATE_MATCHES, JSON.stringify(SEED_DUPLICATE_MATCHES));
  localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  localStorage.setItem(DB_KEYS.ESCALATIONS, JSON.stringify(SEED_ESCALATIONS));
  localStorage.setItem(DB_KEYS.RESOLUTION_FEEDBACK, JSON.stringify(SEED_RESOLUTION_FEEDBACK));
  localStorage.setItem(DB_KEYS.OFFICERS, JSON.stringify(SEED_OFFICERS));
  localStorage.setItem(DB_KEYS.INITIALIZED, 'true');

  console.log('[SmartGrievance AI] Demo database initialized with', SEED_COMPLAINTS.length, 'complaints.');
}

export function resetDatabase(): void {
  Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
  initializeDatabase();
}

// ─── Generic CRUD helpers ──────────────────────────────────────────────────────

export function getAll<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

export function getById<T extends { id: string }>(key: string, id: string): T | null {
  const items = getAll<T>(key);
  return items.find((item) => item.id === id) ?? null;
}

export function insert<T extends { id: string }>(key: string, item: T): T {
  const items = getAll<T>(key);
  items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
  return item;
}

export function updateById<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getAll<T>(key);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  localStorage.setItem(key, JSON.stringify(items));
  return items[idx];
}

export function deleteById<T extends { id: string }>(key: string, id: string): boolean {
  const items = getAll<T>(key);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export function generateGrievanceNumber(): string {
  const complaints = getAll<Complaint>(DB_KEYS.COMPLAINTS);
  const nextNum = complaints.length + 1;
  return `SGAI-2026-${String(nextNum).padStart(6, '0')}`;
}
