// User settings and preferences

export interface UserSettings {
  username: string;
  mascotName: string;
  mascotStyle: 'encouraging' | 'reflective' | 'playful';
  mascotVoice: 'warm' | 'professional' | 'friendly';
}

const SETTINGS_KEY = 'user-settings';

const DEFAULT_SETTINGS: UserSettings = {
  username: 'Sri',
  mascotName: 'Luna',
  mascotStyle: 'encouraging',
  mascotVoice: 'warm',
};

export function getUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      // Initialize with default settings
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    
    const settings = JSON.parse(stored);
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('Error loading user settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: Partial<UserSettings>): void {
  try {
    const currentSettings = getUserSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
}

export function resetUserSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Error resetting user settings:', error);
  }
}
