export interface AIAnalyzeResponse {
  problem_description: string;
  category: string;
  symptoms: string[];
  urgency: 'Emergency' | 'Urgent' | 'Routine';
  safety_concerns: string | null;
  immediate_guidance: string | null;
  customer_location: string;
  preferred_time: string;
  estimated_complexity: string;
  missing_information: string[];
  clarification_question: string | null;
  technician_briefing: string;
  indicative_price_range: string;
  is_demo_fallback: boolean;
  ai_confidence: number;
}

export interface MatchedProfessional {
  id: string;
  name: string;
  category: string;
  skills: string[];
  locality: string;
  latitude: number;
  longitude: number;
  rating: number;
  completed_jobs: number;
  response_time_min: number;
  is_available: boolean;
  price_range: string;
  profile_desc: string;
  avatar_url?: string;
  phone: string;
  languages: string;
  distance_km: number;
  estimated_arrival_mins: number;
  match_score: number;
  rank_reason: string;
}

export interface TimelineEvent {
  time: string;
  event: string;
}

export interface ServiceRequest {
  id: string;
  problem_description: string;
  raw_transcript?: string;
  category: string;
  urgency: 'Emergency' | 'Urgent' | 'Routine';
  symptoms: string[];
  safety_concerns?: string | null;
  immediate_guidance?: string | null;
  customer_location: string;
  customer_name: string;
  customer_phone: string;
  preferred_time: string;
  estimated_complexity: string;
  technician_briefing: string;
  assigned_professional_id?: string | null;
  assigned_professional?: MatchedProfessional | null;
  status: 'REQUESTED' | 'SEARCHING' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  price_estimate_min: number;
  price_estimate_max: number;
  final_amount?: number | null;
  timeline: TimelineEvent[];
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HistoryStats {
  total_requests: number;
  completed_requests: number;
  active_requests: number;
  emergency_requests: number;
  saved_technicians: number;
  total_spent: number;
}

export interface PresetScenario {
  id: string;
  title: string;
  sample_input: string;
  category: string;
  urgency: string;
  symptoms: string[];
  safety_concerns?: string;
  immediate_guidance?: string;
  customer_location: string;
  preferred_time: string;
  estimated_complexity: string;
  missing_information: string[];
  clarification_question?: string;
  technician_briefing: string;
  indicative_price_range: string;
}
