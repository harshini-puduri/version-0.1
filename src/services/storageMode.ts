// Backend URL manager - toggle between localhost and production
type BackendMode = 'localhost' | 'production';

const BACKEND_MODE_KEY = 'backend_mode';
const LOCALHOST_URL = 'http://localhost:8000';
const PRODUCTION_URL = 'https://journal-backend-api.fly.dev';

// Set default to localhost if not set
if (!localStorage.getItem(BACKEND_MODE_KEY)) {
  localStorage.setItem(BACKEND_MODE_KEY, 'localhost');
}

export const backendMode = {
  get(): BackendMode {
    const mode = localStorage.getItem(BACKEND_MODE_KEY);
    return (mode === 'localhost' || mode === 'production') ? mode : 'production';
  },

  set(mode: BackendMode): void {
    localStorage.setItem(BACKEND_MODE_KEY, mode);
    // Dispatch custom event to notify components to reload
    window.dispatchEvent(new CustomEvent('backendModeChanged', { detail: mode }));
  },

  getUrl(): string {
    return this.get() === 'localhost' ? LOCALHOST_URL : PRODUCTION_URL;
  },

  isLocalhost(): boolean {
    return this.get() === 'localhost';
  },

  isProduction(): boolean {
    return this.get() === 'production';
  },

  toggle(): BackendMode {
    const newMode = this.get() === 'localhost' ? 'production' : 'localhost';
    this.set(newMode);
    return newMode;
  }
};
