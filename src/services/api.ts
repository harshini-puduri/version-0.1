// src/services/api.ts
import { backendMode } from './storageMode';

const getApiUrl = () => {
  return backendMode.getUrl();
};

const API_URL = getApiUrl();

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface HealthCheckResponse {
  status: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface JournalEntry {
  id?: string;
  title?: string;
  content: string;
  timestamp?: string;
  [key: string]: unknown;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    // Always append user_id=demo_user for user-specific calls
    let url = `${getApiUrl()}${endpoint}`;
    if (!url.includes('user_id=')) {
      if (url.includes('?')) {
        url += '&user_id=demo_user';
      } else {
        url += '?user_id=demo_user';
      }
    }
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health');
  }

  // Root endpoint
  async getRoot(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/');
  }

  // Journal entries endpoints
  async getEntries(): Promise<JournalEntry[]> {
    return this.request<JournalEntry[]>('/entries/');
  }

  async createEntry(data: Omit<JournalEntry, 'id' | 'timestamp'>): Promise<JournalEntry> {
    return this.request<JournalEntry>('/entries/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEntry(id: string, data: Partial<JournalEntry>): Promise<JournalEntry> {
    return this.request<JournalEntry>(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEntry(id: string): Promise<void> {
    return this.request<void>(`/entries/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService(API_URL);
export const API_BASE_URL = API_URL;
export type { HealthCheckResponse, JournalEntry };
