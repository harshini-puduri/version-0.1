// src/services/settingsApi.ts
import { backendMode } from './storageMode';

const getApiUrl = () => {
  // Check if user has toggled backend mode
  return backendMode.getUrl();
};

const API_URL = getApiUrl();

export interface PrivacySettings {
  biometric_lock: boolean;
  auto_lock: boolean;
  lock_timeout: string;
  cloud_backup: boolean;
  hide_on_screenshots: boolean;
}

export interface PersonalizationSettings {
  username: string;
  mascot_name: string;
  mascot_style: 'encouraging' | 'reflective' | 'playful';
  mascot_voice: 'warm' | 'professional' | 'friendly';
  mascot_primary_color?: string;
  mascot_secondary_color?: string;
  mascot_accent_color?: string;
  mascot_blush_color?: string;
}

export interface AppSettings {
  privacy: PrivacySettings;
  personalization: PersonalizationSettings;
}

export interface SettingResponse {
  id: number;
  key: string;
  value: any;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const settingsApi = {
  // Get all settings
  async getAll(): Promise<AppSettings> {
    const response = await fetch(`${getApiUrl()}/api/settings/?user_id=demo_user`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  // Get specific setting
  async get(key: 'privacy' | 'personalization'): Promise<any> {
    const response = await fetch(`${getApiUrl()}/api/settings/${key}?user_id=demo_user`);
    if (!response.ok) throw new Error(`Failed to fetch ${key} settings`);
    const data: SettingResponse = await response.json();
    return data.value;
  },

  // Update privacy settings
  async updatePrivacy(settings: PrivacySettings): Promise<SettingResponse> {
    const response = await fetch(`${getApiUrl()}/api/settings/privacy?user_id=demo_user`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: settings })
    });
    if (!response.ok) throw new Error('Failed to update privacy settings');
    return response.json();
  },

  // Update personalization settings
  async updatePersonalization(settings: PersonalizationSettings): Promise<SettingResponse> {
    const response = await fetch(`${getApiUrl()}/api/settings/personalization?user_id=demo_user`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: settings })
    });
    if (!response.ok) throw new Error('Failed to update personalization settings');
    return response.json();
  },

  // Initialize default settings
  async initialize(): Promise<void> {
    const response = await fetch(`${getApiUrl()}/api/settings/initialize?user_id=demo_user`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to initialize settings');
  }
};
