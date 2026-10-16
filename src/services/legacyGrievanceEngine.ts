// Demo-mode data layer + rule-based AI fallback classifier (runs in browser, stored in localStorage).
export const DEPARTMENTS = [
  "Agriculture", "Horticulture", "Fisheries", "Irrigation and Water Resources", "Electricity",
  "Water Supply", "Roads and Highways", "Health and Medical", "Education", "Police and Public Safety",
  "Municipal Administration", "Revenue and Land Records", "Social Welfare", "Environment and Pollution Control",
  "Transport", "Rural Development and Panchayat Raj", "Food and Civil Supplies", "Labour and Employment",
  "Housing", "Disaster Management",
] as const;

export const AP_DISTRICTS: Record<string, string[]> = {
  "Visakhapatnam": ["Bheemunipatnam", "Pendurthi", "Gajuwaka", "Anandapuram"],
  "East Godavari": ["Rajahmundry Rural", "Kadiam", "Korukonda", "Rajanagaram"],
  "Konaseema": ["Amalapuram", "Razole", "Mummidivaram", "Kothapeta"],
  "Krishna": ["Machilipatnam", "Gudivada", "Pamarru", "Avanigadda"],
  "Guntur": ["Tenali", "Mangalagiri", "Ponnur", "Tadikonda"],
  "Nellore": ["Kavali", "Kovur", "Gudur", "Atmakur"],
  "Kurnool": ["Adoni", "Nandyal Rural", "Kodumur", "Pattikonda"],
  "Anantapur": ["Dharmavaram", "Gooty", "Tadipatri", "Kalyandurg"],
  "Chittoor": ["Palamaner", "Kuppam", "Punganur", "Nagari"],
};

export type Priority = "Critical" | "High" | "Medium" | "Low";
export const STATUSES = ["Submitted", "AI Analyzed", "Pending Officer Review", "Assigned", "In Progress",
  "More Information Required", "Reassigned", "Escalated", "Resolved", "Reopened"] as const;
export type Status = (typeof STATUSES)[number];

export interface Analysis {
  language: string; category: string; summary: string; priority: Priority;
  primary: string; secondary: string[]; reason: string; confidence: number;
  needsReview: boolean; priorityReason: string;
}
export interface Grievance {
  id: string; pin: string; name: string; mobile: string; email: string;
  district: string; mandal: string; village: string; title: string; description: string;
  language: string; createdAt: string; status: Status; department: string; priority: Priority;
  analysis: Analysis; duplicates: string[];
  timeline: { at: string; status: Status; note: string; by: string }[];
}

const RULES: { dept: string; cat: string; kw: string[]; sec?: string[] }[] = [
  { dept: "Electricity", cat: "Power supply", kw: ["electric", "power", "current", "transformer", "wire", "streetlight", "bijli", "karent", "విద్యుత్", "కరెంట్", "मिनसारम", "மின்", "बिजली"] },
  { dept: "Water Supply", cat: "Drinking water", kw: ["drinking water", "water supply", "tap", "neeru", "neellu", "paani", "pani", "నీరు", "నీళ్ళు", "पानी", "தண்ணீர்"] },
  { dept: "Roads and Highways", cat: "Road damage", kw: ["road", "pothole", "bridge", "highway", "rasta", "రోడ్డు", "सड़क", "சாலை"] },
  { dept: "Horticulture", cat: "Plantation crops", kw: ["coconut", "mango", "banana", "plantation", "orchard", "కొబ్బరి", "नारियल", "தென்னை"], sec: ["Agriculture", "Fisheries", "Irrigation and Water Resources", "Environment and Pollution Control"] },
  { dept: "Agriculture", cat: "Crops & farming", kw: ["crop", "paddy", "farmer", "seed", "fertilizer", "pest", "పంట", "फसल", "பயிர்"] },
  { dept: "Fisheries", cat: "Fisheries", kw: ["fish", "aqua", "prawn", "boat", "చేప", "मछली", "மீன்"] },
  { dept: "Irrigation and Water Resources", cat: "Irrigation", kw: ["canal", "irrigation", "tank bund", "reservoir", "కాలువ", "नहर"] },
  { dept: "Health and Medical", cat: "Health services", kw: ["hospital", "doctor", "medicine", "phc", "ambulance", "ఆసుపత్రి", "अस्पताल", "மருத்துவ"] },
  { dept: "Education", cat: "Schools", kw: ["school", "teacher", "student", "college", "బడి", "पाठशाला", "स्कूल", "பள்ளி"] },
  { dept: "Police and Public Safety", cat: "Safety", kw: ["police", "theft", "harass", "fight", "crime", "పోలీస్", "पुलिस", "காவல்"] },
  { dept: "Municipal Administration", cat: "Sanitation", kw: ["garbage", "drain", "sewage", "waste", "mosquito", "చెత్త", "कचरा", "குப்பை"] },
  { dept: "Revenue and Land Records", cat: "Land records", kw: ["land", "patta", "survey", "record", "mutation", "భూమి", "ज़मीन", "நிலம்"] },
  { dept: "Social Welfare", cat: "Welfare schemes", kw: ["pension", "welfare", "disability", "widow", "scholarship", "పింఛన్", "पेंशन"] },
  { dept: "Environment and Pollution Control", cat: "Pollution", kw: ["pollution", "smoke", "factory", "saline", "contamina", "noise", "కాలుష్యం", "प्रदूषण"] },
  { dept: "Transport", cat: "Public transport", kw: ["bus", "rtc", "transport", "license", "బస్సు", "बस"] },
  { dept: "Rural Development and Panchayat Raj", cat: "Panchayat services", kw: ["panchayat", "village office", "nrega", "gram", "పంచాయతీ"] },
  { dept: "Food and Civil Supplies", cat: "Ration", kw: ["ration", "rice card", "pds", "ration shop", "రేషన్", "राशन"] },
  { dept: "Labour and Employment", cat: "Labour", kw: ["wage", "salary", "labour", "job", "employment", "కూలి", "मजदूरी"] },
  { dept: "Housing", cat: "Housing", kw: ["house", "housing", "home scheme", "ఇల్లు", "मकान", "வீடு"] },
  { dept: "Disaster Management", cat: "Disaster", kw: ["flood", "cyclone", "landslide", "collapse", "fire", "వరద", "बाढ़", "வெள்ள"] },
];
const CRITICAL = ["live wire", "fallen wire", "electrocut", "collapse", "flood", "fire", "drowning", "died", "death", "dying", "danger", "accident", "emergency", "వరద", "बाढ़"];
const HIGH = ["no water", "without water", "days", "weeks", "crop damage", "medicine shortage", "no electricity", "entire village", "hundreds", "children", "sick", "outbreak"];
const MEDIUM = ["pothole", "drain", "damaged", "decreasing", "broken", "not working", "irregular"];

export function detectLanguage(t: string) {
  if (/[\u0B80-\u0BFF]/.test(t)) return "Tamil";
  return "English";
}

export function analyze(title: string, desc: string): Analysis {
  const text = `${title} ${desc}`.toLowerCase();
  const scored = RULES.map((r) => ({ r, hits: r.kw.filter((k) => text.includes(k.toLowerCase())) }))
    .filter((x) => x.hits.length).sort((a, b) => b.hits.length - a.hits.length);
  const top = scored[0];
  const has = (l: string[]) => l.filter((k) => text.includes(k));
  const c = has(CRITICAL), h = has(HIGH), m = has(MEDIUM);
  const priority: Priority = c.length ? "Critical" : h.length ? "High" : m.length ? "Medium" : "Low";
  const priorityReason = c.length ? `Possible danger to life or safety ("${c[0]}").`
    : h.length ? `Serious ongoing disruption indicated ("${h[0]}").`
    : m.length ? `Service problem without clear immediate danger ("${m[0]}").` : "Appears to be a routine service request.";
  const confidence = top ? Math.min(0.95, 0.5 + top.hits.length * 0.15) : 0.2;
  const secondary = top ? [...(top.r.sec ?? []), ...scored.slice(1, 3).map((s) => s.r.dept)].filter((d, i, a) => d !== top.r.dept && a.indexOf(d) === i).slice(0, 4) : [];
  return {
    language: detectLanguage(`${title} ${desc}`),
    category: top?.r.cat ?? "Unclassified",
    summary: (desc || title).slice(0, 160),
    priority, priorityReason,
    primary: top?.r.dept ?? "Manual Triage",
    secondary,
    reason: top ? `Matched terms: ${top.hits.slice(0, 4).join(", ")}.` : "No clear department signal — sent to manual triage.",
    confidence,
    needsReview: confidence < 0.65 || priority === "Critical",
  };
}

const KEY = "sgai.grievances";
export function load(): Grievance[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  const seed = SEED.map((s, i) => build({ ...s, name: "Demo Citizen", mobile: "9000000000", email: "", language: "English" }, i + 1, new Date(Date.now() - (i + 1) * 864e5 * 0.7).toISOString()));
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}
export function save(list: Grievance[]) { localStorage.setItem(KEY, JSON.stringify(list)); }

type Input = Pick<Grievance, "name" | "mobile" | "email" | "district" | "mandal" | "village" | "title" | "description" | "language">;
function tokens(s: string) { return new Set(s.toLowerCase().split(/\W+/).filter((w) => w.length > 3)); }
function build(inp: Input, n: number, at: string, existing: Grievance[] = []): Grievance {
  const analysis = analyze(inp.title, inp.description);
  const t = tokens(inp.title + " " + inp.description);
  const duplicates = existing.filter((g) => g.village.toLowerCase() === inp.village.toLowerCase() && g.department === analysis.primary
    && ([...tokens(g.title + " " + g.description)].filter((w) => t.has(w)).length >= 2)).map((g) => g.id);
  return {
    ...inp, id: `SGAI-2026-${String(n).padStart(6, "0")}`, pin: String(Math.floor(1000 + Math.random() * 9000)),
    createdAt: at, status: "Pending Officer Review", department: analysis.primary, priority: analysis.priority, analysis, duplicates,
    timeline: [
      { at, status: "Submitted", note: "Complaint received.", by: "Citizen" },
      { at, status: "AI Analyzed", note: `Suggested ${analysis.primary} · ${analysis.priority}`, by: "SmartGrievance AI" },
      { at, status: "Pending Officer Review", note: "Awaiting officer verification.", by: "System" },
    ],
  };
}
export function submit(inp: Input) {
  const list = load();
  const g = build(inp, list.length + 1, new Date().toISOString(), list);
  save([...list, g]);
  return g;
}
export function update(id: string, patch: Partial<Grievance>, note: string, by: string) {
  const list = load().map((g) => g.id !== id ? g : {
    ...g, ...patch, timeline: [...g.timeline, { at: new Date().toISOString(), status: (patch.status ?? g.status) as Status, note, by }],
  });
  save(list);
  return list;
}

const SEED = [
  { district: "Konaseema", mandal: "Amalapuram", village: "Bandarulanka", title: "No drinking water for 3 days", description: "Our village has had no drinking water supply for three days. Hundreds of families affected." },
  { district: "Konaseema", mandal: "Amalapuram", village: "Bandarulanka", title: "Tap water stopped", description: "No water in taps for days, entire village struggling for drinking water." },
  { district: "Konaseema", mandal: "Razole", village: "Sakhinetipalli", title: "Coconut yield decreasing", description: "Coconut production is decreasing due to suspected saline water contamination." },
  { district: "Visakhapatnam", mandal: "Gajuwaka", village: "Gajuwaka", title: "Fallen live wire on street", description: "An electric wire has fallen on the road near the school. Danger to children." },
  { district: "Guntur", mandal: "Tenali", village: "Tenali", title: "Main road potholes", description: "The main road in our village has many potholes causing accidents." },
  { district: "Krishna", mandal: "Gudivada", village: "Gudivada", title: "Garbage not collected", description: "Garbage has not been collected for a week, drains are blocked." },
  { district: "Nellore", mandal: "Kavali", village: "Kavali", title: "PHC has no doctor", description: "Primary health centre has no doctor and medicine shortage for sick patients." },
  { district: "Kurnool", mandal: "Adoni", village: "Adoni", title: "Ration shop closed", description: "Ration shop is not opening regularly, rice not distributed." },
];

export const PRIORITY_STYLE: Record<Priority, string> = {
  Critical: "bg-critical text-primary-foreground", High: "bg-high text-primary-foreground",
  Medium: "bg-medium text-foreground", Low: "bg-low text-primary-foreground",
};
