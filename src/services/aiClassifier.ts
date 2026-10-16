import { analyze as analyzeLegacyRules } from './legacyGrievanceEngine';
/**
 * SmartGrievance AI — Rule-Based Classification Engine (Demo Mode)
 * 
 * This is a transparent, rule-based classifier that runs entirely in the browser.
 * It provides explainable recommendations without any API key requirements.
 * In a production system, this would be replaced with a real LLM API call.
 */

import type { Priority, Language, AIAnalysis } from '../types';
import { DEPARTMENTS } from '../data/departments';
import { generateId } from '../data/mockDb';



export function detectLanguage(text: string): { language: Language; name: string; confidence: number } {
  const safeText = text || '';
  const tamilChars = (safeText.match(/[\u0B80-\u0BFF]/g) || []).length;
  const letters = (safeText.match(/[\p{L}]/gu) || []).length;
  if (tamilChars > 0 && tamilChars / Math.max(letters, 1) >= 0.1) {
    return { language: 'ta', name: 'Tamil', confidence: Math.min(99, 80 + (tamilChars / Math.max(letters, 1)) * 100) };
  }
  return { language: 'en', name: 'English', confidence: letters > 0 ? 95 : 0 };
}

// ─── Classification Rules ─────────────────────────────────────────────────────

interface ClassificationRule {
  department_id: string;
  secondary_department_ids: string[];
  category: string;
  keywords: string[];
  teluguKeywords?: string[];
  hindiKeywords?: string[];
  tamilKeywords?: string[];
  priority_boost?: Priority; // minimum priority to assign
  critical_if?: string[]; // if any of these present, force critical
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  // ─── ELECTRICITY ───────────────────────────────────────────────────────
  {
    department_id: 'dept-electricity',
    secondary_department_ids: ['dept-disaster', 'dept-police'],
    category: 'Live Wire Hazard',
    keywords: ['live wire', 'electric wire', 'fallen wire', 'sparking wire', 'hanging wire', 'wire down', 'electrical wire', 'high tension wire', 'live cable'],
    critical_if: ['live wire', 'sparking', 'fallen wire', 'hanging wire', 'wire down', 'high tension', 'electrocution'],
    priority_boost: 'critical',
  },
  {
    department_id: 'dept-electricity',
    secondary_department_ids: [],
    category: 'Power Outage',
    keywords: ['no electricity', 'power outage', 'power cut', 'no power', 'power failure', 'electricity gone', 'current ledu', 'bijli nahi', 'load shedding', 'transformer', 'burnt transformer', 'power supply', 'current not coming'],
    teluguKeywords: ['కరెంట్', 'విద్యుత్', 'ట్రాన్స్ఫార్మర్'],
    hindiKeywords: ['बिजली', 'करंट', 'ट्रांसफार्मर', 'बिजली नहीं'],
    tamilKeywords: ['மின்சாரம்', 'மின்', 'கரண்ட்'],
    critical_if: ['transformer burned', 'vaccine', 'cold storage', 'hospital', 'health centre'],
    priority_boost: 'high',
  },
  {
    department_id: 'dept-electricity',
    secondary_department_ids: [],
    category: 'Street Light Failure',
    keywords: ['street light', 'streetlight', 'road light', 'lamp not working', 'no light', 'dark road', 'street lamp'],
    priority_boost: 'medium',
  },

  // ─── WATER SUPPLY ──────────────────────────────────────────────────────
  {
    department_id: 'dept-water-supply',
    secondary_department_ids: ['dept-municipal'],
    category: 'Drinking Water Shortage',
    keywords: ['drinking water', 'no water', 'water shortage', 'water not coming', 'taagu neeru', 'nallaa', 'pani nahi', 'paani nahi', 'water supply', 'borewell', 'tap water', 'pipeline broken', 'pipeline leak', 'water pipeline', 'fluoride', 'water quality', 'contaminated water', 'drinking water pipe', 'water main'],
    teluguKeywords: ['నీళ్ళు', 'నీరు', 'పైపు', 'నల్లా', 'తాగు నీళ్ళు'],
    hindiKeywords: ['पानी', 'नल', 'पाइपलाइन', 'पेयजल'],
    tamilKeywords: ['தண்ணீர்', 'குழாய்', 'குடிநீர்'],
    critical_if: ['contaminated', 'sewage', 'sewerage mixing', 'illness', 'sick', 'disease', 'cholera', 'typhoid'],
    priority_boost: 'high',
  },

  // ─── ROADS ─────────────────────────────────────────────────────────────
  {
    department_id: 'dept-roads',
    secondary_department_ids: ['dept-municipal'],
    category: 'Road Damage / Potholes',
    keywords: ['pothole', 'road damage', 'road repair', 'broken road', 'damaged road', 'road condition', 'highway', 'bridge', 'road not repaired', 'road accident', 'road fall', 'culvert'],
    critical_if: ['bridge collapsed', 'bridge crack', 'bridge damage', 'bridge unsafe', 'bridge broken', 'collapse risk', 'bridge railing'],
    priority_boost: 'medium',
  },

  // ─── IRRIGATION ────────────────────────────────────────────────────────
  {
    department_id: 'dept-irrigation',
    secondary_department_ids: ['dept-agriculture'],
    category: 'Irrigation Water Shortage',
    keywords: ['irrigation', 'canal', 'water channel', 'irrigation water', 'paddy water', 'kaal vay', 'kalva', 'dam water', 'sluice', 'reservoir', 'irrigation canal', 'water allocation', 'bund', 'anicut'],
    teluguKeywords: ['కాలువ', 'నీటిపారుదల', 'ఆయకట్టు'],
    tamilKeywords: ['கால்வாய்', 'பாசனம்', 'நீர்பாசனம்'],
    priority_boost: 'high',
  },

  // ─── HEALTH ────────────────────────────────────────────────────────────
  {
    department_id: 'dept-health',
    secondary_department_ids: ['dept-municipal'],
    category: 'Hospital / Medical Services',
    keywords: ['hospital', 'medicine', 'doctor', 'medical', 'health centre', 'PHC', 'clinic', 'nurse', 'ambulance', 'medicine shortage', 'no doctor', 'health', 'malaria', 'dengue', 'fever', 'disease', 'vaccine'],
    hindiKeywords: ['अस्पताल', 'दवाई', 'डॉक्टर', 'दवाखाना'],
    critical_if: ['ceiling collapsed', 'building collapsed', 'patient safety', 'structural damage', 'roof collapsed'],
    priority_boost: 'high',
  },

  // ─── AGRICULTURE ───────────────────────────────────────────────────────
  {
    department_id: 'dept-agriculture',
    secondary_department_ids: ['dept-horticulture', 'dept-irrigation'],
    category: 'Crop Damage',
    keywords: ['crop damage', 'crop loss', 'agriculture', 'farming', 'paddy', 'rice crop', 'sugarcane', 'groundnut', 'cotton', 'crop failure', 'plant disease', 'pest', 'pesticide'],
    teluguKeywords: ['పంట నష్టం', 'వ్యవసాయం', 'రైతు'],
    priority_boost: 'high',
  },
  {
    department_id: 'dept-horticulture',
    secondary_department_ids: ['dept-agriculture', 'dept-fisheries', 'dept-irrigation', 'dept-environment'],
    category: 'Crop Damage',
    keywords: ['coconut', 'mango', 'banana', 'citrus', 'tomato', 'horticulture', 'fruit crop', 'vegetable crop', 'coconut production', 'coconut yield', 'saline water', 'salt water', 'salinity', 'backwater contamination'],
    critical_if: [],
    priority_boost: 'high',
  },

  // ─── FISHERIES ─────────────────────────────────────────────────────────
  {
    department_id: 'dept-fisheries',
    secondary_department_ids: ['dept-agriculture'],
    category: 'Agricultural Input Issues',
    keywords: ['fish', 'fishing', 'aquaculture', 'shrimp', 'prawns', 'fishermen', 'fish pond', 'fish disease', 'fish kill', 'white spot', 'fish production', 'coastal fishing'],
    priority_boost: 'high',
  },

  // ─── MUNICIPAL ─────────────────────────────────────────────────────────
  {
    department_id: 'dept-municipal',
    secondary_department_ids: ['dept-health'],
    category: 'Garbage / Sanitation',
    keywords: ['garbage', 'waste', 'trash', 'sanitation', 'cleaning', 'drain', 'drainage', 'open drain', 'sewage', 'sewage overflow', 'stagnant water', 'mosquito', 'malaria', 'dengue', 'garbage not collected', 'waste disposal', 'open defecation', 'public toilet'],
    teluguKeywords: ['చెత్త', 'డ్రైనేజ్', 'పారిశుధ్యం'],
    tamilKeywords: ['குப்பை', 'கழிவு', 'சாக்கடை'],
    critical_if: ['dengue', 'malaria', 'cholera', 'epidemic'],
    priority_boost: 'medium',
  },

  // ─── REVENUE ───────────────────────────────────────────────────────────
  {
    department_id: 'dept-revenue',
    secondary_department_ids: ['dept-police'],
    category: 'Land Dispute',
    keywords: ['land', 'patta', 'mutation', 'land records', 'property', 'survey', 'encroachment', 'land dispute', 'land grabbing', 'patwari', 'revenue', 'tahsildar', 'certificate', 'income certificate', 'caste certificate', 'adangal'],
    hindiKeywords: ['जमीन', 'भूमि', 'पट्टा', 'भू-अभिलेख', 'पटवारी'],
    priority_boost: 'medium',
  },

  // ─── SOCIAL WELFARE ────────────────────────────────────────────────────
  {
    department_id: 'dept-social-welfare',
    secondary_department_ids: [],
    category: 'Pension / Welfare Benefits',
    keywords: ['pension', 'old age pension', 'widow pension', 'disability pension', 'scholarship', 'social security', 'ration card', 'welfare', 'subsidy', 'beneficiary', 'aadhar', 'AEPS'],
    teluguKeywords: ['పింఛన్', 'సంక్షేమం'],
    hindiKeywords: ['पेंशन', 'कल्याण', 'वृद्धावस्था'],
    priority_boost: 'medium',
  },

  // ─── ENVIRONMENT ───────────────────────────────────────────────────────
  {
    department_id: 'dept-environment',
    secondary_department_ids: ['dept-fisheries', 'dept-health', 'dept-police'],
    category: 'Environmental Pollution',
    keywords: ['pollution', 'polluted', 'effluent', 'factory waste', 'chemical discharge', 'river pollution', 'water pollution', 'air pollution', 'industrial waste', 'toxic', 'contamination', 'forest encroachment', 'deforestation', 'illegal construction'],
    critical_if: ['river', 'lake', 'chemical', 'toxic', 'fish dying', 'fish dead'],
    priority_boost: 'high',
  },

  // ─── FOOD ──────────────────────────────────────────────────────────────
  {
    department_id: 'dept-food',
    secondary_department_ids: [],
    category: 'Fair Price Shop Issues',
    keywords: ['ration', 'ration shop', 'fair price shop', 'rice quality', 'grain quality', 'ration card', 'biometric', 'ration dealer', 'PDS', 'civil supplies', 'food supply'],
    teluguKeywords: ['రేషన్', 'బియ్యం నాణ్యత'],
    priority_boost: 'medium',
  },

  // ─── TRANSPORT ─────────────────────────────────────────────────────────
  {
    department_id: 'dept-transport',
    secondary_department_ids: [],
    category: 'Public Transport',
    keywords: ['bus', 'APSRTC', 'transport', 'bus service', 'no bus', 'auto rickshaw', 'overcharging', 'bus route', 'bus stop', 'traffic'],
    priority_boost: 'medium',
  },

  // ─── EDUCATION ─────────────────────────────────────────────────────────
  {
    department_id: 'dept-education',
    secondary_department_ids: [],
    category: 'School Infrastructure',
    keywords: ['school', 'teacher', 'education', 'midday meal', 'textbook', 'scholarship', 'student', 'classroom', 'college', 'hostel', 'teacher absent', 'school building'],
    priority_boost: 'medium',
  },

  // ─── POLICE ────────────────────────────────────────────────────────────
  {
    department_id: 'dept-police',
    secondary_department_ids: ['dept-social-welfare'],
    category: 'Police / Law & Order',
    keywords: ['police', 'crime', 'theft', 'harassment', 'assault', 'robbery', 'violence', 'cybercrime', 'missing', 'FIR', 'complaint not registered'],
    priority_boost: 'high',
  },

  // ─── LABOUR ────────────────────────────────────────────────────────────
  {
    department_id: 'dept-labour',
    secondary_department_ids: ['dept-social-welfare', 'dept-police'],
    category: 'Workplace Safety',
    keywords: ['labour', 'worker', 'workplace', 'safety', 'accident', 'factory', 'quarry', 'mine', 'child labour', 'wage', 'underpaid', 'ESI', 'PF'],
    critical_if: ['child labour', 'children working', 'child work'],
    priority_boost: 'high',
  },

  // ─── HOUSING ───────────────────────────────────────────────────────────
  {
    department_id: 'dept-housing',
    secondary_department_ids: [],
    category: 'Housing Scheme Issues',
    keywords: ['house', 'housing', 'PMAY', 'pradhan mantri awas', 'construction', 'home', 'dwelling', 'building quality', 'crack', 'roof leak', 'allotment'],
    priority_boost: 'low',
  },

  // ─── RURAL DEVELOPMENT ─────────────────────────────────────────────────
  {
    department_id: 'dept-rural',
    secondary_department_ids: [],
    category: 'Government Office Delay',
    keywords: ['panchayat', 'gram panchayat', 'village development', 'MGNREGA', 'rural road', 'gram sevak', 'panchayat secretary', 'rural development'],
    priority_boost: 'low',
  },

  // ─── DISASTER ──────────────────────────────────────────────────────────
  {
    department_id: 'dept-disaster',
    secondary_department_ids: ['dept-revenue', 'dept-housing'],
    category: 'Flood Relief',
    keywords: ['flood', 'cyclone', 'disaster', 'relief', 'natural disaster', 'storm', 'earthquake', 'landslide', 'inundation', 'disaster relief', 'calamity', 'destroyed home', 'damaged house'],
    critical_if: ['flood', 'cyclone', 'storm', 'disaster', 'emergency'],
    priority_boost: 'critical',
  },
];

// ─── Priority Keywords ────────────────────────────────────────────────────────

const CRITICAL_KEYWORDS = [
  'immediate danger', 'life threatening', 'emergency', 'critically', 'fatal', 'death',
  'dying', 'collapsed', 'explosion', 'fire', 'flood', 'drowning', 'people trapped',
  'gas leak', 'toxic', 'hazardous', 'critical', 'urgent emergency', 'accident happened',
  'injured badly', 'bone broken', 'hospitalized', 'people dying', 'child death'
];

const HIGH_KEYWORDS = [
  'several days', 'many days', 'weeks', 'week', 'month', 'months', '3 days', '4 days', '5 days', '7 days',
  'no water', 'no electricity', 'medicine shortage', 'many families', 'all residents', 'entire village',
  'affecting many', 'crops damaged', 'loss of livelihood', 'elderly', 'children affected', 'patients'
];

const MEDIUM_KEYWORDS = [
  'damaged', 'not working', 'broken', 'delay', 'pending', 'issue', 'problem', 'complaint'
];

// ─── Main Classifier ──────────────────────────────────────────────────────────

export interface ClassificationResult {
  department_id: string;
  secondary_department_ids: string[];
  category: string;
  priority: Priority;
  confidence: number;
  uncertainty: boolean;
  review_required: boolean;
  explanation: string;
  keywords_matched: string[];
  detected_language: Language;
  language_name: string;
}

export function classifyComplaint(
  title: string,
  description: string
): ClassificationResult {
  const fullText = `${title} ${description}`.toLowerCase();
  const langResult = detectLanguage(`${title} ${description}`);

  let bestRule: ClassificationRule | null = null;
  let maxScore = 0;
  let matchedKeywords: string[] = [];

  for (const rule of CLASSIFICATION_RULES) {
    let score = 0;
    const matched: string[] = [];

    for (const keyword of rule.keywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // multi-word keywords score higher
        matched.push(keyword);
      }
    }

    // Language-specific keywords
    const langKws = langResult.language === 'ta' ? rule.tamilKeywords : undefined;

    if (langKws) {
      for (const kw of langKws) {
        if (`${title} ${description}`.includes(kw)) {
          score += 3;
          matched.push(kw);
        }
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestRule = rule;
      matchedKeywords = matched;
    }
  }

  // Determine priority
  let priority: Priority = 'low';
  const criticalKwMatch = CRITICAL_KEYWORDS.some(k => fullText.includes(k));
  const highKwMatch = HIGH_KEYWORDS.some(k => fullText.includes(k));
  const mediumKwMatch = MEDIUM_KEYWORDS.some(k => fullText.includes(k));

  // Check rule-specific critical triggers
  let ruleCritical = false;
  if (bestRule?.critical_if) {
    ruleCritical = bestRule.critical_if.some(k => fullText.includes(k.toLowerCase()));
  }

  if (criticalKwMatch || ruleCritical) {
    priority = 'critical';
  } else if (highKwMatch) {
    priority = 'high';
  } else if (mediumKwMatch) {
    priority = 'medium';
  }

  // Apply rule minimum priority
  if (bestRule?.priority_boost) {
    const priorityOrder: Priority[] = ['low', 'medium', 'high', 'critical'];
    const currentIdx = priorityOrder.indexOf(priority);
    const boostIdx = priorityOrder.indexOf(bestRule.priority_boost);
    if (boostIdx > currentIdx) {
      priority = bestRule.priority_boost;
    }
  }

  const confidence = maxScore > 0 ? Math.min(98, 60 + maxScore * 5 + (langResult.confidence - 80)) : 55;
  const uncertainty = confidence < 75 || maxScore === 0;
  const review_required = priority === 'critical' || uncertainty;

  // Cross-check with the first project's independent multilingual safety rules.
  // A critical hazard found by either engine is never downgraded.
  const legacySafety = analyzeLegacyRules(title, description);
  if (legacySafety.priority === 'Critical' && priority !== 'critical') {
    priority = 'critical';
  }

  // Generate explanation
  const dept = DEPARTMENTS.find(d => d.id === bestRule?.department_id);
  const secondaryDepts = (bestRule?.secondary_department_ids || [])
    .map(id => DEPARTMENTS.find(d => d.id === id)?.department_name)
    .filter(Boolean);

  let explanation = '';
  if (!bestRule || maxScore === 0) {
    explanation = `No clear category match found. Complaint requires manual review by a triage officer. Language detected: ${langResult.name}.`;
  } else {
    explanation = `Detected language: ${langResult.name} (${Math.round(langResult.confidence)}% confidence). `;
    explanation += `Matched ${matchedKeywords.length} keyword${matchedKeywords.length !== 1 ? 's' : ''}: "${matchedKeywords.slice(0, 3).join('", "')}". `;
    explanation += `Primary department: ${dept?.department_name}. `;
    if (secondaryDepts.length > 0) {
      explanation += `Secondary departments involved: ${secondaryDepts.join(', ')}. `;
    }
    if (priority === 'critical') {
      explanation += `⚠️ Critical priority assigned due to immediate safety risk. Human review required before dispatch.`;
    } else if (priority === 'high') {
      explanation += `High priority due to significant public service disruption or ongoing harm to community.`;
    } else if (priority === 'medium') {
      explanation += `Medium priority — important issue without immediate danger.`;
    } else {
      explanation += `Low priority — routine maintenance or minor service request.`;
    }
    if (uncertainty) {
      explanation += ` ⚠️ Low confidence — manual triage recommended.`;
    }
  }
  if (legacySafety.priority === 'Critical') {
    explanation += ` Independent safety cross-check: ${legacySafety.priorityReason} Officer review required.`;
  }

  return {
    department_id: bestRule?.department_id || 'dept-municipal',
    secondary_department_ids: bestRule?.secondary_department_ids || [],
    category: bestRule?.category || 'Other',
    priority,
    confidence: Math.round(confidence),
    uncertainty,
    review_required,
    explanation,
    keywords_matched: matchedKeywords,
    detected_language: langResult.language,
    language_name: langResult.name,
  };
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────

export function detectDuplicates(
  newTitle: string,
  newDescription: string,
  newDistrictId: string,
  newMandal: string,
  existingComplaints: Array<{
    id: string;
    title: string;
    original_description: string;
    district_id: string;
    mandal: string;
    category?: string;
  }>
): Array<{ complaint_id: string; similarity_score: number }> {
  const newText = `${newTitle} ${newDescription}`.toLowerCase();
  const results: Array<{ complaint_id: string; similarity_score: number }> = [];

  for (const complaint of existingComplaints) {
    if (complaint.district_id !== newDistrictId) continue;

    const existingText = `${complaint.title} ${complaint.original_description}`.toLowerCase();

    // Word overlap similarity
    const newWords = new Set(newText.split(/\s+/).filter(w => w.length > 4));
    const existingWords = new Set(existingText.split(/\s+/).filter(w => w.length > 4));

    let overlap = 0;
    for (const word of newWords) {
      if (existingWords.has(word)) overlap++;
    }

    const similarity = newWords.size > 0
      ? Math.round((overlap / Math.max(newWords.size, existingWords.size)) * 100)
      : 0;

    // Location boost
    const locationMatch = complaint.mandal.toLowerCase() === newMandal.toLowerCase();
    const adjustedScore = locationMatch ? Math.min(98, similarity + 20) : similarity;

    if (adjustedScore >= 50) {
      results.push({ complaint_id: complaint.id, similarity_score: adjustedScore });
    }
  }

  return results.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 3);
}

// ─── AI Analysis Builder ──────────────────────────────────────────────────────

export function buildAIAnalysis(
  complaintId: string,
  classificationResult: ClassificationResult
): AIAnalysis {
  const dept = DEPARTMENTS.find(d => d.id === classificationResult.department_id);

  return {
    id: generateId('ai'),
    complaint_id: complaintId,
    detected_language: classificationResult.detected_language,
    language_name: classificationResult.language_name,
    summary: `[AI Summary] Category: ${classificationResult.category}. Department: ${dept?.department_name}. Priority: ${classificationResult.priority.toUpperCase()}.`,
    recommended_category: classificationResult.category,
    recommended_priority: classificationResult.priority,
    recommended_department_id: classificationResult.department_id,
    secondary_department_ids: classificationResult.secondary_department_ids,
    explanation: classificationResult.explanation,
    confidence: classificationResult.confidence,
    uncertainty: classificationResult.uncertainty,
    review_required: classificationResult.review_required,
    keywords: classificationResult.keywords_matched,
    model_version: 'SmartGrievance Demo AI v2.4 (Rule-Based)',
    analyzed_at: new Date().toISOString(),
  };
}

// ─── Summarize complaint ──────────────────────────────────────────────────────

export function generateSummary(title: string, description: string, maxLength = 150): string {
  const content = description || title;
  const clean = content.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + '...';
}
