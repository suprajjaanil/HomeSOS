import { 
  AIAnalyzeResponse, 
  MatchedProfessional, 
  ServiceRequest, 
  HistoryStats, 
  PresetScenario, 
  User, 
  AuthResponse, 
  ImageUploadResponse 
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function getUrl(path: string): string {
  if (API_BASE) {
    return `${API_BASE.replace(/\/$/, '')}${path}`;
  }
  return path;
}

let sessionToken: string | null = null;
if (typeof window !== 'undefined') {
  sessionToken = localStorage.getItem('homesos_auth_token');
}

export function setAuthToken(token: string | null) {
  sessionToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('homesos_auth_token', token);
    } else {
      localStorage.removeItem('homesos_auth_token');
    }
  }
}

export function getAuthToken(): string | null {
  return sessionToken;
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let message = `API Error (${res.status})`;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.detail || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // --- Auth APIs ---
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(getUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse<AuthResponse>(res);
    setAuthToken(data.token);
    return data;
  },

  async register(payload: { name: string; email: string; phone: string; password: string; locality?: string; address?: string }): Promise<AuthResponse> {
    const res = await fetch(getUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<AuthResponse>(res);
    setAuthToken(data.token);
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(getUrl('/api/auth/me'), {
      headers: getAuthHeaders(),
    });
    return handleResponse<User>(res);
  },

  async updateProfile(payload: { name?: string; phone?: string; locality?: string; address?: string }): Promise<User> {
    const res = await fetch(getUrl('/api/auth/profile'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<User>(res);
  },

  // --- Image Upload API ---
  async uploadImage(file: Blob): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, 'homesos_camera_photo.jpg');

    const res = await fetch(getUrl('/api/uploads/image'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse<ImageUploadResponse>(res);
  },

  // --- Health & Scenarios ---
  async getHealth() {
    const res = await fetch(getUrl('/api/health'));
    return handleResponse<{ status: string; ai_engine: string; region: string }>(res);
  },

  async getScenarios(): Promise<PresetScenario[]> {
    const res = await fetch(getUrl('/api/ai/scenarios'));
    return handleResponse<PresetScenario[]>(res);
  },

  // --- AI Analysis ---
  async analyzeProblem(text: string, language = 'auto', locationHint?: string, imageUrl?: string): Promise<AIAnalyzeResponse> {
    const res = await fetch(getUrl('/api/ai/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language, location_hint: locationHint, image_url: imageUrl }),
    });
    return handleResponse<AIAnalyzeResponse>(res);
  },

  async uploadAudio(file: Blob, language = 'auto', locationHint?: string): Promise<AIAnalyzeResponse> {
    const formData = new FormData();
    formData.append('audio', file, 'voice-recording.webm');
    formData.append('language', language);
    if (locationHint) formData.append('location_hint', locationHint);

    const res = await fetch(getUrl('/api/ai/upload-audio'), {
      method: 'POST',
      body: formData,
    });
    return handleResponse<AIAnalyzeResponse>(res);
  },

  // --- Professional Matching ---
  async matchProfessionals(category: string, location = 'BTM Layout', urgency = 'Urgent', limit = 5): Promise<MatchedProfessional[]> {
    const baseUrl = API_BASE ? API_BASE : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');
    const url = new URL(getUrl('/api/professionals/match'), baseUrl);
    url.searchParams.set('category', category);
    url.searchParams.set('location', location);
    url.searchParams.set('urgency', urgency);
    url.searchParams.set('limit', limit.toString());

    const res = await fetch(url.toString());
    return handleResponse<MatchedProfessional[]>(res);
  },

  // --- Requests & Tracking ---
  async createRequest(payload: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const res = await fetch(getUrl('/api/requests'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<ServiceRequest>(res);
  },

  async getRequest(id: string): Promise<ServiceRequest> {
    const res = await fetch(getUrl(`/api/requests/${id}`));
    return handleResponse<ServiceRequest>(res);
  },

  async updateStatus(id: string, status: string, notes?: string, finalAmount?: number): Promise<ServiceRequest> {
    const res = await fetch(getUrl(`/api/requests/${id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status, notes, final_amount: finalAmount }),
    });
    return handleResponse<ServiceRequest>(res);
  },

  async simulateStep(id: string): Promise<ServiceRequest> {
    const res = await fetch(getUrl(`/api/requests/${id}/simulate-step`), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<ServiceRequest>(res);
  },

  // --- History & Stats ---
  async getHistory(customerId?: string): Promise<ServiceRequest[]> {
    const baseUrl = API_BASE ? API_BASE : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');
    const url = new URL(getUrl('/api/history'), baseUrl);
    if (customerId) url.searchParams.set('customer_id', customerId);

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<ServiceRequest[]>(res);
  },

  async getHistoryStats(customerId?: string): Promise<HistoryStats> {
    const baseUrl = API_BASE ? API_BASE : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000');
    const url = new URL(getUrl('/api/history/stats'), baseUrl);
    if (customerId) url.searchParams.set('customer_id', customerId);

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleResponse<HistoryStats>(res);
  },
};
