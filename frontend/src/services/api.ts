import { AIAnalyzeResponse, MatchedProfessional, ServiceRequest, HistoryStats, PresetScenario } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function getUrl(path: string): string {
  if (API_BASE) {
    return `${API_BASE.replace(/\/$/, '')}${path}`;
  }
  return path;
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
  async getHealth() {
    const res = await fetch(getUrl('/api/health'));
    return handleResponse<{ status: string; ai_engine: string; region: string }>(res);
  },

  async analyzeProblem(text: string, language = 'auto', locationHint?: string): Promise<AIAnalyzeResponse> {
    const res = await fetch(getUrl('/api/ai/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language, location_hint: locationHint }),
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

  async getScenarios(): Promise<PresetScenario[]> {
    const res = await fetch(getUrl('/api/ai/scenarios'));
    return handleResponse<PresetScenario[]>(res);
  },

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

  async createRequest(payload: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const res = await fetch(getUrl('/api/requests'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, final_amount: finalAmount }),
    });
    return handleResponse<ServiceRequest>(res);
  },

  async simulateStep(id: string): Promise<ServiceRequest> {
    const res = await fetch(getUrl(`/api/requests/${id}/simulate-step`), {
      method: 'POST',
    });
    return handleResponse<ServiceRequest>(res);
  },

  async getHistory(): Promise<ServiceRequest[]> {
    const res = await fetch(getUrl('/api/history'));
    return handleResponse<ServiceRequest[]>(res);
  },

  async getHistoryStats(): Promise<HistoryStats> {
    const res = await fetch(getUrl('/api/history/stats'));
    return handleResponse<HistoryStats>(res);
  },
};
