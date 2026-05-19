// Case status
export type CaseStatus = 'draft' | 'in_progress' | 'completed';

// Jenis pelanggaran
export type ViolationType =
  | 'penggusuran'
  | 'sengketa_lahan'
  | 'pencemaran_lingkungan'
  | 'pelanggaran_hak'
  | 'lainnya';

// Evidence item
export interface Evidence {
  id: string;
  type: 'photo' | 'video' | 'document';
  url: string;
  timestamp: string;
  hash: string;
  name?: string;
  description?: string;
}

// Witness/Saksi
export interface Witness {
  name: string;
  contact?: string;
  relationship: string;
}

// Interview message
export interface Message {
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
}

// Timeline Event
export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  description: string;
  type: 'incident' | 'document' | 'witness' | 'authority' | 'evidence' | 'report';
  isCritical?: boolean;
}

// Main Case interface
export interface Case {
  id: string;
  session_id: string;
  status: CaseStatus;
  user_id?: string;
  reporter_name?: string;
  involved_parties?: string;
  violation_type?: ViolationType;
  incident_date?: string;
  incident_location?: string;
  description: string;
  witnesses: Witness[];
  evidence: Evidence[];
  messages: Message[];
  timeline_events?: TimelineEvent[];
  completeness_score: number;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

// Completeness check result
export interface CompletenessResult {
  score: number;
  missing: string[];
  present: string[];
  recommendation: string;
}

// LBH data
export interface LBH {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  specialization: ViolationType[];
}
